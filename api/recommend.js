import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API Key is missing" });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using Flash-Lite for speed and high token limit
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  try {
    const userProfile = req.body;
    
    // ============================================================
    // 1. THE MASTER DATABASE (Full 233 Shoes from Spreadsheet)
    // ============================================================
    const SHOE_DATABASE = [
  {"name": "ADIDAS Adizero Adios Pro 4", "brand": "ADIDAS", "price_filter": 22999, "price_display": "₹21,999 - ₹24,000", "type": "Elite Racing (New)", "features": "Foam: Lightstrike Pro (New Geometry)  Plate: EnergyRods 2.0 (Carbon)", "retailer": "Official, Dawntown, Hype Fly"},
  {"name": "ADIDAS Adizero Adios Pro 3", "brand": "ADIDAS", "price_filter": 16000, "price_display": "₹14,000 - ₹18,000", "type": "Elite Racing (Value)", "features": "Foam: Lightstrike Pro  Plate: EnergyRods 2.0", "retailer": "Myntra, Flipkart, Official (Sale)"},
  {"name": "ADIDAS Adizero Prime X 2 Strung", "brand": "ADIDAS", "price_filter": 35500, "price_display": "₹26,000 - ₹45,000", "type": "Illegal Racing (50mm)", "features": "Foam: 3 Layers Lightstrike Pro  Plate: Carbon Plate & Rods", "retailer": "Culture Circle, Dawntown"},
  {"name": "ADIDAS Adizero Takumi Sen 10", "brand": "ADIDAS", "price_filter": 17000, "price_display": "₹16,000 - ₹18,000", "type": "5K/10K Racing", "features": "Foam: Lightstrike Pro  Plate: Glass-fiber EnergyRods", "retailer": "Official, Hype Fly"},
  {"name": "ADIDAS Adizero Boston 13", "brand": "ADIDAS", "price_filter": 16499, "price_display": "₹15,999 - ₹16,999", "type": "Tempo / Speed (New)", "features": "Foam: Lightstrike Pro (Softer) + EVA  Plate: Glass-fiber EnergyRods", "retailer": "Official, Select Retailers"},
  {"name": "ADIDAS Adizero Boston 12", "brand": "ADIDAS", "price_filter": 11250, "price_display": "₹9,500 - ₹13,000", "type": "Tempo / Speed (Value)", "features": "Foam: Lightstrike Pro + Lightstrike 2.0", "retailer": "Myntra, Flipkart, Ajio"},
  {"name": "ADIDAS Adizero Evo SL", "brand": "ADIDAS", "price_filter": 15999, "price_display": "₹15,999", "type": "Speed Daily (New)", "features": "Foam: Full Lightstrike Pro (No Plate)", "retailer": "Official, VegNonVeg"},
  {"name": "ADIDAS Adizero Sl 2", "brand": "ADIDAS", "price_filter": 10999, "price_display": "₹9,999 - ₹11,999", "type": "Daily Speed", "features": "Foam: Lightstrike Pro Core + Lightstrike 2.0 Frame", "retailer": "Official, Myntra, Flipkart"},
  {"name": "ADIDAS Supernova Rise 2", "brand": "ADIDAS", "price_filter": 13999, "price_display": "₹13,999", "type": "Daily Trainer", "features": "Foam: Dreamstrike+ (PEBA based)", "retailer": "Official, Amazon"},
  {"name": "ADIDAS Ultraboost 5", "brand": "ADIDAS", "price_filter": 16999, "price_display": "₹16,999", "type": "Max Cushion", "features": "Foam: Light Boost (New Formula)", "retailer": "Official, Myntra"},
  {"name": "ADIDAS Ultraboost 5X", "brand": "ADIDAS", "price_filter": 17999, "price_display": "₹17,999", "type": "Max Cushion (Premium)", "features": "Foam: Light Boost (Lighter Upper)", "retailer": "Official"},
  {"name": "ADIDAS Ultraboost Light", "brand": "ADIDAS", "price_filter": 10500, "price_display": "₹9,000 - ₹12,000", "type": "Max Cushion (Value)", "features": "Foam: Light Boost", "retailer": "Amazon, Flipkart, Ajio"},
  {"name": "ADIDAS Supernova Stride", "brand": "ADIDAS", "price_filter": 8999, "price_display": "₹8,999", "type": "Daily Trainer", "features": "Foam: Dreamstrike+ Carrier", "retailer": "Official, Amazon"},
  {"name": "ADIDAS Adistar 3", "brand": "ADIDAS", "price_filter": 12999, "price_display": "₹12,999", "type": "Max Cushion / Recovery", "features": "Foam: Repetitor 2.0 (Firm Rocker)", "retailer": "Official, Flipkart"},
  {"name": "ADIDAS Adistar CS 2", "brand": "ADIDAS", "price_filter": 14999, "price_display": "₹14,999", "type": "Stability Max", "features": "Foam: Repetitor+", "retailer": "Official"},
  {"name": "ADIDAS Solarglide 6", "brand": "ADIDAS", "price_filter": 9999, "price_display": "₹8,000 - ₹11,999", "type": "Daily Trainer", "features": "Foam: Boost", "retailer": "Amazon, Myntra"},
  {"name": "ADIDAS Pureboost 23", "brand": "ADIDAS", "price_filter": 7999, "price_display": "₹6,500 - ₹9,999", "type": "Daily / Gym", "features": "Foam: Full Boost", "retailer": "Myntra, Flipkart"},
  {"name": "ADIDAS Duramo Speed", "brand": "ADIDAS", "price_filter": 6999, "price_display": "₹5,500 - ₹7,999", "type": "Budget Speed", "features": "Foam: Lightstrike", "retailer": "Amazon, Flipkart"},
  {"name": "ADIDAS Switch FWD 2", "brand": "ADIDAS", "price_filter": 13999, "price_display": "₹13,999", "type": "Novelty / Cushion", "features": "Foam: EVA voids (Mechanical Cushion)", "retailer": "Official, Myntra"},
  {"name": "ADIDAS 4DFWD 3", "brand": "ADIDAS", "price_filter": 19999, "price_display": "₹18,000 - ₹22,000", "type": "Novelty / Tech", "features": "Tech: 3D Printed Lattice", "retailer": "Official, Dawntown"},
  {"name": "ADIDAS Questar 3", "brand": "ADIDAS", "price_filter": 5999, "price_display": "₹4,999 - ₹6,999", "type": "Budget Daily", "features": "Foam: Bounce", "retailer": "Flipkart, Amazon"},
  {"name": "ADIDAS Galaxy 7", "brand": "ADIDAS", "price_filter": 4599, "price_display": "₹3,999 - ₹5,299", "type": "Entry Level", "features": "Foam: Cloudfoam", "retailer": "Amazon, Flipkart"},
  {"name": "ADIDAS Response Super", "brand": "ADIDAS", "price_filter": 6999, "price_display": "₹5,500 - ₹7,500", "type": "Daily Trainer", "features": "Foam: Dreamstrike Core", "retailer": "Myntra, Ajio"},
  {"name": "ADIDAS Runfalcon 5", "brand": "ADIDAS", "price_filter": 4299, "price_display": "₹3,599 - ₹4,999", "type": "Entry Level", "features": "Foam: Cloudfoam", "retailer": "Flipkart, Amazon"},
  {"name": "ADIDAS Lite Racer 4.0", "brand": "ADIDAS", "price_filter": 3299, "price_display": "₹2,500 - ₹3,999", "type": "Casual Run", "features": "Foam: Cloudfoam", "retailer": "Amazon, Flipkart"},
  {"name": "ADIDAS TorFlex", "brand": "ADIDAS", "price_filter": 5299, "price_display": "₹4,599 - ₹5,999", "type": "Budget Daily", "features": "Foam: Bounce", "retailer": "Flipkart, Amazon"},
  {"name": "ASICS Metaspeed Sky Paris", "brand": "ASICS", "price_filter": 21999, "price_display": "₹21,999", "type": "Elite Racing", "features": "Foam: FF Turbo+  Plate: Carbon (Optimized for Stride)", "retailer": "Official, Tata Cliq"},
  {"name": "ASICS Metaspeed Edge Paris", "brand": "ASICS", "price_filter": 21999, "price_display": "₹21,999", "type": "Elite Racing", "features": "Foam: FF Turbo+  Plate: Carbon (Optimized for Cadence)", "retailer": "Official, Tata Cliq"},
  {"name": "ASICS Metaspeed Edge Tokyo", "brand": "ASICS", "price_filter": 14999, "price_display": "₹14,999 (Clearance)", "type": "Racing (Value)", "features": "Foam: FF Turbo  Plate: Carbon (Cadence)", "retailer": "Flipkart (Rare), Resellers"},
  {"name": "ASICS Metaspeed Ray", "brand": "ASICS", "price_filter": 24999, "price_display": "₹24,999 (Future)", "type": "Elite Racing (Next Gen)", "features": "Foam: FF Turbo Max (Prototype)", "retailer": "Official (Late 2026)"},
  {"name": "ASICS Superblast 2", "brand": "ASICS", "price_filter": 21999, "price_display": "₹21,999", "type": "Super Trainer", "features": "Foam: FF Turbo+ (No Plate)", "retailer": "Official, VegNonVeg"},
  {"name": "ASICS Magic Speed 4", "brand": "ASICS", "price_filter": 15999, "price_display": "₹15,999", "type": "Speed Trainer", "features": "Foam: FF Turbo + FF Blast+  Plate: Carbon", "retailer": "Official, Tata Cliq"},
  {"name": "ASICS Novablast 5", "brand": "ASICS", "price_filter": 13999, "price_display": "₹13,999", "type": "Daily Speed", "features": "Foam: FF Blast Max (New)", "retailer": "Official, Amazon"},
  {"name": "ASICS Novablast 4", "brand": "ASICS", "price_filter": 11999, "price_display": "₹10,999 - ₹13,499", "type": "Daily Speed (Value)", "features": "Foam: FF Blast+ Eco", "retailer": "Amazon, Flipkart"},
  {"name": "ASICS Gel Nimbus 27", "brand": "ASICS", "price_filter": 16999, "price_display": "₹16,999", "type": "Max Cushion", "features": "Foam: FF Blast+ Eco (Plush)", "retailer": "Official, Tata Cliq"},
  {"name": "ASICS Gel Nimbus 28", "brand": "ASICS", "price_filter": 16999, "price_display": "₹16,999", "type": "Max Cushion (Future)", "features": "Foam: FF Blast+ Eco", "retailer": "Official (Late 2025)"},
  {"name": "ASICS Gel Nimbus 28 PLATINUM", "brand": "ASICS", "price_filter": 17499, "price_display": "₹17,499", "type": "Max Cushion (Style)", "features": "Foam: FF Blast+ Eco (Chrome)", "retailer": "Official"},
  {"name": "ASICS Gel Kayano 31", "brand": "ASICS", "price_filter": 12500, "price_display": "₹10,000 - ₹15,000", "type": "Stability Max", "features": "Foam: FF Blast+  Tech: 4D Guidance System", "retailer": "Official, IndiaMart"},
  {"name": "ASICS Gel Kayano 32", "brand": "ASICS", "price_filter": 16999, "price_display": "₹16,999", "type": "Stability Max (Future)", "features": "Foam: FF Blast+ Eco (New Geometry)", "retailer": "Official (2026)"},
  {"name": "ASICS Gel Kayano 32 PLATINUM", "brand": "ASICS", "price_filter": 17499, "price_display": "₹17,499", "type": "Stability (Style)", "features": "Tech: Platinum finishes", "retailer": "Official"},
  {"name": "ASICS Gel Kayano 32 WIDE", "brand": "ASICS", "price_filter": 16999, "price_display": "₹16,999", "type": "Stability (Wide)", "features": "Fit: 2E/4E Options", "retailer": "Official"},
  {"name": "ASICS Gel Kayano 32 EXTRA WIDE", "brand": "ASICS", "price_filter": 16999, "price_display": "₹16,999", "type": "Stability (X-Wide)", "features": "Fit: 4E Option", "retailer": "Official"},
  {"name": "ASICS Gel Cumulus 26", "brand": "ASICS", "price_filter": 10999, "price_display": "₹9,999 - ₹11,999", "type": "Daily Trainer", "features": "Foam: FF Blast+  Tech: PureGEL", "retailer": "Amazon, Flipkart"},
  {"name": "ASICS Gel Cumulus 27", "brand": "ASICS", "price_filter": 10700, "price_display": "₹8,399 - ₹12,999", "type": "Daily Trainer (New)", "features": "Foam: FF Blast+ Eco", "retailer": "Flipkart, Official"},
  {"name": "ASICS GT-2000 13", "brand": "ASICS", "price_filter": 13999, "price_display": "₹13,999", "type": "Stability", "features": "Foam: FF Blast+ + 3D Guidance", "retailer": "Official, Amazon"},
  {"name": "ASICS GT-2000 14", "brand": "ASICS", "price_filter": 13999, "price_display": "₹13,999", "type": "Stability (Future)", "features": "Foam: Updated Guidance", "retailer": "Official"},
  {"name": "ASICS GT-1000 13", "brand": "ASICS", "price_filter": 8999, "price_display": "₹8,999", "type": "Budget Stability", "features": "Foam: Flytefoam + GEL", "retailer": "Amazon, Flipkart"},
  {"name": "ASICS Noosa Tri 16", "brand": "ASICS", "price_filter": 11999, "price_display": "₹11,999", "type": "Triathlon / Speed", "features": "Foam: FF Blast+ (Colorful)", "retailer": "Official, Tata Cliq"},
  {"name": "ASICS Glideride Max", "brand": "ASICS", "price_filter": 14999, "price_display": "₹14,999", "type": "Long Run Rocker", "features": "Foam: FF Blast Max  Tech: Guidesole", "retailer": "Official"},
  {"name": "ASICS Gel Pulse 15", "brand": "ASICS", "price_filter": 7999, "price_display": "₹6,999 - ₹8,999", "type": "Budget Daily", "features": "Foam: Flytefoam", "retailer": "Amazon, Flipkart"},
  {"name": "ASICS Gel Pulse 16", "brand": "ASICS", "price_filter": 8999, "price_display": "₹7,999 - ₹9,999", "type": "Daily Trainer", "features": "Foam: Amplifoam+", "retailer": "Amazon, Flipkart"},
  {"name": "ASICS Gel Excite 10", "brand": "ASICS", "price_filter": 6499, "price_display": "₹5,500 - ₹7,499", "type": "Entry Level", "features": "Foam: Amplifoam+", "retailer": "Amazon, Myntra"},
  {"name": "ASICS Gel Excite 11", "brand": "ASICS", "price_filter": 7999, "price_display": "₹7,999", "type": "Entry Level", "features": "Foam: Amplifoam+ (Updated)", "retailer": "Official"},
  {"name": "ASICS Jolt 4", "brand": "ASICS", "price_filter": 4299, "price_display": "₹3,500 - ₹4,999", "type": "Budget Entry", "features": "Foam: EVA", "retailer": "Flipkart, Amazon"},
  {"name": "ASICS Patriot 13", "brand": "ASICS", "price_filter": 4499, "price_display": "₹3,999 - ₹5,000", "type": "Budget Entry", "features": "Foam: EVA", "retailer": "Amazon, Flipkart"},
  {"name": "BROOKS Hyperion Elite 4", "brand": "BROOKS", "price_filter": 21999, "price_display": "₹21,999", "type": "Marathon Racer", "features": "Foam: DNA Flash v2 (Nitrogen)  Plate: Carbon", "retailer": "Official, Amazon"},
  {"name": "BROOKS Hyperion Elite LD", "brand": "BROOKS", "price_filter": 16000, "price_display": "₹16,000 (Est)", "type": "Track Spike", "features": "Plate: Carbon Spike Plate", "retailer": "Specialty Stores"},
  {"name": "BROOKS Hyperion Elite MD", "brand": "BROOKS", "price_filter": 16000, "price_display": "₹16,000 (Est)", "type": "Track Spike", "features": "Plate: Carbon Spike Plate", "retailer": "Specialty Stores"},
  {"name": "BROOKS Hyperion Max", "brand": "BROOKS", "price_filter": 15999, "price_display": "₹15,999", "type": "Speed Trainer", "features": "Foam: DNA Flash (No Plate)", "retailer": "Official, Tata Cliq"},
  {"name": "BROOKS Hyperion GTS", "brand": "BROOKS", "price_filter": 14999, "price_display": "₹14,999", "type": "Speed Stability", "features": "Foam: DNA Flash  Tech: GuideRails", "retailer": "Official"},
  {"name": "BROOKS Glycerin 21", "brand": "BROOKS", "price_filter": 15499, "price_display": "₹15,499", "type": "Max Cushion", "features": "Foam: DNA Loft v3 (Nitrogen)", "retailer": "Official, Amazon"},
  {"name": "BROOKS Glycerin Stealthfit 21", "brand": "BROOKS", "price_filter": 15499, "price_display": "₹15,499", "type": "Max Cushion", "features": "Foam: DNA Loft v3  Fit: Knit Upper", "retailer": "Official"},
  {"name": "BROOKS Ghost 16", "brand": "BROOKS", "price_filter": 12999, "price_display": "₹12,999", "type": "Daily Workhorse", "features": "Foam: DNA Loft v3", "retailer": "Official, Amazon"},
  {"name": "BROOKS Ghost Max 2", "brand": "BROOKS", "price_filter": 13999, "price_display": "₹13,999", "type": "Max Cushion Rocker", "features": "Foam: DNA Loft v3 (High Stack)", "retailer": "Official"},
  {"name": "BROOKS Adrenaline GTS 23", "brand": "BROOKS", "price_filter": 12999, "price_display": "₹12,999", "type": "Stability", "features": "Tech: GuideRails + DNA Loft v2", "retailer": "Official, Amazon"},
  {"name": "BROOKS Launch 10", "brand": "BROOKS", "price_filter": 9999, "price_display": "₹9,999", "type": "Lightweight Daily", "features": "Foam: BioMoGo DNA", "retailer": "Amazon"},
  {"name": "BROOKS Launch GTS 10", "brand": "BROOKS", "price_filter": 10999, "price_display": "₹10,999", "type": "Lightweight Stability", "features": "Tech: GuideRails", "retailer": "Amazon"},
  {"name": "BROOKS Levitate 6", "brand": "BROOKS", "price_filter": 9999, "price_display": "₹8,999 - ₹10,999", "type": "Energy Return", "features": "Foam: DNA Amp v2", "retailer": "Myntra, Flipkart"},
  {"name": "BROOKS Revel 6", "brand": "BROOKS", "price_filter": 7999, "price_display": "₹7,999", "type": "Budget Daily", "features": "Foam: BioMoGo DNA", "retailer": "Amazon, Flipkart"},
  {"name": "BROOKS Catamount Agil", "brand": "BROOKS", "price_filter": 15999, "price_display": "₹15,999", "type": "Trail Race", "features": "Foam: DNA Flash  Plate: SkyVault", "retailer": "Official"},
  {"name": "BROOKS Cascadia 17", "brand": "BROOKS", "price_filter": 13999, "price_display": "₹13,999", "type": "Trail Workhorse", "features": "Tech: Trail Adapt System", "retailer": "Official, Amazon"},
  {"name": "BROOKS Caldera 7", "brand": "BROOKS", "price_filter": 14999, "price_display": "₹14,999", "type": "Trail Max Cushion", "features": "Foam: DNA Loft v3 (Trail)", "retailer": "Official"},
  {"name": "HOKA Cielo X1", "brand": "HOKA", "price_filter": 25999, "price_display": "₹24,000 - ₹27,999", "type": "Elite Racer", "features": "Foam: PEBA (Dual Layer)  Plate: Winged Carbon", "retailer": "Tata Cliq, Triworld"},
  {"name": "HOKA Cielo X1 2.0", "brand": "HOKA", "price_filter": 37500, "price_display": "₹30,000 - ₹45,000", "type": "Elite Racer (New)", "features": "Foam: Updated PEBA", "retailer": "Select Retailers"},
  {"name": "HOKA Rocket X 2", "brand": "HOKA", "price_filter": 21999, "price_display": "₹21,999", "type": "Marathon Racer", "features": "Foam: PEBA  Plate: Carbon", "retailer": "Tata Cliq"},
  {"name": "HOKA Mach X 2", "brand": "HOKA", "price_filter": 18999, "price_display": "₹18,999", "type": "Super Trainer", "features": "Foam: PEBA + EVA  Plate: PEBAX Plate", "retailer": "Tata Cliq"},
  {"name": "HOKA Skyward X", "brand": "HOKA", "price_filter": 19999, "price_display": "₹19,999", "type": "Super Trainer (Max)", "features": "Foam: PEBA + SCF EVA  Plate: Carbon", "retailer": "Tata Cliq, Triworld"},
  {"name": "HOKA Mach 6", "brand": "HOKA", "price_filter": 13999, "price_display": "₹13,999", "type": "Speed Daily", "features": "Foam: Super Critical EVA (No Plate)", "retailer": "Tata Cliq, Amazon"},
  {"name": "HOKA Clifton 9", "brand": "HOKA", "price_filter": 12499, "price_display": "₹11,000 - ₹13,999", "type": "Daily Cushion", "features": "Foam: Compression Molded EVA", "retailer": "Tata Cliq, Myntra"},
  {"name": "HOKA Clifton 10", "brand": "HOKA", "price_filter": 13999, "price_display": "₹13,999", "type": "Daily Cushion (New)", "features": "Foam: Updated EVA", "retailer": "Official, Tata Cliq"},
  {"name": "HOKA Clifton L Suede Sneaker", "brand": "HOKA", "price_filter": 14999, "price_display": "₹14,999", "type": "Lifestyle", "features": "Material: Suede", "retailer": "Lifestyle Stores"},
  {"name": "HOKA Bondi 8", "brand": "HOKA", "price_filter": 14999, "price_display": "₹14,999", "type": "Max Recovery", "features": "Foam: Soft EVA (Massive)", "retailer": "Tata Cliq, Amazon"},
  {"name": "HOKA Bondi 9", "brand": "HOKA", "price_filter": 15999, "price_display": "₹15,999", "type": "Max Recovery (New)", "features": "Foam: Updated Soft EVA", "retailer": "Official"},
  {"name": "HOKA Arahi 7", "brand": "HOKA", "price_filter": 13499, "price_display": "₹13,499", "type": "Stability", "features": "Tech: J-Frame Support", "retailer": "Tata Cliq"},
  {"name": "HOKA Rincon 4", "brand": "HOKA", "price_filter": 10999, "price_display": "₹10,999", "type": "Lightweight Daily", "features": "Foam: EVA (Light)", "retailer": "Tata Cliq, Amazon"},
  {"name": "HOKA Kawana 2", "brand": "HOKA", "price_filter": 12999, "price_display": "₹12,999", "type": "Gym / Run", "features": "Foam: CMEVA (Firm)", "retailer": "Tata Cliq"},
  {"name": "HOKA Transport", "brand": "HOKA", "price_filter": 11999, "price_display": "₹11,999", "type": "Commuter", "features": "Tech: Cordura Upper", "retailer": "Tata Cliq"},
  {"name": "HOKA Solimar", "brand": "HOKA", "price_filter": 9999, "price_display": "₹9,999", "type": "Daily / Gym", "features": "Foam: Balanced EVA", "retailer": "Amazon"},
  {"name": "HOKA Ora Recovery Shoe 2", "brand": "HOKA", "price_filter": 7999, "price_display": "₹7,999", "type": "Recovery", "features": "Foam: Soft EVA", "retailer": "Triworld"},
  {"name": "HOKA Tecton X 2", "brand": "HOKA", "price_filter": 21999, "price_display": "₹21,999", "type": "Trail Racer", "features": "Foam: ProFlyX  Plate: Carbon (Parallel)", "retailer": "Triworld"},
  {"name": "HOKA Speedgoat 5", "brand": "HOKA", "price_filter": 14999, "price_display": "₹14,999", "type": "Trail Workhorse", "features": "Tech: Vibram Megagrip", "retailer": "Triworld, Tata Cliq"},
  {"name": "HOKA Speedgoat 5 GTX", "brand": "HOKA", "price_filter": 16999, "price_display": "₹16,999", "type": "Trail Running", "features": "Tech: Vibram Megagrip + GoreTex", "retailer": "Triworld, Tata Cliq"},
  {"name": "HOKA Speedgoat 6", "brand": "HOKA", "price_filter": 15999, "price_display": "₹15,999", "type": "Trail Workhorse (New)", "features": "Tech: Updated Vibram Lugs", "retailer": "Official"},
  {"name": "HOKA Challenger 7", "brand": "HOKA", "price_filter": 12999, "price_display": "₹12,999", "type": "Road-to-Trail", "features": "Tech: All-Terrain Tread", "retailer": "Tata Cliq"},
  {"name": "NIKE Alphafly 3", "brand": "NIKE", "price_filter": 22795, "price_display": "₹22,795", "type": "Marathon Racer", "features": "Foam: ZoomX  Plate: Carbon Flyplate + Air Zoom", "retailer": "Official, Dawntown"},
  {"name": "NIKE Alphafly 3 Blueprint", "brand": "NIKE", "price_filter": 26995, "price_display": "₹26,995", "type": "Marathon Racer (Color)", "features": "Foam: ZoomX (Blueprint Pack)", "retailer": "Official"},
  {"name": "NIKE Vaporfly 3", "brand": "NIKE", "price_filter": 20695, "price_display": "₹20,695", "type": "Marathon Racer", "features": "Foam: ZoomX  Plate: Carbon Flyplate", "retailer": "Official, Myntra"},
  {"name": "NIKE Vaporfly 4", "brand": "NIKE", "price_filter": 22000, "price_display": "₹22,000 (Est)", "type": "Marathon Racer (Future)", "features": "Foam: ZoomX (Optimized)", "retailer": "Official (Late 2026)"},
  {"name": "NIKE Vaporfly Next% 3", "brand": "NIKE", "price_filter": 20695, "price_display": "₹20,695", "type": "Marathon Racer", "features": "Foam: ZoomX", "retailer": "Official"},
  {"name": "NIKE Streakfly", "brand": "NIKE", "price_filter": 14995, "price_display": "₹14,995", "type": "5K/10K Racer", "features": "Foam: ZoomX (Midfoot Shank)", "retailer": "Official"},
  {"name": "NIKE Streakfly 2", "brand": "NIKE", "price_filter": 14995, "price_display": "₹14,995", "type": "5K/10K Racer (New)", "features": "Foam: ZoomX (Updated)", "retailer": "Official"},
  {"name": "NIKE Zoom Fly 6", "brand": "NIKE", "price_filter": 15995, "price_display": "₹15,995", "type": "Tempo / Trainer", "features": "Foam: ZoomX + SR02  Plate: Carbon", "retailer": "Official, Myntra"},
  {"name": "NIKE Tempo Next% 2", "brand": "NIKE", "price_filter": 16495, "price_display": "₹16,495", "type": "Tempo / Speed", "features": "Foam: ZoomX + React  Tech: Air Zoom Pods", "retailer": "Official (Rare)"},
  {"name": "NIKE Invincible 3", "brand": "NIKE", "price_filter": 16995, "price_display": "₹16,995", "type": "Max Cushion", "features": "Foam: Full ZoomX (Slab)", "retailer": "Official, Ajio"},
  {"name": "NIKE Vomero 17", "brand": "NIKE", "price_filter": 14495, "price_display": "₹14,495", "type": "Max Cushion", "features": "Foam: ZoomX + Cushlon 3.0", "retailer": "Official, Myntra"},
  {"name": "NIKE Vomero 18", "brand": "NIKE", "price_filter": 14495, "price_display": "₹14,495", "type": "Max Cushion (New)", "features": "Foam: ZoomX (Updated Stack)", "retailer": "Official (Late 2025)"},
  {"name": "NIKE Vomero Plus", "brand": "NIKE", "price_filter": 15495, "price_display": "₹15,495", "type": "Max Cushion (Premium)", "features": "Foam: ZoomX + ReactX", "retailer": "Official"},
  {"name": "NIKE Vomero Premium", "brand": "NIKE", "price_filter": 15995, "price_display": "₹15,995", "type": "Max Cushion (Luxe)", "features": "Tech: Premium Materials", "retailer": "Official"},
  {"name": "NIKE Vomero 16", "brand": "NIKE", "price_filter": 11000, "price_display": "₹10,000 - ₹12,000", "type": "Max Cushion (Old)", "features": "Foam: ZoomX + SR02", "retailer": "Myntra (Clearance)"},
  {"name": "NIKE Pegasus 41", "brand": "NIKE", "price_filter": 11895, "price_display": "₹11,895", "type": "Daily Workhorse", "features": "Foam: ReactX + Air Zoom Units", "retailer": "Official, Myntra, Flipkart"},
  {"name": "NIKE Pegasus 41 / 42", "brand": "NIKE", "price_filter": 11895, "price_display": "₹11,895", "type": "Daily Workhorse", "features": "Foam: ReactX", "retailer": "Official"},
  {"name": "NIKE Pegasus 41 'Eliud Kipchoge'", "brand": "NIKE", "price_filter": 12495, "price_display": "₹12,495", "type": "Daily (Special)", "features": "Design: Kipchoge Edition", "retailer": "Official"},
  {"name": "NIKE Pegasus 42", "brand": "NIKE", "price_filter": 11995, "price_display": "₹11,995", "type": "Daily Workhorse (Future)", "features": "Foam: ReactX (Refined)", "retailer": "Official (2026)"},
  {"name": "NIKE Pegasus Premium", "brand": "NIKE", "price_filter": 18000, "price_display": "₹18,000 (Est)", "type": "Super Daily", "features": "Foam: ZoomX + Visible Air Zoom", "retailer": "Official"},
  {"name": "NIKE Infinity RN 4", "brand": "NIKE", "price_filter": 14995, "price_display": "₹14,995", "type": "Daily / Stability", "features": "Foam: ReactX (Rocker)", "retailer": "Official, Myntra"},
  {"name": "NIKE Structure 26", "brand": "NIKE", "price_filter": 11495, "price_display": "₹11,495", "type": "Stability", "features": "Foam: Cushlon + Zoom Air", "retailer": "Official, Amazon"},
  {"name": "NIKE Winflo 11", "brand": "NIKE", "price_filter": 8695, "price_display": "₹8,695", "type": "Budget Daily", "features": "Foam: Cushlon 3.0 + Full Air Unit", "retailer": "Myntra, Ajio"},
  {"name": "NIKE Journey Run", "brand": "NIKE", "price_filter": 7995, "price_display": "₹7,995", "type": "Casual Run", "features": "Foam: ComfiRide", "retailer": "Official, Flipkart"},
  {"name": "NIKE Downshifter 13", "brand": "NIKE", "price_filter": 3995, "price_display": "₹3,495 - ₹4,495", "type": "Entry Level", "features": "Foam: Soft Phylon", "retailer": "Amazon, Flipkart"},
  {"name": "NIKE Revolution 7", "brand": "NIKE", "price_filter": 3695, "price_display": "₹3,695", "type": "Entry Level", "features": "Foam: Soft Foam", "retailer": "Amazon, Flipkart"},
  {"name": "NIKE Quest 6", "brand": "NIKE", "price_filter": 5995, "price_display": "₹5,995", "type": "Budget Daily", "features": "Foam: Foam Blend", "retailer": "Official, Myntra"},
  {"name": "NIKE Pegasus Trail 5", "brand": "NIKE", "price_filter": 12495, "price_display": "₹12,495", "type": "Trail Hybrid", "features": "Foam: ReactX  Tech: High Traction", "retailer": "Official, Myntra"},
  {"name": "NIKE Zegama 2", "brand": "NIKE", "price_filter": 15495, "price_display": "₹15,495", "type": "Trail Tech", "features": "Foam: ZoomX  Tech: Vibram Outsole", "retailer": "Official"},
  {"name": "NIKE Wildhorse 8", "brand": "NIKE", "price_filter": 10995, "price_display": "₹10,995", "type": "Trail Rugged", "features": "Foam: React  Tech: Rock Plate", "retailer": "Official, Myntra"},
  {"name": "NIKE Terra Kiger 10", "brand": "NIKE", "price_filter": 12495, "price_display": "₹12,495", "type": "Trail Fast", "features": "Foam: React (Low Profile)", "retailer": "Official"},
  {"name": "NIKE Ultrafly Trail", "brand": "NIKE", "price_filter": 21695, "price_display": "₹21,695", "type": "Trail Racer", "features": "Foam: ZoomX (Wrapped)  Plate: Carbon", "retailer": "Official"},
  {"name": "NEW BALANCE SC Elite v4", "brand": "NEW BALANCE", "price_filter": 22999, "price_display": "₹22,999", "type": "Marathon Racer", "features": "Foam: FuelCell (100% PEBA)  Plate: Carbon", "retailer": "Official, Culture Circle"},
  {"name": "NEW BALANCE Sc Elite V4", "brand": "NEW BALANCE", "price_filter": 22999, "price_display": "₹22,999", "type": "Marathon Racer", "features": "Foam: FuelCell PEBA", "retailer": "Official"},
  {"name": "NEW BALANCE FuelCell RC Elite v2", "brand": "NEW BALANCE", "price_filter": 15000, "price_display": "₹14,000 - ₹18,000", "type": "Marathon Racer (Old)", "features": "Foam: FuelCell", "retailer": "Amazon (Clearance)"},
  {"name": "NEW BALANCE SC Trainer v3", "brand": "NEW BALANCE", "price_filter": 17999, "price_display": "₹17,999", "type": "Super Trainer", "features": "Foam: FuelCell  Plate: Carbon", "retailer": "Official"},
  {"name": "NEW BALANCE SC Pacer v2", "brand": "NEW BALANCE", "price_filter": 16999, "price_display": "₹16,999", "type": "5K/10K Racer", "features": "Foam: FuelCell  Plate: Carbon", "retailer": "Official"},
  {"name": "NEW BALANCE Rebel v4", "brand": "NEW BALANCE", "price_filter": 13999, "price_display": "₹13,999", "type": "Daily Speed", "features": "Foam: FuelCell Blend", "retailer": "Official, Tata Cliq"},
  {"name": "NEW BALANCE FuelCell Rebel v4", "brand": "NEW BALANCE", "price_filter": 13999, "price_display": "₹13,999", "type": "Daily Speed", "features": "Foam: FuelCell", "retailer": "Official"},
  {"name": "NEW BALANCE Fuelcell Rebel V4", "brand": "NEW BALANCE", "price_filter": 13999, "price_display": "₹13,999", "type": "Daily Speed", "features": "Foam: FuelCell", "retailer": "Official"},
  {"name": "NEW BALANCE Balos", "brand": "NEW BALANCE", "price_filter": 18999, "price_display": "₹18,999", "type": "Max Cushion Speed", "features": "Foam: Fresh Foam X + PEBA blend", "retailer": "Official"},
  {"name": "NEW BALANCE Fresh Foam X 1080 v14", "brand": "NEW BALANCE", "price_filter": 15999, "price_display": "₹15,999", "type": "Daily Max", "features": "Foam: Fresh Foam X (Softer)", "retailer": "Official, Amazon"},
  {"name": "NEW BALANCE Fresh Foam X 1080 V14", "brand": "NEW BALANCE", "price_filter": 15999, "price_display": "₹15,999", "type": "Daily Max", "features": "Foam: Fresh Foam X", "retailer": "Official"},
  {"name": "NEW BALANCE Fresh Foam 1080 v14", "brand": "NEW BALANCE", "price_filter": 15999, "price_display": "₹15,999", "type": "Daily Max", "features": "Foam: Fresh Foam X", "retailer": "Official"},
  {"name": "NEW BALANCE Fresh Foam X 1080 V15", "brand": "NEW BALANCE", "price_filter": 15999, "price_display": "₹15,999", "type": "Daily Max (Future)", "features": "Foam: Fresh Foam X (Next Gen)", "retailer": "Official (2026)"},
  {"name": "NEW BALANCE Fresh Foam X 1080v14", "brand": "NEW BALANCE", "price_filter": 15999, "price_display": "₹15,999", "type": "Daily Max", "features": "Foam: Fresh Foam X", "retailer": "Official"},
  {"name": "NEW BALANCE Fresh Foam More v5", "brand": "NEW BALANCE", "price_filter": 14999, "price_display": "₹14,999", "type": "Max Cushion", "features": "Foam: Massive Fresh Foam X", "retailer": "Official, Flipkart"},
  {"name": "NEW BALANCE 880", "brand": "NEW BALANCE", "price_filter": 11999, "price_display": "₹11,999", "type": "Daily Trainer", "features": "Foam: Fresh Foam X", "retailer": "Official"},
  {"name": "NEW BALANCE 860 v14", "brand": "NEW BALANCE", "price_filter": 12999, "price_display": "₹12,999", "type": "Stability", "features": "Tech: Stability Plane", "retailer": "Official"},
  {"name": "NEW BALANCE 860 Black", "brand": "NEW BALANCE", "price_filter": 12999, "price_display": "₹12,999", "type": "Stability (Color)", "features": "Tech: Stability", "retailer": "Official"},
  {"name": "NEW BALANCE Vongo v6", "brand": "NEW BALANCE", "price_filter": 14999, "price_display": "₹14,999", "type": "Stability Max", "features": "Foam: Fresh Foam X + Plate", "retailer": "Official"},
  {"name": "NEW BALANCE Propel v5", "brand": "NEW BALANCE", "price_filter": 10999, "price_display": "₹10,999", "type": "Daily Speed", "features": "Foam: FuelCell + TPU Plate", "retailer": "Official, Myntra"},
  {"name": "NEW BALANCE 680v8", "brand": "NEW BALANCE", "price_filter": 7999, "price_display": "₹6,000 - ₹8,000", "type": "Entry Daily", "features": "Foam: Fresh Foam", "retailer": "Flipkart, Amazon"},
  {"name": "NEW BALANCE 680XB7", "brand": "NEW BALANCE", "price_filter": 6500, "price_display": "₹6,500", "type": "Entry Daily", "features": "Foam: Fresh Foam", "retailer": "Amazon"},
  {"name": "NEW BALANCE 520v8", "brand": "NEW BALANCE", "price_filter": 4999, "price_display": "₹4,999", "type": "Budget Run", "features": "Foam: EVA", "retailer": "Amazon, Flipkart"},
  {"name": "NEW BALANCE 411v3", "brand": "NEW BALANCE", "price_filter": 3999, "price_display": "₹3,999", "type": "Budget Run", "features": "Foam: EVA", "retailer": "Amazon"},
  {"name": "NEW BALANCE Hierro v8", "brand": "NEW BALANCE", "price_filter": 12999, "price_display": "₹12,999", "type": "Trail Cushion", "features": "Foam: Fresh Foam X  Tech: Vibram", "retailer": "Official"},
  {"name": "NEW BALANCE Garo", "brand": "NEW BALANCE", "price_filter": 9999, "price_display": "₹9,999", "type": "Trail Speed", "features": "Foam: Fresh Foam", "retailer": "Official"},
  {"name": "NEW BALANCE Nitrel v5", "brand": "NEW BALANCE", "price_filter": 7999, "price_display": "₹7,999", "type": "Trail Budget", "features": "Foam: DynaSoft", "retailer": "Myntra, Amazon"},
  {"name": "NEW BALANCE Evozid3", "brand": "NEW BALANCE", "price_filter": 6000, "price_display": "₹6,000", "type": "Daily", "features": "Foam: Fresh Foam", "retailer": "Online"},
  {"name": "NEW BALANCE Evozie3", "brand": "NEW BALANCE", "price_filter": 6000, "price_display": "₹6,000", "type": "Daily", "features": "Foam: Fresh Foam", "retailer": "Online"},
  {"name": "NEW BALANCE MRCELCE3 Electric Indigo", "brand": "NEW BALANCE", "price_filter": 15000, "price_display": "₹15,000", "type": "Speed", "features": "Foam: FuelCell", "retailer": "Amazon"},
  {"name": "PUMA Deviate Nitro Elite 3", "brand": "PUMA", "price_filter": 19999, "price_display": "₹19,999", "type": "Marathon Racer", "features": "Foam: Nitro Elite (PEBA)  Plate: Carbon PWRPLATE", "retailer": "Official, Flipkart"},
  {"name": "PUMA Fast-R Nitro Elite 2", "brand": "PUMA", "price_filter": 22999, "price_display": "₹22,999", "type": "Marathon Racer", "features": "Foam: Nitro Elite  Plate: Exposed Carbon", "retailer": "Official, Myntra"},
  {"name": "PUMA Fast R Nitro Elite 2", "brand": "PUMA", "price_filter": 22999, "price_display": "₹22,999", "type": "Marathon Racer", "features": "Foam: Nitro Elite", "retailer": "Official"},
  {"name": "PUMA Fast-R Nitro Elite 3", "brand": "PUMA", "price_filter": 23999, "price_display": "₹23,999", "type": "Marathon Racer (Future)", "features": "Foam: Nitro Elite (Updated)", "retailer": "Official (Late 2025)"},
  {"name": "PUMA Deviate Nitro 3", "brand": "PUMA", "price_filter": 15999, "price_display": "₹15,999", "type": "Speed Trainer", "features": "Foam: Nitro Elite + Nitro  Plate: Carbon", "retailer": "Official, Flipkart"},
  {"name": "PUMA MagMax Nitro", "brand": "PUMA", "price_filter": 16999, "price_display": "₹16,999", "type": "Max Cushion", "features": "Foam: Nitro (Massive Stack)", "retailer": "Official"},
  {"name": "PUMA Magnify Nitro 2", "brand": "PUMA", "price_filter": 12999, "price_display": "₹12,999", "type": "Max Cushion", "features": "Foam: Full Nitro (Thick)", "retailer": "Flipkart, Amazon"},
  {"name": "PUMA Velocity Nitro 3", "brand": "PUMA", "price_filter": 10999, "price_display": "₹10,999", "type": "Daily Workhorse", "features": "Foam: Nitro + ProFoam  Tech: PumaGrip", "retailer": "Flipkart, Myntra, Amazon"},
  {"name": "PUMA Velocity Nitro 4", "brand": "PUMA", "price_filter": 11999, "price_display": "₹11,999", "type": "Daily Workhorse (New)", "features": "Foam: Updated Nitro", "retailer": "Official (Late 2025)"},
  {"name": "PUMA ForeverRun Nitro", "brand": "PUMA", "price_filter": 13999, "price_display": "₹13,999", "type": "Stability Max", "features": "Foam: Nitro  Tech: RUNGUIDE", "retailer": "Official, Amazon"},
  {"name": "PUMA Liberate Nitro 2", "brand": "PUMA", "price_filter": 9999, "price_display": "₹9,999", "type": "Lightweight Tempo", "features": "Foam: Nitro (Flexible)", "retailer": "Flipkart"},
  {"name": "PUMA Electrify Nitro 3", "brand": "PUMA", "price_filter": 6999, "price_display": "₹6,999", "type": "Budget Daily", "features": "Foam: Nitro Heel + ProFoam", "retailer": "Flipkart, Amazon"},
  {"name": "PUMA Skyrocket Lite", "brand": "PUMA", "price_filter": 4499, "price_display": "₹3,500 - ₹4,999", "type": "Budget Run", "features": "Foam: ProFoam", "retailer": "Amazon, Flipkart"},
  {"name": "PUMA Scend Pro", "brand": "PUMA", "price_filter": 5999, "price_display": "₹5,999", "type": "Budget Run", "features": "Foam: ProFoam", "retailer": "Myntra"},
  {"name": "PUMA Softride Frequence", "brand": "PUMA", "price_filter": 5499, "price_display": "₹5,499", "type": "Comfort / Casual", "features": "Foam: Softride", "retailer": "Amazon"},
  {"name": "PUMA Galaxis Pro", "brand": "PUMA", "price_filter": 3999, "price_display": "₹3,999", "type": "Entry Level", "features": "Foam: EVA", "retailer": "Flipkart"},
  {"name": "PUMA Galaxis Pro Performance Boost", "brand": "PUMA", "price_filter": 4299, "price_display": "₹4,299", "type": "Entry Level", "features": "Foam: EVA", "retailer": "Flipkart"},
  {"name": "PUMA FusionPro Lightweight Cushioned", "brand": "PUMA", "price_filter": 3499, "price_display": "₹3,499", "type": "Budget", "features": "Foam: Fusion Foam", "retailer": "Amazon"},
  {"name": "PUMA Extend Lite Trail", "brand": "PUMA", "price_filter": 4999, "price_display": "₹4,999", "type": "Budget Trail", "features": "Tech: Trail Lug", "retailer": "Amazon"},
  {"name": "PUMA Voyage Nitro 3", "brand": "PUMA", "price_filter": 11999, "price_display": "₹11,999", "type": "Trail Cushion", "features": "Foam: Nitro  Tech: PUMAGRIP ATR", "retailer": "Official"},
  {"name": "PUMA Fast-Trac Nitro 2", "brand": "PUMA", "price_filter": 9999, "price_display": "₹9,999", "type": "Trail Hybrid", "features": "Foam: Nitro", "retailer": "Official"},
  {"name": "SAUCONY Endorphin Pro 4", "brand": "SAUCONY", "price_filter": 23990, "price_display": "₹23,990", "type": "Marathon Racer", "features": "Foam: PWRRUN HG + PB  Plate: Carbon", "retailer": "Tata Cliq, Amazon"},
  {"name": "SAUCONY Endorphin Pro 3", "brand": "SAUCONY", "price_filter": 18000, "price_display": "₹16,000 - ₹20,000", "type": "Marathon Racer (Old)", "features": "Foam: PWRRUN PB  Plate: Carbon", "retailer": "Tata Cliq (Sale)"},
  {"name": "SAUCONY Endorphin Elite", "brand": "SAUCONY", "price_filter": 26990, "price_display": "₹26,990", "type": "Marathon Racer (Max)", "features": "Foam: PWRRUN HG  Plate: Slotted Carbon", "retailer": "Official"},
  {"name": "SAUCONY Endorphin Speed 4", "brand": "SAUCONY", "price_filter": 16990, "price_display": "₹16,990", "type": "Speed Trainer", "features": "Foam: PWRRUN PB  Plate: Nylon", "retailer": "Tata Cliq"},
  {"name": "SAUCONY Kinvara Pro", "brand": "SAUCONY", "price_filter": 18990, "price_display": "₹18,990", "type": "Super Trainer", "features": "Foam: PWRRUN PB + Carbon Plate", "retailer": "Official"},
  {"name": "SAUCONY Triumph 21", "brand": "SAUCONY", "price_filter": 15990, "price_display": "₹15,990", "type": "Max Cushion", "features": "Foam: PWRRUN+ (TPU)", "retailer": "Amazon, Tata Cliq"},
  {"name": "SAUCONY Triumph 22", "brand": "SAUCONY", "price_filter": 16299, "price_display": "₹16,299", "type": "Max Cushion (New)", "features": "Foam: PWRRUN PB (Upgrade)", "retailer": "Tata Cliq"},
  {"name": "SAUCONY Triumph 23", "brand": "SAUCONY", "price_filter": 16999, "price_display": "₹16,999", "type": "Max Cushion (Future)", "features": "Foam: PWRRUN PB", "retailer": "Official (2026)"},
  {"name": "SAUCONY Hurricane 24", "brand": "SAUCONY", "price_filter": 16990, "price_display": "₹16,990", "type": "Max Stability", "features": "Foam: PWRRUN PB + CenterPath", "retailer": "Official"},
  {"name": "SAUCONY Guide 17", "brand": "SAUCONY", "price_filter": 13990, "price_display": "₹13,990", "type": "Stability", "features": "Foam: PWRRUN + CenterPath", "retailer": "Amazon"},
  {"name": "SAUCONY Ride 17", "brand": "SAUCONY", "price_filter": 11990, "price_display": "₹11,999", "type": "Daily Trainer", "features": "Foam: PWRRUN+", "retailer": "Amazon, Tata Cliq"},
  {"name": "SAUCONY Kinvara 14", "brand": "SAUCONY", "price_filter": 10990, "price_display": "₹10,990", "type": "Lightweight Low Drop", "features": "Foam: PWRRUN", "retailer": "Tata Cliq"},
  {"name": "SAUCONY Kinvara 15", "brand": "SAUCONY", "price_filter": 11490, "price_display": "₹11,490", "type": "Lightweight Daily", "features": "Foam: PWRRUN", "retailer": "Official"},
  {"name": "SAUCONY Axon 3", "brand": "SAUCONY", "price_filter": 7990, "price_display": "₹6,990 - ₹8,990", "type": "Budget Max", "features": "Foam: PWRRUN (Firm Rocker)", "retailer": "Tata Cliq, Myntra"},
  {"name": "SAUCONY Peregrine 14", "brand": "SAUCONY", "price_filter": 12999, "price_display": "₹12,999", "type": "Trail Tech", "features": "Foam: PWRRUN  Tech: Vibram", "retailer": "Official"},
  {"name": "SAUCONY Xodus Ultra 3", "brand": "SAUCONY", "price_filter": 15990, "price_display": "₹15,990", "type": "Trail Ultra", "features": "Foam: PWRRUN PB core", "retailer": "Official"},
  {"name": "SAUCONY Aura Tr", "brand": "SAUCONY", "price_filter": 8990, "price_display": "₹8,990", "type": "Trail Budget", "features": "Foam: PWRRUN", "retailer": "Amazon"},
  {"name": "SAUCONY Omni 22", "brand": "SAUCONY", "price_filter": 12990, "price_display": "₹12,990", "type": "Stability", "features": "Tech: Omni Support", "retailer": "Official"},
  {"name": "SAUCONY Tempus", "brand": "SAUCONY", "price_filter": 15990, "price_display": "₹15,990", "type": "Super Stability", "features": "Foam: PWRRUN PB Frame", "retailer": "Official"},
  {"name": "SKECHERS GoRun Ride 11", "brand": "SKECHERS", "price_filter": 10999, "price_display": "₹10,999", "type": "Daily Trainer", "features": "Foam: HyperBurst Ice", "retailer": "Official, Amazon"},
  {"name": "SKECHERS GoRun Max Road 6", "brand": "SKECHERS", "price_filter": 13999, "price_display": "₹13,999", "type": "Max Cushion", "features": "Foam: HyperBurst Ice  Plate: Carbon-Infused", "retailer": "Official"},
  {"name": "SKECHERS GoRun Razor 4", "brand": "SKECHERS", "price_filter": 11999, "price_display": "₹11,999", "type": "Speed Trainer", "features": "Foam: HyperBurst Pro  Plate: Carbon-Infused", "retailer": "Official"},
  {"name": "SKECHERS GoRun Pure 4", "brand": "SKECHERS", "price_filter": 8999, "price_display": "₹8,999", "type": "Daily Trainer", "features": "Foam: Eco Flight", "retailer": "Official, Myntra"},
  {"name": "SKECHERS GoRun Consistent 2", "brand": "SKECHERS", "price_filter": 5499, "price_display": "₹5,499", "type": "Budget Daily", "features": "Foam: Ultra Light", "retailer": "Amazon, Flipkart"},
  {"name": "SKECHERS GoRun Elevate", "brand": "SKECHERS", "price_filter": 4999, "price_display": "₹4,999", "type": "Comfort Run", "features": "Foam: Ultra Go", "retailer": "Amazon, Flipkart"},
  {"name": "SKECHERS GoRun Supersonic Max", "brand": "SKECHERS", "price_filter": 7999, "price_display": "₹7,999", "type": "Daily Max", "features": "Foam: Ultra Go + Goga Mat", "retailer": "Official"},
  {"name": "UNDER ARMOUR Velociti Elite 2", "brand": "UNDER ARMOUR", "price_filter": 21999, "price_display": "₹21,999", "type": "Marathon Racer", "features": "Foam: PEBAX + Flow  Plate: Carbon", "retailer": "Official"},
  {"name": "UNDER ARMOUR Velociti 4", "brand": "UNDER ARMOUR", "price_filter": 11499, "price_display": "₹8,999 - ₹13,999", "type": "Speed / Tempo", "features": "Foam: UA Flow (No Rubber Outsole)", "retailer": "Myntra, Flipkart, Official"},
  {"name": "UNDER ARMOUR Infinite Elite", "brand": "UNDER ARMOUR", "price_filter": 15299, "price_display": "₹13,599 - ₹16,999", "type": "Max Cushion (Endurance)", "features": "Foam: HOVR+ (Beaded Foam)  Tech: Slanted Heel for Impact", "retailer": "Official, Tata Cliq, Myntra"},
  {"name": "UNDER ARMOUR Infinite Pro 2", "brand": "UNDER ARMOUR", "price_filter": 15499, "price_display": "₹13,999 - ₹16,999", "type": "Daily Driver (New)", "features": "Foam: HOVR+ (Updated Geometry)", "retailer": "Official, Ajio, Myntra"},
  {"name": "UNDER ARMOUR Machina 3 Clone", "brand": "UNDER ARMOUR", "price_filter": 12000, "price_display": "₹10,000 - ₹14,000", "type": "Long Run / Smart", "features": "Foam: HOVR  Tech: Clone Upper (Expands with foot)", "retailer": "Flipkart, Amazon, Myntra"},
  {"name": "UNDER ARMOUR Machina Storm", "brand": "UNDER ARMOUR", "price_filter": 15999, "price_display": "₹15,999", "type": "Winter / Rain Run", "features": "Tech: UA Storm (Water Repellent)", "retailer": "Official, Amazon"},
  {"name": "UNDER ARMOUR Sonic 6", "brand": "UNDER ARMOUR", "price_filter": 9499, "price_display": "₹8,999 - ₹9,999", "type": "Daily Trainer", "features": "Foam: HOVR", "retailer": "Amazon, Flipkart"},
  {"name": "UNDER ARMOUR Charged Pursuit 3", "brand": "UNDER ARMOUR", "price_filter": 5499, "price_display": "₹4,999 - ₹5,999", "type": "Budget Run", "features": "Foam: Charged Cushioning", "retailer": "Amazon, Flipkart"},
  {"name": "UNDER ARMOUR Charged Assert 10", "brand": "UNDER ARMOUR", "price_filter": 6499, "price_display": "₹5,999 - ₹6,999", "type": "Budget Stability", "features": "Foam: Charged Cushioning", "retailer": "Amazon, Myntra"},
  {"name": "UNDER ARMOUR Surge 4", "brand": "UNDER ARMOUR", "price_filter": 4499, "price_display": "₹3,999 - ₹4,999", "type": "Entry Level", "features": "Foam: EVA", "retailer": "Amazon, Flipkart"},
  {"name": "UNDER ARMOUR Phantom 4", "brand": "UNDER ARMOUR", "price_filter": 15999, "price_display": "₹14,999 - ₹16,999", "type": "Lifestyle / Comfort Run", "features": "Foam: HOVR+ (Sock-like fit)", "retailer": "Tata Cliq Luxury, Myntra, Official"},
  {"name": "UNDER ARMOUR Apparition", "brand": "UNDER ARMOUR", "price_filter": 13499, "price_display": "₹13,499", "type": "Retro Tech (New)", "features": "Foam: UA HOVR (Legacy Tech)", "retailer": "Official, VegNonVeg, Superkicks"},
  {"name": "UNDER ARMOUR SlipSpeed Mega", "brand": "UNDER ARMOUR", "price_filter": 14999, "price_display": "₹14,000 - ₹15,999", "type": "Gym/Run Hybrid (New)", "features": "Foam: UA Flow (Oversized)  Tech: Collapsible Heel (Convertible)", "retailer": "Official, Underdog Athletics, Amazon"},
  {"name": "XTEP 160X 6.0", "brand": "XTEP", "price_filter": 17999, "price_display": "₹17,999", "type": "Elite Racer", "features": "Foam: XTEP ACE (Updated)  Plate: Carbon", "retailer": "Xtep India"},
  {"name": "XTEP 160X 6.0 Pro", "brand": "XTEP", "price_filter": 20999, "price_display": "₹20,999", "type": "Elite Racer (Max)", "features": "Foam: XTEP ACE  Plate: Carbon", "retailer": "Xtep India"},
  {"name": "XTEP 160X 5.0 Pro", "brand": "XTEP", "price_filter": 14999, "price_display": "₹14,999", "type": "Elite Racer", "features": "Foam: XTEP ACE (PEBA)  Plate: Carbon", "retailer": "Xtep India"},
  {"name": "XTEP 160X 5.0", "brand": "XTEP", "price_filter": 11999, "price_display": "₹11,999", "type": "Marathon Racer", "features": "Foam: XTEP ACE  Plate: Carbon", "retailer": "Xtep India"},
  {"name": "XTEP 160X 3.0 Pro", "brand": "XTEP", "price_filter": 12999, "price_display": "₹12,999", "type": "Marathon Racer (Old)", "features": "Foam: ACE Cushioning", "retailer": "Amazon"},
  {"name": "XTEP 160X Pro", "brand": "XTEP", "price_filter": 0, "price_display": "nan", "type": "Elite Racing", "features": "nan", "retailer": "nan"},
  {"name": "XTEP 160X Series", "brand": "XTEP", "price_filter": 0, "price_display": "nan", "type": "Daily Trainer", "features": "nan", "retailer": "nan"},
  {"name": "XTEP 260 5.0", "brand": "XTEP", "price_filter": 8999, "price_display": "₹8,999", "type": "Speed Trainer", "features": "Foam: Marathon Foam  Plate: Nylon", "retailer": "Xtep India"},
  {"name": "XTEP 2000km", "brand": "XTEP", "price_filter": 7999, "price_display": "₹7,999", "type": "Daily Endurance", "features": "Foam: High Durability", "retailer": "Xtep India"},
  {"name": "XTEP Ace Racing", "brand": "XTEP", "price_filter": 0, "price_display": "nan", "type": "Daily Trainer", "features": "nan", "retailer": "nan"},
  {"name": "XTEP Reactive Coil", "brand": "XTEP", "price_filter": 5999, "price_display": "₹5,000 - ₹6,999", "type": "Daily Budget", "features": "Foam: Soft EVA", "retailer": "Amazon"},
  {"name": "XTEP Ultra Fast", "brand": "XTEP", "price_filter": 4999, "price_display": "₹4,999", "type": "Budget Speed", "features": "Foam: EVA", "retailer": "Amazon"},
  {"name": "XTEP Dynamic Foam Runner", "brand": "XTEP", "price_filter": 0, "price_display": "nan", "type": "Daily Trainer", "features": "nan", "retailer": "nan"},
  {"name": "XTEP Softpad", "brand": "XTEP", "price_filter": 3999, "price_display": "₹3,999", "type": "Budget Cushion", "features": "Foam: Softpad", "retailer": "Amazon"},
  {"name": "DECATHLON Kiprun KD900X LD", "brand": "DECATHLON", "price_filter": 14999, "price_display": "₹14,999", "type": "Marathon Racer", "features": "Foam: PEBAX  Plate: Carbon", "retailer": "Decathlon"},
  {"name": "DECATHLON Kiprun KD900", "brand": "DECATHLON", "price_filter": 9999, "price_display": "₹9,999", "type": "Performance", "features": "Foam: PEBAX (Arkema)", "retailer": "Decathlon App"},
  {"name": "DECATHLON Kiprun KS900", "brand": "DECATHLON", "price_filter": 7999, "price_display": "₹7,999", "type": "Cushion", "features": "Foam: MFOAM (Soft)", "retailer": "Decathlon App"},
  {"name": "DECATHLON Kiprun KS900 Light", "brand": "DECATHLON", "price_filter": 8999, "price_display": "₹8,999", "type": "Light Cushion", "features": "Foam: MFOAM", "retailer": "Decathlon"},
  {"name": "DECATHLON Kiprun 500", "brand": "DECATHLON", "price_filter": 3499, "price_display": "₹3,499", "type": "Entry Trainer", "features": "Basic running shoe", "retailer": "Decathlon"},
  {"name": "DECATHLON Kiprun KN500", "brand": "DECATHLON", "price_filter": 4999, "price_display": "₹4,999", "type": "Flexible Daily", "features": "Foam: EVA (Flex Grooves)", "retailer": "Decathlon"},
  {"name": "DECATHLON Jogflow 500", "brand": "DECATHLON", "price_filter": 3149, "price_display": "₹2,799 - ₹3,499", "type": "Entry Daily", "features": "Foam: EVA (Flexible)", "retailer": "Decathlon App"},
  {"name": "DECATHLON Run Support", "brand": "DECATHLON", "price_filter": 4499, "price_display": "₹4,499", "type": "Entry Trainer", "features": "Stability support", "retailer": "Decathlon"},
  {"name": "DECATHLON Run Active 100", "brand": "DECATHLON", "price_filter": 1749, "price_display": "₹1,499 - ₹1,999", "type": "Budget Entry", "features": "Foam: Basic EVA", "retailer": "Decathlon App"},
  {"name": "DECATHLON Run One", "brand": "DECATHLON", "price_filter": 1299, "price_display": "₹999 - ₹1,599", "type": "Ultra Budget", "features": "Foam: Basic EVA", "retailer": "Decathlon"},
  {"name": "REEBOK Floatride Energy 5", "brand": "REEBOK", "price_filter": 7999, "price_display": "₹7,999", "type": "Daily Trainer", "features": "Foam: Floatride Energy", "retailer": "Official, Myntra"},
  {"name": "REEBOK Floatride Energy 6", "brand": "REEBOK", "price_filter": 8999, "price_display": "₹8,999", "type": "Daily Trainer (New)", "features": "Foam: Floatride Energy", "retailer": "Official"},
  {"name": "REEBOK Floatride Energy 4", "brand": "REEBOK", "price_filter": 6000, "price_display": "₹5,000 - ₹7,000", "type": "Daily Trainer (Old)", "features": "Foam: Floatride Energy", "retailer": "Amazon, Flipkart"},
  {"name": "REEBOK Floatride Energy Symmetros", "brand": "REEBOK", "price_filter": 9999, "price_display": "₹9,999", "type": "Long Run", "features": "Foam: Floatride Energy", "retailer": "Official"},
  {"name": "REEBOK Floatzig 1", "brand": "REEBOK", "price_filter": 11999, "price_display": "₹11,999", "type": "Fun / Bouncy", "features": "Foam: Floatride Energy (Zig Geometry)", "retailer": "VegNonVeg, Official"},
  {"name": "REEBOK Floatzig Symmetros", "brand": "REEBOK", "price_filter": 12999, "price_display": "₹12,999", "type": "Stability Zig", "features": "Foam: Zig Tech", "retailer": "Official"},
  {"name": "REEBOK Nano X4", "brand": "REEBOK", "price_filter": 11999, "price_display": "₹11,999", "type": "CrossFit / Run", "features": "Tech: Stable Heel", "retailer": "Official"},
  {"name": "REEBOK Lite 4.0", "brand": "REEBOK", "price_filter": 3599, "price_display": "₹3,599", "type": "Entry Level", "features": "Foam: EVA", "retailer": "Amazon, Flipkart"},
  {"name": "REEBOK Energen Tech Plus", "brand": "REEBOK", "price_filter": 5999, "price_display": "₹5,999", "type": "Budget Daily", "features": "Foam: Floatride", "retailer": "Myntra"},
  {"name": "REEBOK Flylite Runblaze +", "brand": "REEBOK", "price_filter": 0, "price_display": "nan", "type": "Daily Trainer", "features": "nan", "retailer": "nan"},
  {"name": "REEBOK Motion Pulse", "brand": "REEBOK", "price_filter": 0, "price_display": "nan", "type": "Daily Trainer", "features": "nan", "retailer": "nan"},
  {"name": "REEBOK Raineer", "brand": "REEBOK", "price_filter": 0, "price_display": "nan", "type": "Daily Trainer", "features": "nan", "retailer": "nan"},
  {"name": "REEBOK Runergy Lt Ventrix M", "brand": "REEBOK", "price_filter": 0, "price_display": "nan", "type": "Daily Trainer", "features": "nan", "retailer": "nan"},
  {"name": "MIZUNO Wave Rebellion Pro 2", "brand": "MIZUNO", "price_filter": 24999, "price_display": "₹24,999", "type": "Elite Racer", "features": "Foam: Enerzy Lite+  Tech: Extreme Cut Heel", "retailer": "Official, Amazon (Import)"},
  {"name": "MIZUNO Wave Rebellion Flash 2", "brand": "MIZUNO", "price_filter": 16999, "price_display": "₹16,999", "type": "Speed Trainer", "features": "Foam: Enerzy Lite  Plate: Glass Fiber", "retailer": "Official"},
  {"name": "MIZUNO Wave Rider 28", "brand": "MIZUNO", "price_filter": 13999, "price_display": "₹13,999", "type": "Daily Workhorse", "features": "Foam: Enerzy  Plate: Wave Plate (Plastic)", "retailer": "Official, Amazon"},
  {"name": "MIZUNO Wave Rider 27", "brand": "MIZUNO", "price_filter": 11999, "price_display": "₹10,000 - ₹12,999", "type": "Daily Workhorse", "features": "Foam: Enerzy", "retailer": "Amazon"},
  {"name": "MIZUNO Wave Inspire 20", "brand": "MIZUNO", "price_filter": 13999, "price_display": "₹13,999", "type": "Stability", "features": "Tech: Support Wave Plate", "retailer": "Official"},
  {"name": "MIZUNO Wave Sky 7", "brand": "MIZUNO", "price_filter": 15999, "price_display": "₹15,999", "type": "Max Cushion", "features": "Foam: Enerzy Core", "retailer": "Official"},
  {"name": "MIZUNO Wave Horizon 7", "brand": "MIZUNO", "price_filter": 16999, "price_display": "₹16,999", "type": "Max Stability", "features": "Foam: Enerzy Core + Support", "retailer": "Official"},
  {"name": "ALTRA Vanish Carbon 2", "brand": "ALTRA", "price_filter": 23999, "price_display": "₹23,999", "type": "Zero Drop Racer", "features": "Foam: EGO PRO  Plate: Carbon", "retailer": "Triworld"},
  {"name": "ALTRA Torin 7", "brand": "ALTRA", "price_filter": 14999, "price_display": "₹14,999", "type": "Zero Drop Daily", "features": "Foam: EGO MAX", "retailer": "Triworld, Amazon"},
  {"name": "ALTRA Paradigm 7", "brand": "ALTRA", "price_filter": 15999, "price_display": "₹15,999", "type": "Zero Drop Stability", "features": "Tech: GuideRail", "retailer": "Triworld"},
  {"name": "ALTRA Olympus 5", "brand": "ALTRA", "price_filter": 16999, "price_display": "₹16,999", "type": "Trail Max", "features": "Tech: Vibram Megagrip", "retailer": "Triworld"},
  {"name": "ALTRA Lone Peak 8", "brand": "ALTRA", "price_filter": 13999, "price_display": "₹13,999", "type": "Trail Zero Drop", "features": "Tech: MaxTrac", "retailer": "Triworld, Amazon"},
  {"name": "ALTRA Rivera 4", "brand": "ALTRA", "price_filter": 12999, "price_display": "₹12,999", "type": "Daily Natural", "features": "Foam: EGO", "retailer": "Triworld"},
  {"name": "SALOMON S/Lab Phantasm 2", "brand": "SALOMON", "price_filter": 22999, "price_display": "₹22,999", "type": "Elite Racer", "features": "Foam: Energy Foam+  Plate: Carbon", "retailer": "Official, Tata Cliq"},
  {"name": "SALOMON Aero Glide 2", "brand": "SALOMON", "price_filter": 14999, "price_display": "₹14,999", "type": "Max Cushion", "features": "Foam: Energy Foam", "retailer": "Official"},
  {"name": "SALOMON Speedcross 6", "brand": "SALOMON", "price_filter": 13999, "price_display": "₹13,999", "type": "Trail Mud", "features": "Tech: Deep Lugs", "retailer": "Official, Amazon"},
  {"name": "SALOMON Sense Ride 5", "brand": "SALOMON", "price_filter": 11999, "price_display": "₹11,999", "type": "Trail Versatile", "features": "Foam: Energy Foam", "retailer": "Official, Myntra"},
  {"name": "SALOMON Genesis", "brand": "SALOMON", "price_filter": 15999, "price_display": "₹15,999", "type": "Trail Technical", "features": "Tech: Matryx Upper", "retailer": "Official"},
  {"name": "SALOMON Thundercross", "brand": "SALOMON", "price_filter": 14999, "price_display": "₹14,999", "type": "Trail Grip", "features": "Tech: Aggressive 5mm Lugs", "retailer": "Official"},
  {"name": "KIPRUN KD900X LD", "brand": "KIPRUN", "price_filter": 14999, "price_display": "₹14,999", "type": "Marathon Racer", "features": "Foam: VFOAM Plus (PEBA)  Plate: Carbon", "retailer": "Decathlon"},
  {"name": "KIPRUN KS900 2", "brand": "KIPRUN", "price_filter": 10999, "price_display": "₹10,999", "type": "Max Cushion", "features": "Foam: MFOAM Cushion", "retailer": "Decathlon"},
  {"name": "KIPRUN KN500", "brand": "KIPRUN", "price_filter": 4999, "price_display": "₹4,999", "type": "Flexible Daily", "features": "Foam: Flex Grooves", "retailer": "Decathlon"},
  {"name": "ON RUNNING Cloudboom Echo 3", "brand": "ON RUNNING", "price_filter": 26999, "price_display": "₹26,999", "type": "Marathon Racer", "features": "Foam: Helion HF (PEBA)  Plate: Carbon Speedboard", "retailer": "Official, Tata Cliq Luxury"},
  {"name": "ON RUNNING Cloudmonster 2", "brand": "ON RUNNING", "price_filter": 16999, "price_display": "₹16,999", "type": "Max Cushion", "features": "Foam: Helion (Massive Clouds)", "retailer": "Official, Myntra"},
  {"name": "ON RUNNING Cloudsurfer", "brand": "ON RUNNING", "price_filter": 15999, "price_display": "₹15,999", "type": "Daily Plush", "features": "Tech: CloudTec Phase (No Speedboard)", "retailer": "Official, Amazon"},
  {"name": "ON RUNNING Cloudstratus 3", "brand": "ON RUNNING", "price_filter": 17999, "price_display": "₹17,999", "type": "Max Cushion", "features": "Foam: Double CloudTec", "retailer": "Official"},
  {"name": "ON RUNNING Cloudrunner 2", "brand": "ON RUNNING", "price_filter": 14999, "price_display": "₹14,999", "type": "Stability Daily", "features": "Foam: Zero-Gravity Foam", "retailer": "Official"},
  {"name": "ON RUNNING Cloudflow 4", "brand": "ON RUNNING", "price_filter": 15999, "price_display": "₹15,999", "type": "Speed Trainer", "features": "Foam: Helion", "retailer": "Official"},
  {"name": "ON RUNNING Cloudeclipse", "brand": "ON RUNNING", "price_filter": 17999, "price_display": "₹17,999", "type": "Max Cushion", "features": "Foam: Double Layer CloudTec Phase", "retailer": "Official"},
  {"name": "CAMPUS Nitrofly", "brand": "CAMPUS", "price_filter": 2499, "price_display": "₹2,499", "type": "Budget Daily", "features": "Foam: Nitrofly (EVA)", "retailer": "Amazon, Flipkart"},
  {"name": "CAMPUS Motomania", "brand": "CAMPUS", "price_filter": 1899, "price_display": "₹1,899", "type": "Casual Run", "features": "Foam: EVA", "retailer": "Amazon"},
  {"name": "CAMPUS First", "brand": "CAMPUS", "price_filter": 1499, "price_display": "₹1,499", "type": "Entry Level", "features": "Foam: EVA", "retailer": "Amazon"},
  {"name": "HRX (by Hrithik Roshan) Meta Flash", "brand": "HRX (by Hrithik Roshan)", "price_filter": 3499, "price_display": "₹3,499", "type": "Budget Fashion Run", "features": "Foam: EVA", "retailer": "Myntra"},
  {"name": "HRX (by Hrithik Roshan) Core Run", "brand": "HRX (by Hrithik Roshan)", "price_filter": 1999, "price_display": "₹1,999", "type": "Entry Level", "features": "Foam: EVA", "retailer": "Myntra"},
  {"name": "RED TAPE Athleisure", "brand": "RED TAPE", "price_filter": 1799, "price_display": "₹1,500 - ₹2,500", "type": "Casual Run", "features": "Foam: Memory Foam Insole", "retailer": "Amazon, Flipkart"}
];

    // ============================================================
    // 2. INTELLIGENT FILTERING LOGIC
    // ============================================================
    const userBudget = userProfile.budget || 5000;
    
    // Strict Cap with Buffer (e.g. Budget 5000 -> Max 6000)
    // If budget is high (>= 20k), allow up to 45k+ (Super Shoes)
    let maxPrice;
    if (userBudget >= 20000) {
      maxPrice = 100000; 
    } else {
      maxPrice = Math.round(userBudget * 1.25); 
    }
    const minPrice = 1000; 

    // A. Primary Filter: Strict Budget
    let relevantShoes = SHOE_DATABASE.filter(shoe => shoe.price_filter <= maxPrice);

    // B. Fallback Logic (No Results Found)
    let contextMessage = "";
    if (relevantShoes.length === 0) {
       // Fallback: Just show the cheapest shoes in the database
       relevantShoes = SHOE_DATABASE.sort((a,b) => a.price_filter - b.price_filter).slice(0, 10);
       contextMessage = `CRITICAL NOTICE: The user budget is ₹${userBudget}, but no shoes exist in that range. I have provided the CHEAPEST alternatives. You MUST explicitly tell the user: "No shoes match your exact price filter, but here are the best value options currently available."`;
    }

    // ============================================================
    // 3. THE ANALYST PROMPT
    // ============================================================
    const systemPrompt = `
      You are an Expert Running Shoe Analyst (Simulating RunTesters / Sole Review).
      
      USER PROFILE:
      - Budget: ₹${userBudget}
      - Goal: ${userProfile.goal}
      - Surface: ${userProfile.terrain ? userProfile.terrain.join(', ') : 'Road'}
      - Feel: ${userProfile.feel}
      
      YOUR DATABASE (Filtered Candidates):
      ${JSON.stringify(relevantShoes)}
      
      ${contextMessage}
      
      YOUR TASK:
      1. **Select Top 5:** Analyze the provided 'Filtered Candidates'. Pick the 5 best matches for the user's Goal/Surface.
         - If User wants "Trail/Mud", look for 'Trail' in shoe type or features.
         - If User wants "Race Day", look for 'Race' or Carbon Plates.
      2. **Deep Analysis:** Write a "why_it_fits" review. Simulate looking up reviews. Explain *why* the tech works.
      3. **Price & Links:** - Use "price_display" string from the database.
         - Generate a 'purchase_link' that is a Smart Google Search for "Cheapest Online Price".
      
      OUTPUT FORMAT (JSON Only):
      [
        {
          "rank": 1,
          "name": "Exact Name from DB",
          "price": "String from 'price_display'",
          "match_percentage": Number (80-99),
          "ratings": { "cushion": 1-5, "durability": 1-5, "energy_return": 1-5 },
          "why_it_fits": "Expert analysis...",
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
    res.status(200).json([]); 
  }
}
