import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key is missing" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using Flash-Lite for speed/rate limits, but giving it a massive context
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  try {
    const userProfile = req.body;
    
    // 1. FAILSAFE BUDGETING
    const userBudget = userProfile.budget || 5000;
    const maxPrice = Math.round(userBudget * 1.4); 
    const minPrice = 2000;

    // 2. KNOWLEDGE INJECTION (The "Virtual Database")
    // This forces the AI to look at these SPECIFIC Indian models instead of generic US ones.
    const indianShoeContext = `
      AVAILABLE INDIAN INVENTORY CONTEXT (2025-2026):
      - Nike: Vomero 17/18, Pegasus 41/42, Rival Fly 4, Invincible 3, Zoom Fly 6.
      - Asics: Novablast 4/5, Nimbus 26/27, GT-2000 13, Kayano 31, Superblast 2 (Rare).
      - Puma: Velocity Nitro 3, Deviate Nitro 3, Magnify Nitro 2, Electrify Nitro 3 (Budget).
      - Adidas: Adizero SL 2, Boston 12/13, Supernova Rise, Adios Pro 3 (Racing).
      - New Balance: SC Trainer v3, Rebel v4, 1080v14.
      - Hoka India: Clifton 9, Mach 6, Arahi 7.
      - Brooks India: Ghost 16, Glycerin 21, Hyperion Max.
      - Xtep India (Critical for value): 160x 5.0, 160x 6.0, 2000km, Reactive Coil.
      - Saucony India: Endorphin Speed 4, Triumph 22.
      - Reebok: Floatride Energy 5.
    `;

    const systemPrompt = `
      You are an Elite Running Shoe Analyst (Supwell/RunRepeat Level) specifically for the Indian Market.
      
      USER BUDGET: ₹${userBudget} (Max Ceiling: ₹${maxPrice})
      
      YOUR MANDATE:
      Perform a deep "simulated search" across these specific Indian retailers:
      [Dawntown, Kicksmachine, Hype Fly, Culture Circle, Amazon.in, Flipkart, Ajio, Myntra, Tata Cliq, Triworld, Official Brand Sites].
      
      Apply the review methodologies of: [RunTesters, Sole Review, Marathon Handbook].
      
      TASK:
      Select exactly 5 DISTINCT shoes from the "Inventory Context" below that best match the user.
      
      CRITICAL RULES:
      1. **Variety is Key:** Do NOT just recommend 5 Nike shoes. Mix brands (e.g., 1 Asics, 1 Puma, 1 Xtep, 1 Adidas).
      2. **Strict Budget:** If a shoe costs ₹18,000 and budget is ₹5,000, DO NOT include it.
      3. **Review Logic:**
         - If the user wants "Speed", look for "Snappy/Plated" shoes (Puma Deviate, Adidas SL, Xtep 160x).
         - If the user wants "Comfort/Recovery", look for "Max Cushion" (Nimbus, Vomero, Magnify Nitro).
      4. **Link Generation:** - Generate a SMART search link. 
         - If the shoe is a "Hype" shoe (like Superblast or Vaporfly), point to 'Kicksmachine' or 'Culture Circle'.
         - If it's a daily trainer, point to 'Amazon.in' or 'Flipkart'.
      
      ${indianShoeContext}
         
      OUTPUT FORMAT:
      Return ONLY a JSON array. 
      
      [
        {
          "rank": 1,
          "name": "Brand Model Version",
          "price": Number (e.g. 11999),
          "match_percentage": Number (85-99),
          "ratings": { "cushion": 1-5, "durability": 1-5, "energy_return": 1-5 },
          "why_it_fits": "Deep technical reason (mention foam type: ZoomX, FF Blast+, Nitro, etc).",
          "brand": "Brand Name",
          "purchase_link": "https://www.google.com/search?q=buy+SHOE_NAME+India",
          "retailer_name": "Recommended Store Name"
        }
      ]
    `;

    const userMessage = `User Profile: ${JSON.stringify(userProfile)}`;

    const result = await model.generateContent([systemPrompt, userMessage]);
    const response = await result.response;
    let text = response.text();
    
    // Clean JSON
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    
    if (start === -1 || end === -1) return res.status(200).json([]);

    const jsonString = text.substring(start, end + 1);
    let shoes = JSON.parse(jsonString);

    // 3. FINAL PRICE FILTER
    shoes = shoes.filter(shoe => {
      const price = parseInt(shoe.price);
      return !isNaN(price) && price <= maxPrice && price >= 2000;
    });

    res.status(200).json(shoes);

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(200).json([]); 
  }
}
