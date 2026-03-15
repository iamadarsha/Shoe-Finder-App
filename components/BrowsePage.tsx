import { useState, useMemo, useEffect } from 'react';
import { Shoe, SortOption } from '../types';

interface BrowsePageProps {
  shoeDatabase: Shoe[];
  onBack: () => void;
  onChat: () => void;
}

const BRANDS = [
  'Adidas', 'Anta', 'Asics', 'Brooks', 'Decathlon', 'Hoka',
  'New Balance', 'Nike', 'On Running', 'Puma', 'Reebok',
  'Saucony', 'Skechers', 'Under Armour', 'Xtep',
];

const USE_CASES = [
  { value: 'racing', label: 'Racing' },
  { value: 'speed', label: 'Speed / Tempo' },
  { value: 'daily', label: 'Daily Trainer' },
  { value: 'cushion', label: 'Max Cushion' },
  { value: 'trail', label: 'Trail' },
  { value: 'stability', label: 'Stability' },
  { value: 'training', label: 'Gym / Training' },
  { value: 'casual', label: 'Casual / Lifestyle' },
  { value: 'budget', label: 'Budget' },
];

const BUDGET_TIERS = [
  { value: 'budget', label: 'Under ₹8K' },
  { value: 'mid', label: '₹8K–15K' },
  { value: 'premium', label: '₹15K+' },
];

