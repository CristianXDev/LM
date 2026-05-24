// Chatbot LiveMonitor con Integración de API Groq y Correcciones de Audio

class LiveMonitorChatbot {
  constructor() {
    this.isOpen = false;
    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.exchangeRates = null;
    // ADVERTENCIA: Nunca dejes tu API key en el código frontend en producción.
    this.groqApiKey = "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";
    this.conversationHistory = [];
    this.maxHistory = 10;

    // CORRECCIÓN 1: Variables para el formato y tiempo de audio
    this.currentMimeType = '';
    this.recordStartTime = 0;

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadExchangeRates();
    this.loadHistory();
    this.addWelcomeMessage();
  }

  bindEvents() {
    document.getElementById("chatbotToggle").addEventListener("click", () => this.toggleChat());
    document.getElementById("chatbotClose").addEventListener("click", () => this.closeChat());
    document.getElementById("chatbotSend").addEventListener("click", () => this.sendMessage());
    document.getElementById("chatbotInput").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.sendMessage();
    });
    document.getElementById("chatbotAudio").addEventListener("click", () => this.toggleRecording());
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const container = document.querySelector(".chatbot-container");
    if (this.isOpen) {
      container.classList.add("chat-open");
    } else {
      container.classList.remove("chat-open");
    }
  }

  closeChat() {
    this.isOpen = false;
    document.querySelector(".chatbot-container").classList.remove("chat-open");
  }

  async loadExchangeRates() {
    const CACHE_KEY = "dolar_data_cache";
    const cached = localStorage.getItem(CACHE_KEY);
    const now = Date.now();

    if (cached) {
      const parsedCache = JSON.parse(cached);
      if (now - parsedCache.timestamp < 10 * 60 * 1000) {
        this.exchangeRates = parsedCache.data;
        return;
      }
    }

    try {
      const urls = [
        "https://ve.dolarapi.com/v1/dolares/oficial",
        "https://ve.dolarapi.com/v1/dolares/paralelo",
        "https://ve.dolarapi.com/v1/euros/oficial",
        "https://ve.dolarapi.com/v1/euros/paralelo",
      ];

      const [uOfi, uPara, eOfi, ePara] = await Promise.all(
        urls.map((url) => fetch(url).then((res) => res.json())),
      );

      this.exchangeRates = { uOfi, uPara, eOfi, ePara };

      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: now,
          data: this.exchangeRates,
        }),
      );
    } catch (error) {
      console.error("Error loading exchange rates:", error);
    }
  }

  getRatesContext() {
    if (!this.exchangeRates) return "No hay datos de tasas disponibles.";

    const { uOfi, uPara, eOfi, ePara } = this.exchangeRates;

    return `TASAS ACTUALES (VES):\n- Dólar Oficial: ${uOfi?.promedio?.toFixed(2) || "N/A"} Bs\n- Dólar Paralelo: ${uPara?.promedio?.toFixed(2) || "N/A"} Bs\n- Euro Oficial: ${eOfi?.promedio?.toFixed(2) || "N/A"} Bs\n- Euro Paralelo: ${ePara?.promedio?.toFixed(2) || "N/A"} Bs`;
  }

  saveHistory() {
    localStorage.setItem(
      "chatbot_history",
      JSON.stringify(this.conversationHistory.slice(-this.maxHistory)),
    );
  }

  loadHistory() {
    const saved = localStorage.getItem("chatbot_history");
    if (saved) {
      this.conversationHistory = JSON.parse(saved);
    }
  }

  addToHistory(role, content) {
    this.conversationHistory.push({ role, content });
    this.saveHistory();
  }

  async sendMessage() {
    const input = document.getElementById("chatbotInput");
    const message = input.value.trim();

    if (message) {
      this.addMessage(message, "user");
      this.addToHistory("user", message);
      input.value = "";

      this.showTypingIndicator();

      try {
        const response = await this.getGroqResponse(message);
        this.hideTypingIndicator();
        this.addMessage(response, "bot");
        this.addToHistory("assistant", response);
      } catch (error) {
        this.hideTypingIndicator();
        const fallbackResponse = this.calculateConversion(message);
        this.addMessage(fallbackResponse, "bot");
        this.addToHistory("assistant", fallbackResponse);
      }
    }
  }

  async getGroqResponse(userMessage) {
    const ratesContext = this.getRatesContext();

    const systemPrompt = `Eres un asistente financiero especializado en tasas de cambio de Venezuela.

TASAS ACTUALES:
${ratesContext}

INSTRUCCIONES:
- Responde de forma CONCISA (máximo 3 líneas)
- Para conversiones: indica SOLO el resultado con la tasa usada
- Si la pregunta es ambigua, pide aclaración específica
- Usa formato numérico con 2 decimales
- No des explicaciones largas, solo lo necesario
- Si se te pide calcular una conversion, usa la taza solicitada teniendo en cuenta decimales

Ejemplos:
- "10 USD = 360.00 Bs (Dólar Oficial)"
- "¿A qué tasa quieres convertir? Oficial o Paralelo?"
- "Las tasas están actualizadas al momento"`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...this.conversationHistory.slice(-6),
      { role: "user", content: userMessage },
    ];

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.groqApiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: messages,
            temperature: 0.3,
            max_tokens: 150,
          }),
        },
      );

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      return (
        data.choices[0]?.message?.content || "No pude generar una respuesta."
      );
    } catch (error) {
      console.error("Groq API error:", error);
      throw error;
    }
  }

  calculateConversion(message) {
    if (!this.exchangeRates) {
      return "Sin datos de tasas. Verifica en la página principal.";
    }

    const { uOfi, uPara, eOfi, ePara } = this.exchangeRates;
    const rates = {
      dolarOficial: uOfi?.promedio || 0,
      dolarParalelo: uPara?.promedio || 0,
      euroOficial: eOfi?.promedio || 0,
      euroParalelo: ePara?.promedio || 0,
    };

    const normalizedMsg = message.toLowerCase().trim();

    const amountMatch = normalizedMsg.match(/(\d+(?:[.,]\d+)?)/);
    if (!amountMatch) {
      return "No encontré una cantidad. Ej: '10 dólares a la tasa oficial'";
    }

    const amount = parseFloat(amountMatch[1].replace(",", "."));

    const isEuro = normalizedMsg.includes("euro") || normalizedMsg.includes("eur");
    const isDollar = normalizedMsg.includes("dolar") || normalizedMsg.includes("usd") || normalizedMsg.includes("$");
    const isOficial = normalizedMsg.includes("oficial");
    const isParalelo = normalizedMsg.includes("paralelo");

    if (isEuro) {
      if (isOficial) return `${amount} EUR = ${(amount * rates.euroOficial).toFixed(2)} Bs (Oficial)`;
      if (isParalelo) return `${amount} EUR = ${(amount * rates.euroParalelo).toFixed(2)} Bs (Paralelo)`;
      return `${amount} EUR = ${(amount * rates.euroOficial).toFixed(2)} Bs (Oficial) / ${(amount * rates.euroParalelo).toFixed(2)} Bs (Paralelo)`;
    }

    if (isDollar || (!isEuro && amountMatch)) {
      if (isOficial) return `${amount} USD = ${(amount * rates.dolarOficial).toFixed(2)} Bs (Oficial)`;
      if (isParalelo) return `${amount} USD = ${(amount * rates.dolarParalelo).toFixed(2)} Bs (Paralelo)`;
      return `${amount} USD = ${(amount * rates.dolarOficial).toFixed(2)} Bs (Oficial) / ${(amount * rates.dolarParalelo).toFixed(2)} Bs (Paralelo)`;
    }

    if (/cuanto.*son|cuanto.*vale|valor|precio/i.test(message)) {
      if (/dolar.*oficial/i.test(message)) return `Dólar Oficial: ${rates.dolarOficial.toFixed(2)} Bs`;
      if (/dolar.*paralelo/i.test(message)) return `Dólar Paralelo: ${rates.dolarParalelo.toFixed(2)} Bs`;
      if (/euro.*oficial/i.test(message)) return `Euro Oficial: ${rates.euroOficial.toFixed(2)} Bs`;
      if (/euro.*paralelo/i.test(message)) return `Euro Paralelo: ${rates.euroParalelo.toFixed(2)} Bs`;
      return `USD Oficial: ${rates.dolarOficial.toFixed(2)} Bs | Paralelo: ${rates.dolarParalelo.toFixed(2)} Bs`;
    }

    return "¿A qué tasa quieres convertir? Ej: '10 dólares a la tasa oficial'";
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById("chatbotMessages");
    const indicator = document.createElement("div");
    indicator.className = "message message-bot typing-indicator";
    indicator.id = "typingIndicator";
    indicator.innerHTML = "<span></span><span></span><span></span>";
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const indicator = document.getElementById("typingIndicator");
    if (indicator) indicator.remove();
  }

  addMessage(text, sender) {
    const messagesContainer = document.getElementById("chatbotMessages");
    const messageDiv = document.createElement("div");
    messageDiv.className = `message message-${sender}`;
    messageDiv.textContent = text;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  addAudioMessage(audioBlob, duration) {
    const messagesContainer = document.getElementById("chatbotMessages");
    const messageDiv = document.createElement("div");
    messageDiv.className = "message message-user";

    const audioContainer = document.createElement("div");
    audioContainer.className = "audio-message";

    const icon = document.createElement("i");
    icon.className = "bi bi-mic-fill audio-icon";

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = URL.createObjectURL(audioBlob);

    const durationSpan = document.createElement("span");
    durationSpan.className = "audio-duration";
    durationSpan.textContent = this.formatDuration(duration);

    audioContainer.appendChild(icon);
    audioContainer.appendChild(audio);
    audioContainer.appendChild(durationSpan);
    messageDiv.appendChild(audioContainer);

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  addWelcomeMessage() {
    setTimeout(() => {
      this.addMessage(
        "¡Hola! Soy el asistente de LiveMonitor. Pregúntame sobre tasas de cambio o conversiones.",
        "bot",
      );
    }, 1000);
  }

  // CORRECCIÓN 1: Función auxiliar para detectar el mejor formato soportado
  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/mp4', // Vital para Safari / iOS
      'audio/ogg;codecs=opus',
      'audio/webm'
    ];
    return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
  }

  async toggleRecording() {
    const audioBtn = document.getElementById("chatbotAudio");
    const indicator = document.getElementById("recordingIndicator");

    if (!this.isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        // CORRECCIÓN 1: Usar formato compatible detectado
        this.currentMimeType = this.getSupportedMimeType();
        this.mediaRecorder = new MediaRecorder(stream, { mimeType: this.currentMimeType });
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data);
        };

        this.mediaRecorder.onstop = async () => {
          // CORRECCIÓN 3: Calcular la duración real
          const durationSeconds = (Date.now() - this.recordStartTime) / 1000;

          // CORRECCIÓN 1: Crear Blob con el mimeType correcto y asignar extensión
          const audioBlob = new Blob(this.audioChunks, { type: this.currentMimeType });
          const fileExtension = this.currentMimeType.includes('mp4') ? 'm4a' : 'webm';

          this.addAudioMessage(audioBlob, durationSeconds);

          this.showTypingIndicator();
          try {
            // CORRECCIÓN 2: Enviar extensión
            const transcription = await this.transcribeAudio(audioBlob, fileExtension);
            this.hideTypingIndicator();
            this.addMessage(transcription, "user");
            this.addToHistory("user", transcription);

            this.showTypingIndicator();
            const response = await this.getGroqResponse(transcription);
            this.hideTypingIndicator();
            this.addMessage(response, "bot");
            this.addToHistory("assistant", response);
          } catch (error) {
            // CORRECCIÓN 4: Manejo seguro de errores, evita enviar basura al LLM
            console.error("Fallo en el flujo de voz:", error);
            this.hideTypingIndicator();
            this.addMessage(
              "Lo siento, hubo un error procesando el audio. Por favor, intenta de nuevo o escribe tu mensaje.",
              "bot",
            );
          }

          stream.getTracks().forEach((track) => track.stop());
        };

        this.mediaRecorder.start();
        // CORRECCIÓN 3: Registrar el tiempo de inicio
        this.recordStartTime = Date.now();

        this.isRecording = true;
        audioBtn.classList.add("recording");
        indicator.classList.add("active");
      } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("No se pudo acceder al micrófono. Verifica los permisos de tu navegador.");
      }
    } else {
      this.mediaRecorder.stop();
      this.isRecording = false;
      audioBtn.classList.remove("recording");
      indicator.classList.remove("active");
    }
  }

  // CORRECCIÓN 2: Idioma, temperatura y extensión dinámica añadidos
  async transcribeAudio(audioBlob, fileExtension = 'webm') {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, `audio.${fileExtension}`);
      formData.append("model", "whisper-large-v3");
      formData.append("language", "es"); // Forza el español
      formData.append("temperature", "0.0"); // Reduce alucinaciones con ruido

      const response = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.groqApiKey}`,
          },
          body: formData,
        },
      );

      // CORRECCIÓN 4: Leer el mensaje de error real de la API si falla
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Transcription failed by API");
      }

      const data = await response.json();
      return data.text || "No se pudo transcribir el audio.";
    } catch (error) {
      console.error("Transcription error:", error);
      throw error; // Lanzamos el error hacia toggleRecording para cortarlo ahí
    }
  }

  formatDuration(seconds) {
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new LiveMonitorChatbot();
});
