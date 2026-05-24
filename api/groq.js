export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const isAudio = req.headers['content-type']?.includes('multipart/form-data');
  const endpoint = isAudio 
    ? "https://api.groq.com/openai/v1/audio/transcriptions" 
    : "https://api.groq.com/openai/v1/chat/completions";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        ...(isAudio ? {} : { "Content-Type": "application/json" })
      },
      body: req.body, 
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "Error en el puente de API" });
  }
}
  
