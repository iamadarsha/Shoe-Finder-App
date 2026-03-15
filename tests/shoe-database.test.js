import { describe, expect, it } from 'vitest';
import { SHOE_DATABASE } from '../api/shoe-data.js';

describe('SHOE_DATABASE integrity', () => {
  it('Database has exactly 260 shoes', () => {
    expect(SHOE_DATABASE).toHaveLength(260);
  });

  it('All shoes have required fields', () => {
    const requiredFields = [
      'id',
      'brand',
      'model',
      'category',
      'priceMin',
      'priceMax',
      'priceDisplay',
      'foam',
      'plate',
      'tech',
      'availability',
      'useCases',
      'experienceLevel',
      'budgetTier',
      'buyLinks',
    ];

    for (const shoe of SHOE_DATABASE) {
      for (const field of requiredFields) {
        expect(shoe[field]).not.toBeUndefined();
      }
    }
  });

  it('No shoe has priceMin > priceMax', () => {
    expect(SHOE_DATABASE.every((shoe) => shoe.priceMin <= shoe.priceMax)).toBe(true);
  });

  it('No shoe has priceMin <= 0', () => {
    expect(SHOE_DATABASE.every((shoe) => shoe.priceMin > 0)).toBe(true);
  });

  it('All shoes have at least one useCase', () => {
    expect(SHOE_DATABASE.every((shoe) => Array.isArray(shoe.useCases) && shoe.useCases.length > 0)).toBe(
      true
    );
  });

  it('All shoes have at least one experienceLevel', () => {
    expect(
      SHOE_DATABASE.every(
        (shoe) => Array.isArray(shoe.experienceLevel) && shoe.experienceLevel.length > 0
      )
    ).toBe(true);
  });

  it('All shoes have a valid budgetTier (budget | mid | premium)', () => {
    const allowed = new Set(['budget', 'mid', 'premium']);
    expect(SHOE_DATABASE.every((shoe) => allowed.has(shoe.budgetTier))).toBe(true);
  });

  it('All shoes have Amazon and Flipkart buy links', () => {
    expect(
      SHOE_DATABASE.every(
        (shoe) =>
          typeof shoe.buyLinks?.amazon === 'string' &&
          shoe.buyLinks.amazon.length > 0 &&
          typeof shoe.buyLinks?.flipkart === 'string' &&
          shoe.buyLinks.flipkart.length > 0
      )
    ).toBe(true);
  });

  it('All shoes have a Google Shopping link', () => {
    expect(
      SHOE_DATABASE.every(
        (shoe) =>
          typeof shoe.buyLinks?.googleShopping === 'string' &&
          shoe.buyLinks.googleShopping.length > 0
      )
    ).toBe(true);
  });

  it('No duplicate shoe IDs', () => {
    const ids = SHOE_DATABASE.map((shoe) => shoe.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('Brand count is exactly 16', () => {
    const brandCount = new Set(SHOE_DATABASE.map((shoe) => shoe.brand)).size;
    expect(brandCount).toBe(16);
  });

  it('All priceDisplay strings start with ₹', () => {
    expect(
      SHOE_DATABASE.every(
        (shoe) =>
          typeof shoe.priceDisplay === 'string' && shoe.priceDisplay.trim().startsWith('₹')
      )
    ).toBe(true);
  });
});
