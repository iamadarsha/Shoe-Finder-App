import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key is missing" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using Flash-Lite for speed and higher rate limits
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  try {
    const userProfile = req.body;
    
    // 1. FAILSAFE BUDGETING
    // We set a hard ceiling. Budget + 40% buffer.
    // Example: Budget ₹5000 -> Max ₹7000.
    const userBudget = userProfile.budget || 5000;
    const maxPrice = Math.round(userBudget * 1.4); 
    const minPrice = 2000; // Floor to avoid cheap quality shoes

    const systemPrompt = `
      You are an expert Running Shoe Consultant for the Indian Market (Context: Late 2025 / 2026).
      
      USER BUDGET: ₹${userBudget}
      STRICT PRICE CEILING: ₹${maxPrice}
      
      YOUR TASK:
      Recommend exactly 5 running shoes available in India right now that match the user's profile and budget.
      
      CRITICAL RULES:
      1. **Strict Budget Adherence:** - ABSOLUTELY NO SHOES over ₹${maxPrice}. 
         - If the user asks for "Marathon Racing" (Carbon Plate) but budget is ₹3500, DO NOT invent a fake price. Return an empty array [].
         - If no good shoes exist in this range, return [].
         
      2. **Indian Availability & Links:** - Shoes must be listed on: Amazon.in, Flipkart, Myntra, Tata Cliq, VegNonVeg, Superkicks, Xtep India, or Official Brand Sites (Nike.in, Adidas.co.in).
         - **Link Strategy:** Do not guess direct product pages (they break). Generate a high-quality SEARCH URL.
           Example: "https://www.amazon.in/s?k=Nike+Pegasus+41+Men" or "https://www.flipkart.com/search?q=Puma+Velocity+Nitro+3"
      
      3. **Latest Releases (2025-2026):**
         - Look for the newest models if the budget permits:
         - Nike: Vomero 18, Pegasus 42/41, Rival Fly 4.
         - Asics: Novablast 5, Nimbus 27/28, GT-2000 13.
         - Puma: Deviate Nitro 3, Velocity Nitro 3/4.
         - Adidas: Adizero SL 2, Supernova Rise/Stride.
         - Xtep: 160X 6.0, 2000km.
         - Brooks: Ghost 16, Glycerin 22.
         
      OUTPUT FORMAT:
      Return ONLY a JSON array. No markdown.
      
      JSON Structure:
      [
        {
          "rank": 1,
          "name": "Brand + Model + Version (e.g. Asics Novablast 4)",
          "price": Number (Integer only, e.g. 11999),
          "match_percentage": Number (0-100),
          "ratings": { "cushion": Number, "durability": Number, "energy_return": Number },
          "why_it_fits": "Specific reason linking features to Indian roads/user profile.",
          "brand": "Brand Name",
          "purchase_link": "Search URL string",
          "retailer_name": "Amazon.in / Flipkart / Brand Site"
        }
      ]
    `;

    const userMessage = `User Profile: ${JSON.stringify(userProfile)}`;

    const result = await model.generateContent([systemPrompt, userMessage]);
    const response = await result.response;
    let text = response.text();
    
    // 2. CLEANER JSON PARSING
    // Sometimes AI adds "```json ... ```". We clean it.
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Find the start and end of the array to ignore preamble text
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    
    if (start === -1 || end === -1) {
       // AI returned text saying "No shoes found" instead of JSON
       return res.status(200).json([]);
    }

    const jsonString = text.substring(start, end + 1);
    let shoes = JSON.parse(jsonString);

    // 3. THE FINAL FAILSAFE (Post-Processing)
    // We explicitly filter out any hallucinated prices that violate the budget.
    shoes = shoes.filter(shoe => {
      // Ensure price is a number
      const price = parseInt(shoe.price);
      // Check if valid number and within range
      return !isNaN(price) && price <= maxPrice && price >= 500;
    });

    res.status(200).json(shoes);

  } catch (error) {
    console.error("Gemini API Error:", error);
    // If JSON parsing fails or API fails, return empty array so frontend shows "No Results" screen
    // instead of crashing.
    res.status(200).json([]); 
  }
}
