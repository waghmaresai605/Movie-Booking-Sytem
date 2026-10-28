import React, { useState } from 'react';
import { UtensilsCrossed, Sparkles, Plus, Check } from 'lucide-react';
import { ConcessionItem } from '../types';
import { formatCurrency } from '../utils/bookingUtils';

interface ConcessionsViewProps {
  concessions: ConcessionItem[];
  onStartBookingWithSnacks: () => void;
}

export const ConcessionsView: React.FC<ConcessionsViewProps> = ({
  concessions,
  onStartBookingWithSnacks,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'Combos', 'Popcorn', 'Snacks', 'Beverages', 'Desserts'];

  const filtered = concessions.filter(
    (c) => selectedCategory === 'All' || c.category === selectedCategory
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 font-semibold text-xs tracking-wider uppercase">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Cinema Dine-In & Concessions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Gourmet Snacks, Popcorn & Combos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Freshly prepared artisanal theater food delivered hot right to your seat or ready at pickup.
          </p>
        </div>

        <button
          onClick={onStartBookingWithSnacks}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/40 cursor-pointer self-start sm:self-auto"
        >
          Book Movie & Pre-Order
        </button>
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 overflow-hidden shadow-xl flex flex-col justify-between transition-all"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {item.tag && (
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow">
                  {item.tag}
                </span>
              )}
              {item.calories && (
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[10px] font-semibold text-slate-300">
                  {item.calories}
                </span>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{item.category}</span>
                  <span className={item.isVeg ? 'text-emerald-400' : 'text-amber-400'}>
                    {item.isVeg ? '● Pure Veg' : '▲ Non-Veg'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-base font-black text-amber-400">
                  {formatCurrency(item.price)}
                </span>
                <button
                  onClick={onStartBookingWithSnacks}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
