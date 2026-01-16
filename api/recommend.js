import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Setup the API Key
  // This automatically grabs the key you saved in Vercel Settings
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key is missing in Vercel Settings" });
  }

  // 2. Initialize Gemini
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // 3. Get User Profile from the request
    const userProfile = req.body;

    // 4. Define the Prompt
    const systemPrompt = `
      You are an expert Running Shoe Consultant.
      Analyze the user profile and return a JSON array of 5 recommended shoes.
      Strictly follow this JSON format for each shoe:
      {
        "rank": Number,
        "name": String,
        "price_current": Number (INR),
        "price_original": Number (INR),
        "match_percentage": Number,
        "ratings": { "cushion": Number, "durability": Number, "energy_return": Number },
        "why_it_fits": String,
        "image_keyword": String
      }
      Do not use markdown formatting. Just raw JSON.
    `;

    const userMessage = `User Profile: ${JSON.stringify(userProfile)}`;

    // 5. Generate Recommendations
    const result = await model.generateContent([systemPrompt, userMessage]);
    const response = await result.response;
    let text = response.text();
    
    // Clean up response
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const shoes = JSON.parse(text);
    res.status(200).json(shoes);

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to generate recommendations", details: error.message });
  }
}
