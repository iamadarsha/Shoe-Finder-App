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

    if (selectedBrands.length > 0) {
      result = result.filter((s) => selectedBrands.includes(s.brand));
    }

    if (selectedUseCases.length > 0) {
      result = result.filter((s) => s.useCases.some((uc) => selectedUseCases.includes(uc)));
    }

    if (selectedBudget.length > 0) {
      result = result.filter((s) => selectedBudget.includes(s.budgetTier));
    }

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
    <div className="min-h-screen bg-[#050507]">
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 md:px-12 py-5 bg-[#050507ee] backdrop-blur-[12px] border-b border-[#1A1A2A]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm transition-colors hover:text-white text-[#8888A0] font-body"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Home
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#E8E8ED] font-heading">
              Explore Collection
              <span className="ml-3 text-sm font-normal text-[#55556A]">
                {filteredShoes.length} of {shoeDatabase.length}
              </span>
            </h1>
          </div>
          <button
            onClick={onChat}
            className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-90 bg-[#7C5CFC18] border border-[#7C5CFC44] text-[#A78BFA] font-body"
          >
            Ask AI →
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5 mt-2">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="#55556A" strokeWidth="1.5" />
            <path d="M11 11L14 14" stroke="#55556A" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shoes, brands, foam tech..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-1 focus:ring-[#7C5CFC44] bg-[#111118] border border-[#1A1A2A] text-[#E8E8ED] font-body placeholder-[#55556A]"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer bg-[#111118] border border-[#1A1A2A] text-[#8888A0] font-body"
          >
            <option value="brand">Sort: Brand</option>
            <option value="price-low">Sort: Price ↑</option>
            <option value="price-high">Sort: Price ↓</option>
            <option value="category">Sort: Category</option>
          </select>

          {/* Budget chips */}
          {BUDGET_TIERS.map((tier) => {
            const isActive = selectedBudget.includes(tier.value);
            return (
              <button
                key={tier.value}
                onClick={() => toggleFilter(selectedBudget, setSelectedBudget, tier.value)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-150 font-body ${
                  isActive 
                  ? 'bg-[#E8E8ED] text-[#050507] font-semibold border border-transparent'
                  : 'bg-[#111118] border border-[#1A1A2A] text-[#8888A0] hover:border-[#2A2A40]'
                }`}
              >
                {tier.label}
              </button>
            );
          })}

          {/* Use case chips */}
          {USE_CASES.map((uc) => {
            const isActive = selectedUseCases.includes(uc.value);
            return (
              <button
                key={uc.value}
                onClick={() => toggleFilter(selectedUseCases, setSelectedUseCases, uc.value)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-150 font-body shrink-0 ${
                  isActive 
                  ? 'bg-[#E8E8ED] text-[#050507] font-semibold border border-transparent'
                  : 'bg-[#111118] border border-[#1A1A2A] text-[#8888A0] hover:border-[#2A2A40]'
                }`}
              >
                {uc.label}
              </button>
            );
          })}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-lg text-xs transition-all duration-150 text-[#FF4757] font-body hover:bg-white/5"
            >
              Clear all ✕
            </button>
          )}
        </div>

        {/* Brand bar */}
        <div className="flex gap-2 overflow-x-auto mt-2 pb-1 scrollbar-hide">
          {BRANDS.map((brand) => {
            const isActive = selectedBrands.includes(brand);
            return (
              <button
                key={brand}
                onClick={() => toggleFilter(selectedBrands, setSelectedBrands, brand)}
                className={`px-3 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-150 font-heading tracking-wider uppercase ${
                  isActive
                    ? 'bg-[#E8E8ED] text-[#050507] border border-transparent'
                    : 'bg-transparent border border-[#1A1A2A] text-[#55556A] hover:text-[#E8E8ED] hover:border-[#2A2A40]'
                }`}
              >
                {brand}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shoe Grid */}
      <div className="px-6 md:px-12 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredShoes.map((shoe, i) => (
            <div
              key={shoe.id}
              className={`group rounded-2xl p-4 transition-all duration-500 bg-[#111118] border border-[#1A1A2A] hover:border-[#2A2A40] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_4px_25px_rgba(0,0,0,0.5)] flex flex-col ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${Math.min(i * 15, 300)}ms` }}
            >
              {/* Image Placeholder */}
              <div className="h-40 w-full bg-[#0A0A0F] rounded-xl flex items-center justify-center text-5xl mb-4 border border-[#1A1A2A]/50">
                👟
              </div>

              {/* Brand + Category */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#55556A] font-heading">
                  {shoe.brand}
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded font-heading font-medium"
                  style={{
                    background: shoe.budgetTier === 'premium' ? '#7C5CFC15' : shoe.budgetTier === 'mid' ? '#00C89615' : '#FF9F4315',
                    color: shoe.budgetTier === 'premium' ? '#A78BFA' : shoe.budgetTier === 'mid' ? '#00C896' : '#FF9F43',
                  }}
                >
                  {shoe.budgetTier === 'budget' ? '₹' : shoe.budgetTier === 'mid' ? '₹₹' : '₹₹₹'}
                </span>
              </div>

              {/* Model name */}
              <h3 className="text-lg font-bold mb-1 text-[#E8E8ED] font-heading leading-tight line-clamp-2">
                {shoe.model}
              </h3>

              {/* Category */}
              <p className="text-xs mb-3 text-[#55556A] font-body line-clamp-1">
                {shoe.category}
              </p>

              {/* Tech highlights */}
              <div className="mt-auto pt-2 space-y-1">
                {shoe.foam && (
                   <p className="text-[11px] text-[#8888A0] font-body flex items-start gap-1">
                     <span className="text-[#A78BFA] font-medium shrink-0">Foam:</span> <span className="line-clamp-1">{shoe.foam}</span>
                   </p>
                )}
                {shoe.plate && (
                   <p className="text-[11px] text-[#8888A0] font-body flex items-start gap-1">
                     <span className="text-[#FF9F43] font-medium shrink-0">Plate:</span> <span className="line-clamp-1">{shoe.plate}</span>
                   </p>
                )}
              </div>

              {/* Price + Links */}
              <div className="flex items-end justify-between mt-4 border-t border-[#1A1A2A] pt-4">
                <span className="text-lg font-bold text-[#E8E8ED] font-heading">
                  {shoe.priceDisplay}
                </span>
                <div className="flex gap-1.5">
                  {shoe.buyLinks.amazon && (
                    <a
                      href={shoe.buyLinks.amazon}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded text-[10px] font-bold transition-all hover:bg-white/10 hover:text-white border border-[#2A2A40] text-[#8888A0] font-body tracking-wider uppercase"
                    >
                      AMZ
                    </a>
                  )}
                  {shoe.buyLinks.flipkart && (
                    <a
                      href={shoe.buyLinks.flipkart}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded text-[10px] font-bold transition-all hover:bg-white/10 hover:text-white border border-[#2A2A40] text-[#8888A0] font-body tracking-wider uppercase"
                    >
                      FLIP
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredShoes.length === 0 && (
          <div className="text-center py-24">
            <p className="text-xl mb-3 text-[#E8E8ED] font-heading font-medium">
              No shoes found.
            </p>
            <p className="text-sm mb-6 text-[#55556A] font-body">
              Try adjusting your filters or search term to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 rounded-xl font-medium text-sm transition-all text-[#050507] bg-[#E8E8ED] hover:bg-white font-body"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
