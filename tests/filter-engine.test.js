import { describe, expect, it } from 'vitest';
import { calculateBaseScore, filterAndScoreShoes } from '../api/filter-engine.js';
import { SHOE_DATABASE } from '../api/shoe-data.js';

describe('filterAndScoreShoes', () => {
  it('Budget filter: user budget "budget" returns no shoes above ₹10,000 (with 25% buffer)', () => {
    const result = filterAndScoreShoes(
      {
        useCase: null,
        experience: null,
        footType: null,
        mileage: null,
        budget: 'budget',
      },
      SHOE_DATABASE
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((shoe) => shoe.priceMin <= 10_000)).toBe(true);
  });

  it('Budget filter: user budget "premium" includes shoes up to ₹100,000', () => {
    const result = filterAndScoreShoes(
      {
        useCase: null,
        experience: null,
        footType: null,
        mileage: null,
        budget: 'premium',
      },
      SHOE_DATABASE
    );

    const maxPrice = Math.max(...result.map((shoe) => shoe.priceMin));
    expect(maxPrice).toBeLessThanOrEqual(100_000);
    expect(result.some((shoe) => shoe.priceMin >= 20_000)).toBe(true);
  });

  it('Use case filter: user useCase "trail" returns only trail shoes', () => {
    const result = filterAndScoreShoes(
      {
        useCase: 'trail',
        experience: null,
        footType: null,
        mileage: null,
        budget: null,
      },
      SHOE_DATABASE
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((shoe) => shoe.useCases.includes('trail'))).toBe(true);
  });

  it('Use case filter: user useCase "running" includes daily, cushion, speed, or racing shoes', () => {
    const runningUseCases = new Set(['daily', 'cushion', 'speed', 'racing']);
    const result = filterAndScoreShoes(
      {
        useCase: 'running',
        experience: null,
        footType: null,
        mileage: null,
        budget: null,
      },
      SHOE_DATABASE
    );

    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every((shoe) => shoe.useCases.some((useCase) => runningUseCases.has(useCase)))
    ).toBe(true);
  });

  it('Experience filter: user experience "beginner" excludes elite carbon racers', () => {
    const result = filterAndScoreShoes(
      {
        useCase: 'running',
        experience: 'beginner',
        footType: null,
        mileage: null,
        budget: null,
      },
      SHOE_DATABASE
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((shoe) => shoe.experienceLevel.includes('beginner'))).toBe(true);
    expect(
      result.every((shoe) => !String(shoe.category).toLowerCase().includes('elite'))
    ).toBe(true);
  });

  it('Experience filter: user experience "advanced" includes elite shoes', () => {
    const result = filterAndScoreShoes(
      {
        useCase: 'racing',
        experience: 'advanced',
        footType: null,
        mileage: null,
        budget: 'premium',
      },
      SHOE_DATABASE
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.some((shoe) => String(shoe.category).toLowerCase().includes('elite'))).toBe(
      true
    );
  });

  it('Foot type: flat feet boosts stability shoes', () => {
    const preferences = {
      useCase: 'running',
      experience: 'intermediate',
      footType: 'flat',
      mileage: 'medium',
      budget: 'mid',
    };

    const stabilityShoe = {
      id: 's1',
      brand: 'Test',
      model: 'Stable',
      category: 'Stability Daily Trainer',
      priceMin: 9000,
      priceMax: 10000,
      priceDisplay: '₹9,000 - ₹10,000',
      foam: 'EVA',
      plate: '',
      tech: 'EVA',
      availability: 'Test',
      useCases: ['daily', 'stability'],
      experienceLevel: ['intermediate'],
      budgetTier: 'mid',
      buyLinks: { amazon: '#', flipkart: '#', googleShopping: '#', official: '#' },
    };

    const neutralShoe = {
      ...stabilityShoe,
      id: 's2',
      model: 'Neutral',
      category: 'Neutral Daily Trainer',
      useCases: ['daily'],
    };

    expect(calculateBaseScore(stabilityShoe, preferences)).toBeGreaterThan(
      calculateBaseScore(neutralShoe, preferences)
    );
  });

  it('Foot type: high arch boosts neutral cushion shoes', () => {
    const preferences = {
      useCase: 'running',
      experience: 'intermediate',
      footType: 'high_arch',
      mileage: 'medium',
      budget: 'mid',
    };

    const neutralCushionShoe = {
      id: 'n1',
      brand: 'Test',
      model: 'Cushion',
      category: 'Neutral Cushion',
      priceMin: 9000,
      priceMax: 11000,
      priceDisplay: '₹9,000 - ₹11,000',
      foam: 'EVA',
      plate: '',
      tech: 'EVA',
      availability: 'Test',
      useCases: ['cushion', 'daily'],
      experienceLevel: ['intermediate'],
      budgetTier: 'mid',
      buyLinks: { amazon: '#', flipkart: '#', googleShopping: '#', official: '#' },
    };

    const stabilityShoe = {
      ...neutralCushionShoe,
      id: 'n2',
      model: 'Stability',
      category: 'Stability Cushion',
      useCases: ['cushion', 'stability'],
    };

    expect(calculateBaseScore(neutralCushionShoe, preferences)).toBeGreaterThan(
      calculateBaseScore(stabilityShoe, preferences)
    );
  });

  it('Fallback: impossible combo returns the 15 cheapest shoes', () => {
    const impossiblePrefs = {
      useCase: 'trail',
      experience: 'advanced',
      footType: 'high_arch',
      mileage: 'high',
      budget: 'budget',
    };

    const result = filterAndScoreShoes(impossiblePrefs, SHOE_DATABASE);
    const cheapest15 = [...SHOE_DATABASE]
      .sort((a, b) => a.priceMin - b.priceMin)
      .slice(0, 15)
      .map((shoe) => shoe.id);

    expect(result).toHaveLength(15);
    expect(result.every((shoe) => cheapest15.includes(shoe.id))).toBe(true);
  });

  it('Score calculation: trail shoe for trail user scores higher than daily shoe', () => {
    const preferences = {
      useCase: 'trail',
      experience: 'intermediate',
      footType: 'neutral',
      mileage: 'medium',
      budget: 'mid',
    };

    const trailShoe = {
      id: 't1',
      brand: 'Test',
      model: 'Trail Max',
      category: 'Trail',
      priceMin: 9000,
      priceMax: 11000,
      priceDisplay: '₹9,000 - ₹11,000',
      foam: 'EVA',
      plate: '',
      tech: 'EVA',
      availability: 'Test',
      useCases: ['trail'],
      experienceLevel: ['intermediate'],
      budgetTier: 'mid',
      buyLinks: { amazon: '#', flipkart: '#', googleShopping: '#', official: '#' },
    };

    const dailyShoe = {
      ...trailShoe,
      id: 't2',
      model: 'Daily',
      category: 'Daily',
      useCases: ['daily'],
    };

    expect(calculateBaseScore(trailShoe, preferences)).toBeGreaterThan(
      calculateBaseScore(dailyShoe, preferences)
    );
  });

  it('Empty database returns empty array', () => {
    const result = filterAndScoreShoes(
      {
        useCase: 'running',
        experience: 'beginner',
        footType: 'neutral',
        mileage: 'low',
        budget: 'budget',
      },
      []
    );

    expect(result).toEqual([]);
  });

  it('All null preferences returns all shoes unfiltered', () => {
    const result = filterAndScoreShoes(
      {
        useCase: null,
        experience: null,
        footType: null,
        mileage: null,
        budget: null,
      },
      SHOE_DATABASE
    );

    expect(result).toHaveLength(SHOE_DATABASE.length);
    expect(result[0].id).toBe(SHOE_DATABASE[0].id);
    expect(result[result.length - 1].id).toBe(SHOE_DATABASE[SHOE_DATABASE.length - 1].id);
  });
});
