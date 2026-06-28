export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Aquí extraemos la variable de forma segura en el servidor
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: messages,
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error en Groq API');
    }

    res.status(200).json({ reply: data.choices[0]?.message?.content });
  } catch (error) {
    console.error("Error en /api/chat:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
