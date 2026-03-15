const BUDGET_MAP = {
  budget: 8000,
  mid: 15000,
  premium: 100000,
};

const USE_CASE_MAP = {
  running: ['daily', 'cushion', 'speed', 'racing'],
  casual: ['casual', 'daily', 'budget'],
  training: ['training', 'daily'],
  walking: ['casual', 'cushion', 'stability', 'budget'],
  trail: ['trail'],
  racing: ['racing', 'speed'],
};

const PREF_KEYS = ['useCase', 'experience', 'footType', 'mileage', 'budget'];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function includesIgnoreCase(input, expected) {
  return String(input ?? '').toLowerCase().includes(expected.toLowerCase());
}

function hasPlate(shoe) {
  const plate = String(shoe?.plate ?? '').toLowerCase();
  return plate.length > 0 && !plate.includes('none') && !plate.includes('no plate');
}

function buyLinkCount(shoe) {
  return Object.values(shoe?.buyLinks ?? {}).filter(
    (value) => typeof value === 'string' && value.trim().length > 0
  ).length;
}

function isStabilityShoe(shoe) {
  const useCases = shoe?.useCases ?? [];
  return (
    useCases.includes('stability') ||
    includesIgnoreCase(shoe?.category, 'stability')
  );
}

function isNeutralCushionShoe(shoe) {
  const useCases = shoe?.useCases ?? [];
  const hasCushionSignal =
    useCases.includes('cushion') || includesIgnoreCase(shoe?.category, 'cushion');
  const hasStabilitySignal = isStabilityShoe(shoe);
  return hasCushionSignal && !hasStabilitySignal;
}

function useCaseMatches(shoe, useCase) {
  if (!useCase) return false;
  const relevantCases = USE_CASE_MAP[useCase] ?? [];
  const shoeUseCases = shoe?.useCases ?? [];
  return shoeUseCases.some((uc) => relevantCases.includes(uc));
}

export function calculateBaseScore(shoe, preferences) {
  let score = 0;
  const prefs = preferences ?? {};

  if (useCaseMatches(shoe, prefs.useCase)) {
    score += 30;
  }

  if (prefs.experience && (shoe?.experienceLevel ?? []).includes(prefs.experience)) {
    score += 20;
  }

  if (prefs.budget && shoe?.budgetTier === prefs.budget) {
    score += 15;
  }

  if (prefs.experience === 'advanced' && hasPlate(shoe)) {
    score += 10;
  }

  if (prefs.footType === 'flat' && isStabilityShoe(shoe)) {
    score += 10;
  }

  if (prefs.footType === 'high_arch' && isNeutralCushionShoe(shoe)) {
    score += 10;
  }

  if (buyLinkCount(shoe) > 3) {
    score += 5;
  }

  return clamp(score, 0, 100);
}

export function filterAndScoreShoes(preferences, shoeDatabase) {
  if (!Array.isArray(shoeDatabase) || shoeDatabase.length === 0) {
    return [];
  }

  const prefs = preferences ?? {};
  const hasNoPreferences = PREF_KEYS.every((key) => !prefs[key]);

  if (hasNoPreferences) {
    return shoeDatabase.map((shoe) => ({ ...shoe, baseScore: 0 }));
  }

  let filtered = [...shoeDatabase];

  if (prefs.budget && BUDGET_MAP[prefs.budget]) {
    const maxPrice = Math.round(BUDGET_MAP[prefs.budget] * 1.25);
    filtered = filtered.filter((shoe) => Number(shoe.priceMin) <= maxPrice);
  }

  if (prefs.useCase) {
    const relevantCases = USE_CASE_MAP[prefs.useCase] ?? [];
    filtered = filtered.filter((shoe) =>
      (shoe.useCases ?? []).some((uc) => relevantCases.includes(uc))
    );
  }

  if (prefs.experience) {
    filtered = filtered.filter((shoe) =>
      (shoe.experienceLevel ?? []).includes(prefs.experience)
    );
  }

  if (filtered.length < 5) {
    filtered = [...shoeDatabase]
      .sort((a, b) => Number(a.priceMin) - Number(b.priceMin))
      .slice(0, 15);
  }

  return filtered
    .map((shoe) => ({ ...shoe, baseScore: calculateBaseScore(shoe, prefs) }))
    .sort(
      (a, b) =>
        b.baseScore - a.baseScore || Number(a.priceMin) - Number(b.priceMin)
    );
}

export const FILTER_CONFIG = {
  BUDGET_MAP,
  USE_CASE_MAP,
};