export default function BrowsePage({ shoeDatabase, onBack, onChat }: BrowsePageProps) {
  const [search, setSearch] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>('brand');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const toggleFilter = (
    arr: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const filteredShoes = useMemo(() => {
    let result = [...shoeDatabase];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.brand.toLowerCase().includes(q) ||
          s.model.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.foam.toLowerCase().includes(q)
      );
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter((s) => selectedBrands.includes(s.brand));
    }

    // Use case filter
    if (selectedUseCases.length > 0) {
      result = result.filter((s) => s.useCases.some((uc) => selectedUseCases.includes(uc)));
    }

    // Budget filter
    if (selectedBudget.length > 0) {
      result = result.filter((s) => selectedBudget.includes(s.budgetTier));
    }

    // Sort
    switch (sort) {
      case 'price-low':
        result.sort((a, b) => a.priceMin - b.priceMin);
        break;
      case 'price-high':
        result.sort((a, b) => b.priceMax - a.priceMax);
        break;
      case 'brand':
        result.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
        break;
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
    }

    return result;
  }, [shoeDatabase, search, selectedBrands, selectedUseCases, selectedBudget, sort]);

  const clearFilters = () => {
    setSearch('');
    setSelectedBrands([]);
    setSelectedUseCases([]);
    setSelectedBudget([]);
  };

  const hasFilters = search || selectedBrands.length > 0 || selectedUseCases.length > 0 || selectedBudget.length > 0;

  return (
    <div className="min-h-screen" style={{ background: '#050507' }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 md:px-12 py-5" style={{ background: '#050507ee', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm transition-colors hover:text-white"
              style={{ color: '#8888A0', fontFamily: "'Figtree', sans-serif" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Home
            </button>
            <h1
              className="text-xl font-bold"
              style={{ color: '#E8E8ED', fontFamily: "'DM Sans', sans-serif" }}
            >
              All Running Shoes
              <span className="ml-2 text-sm font-normal" style={{ color: '#55556A' }}>
                {filteredShoes.length} of {shoeDatabase.length}
              </span>
            </h1>
          </div>
          <button
            onClick={onChat}
            className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-90"
            style={{
              background: '#7C5CFC18',
              border: '1px solid #7C5CFC44',
              color: '#A78BFA',
              fontFamily: "'Figtree', sans-serif",
            }}
          >
            Ask AI →
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#55556A" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="#55556A" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shoes, brands, foam tech..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-[#7C5CFC44]"
            style={{
              background: '#111118',
              border: '1px solid #1A1A2A',
              color: '#E8E8ED',
              fontFamily: "'Figtree', sans-serif",
            }}
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
            style={{
              background: '#111118',
              border: '1px solid #1A1A2A',
              color: '#8888A0',
              fontFamily: "'Figtree', sans-serif",
            }}
          >
            <option value="brand">Sort: Brand</option>
            <option value="price-low">Sort: Price ↑</option>
            <option value="price-high">Sort: Price ↓</option>
            <option value="category">Sort: Category</option>
          </select>

          {/* Budget chips */}
          {BUDGET_TIERS.map((tier) => (
            <button
              key={tier.value}
              onClick={() => toggleFilter(selectedBudget, setSelectedBudget, tier.value)}
              className="px-3 py-1.5 rounded-lg text-xs transition-all duration-150"
              style={{
                background: selectedBudget.includes(tier.value) ? '#7C5CFC22' : '#111118',
                border: `1px solid ${selectedBudget.includes(tier.value) ? '#7C5CFC' : '#1A1A2A'}`,
                color: selectedBudget.includes(tier.value) ? '#A78BFA' : '#8888A0',
                fontFamily: "'Figtree', sans-serif",
              }}
            >
              {tier.label}
            </button>
          ))}

          {/* Use case chips */}
          {USE_CASES.map((uc) => (
            <button
              key={uc.value}
              onClick={() => toggleFilter(selectedUseCases, setSelectedUseCases, uc.value)}
              className="px-3 py-1.5 rounded-lg text-xs transition-all duration-150"
              style={{
                background: selectedUseCases.includes(uc.value) ? '#00C89622' : '#111118',
                border: `1px solid ${selectedUseCases.includes(uc.value) ? '#00C896' : '#1A1A2A'}`,
                color: selectedUseCases.includes(uc.value) ? '#00C896' : '#8888A0',
                fontFamily: "'Figtree', sans-serif",
              }}
            >
              {uc.label}
            </button>
          ))}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-lg text-xs transition-all duration-150"
              style={{ color: '#FF4757', fontFamily: "'Figtree', sans-serif" }}
            >
              Clear all ✕
            </button>
          )}
        </div>

        {/* Brand bar */}
        <div className="flex gap-2 overflow-x-auto mt-2 pb-1">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              onClick={() => toggleFilter(selectedBrands, setSelectedBrands, brand)}
              className="px-3 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-150"
              style={{
                background: selectedBrands.includes(brand) ? '#7C5CFC' : 'transparent',
                border: `1px solid ${selectedBrands.includes(brand) ? '#7C5CFC' : '#1A1A2A'}`,
                color: selectedBrands.includes(brand) ? 'white' : '#55556A',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Shoe Grid */}
      <div className="px-6 md:px-12 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredShoes.map((shoe, i) => (
            <div
              key={shoe.id}
              className={`group rounded-xl p-5 transition-all duration-300 hover:border-[#2A2A40] ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{
                background: '#111118',
                border: '1px solid #1A1A2A',
                transitionDelay: `${Math.min(i * 20, 300)}ms`,
              }}
            >
              {/* Brand + Category */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: '#55556A' }}>
                  {shoe.brand}
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded"
                  style={{
                    background: shoe.budgetTier === 'premium' ? '#7C5CFC15' : shoe.budgetTier === 'mid' ? '#00C89615' : '#FF9F4315',
                    color: shoe.budgetTier === 'premium' ? '#A78BFA' : shoe.budgetTier === 'mid' ? '#00C896' : '#FF9F43',
                  }}
                >
                  {shoe.budgetTier === 'budget' ? '₹' : shoe.budgetTier === 'mid' ? '₹₹' : '₹₹₹'}
                </span>
              </div>

              {/* Model name */}
              <h3 className="text-base font-semibold mb-1" style={{ color: '#E8E8ED', fontFamily: "'DM Sans', sans-serif" }}>
                {shoe.model}
              </h3>

              {/* Category */}
              <p className="text-xs mb-3" style={{ color: '#55556A', fontFamily: "'Figtree', sans-serif" }}>
                {shoe.category}
              </p>

              {/* Tech highlights */}
              {shoe.foam && (
                <p className="text-[11px] mb-1" style={{ color: '#8888A0', fontFamily: "'Figtree', sans-serif" }}>
                  <span style={{ color: '#A78BFA' }}>Foam:</span> {shoe.foam.substring(0, 50)}
                </p>
              )}
              {shoe.plate && (
                <p className="text-[11px] mb-3" style={{ color: '#8888A0', fontFamily: "'Figtree', sans-serif" }}>
                  <span style={{ color: '#FF9F43' }}>Plate:</span> {shoe.plate.substring(0, 50)}
                </p>
              )}

              {/* Price + Links */}
              <div className="flex items-end justify-between mt-auto pt-3" style={{ borderTop: '1px solid #1A1A2A' }}>
                <span className="text-lg font-bold" style={{ color: '#E8E8ED', fontFamily: "'DM Sans', sans-serif" }}>
                  {shoe.priceDisplay}
                </span>
                <div className="flex gap-1.5">
                  {shoe.buyLinks.amazon && (
                    <a
                      href={shoe.buyLinks.amazon}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded text-[10px] font-medium transition-all hover:bg-white/10"
                      style={{ border: '1px solid #2A2A40', color: '#8888A0' }}
                    >
                      AMZ
                    </a>
                  )}
                  {shoe.buyLinks.flipkart && (
                    <a
                      href={shoe.buyLinks.flipkart}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded text-[10px] font-medium transition-all hover:bg-white/10"
                      style={{ border: '1px solid #2A2A40', color: '#8888A0' }}
                    >
                      FK
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredShoes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg mb-2" style={{ color: '#55556A', fontFamily: "'DM Sans', sans-serif" }}>
              No shoes match your filters
            </p>
            <button
              onClick={clearFilters}
              className="text-sm"
              style={{ color: '#7C5CFC', fontFamily: "'Figtree', sans-serif" }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
