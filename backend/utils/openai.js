import "dotenv/config";

const getopenapiresponse = async (message) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("API key is not configured.");
  }

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gemini-3.8-flash", // verify this model name
        messages: [{ role: "user", content: message }],
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    console.error("Gemini API request failed:", response.status, data);
    throw new Error(data?.error?.message || `Gemini request failed (${response.status})`);
  }

  return data.choices[0].message.content;
};

export default getopenapiresponse;
