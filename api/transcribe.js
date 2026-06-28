export const config = {
  api: {
    bodyParser: false, // Necesario para procesar FormData nativo
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Reenviamos el request completo (FormData) directamente a Groq
    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": req.headers["content-type"] // Mantenemos el boundary del FormData
      },
      // Para enviar el formData entrante de req al fetch, puedes usar el req directamente
      body: req,
      duplex: 'half'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error en Groq Transcription API');
    }

    res.status(200).json({ text: data.text });
  } catch (error) {
    console.error("Error en /api/transcribe:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
