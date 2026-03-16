const { SHOE_DATABASE } = require('../api/shoe-data.js');

describe('Shoe Database Integrity', () => {
  test('has exactly 260 shoes', () => {
    expect(SHOE_DATABASE.length).toBe(260);
  });

  test('has exactly 16 brands', () => {
    const brands = new Set(SHOE_DATABASE.map(s => s.brand));
    expect(brands.size).toBe(16);
  });

  test('includes Mizuno (new brand)', () => {
    const brands = new Set(SHOE_DATABASE.map(s => s.brand));
    expect(brands.has('Mizuno')).toBe(true);
  });

  test('all shoes have valid required fields', () => {
    SHOE_DATABASE.forEach(shoe => {
      expect(shoe.id).toBeTruthy();
      expect(shoe.brand).toBeTruthy();
      expect(shoe.model).toBeTruthy();
      expect(shoe.priceMin).toBeGreaterThan(0);
      expect(shoe.priceMax).toBeGreaterThanOrEqual(shoe.priceMin);
      expect(shoe.priceDisplay).toMatch(/^₹/);
      expect(shoe.useCases.length).toBeGreaterThan(0);
      expect(shoe.experienceLevel.length).toBeGreaterThan(0);
      expect(['budget', 'mid', 'premium']).toContain(shoe.budgetTier);
    });
  });

  test('all shoes have buy links', () => {
    SHOE_DATABASE.forEach(shoe => {
      expect(shoe.buyLinks.amazon).toBeTruthy();
      expect(shoe.buyLinks.flipkart).toBeTruthy();
      expect(shoe.buyLinks.googleShopping).toBeTruthy();
    });
  });

  test('no duplicate IDs', () => {
    const ids = SHOE_DATABASE.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('budget tier distribution is reasonable', () => {
    const tiers = { budget: 0, mid: 0, premium: 0 };
    SHOE_DATABASE.forEach(s => tiers[s.budgetTier]++);
    expect(tiers.budget).toBeGreaterThan(30);
    expect(tiers.mid).toBeGreaterThan(80);
    expect(tiers.premium).toBeGreaterThan(80);
  });

  test('verified Nike Pegasus 41 price', () => {
    const peg41 = SHOE_DATABASE.find(s => s.model === 'Pegasus 41');
    expect(peg41).toBeTruthy();
    expect(peg41.priceMin).toBe(11895);
  });

  test('verified Asics Novablast 5 price', () => {
    const nova5 = SHOE_DATABASE.find(s => s.model === 'Novablast 5');
    expect(nova5).toBeTruthy();
    expect(nova5.priceMin).toBe(13999);
  });
});
