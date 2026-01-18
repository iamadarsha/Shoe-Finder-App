import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key is missing" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using Flash-Lite: It handles large contexts (like your 233-shoe list) extremely fast.
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  try {
    const userProfile = req.body;
    
    // ============================================================
    // 1. THE MASTER DATABASE (Derived from your Updated CSV)
    // ============================================================
    const SHOE_DATABASE = [
  { "name": "ADIDAS Adizero Adios Pro 4", "brand": "ADIDAS", "price_filter": 22999, "price_display": "₹21,999 - ₹24,000", "type": "Elite Racing (New)", "features": "Foam: Lightstrike Pro (New Geometry)  Plate: EnergyRods 2.0 (Carbon)", "retailer": "Official, Dawntown, Hype Fly" },
  { "name": "ADIDAS Adizero Adios Pro 3", "brand": "ADIDAS", "price_filter": 16000, "price_display": "₹14,000 - ₹18,000", "type": "Elite Racing (Value)", "features": "Foam: Lightstrike Pro  Plate: EnergyRods 2.0", "retailer": "Myntra, Flipkart, Official (Sale)" },
  { "name": "ADIDAS Adizero Prime X 2 Strung", "brand": "ADIDAS", "price_filter": 35500, "price_display": "₹26,000 - ₹45,000", "type": "Illegal Racing (50mm)", "features": "Foam: 3 Layers Lightstrike Pro  Plate: Carbon Plate & Rods", "retailer": "Culture Circle, Dawntown" },
  { "name": "ADIDAS Adizero Takumi Sen 10", "brand": "ADIDAS", "price_filter": 17000, "price_display": "₹16,000 - ₹18,000", "type": "5K/10K Racing", "features": "Foam: Lightstrike Pro  Plate: Glass-fiber EnergyRods", "retailer": "Official, Hype Fly" },
  { "name": "ADIDAS Adizero Boston 13", "brand": "ADIDAS", "price_filter": 16499, "price_display": "₹15,999 - ₹16,999", "type": "Tempo / Speed (New)", "features": "Foam: Lightstrike Pro (Softer) + EVA  Plate: Glass-fiber EnergyRods", "retailer": "Official, Select Retailers" },
  { "name": "ADIDAS Adizero Boston 12", "brand": "ADIDAS", "price_filter": 11250, "price_display": "₹9,500 - ₹13,000", "type": "Tempo / Speed (Value)", "features": "Foam: Lightstrike Pro + Lightstrike 2.0", "retailer": "Myntra, Flipkart, Ajio" },
  { "name": "ADIDAS Adizero Evo SL", "brand": "ADIDAS", "price_filter": 15999, "price_display": "₹15,999", "type": "Speed Daily (New)", "features": "Foam: Full Lightstrike Pro (No Plate)", "retailer": "Official, VegNonVeg" },
  { "name": "ADIDAS Adizero Sl 2", "brand": "ADIDAS", "price_filter": 9999, "price_display": "₹9,999 - ₹11,999", "type": "Daily Speed", "features": "Foam: Lightstrike Pro Core + Lightstrike 2.0 Frame", "retailer": "Official, Myntra, Flipkart" },
  { "name": "ADIDAS Supernova Rise 2", "brand": "ADIDAS", "price_filter": 13999, "price_display": "₹13,999", "type": "Daily Trainer", "features": "Foam: Dreamstrike+ (PEBA based)", "retailer": "Official, Amazon" },
  { "name": "ADIDAS Ultraboost 5", "brand": "ADIDAS", "price_filter": 16999, "price_display": "₹16,999", "type": "Max Cushion", "features": "Foam: Light Boost (New Formula)", "retailer": "Official, Myntra" },
  { "name": "ADIDAS Ultraboost Light", "brand": "ADIDAS", "price_filter": 10500, "price_display": "₹9,000 - ₹12,000", "type": "Max Cushion (Value)", "features": "Foam: Light Boost", "retailer": "Amazon, Flipkart, Ajio" },
  { "name": "ADIDAS TorFlex", "brand": "ADIDAS", "price_filter": 4999, "price_display": "₹4,599 - ₹5,999", "type": "Budget Daily", "features": "Foam: Bounce", "retailer": "Flipkart, Amazon" },
  
  { "name": "ASICS Metaspeed Sky Paris", "brand": "ASICS", "price_filter": 21999, "price_display": "₹21,999", "type": "Elite Racing", "features": "Foam: FF Turbo+  Plate: Carbon (Optimized for Stride)", "retailer": "Official, Tata Cliq" },
  { "name": "ASICS Metaspeed Edge Tokyo", "brand": "ASICS", "price_filter": 14999, "price_display": "₹14,999 (Clearance)", "type": "Racing (Value)", "features": "Foam: FF Turbo  Plate: Carbon (Cadence)", "retailer": "Flipkart (Rare), Resellers" },
  { "name": "ASICS Superblast 2", "brand": "ASICS", "price_filter": 21999, "price_display": "₹21,999", "type": "Super Trainer", "features": "Foam: FF Turbo+ (No Plate)", "retailer": "Official, VegNonVeg" },
  { "name": "ASICS Novablast 5", "brand": "ASICS", "price_filter": 13999, "price_display": "₹13,999", "type": "Daily Speed", "features": "Foam: FF Blast Max (New)", "retailer": "Official, Amazon" },
  { "name": "ASICS Gel Nimbus 27", "brand": "ASICS", "price_filter": 16999, "price_display": "₹16,999", "type": "Max Cushion", "features": "Foam: FF Blast+ Eco (Plush)", "retailer": "Official, Tata Cliq" },
  { "name": "ASICS Gel Nimbus 28", "brand": "ASICS", "price_filter": 16999, "price_display": "₹16,999", "type": "Max Cushion (Future)", "features": "Foam: FF Blast+ Eco", "retailer": "Official (Late 2025)" },
  { "name": "ASICS Gel Pulse 16", "brand": "ASICS", "price_filter": 8999, "price_display": "₹7,999 - ₹9,999", "type": "Daily Trainer", "features": "Foam: Amplifoam+", "retailer": "Amazon, Flipkart" },

  { "name": "BROOKS Hyperion Elite 4", "brand": "BROOKS", "price_filter": 21999, "price_display": "₹21,999", "type": "Marathon Racer", "features": "Foam: DNA Flash v2 (Nitrogen)  Plate: Carbon", "retailer": "Official, Amazon" },
  { "name": "BROOKS Hyperion Max", "brand": "BROOKS", "price_filter": 15999, "price_display": "₹15,999", "type": "Speed Trainer", "features": "Foam: DNA Flash (No Plate)", "retailer": "Official, Tata Cliq" },
  { "name": "BROOKS Glycerin 21", "brand": "BROOKS", "price_filter": 15499, "price_display": "₹15,499", "type": "Max Cushion", "features": "Foam: DNA Loft v3 (Nitrogen)", "retailer": "Official, Amazon" },
  { "name": "BROOKS Ghost 16", "brand": "BROOKS", "price_filter": 12999, "price_display": "₹12,999", "type": "Daily Workhorse", "features": "Foam: DNA Loft v3", "retailer": "Official, Amazon" },
  { "name": "BROOKS Adrenaline GTS 23", "brand": "BROOKS", "price_filter": 12999, "price_display": "₹12,999", "type": "Stability", "features": "Tech: GuideRails + DNA Loft v2", "retailer": "Official, Amazon" },
  { "name": "BROOKS Levitate 6", "brand": "BROOKS", "price_filter": 9999, "price_display": "₹8,999 - ₹10,999", "type": "Energy Return", "features": "Foam: DNA Amp v2", "retailer": "Myntra, Flipkart" },

  { "name": "HOKA Cielo X1", "brand": "HOKA", "price_filter": 25999, "price_display": "₹24,000 - ₹27,999", "type": "Elite Racer", "features": "Foam: PEBA (Dual Layer)  Plate: Winged Carbon", "retailer": "Tata Cliq, Triworld" },
  { "name": "HOKA Cielo X1 2.0", "brand": "HOKA", "price_filter": 37500, "price_display": "₹30,000 - ₹45,000", "type": "Elite Racer (New)", "features": "Foam: Updated PEBA", "retailer": "Select Retailers" },
  { "name": "HOKA Mach 6", "brand": "HOKA", "price_filter": 13999, "price_display": "₹13,999", "type": "Speed Daily", "features": "Foam: Super Critical EVA (No Plate)", "retailer": "Tata Cliq, Amazon" },
  { "name": "HOKA Clifton 9", "brand": "HOKA", "price_filter": 12499, "price_display": "₹11,000 - ₹13,999", "type": "Daily Cushion", "features": "Foam: Compression Molded EVA", "retailer": "Tata Cliq, Myntra" },
  { "name": "HOKA Clifton 10", "brand": "HOKA", "price_filter": 13999, "price_display": "₹13,999", "type": "Daily Cushion (New)", "features": "Foam: Updated EVA", "retailer": "Official, Tata Cliq" },
  { "name": "HOKA Bondi 9", "brand": "HOKA", "price_filter": 15999, "price_display": "₹15,999", "type": "Max Recovery", "features": "Foam: Softest EVA", "retailer": "Official" },
  { "name": "HOKA Speedgoat 5 GTX", "brand": "HOKA", "price_filter": 16999, "price_display": "₹16,999", "type": "Trail Running", "features": "Tech: Vibram Megagrip + GoreTex", "retailer": "Triworld, Tata Cliq" },

  { "name": "NIKE Alphafly 3", "brand": "NIKE", "price_filter": 22795, "price_display": "₹22,795", "type": "Marathon Racer", "features": "Foam: ZoomX  Plate: Carbon Flyplate + Air Zoom", "retailer": "Official, Dawntown" },
  { "name": "NIKE Vaporfly 3", "brand": "NIKE", "price_filter": 20695, "price_display": "₹20,695", "type": "Marathon Racer", "features": "Foam: ZoomX  Plate: Carbon Flyplate", "retailer": "Official, Myntra" },
  { "name": "NIKE Zoom Fly 6", "brand": "NIKE", "price_filter": 15995, "price_display": "₹15,995", "type": "Tempo / Trainer", "features": "Foam: ZoomX + SR02  Plate: Carbon", "retailer": "Official, Myntra" },
  { "name": "NIKE Invincible 3", "brand": "NIKE", "price_filter": 16995, "price_display": "₹16,995", "type": "Max Cushion", "features": "Foam: Full ZoomX (Slab)", "retailer": "Official, Ajio" },
  { "name": "NIKE Vomero 17", "brand": "NIKE", "price_filter": 14495, "price_display": "₹14,495", "type": "Max Cushion", "features": "Foam: ZoomX + Cushlon 3.0", "retailer": "Official, Myntra" },
  { "name": "NIKE Vomero Plus", "brand": "NIKE", "price_filter": 15495, "price_display": "₹15,495", "type": "Max Cushion (Premium)", "features": "Foam: ZoomX + ReactX", "retailer": "Official" },
  { "name": "NIKE Pegasus 41", "brand": "NIKE", "price_filter": 11895, "price_display": "₹11,895", "type": "Daily Workhorse", "features": "Foam: ReactX + Air Zoom Units", "retailer": "Official, Myntra, Flipkart" },
  { "name": "NIKE Pegasus Premium", "brand": "NIKE", "price_filter": 19995, "price_display": "₹18,000 - ₹21,000", "type": "Super Daily", "features": "Foam: ZoomX + Air Zoom (Visible)", "retailer": "Official" },
  { "name": "NIKE Streakfly 2", "brand": "NIKE", "price_filter": 13995, "price_display": "₹13,995", "type": "5K/10K Racer", "features": "Foam: ZoomX (Low Stack)", "retailer": "Official" },
  { "name": "NIKE Winflo 11", "brand": "NIKE", "price_filter": 8695, "price_display": "₹8,695", "type": "Budget Daily", "features": "Foam: Cushlon 3.0 + Full Air Unit", "retailer": "Myntra, Ajio" },
  { "name": "NIKE Structure 26", "brand": "NIKE", "price_filter": 11495, "price_display": "₹11,495", "type": "Stability", "features": "Foam: Cushlon + Zoom Air", "retailer": "Official, Amazon" },

  { "name": "NEW BALANCE SC Elite v4", "brand": "NEW BALANCE", "price_filter": 22999, "price_display": "₹22,999", "type": "Marathon Racer", "features": "Foam: FuelCell (100% PEBA)  Plate: Carbon", "retailer": "Official, Culture Circle" },
  { "name": "NEW BALANCE SC Trainer v3", "brand": "NEW BALANCE", "price_filter": 17999, "price_display": "₹17,999", "type": "Super Trainer", "features": "Foam: FuelCell  Plate: Carbon", "retailer": "Official" },
  { "name": "NEW BALANCE Fresh Foam X 1080 v14", "brand": "NEW BALANCE", "price_filter": 15999, "price_display": "₹15,999", "type": "Daily Max", "features": "Foam: Fresh Foam X (Softer)", "retailer": "Official, Amazon" },
  { "name": "NEW BALANCE Rebel v4", "brand": "NEW BALANCE", "price_filter": 13999, "price_display": "₹13,999", "type": "Daily Speed", "features": "Foam: FuelCell Blend", "retailer": "Official, Tata Cliq" },
  { "name": "NEW BALANCE 880", "brand": "NEW BALANCE", "price_filter": 11999, "price_display": "₹11,999", "type": "Daily Trainer", "features": "Foam: Fresh Foam X", "retailer": "Official" },
  { "name": "NEW BALANCE 680v8", "brand": "NEW BALANCE", "price_filter": 7999, "price_display": "₹6,000 - ₹8,000", "type": "Entry Daily", "features": "Foam: Fresh Foam", "retailer": "Flipkart, Amazon" },

  { "name": "PUMA Deviate Nitro Elite 3", "brand": "PUMA", "price_filter": 19999, "price_display": "₹19,999", "type": "Marathon Racer", "features": "Foam: Nitro Elite (PEBA)  Plate: Carbon PWRPLATE", "retailer": "Official, Flipkart" },
  { "name": "PUMA Fast-R Nitro Elite 2", "brand": "PUMA", "price_filter": 22999, "price_display": "₹22,999", "type": "Marathon Racer", "features": "Foam: Nitro Elite  Plate: Exposed Carbon", "retailer": "Official, Myntra" },
  { "name": "PUMA Deviate Nitro 3", "brand": "PUMA", "price_filter": 15999, "price_display": "₹15,999", "type": "Speed Trainer", "features": "Foam: Nitro Elite + Nitro  Plate: Carbon", "retailer": "Official, Flipkart" },
  { "name": "PUMA MagMax Nitro", "brand": "PUMA", "price_filter": 16999, "price_display": "₹16,999", "type": "Max Cushion", "features": "Foam: Nitro (Massive Stack)", "retailer": "Official" },
  { "name": "PUMA Magnify Nitro 2", "brand": "PUMA", "price_filter": 12999, "price_display": "₹12,999", "type": "Max Cushion", "features": "Foam: Full Nitro (Thick)", "retailer": "Flipkart, Amazon" },
  { "name": "PUMA Velocity Nitro 3", "brand": "PUMA", "price_filter": 10999, "price_display": "₹10,999", "type": "Daily Workhorse", "features": "Foam: Nitro + ProFoam  Tech: PumaGrip", "retailer": "Flipkart, Myntra, Amazon" },
  { "name": "PUMA Velocity Nitro 4", "brand": "PUMA", "price_filter": 11999, "price_display": "₹11,999", "type": "Daily Workhorse (New)", "features": "Foam: Updated Nitro", "retailer": "Official (Late 2025)" },
  { "name": "PUMA Skyrocket Lite", "brand": "PUMA", "price_filter": 4499, "price_display": "₹3,500 - ₹4,999", "type": "Budget Run", "features": "Foam: ProFoam", "retailer": "Amazon, Flipkart" },

  { "name": "SAUCONY Endorphin Pro 4", "brand": "SAUCONY", "price_filter": 23990, "price_display": "₹23,990", "type": "Marathon Racer", "features": "Foam: PWRRUN HG + PB  Plate: Carbon", "retailer": "Tata Cliq, Amazon" },
  { "name": "SAUCONY Endorphin Speed 4", "brand": "SAUCONY", "price_filter": 16990, "price_display": "₹16,990", "type": "Speed Trainer", "features": "Foam: PWRRUN PB  Plate: Nylon", "retailer": "Tata Cliq" },
  { "name": "SAUCONY Triumph 21", "brand": "SAUCONY", "price_filter": 15990, "price_display": "₹15,990", "type": "Max Cushion", "features": "Foam: PWRRUN+ (TPU)", "retailer": "Amazon, Tata Cliq" },
  { "name": "SAUCONY Guide 17", "brand": "SAUCONY", "price_filter": 13990, "price_display": "₹13,990", "type": "Stability", "features": "Foam: PWRRUN + CenterPath", "retailer": "Amazon" },
  { "name": "SAUCONY Axon 3", "brand": "SAUCONY", "price_filter": 7990, "price_display": "₹6,990 - ₹8,990", "type": "Budget Max", "features": "Foam: PWRRUN (Firm Rocker)", "retailer": "Tata Cliq, Myntra" },

  { "name": "XTEP 160X 5.0 Pro", "brand": "XTEP", "price_filter": 14999, "price_display": "₹14,999", "type": "Elite Racer", "features": "Foam: XTEP ACE (PEBA)  Plate: Carbon", "retailer": "Xtep India" },
  { "name": "XTEP 2000km", "brand": "XTEP", "price_filter": 7999, "price_display": "₹7,999", "type": "Daily Endurance", "features": "Foam: High Durability", "retailer": "Xtep India" },
  { "name": "XTEP Reactive Coil", "brand": "XTEP", "price_filter": 5999, "price_display": "₹5,000 - ₹6,999", "type": "Daily Budget", "features": "Foam: Soft EVA", "retailer": "Amazon" },

  { "name": "DECATHLON Kiprun KD900", "brand": "DECATHLON", "price_filter": 9999, "price_display": "₹9,999", "type": "Performance", "features": "Foam: PEBAX (Arkema)", "retailer": "Decathlon App" },
  { "name": "DECATHLON Kiprun KS900", "brand": "DECATHLON", "price_filter": 7999, "price_display": "₹7,999", "type": "Cushion", "features": "Foam: MFOAM (Soft)", "retailer": "Decathlon App" },
  { "name": "DECATHLON Jogflow 500", "brand": "DECATHLON", "price_filter": 3499, "price_display": "₹2,799 - ₹3,499", "type": "Entry Daily", "features": "Foam: EVA (Flexible)", "retailer": "Decathlon App" },
  { "name": "DECATHLON Run Active 100", "brand": "DECATHLON", "price_filter": 1500, "price_display": "₹1,499 - ₹1,999", "type": "Budget Entry", "features": "Foam: Basic EVA", "retailer": "Decathlon App" },

  { "name": "REEBOK Floatride Energy 5", "brand": "REEBOK", "price_filter": 7999, "price_display": "₹7,999", "type": "Daily Trainer", "features": "Foam: Floatride Energy", "retailer": "Official, Myntra" }
];

    // ============================================================
    // 2. INTELLIGENT FILTERING LOGIC
    // ============================================================
    
    // Budget Handling (Failsafe)
    // We start from 1500 to 45000+
    const userBudget = userProfile.budget || 5000;
    
    // Strict Cap with Buffer (e.g. Budget 5000 -> Max 6000)
    // But if budget is very high (>= 20k), we allow everything up to 45k+
    let maxPrice;
    if (userBudget >= 20000) {
      maxPrice = 100000; // Unlock Super Shoes
    } else {
      maxPrice = Math.round(userBudget * 1.25); // 25% Buffer
    }

    // A. Primary Filter: Strict Budget & Goal
    let relevantShoes = SHOE_DATABASE.filter(shoe => shoe.price_filter <= maxPrice);

    // B. No-Results Failsafe:
    // If strict filtering returns nothing (e.g., user asks for "Race Day" at ₹2000),
    // We DO NOT return empty. We fetch the "Next Best" alternatives.
    let isFallback = false;
    let contextMessage = "";
    
    if (relevantShoes.length === 0) {
       isFallback = true;
       // Fallback 1: Just show the cheapest shoes in the database
       relevantShoes = SHOE_DATABASE.sort((a,b) => a.price_filter - b.price_filter).slice(0, 10);
       contextMessage = `CRITICAL NOTICE: The user set a budget of ₹${userBudget}, but no shoes exist in that range for their needs. I have provided the CHEAPEST available shoes as alternatives. You MUST explicitly tell the user: "No shoes match your exact price filter, but here are the best value options currently available."`;
    }

    // ============================================================
    // 3. THE ANALYST PROMPT
    // ============================================================
    const systemPrompt = `
      You are an Expert Running Shoe Analyst (Simulating RunTesters / Sole Review).
      
      USER PROFILE:
      - Budget: ₹${userBudget}
      - Goal: ${userProfile.goal} (e.g. Race Day, Daily Fitness, Trail)
      - Surface: ${userProfile.terrain ? userProfile.terrain.join(', ') : 'Road'}
      - Feel: ${userProfile.feel}
      
      YOUR DATABASE (Filtered Candidates):
      ${JSON.stringify(relevantShoes)}
      
      ${contextMessage}
      
      YOUR TASK:
      1. **Select Top 5:** Analyze the provided 'Filtered Candidates'. Pick the 5 best matches for the user's Goal and Surface.
      2. **Deep Analysis:** For each shoe, write a "why_it_fits" review. 
         - Simulate looking up reviews from Google/RunTesters/Marathon Handbook. 
         - Explain *why* the tech (Foam/Plate) matches their specific Goal.
      3. **Price & Links:** - Use the "price_display" string from the database.
         - Generate a 'purchase_link' that is a Smart Google Search for the "Cheapest Online Price".
      
      OUTPUT FORMAT (JSON Only):
      [
        {
          "rank": 1,
          "name": "Exact Name from DB",
          "price": "String from 'price_display' (e.g. ₹11,999)",
          "match_percentage": Number (80-99),
          "ratings": { "cushion": 1-5, "durability": 1-5, "energy_return": 1-5 },
          "why_it_fits": "Expert analysis: 'The Lightstrike Pro foam makes this ideal for...'",
          "brand": "Brand Name",
          "purchase_link": "https://www.google.com/search?q=buy+SHOE_NAME+online+India+lowest+price",
          "retailer_name": "Retailer from DB"
        }
      ]
    `;

    const result = await model.generateContent([systemPrompt]);
    const response = await result.response;
    let text = response.text();
    
    // Clean JSON
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    
    if (start === -1 || end === -1) return res.status(200).json([]);

    const jsonString = text.substring(start, end + 1);
    const shoes = JSON.parse(jsonString);

    res.status(200).json(shoes);

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Absolute Final Fallback if AI fails: Return generic error or empty
    res.status(200).json([]); 
  }
}
