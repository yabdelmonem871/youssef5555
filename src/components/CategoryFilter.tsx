import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';

export default function CategoryFilter({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (slug: string | null) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        setCategories((data ?? []) as Category[]);
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          selected === null
            ? 'bg-primary-600 text-white shadow-md'
            : 'bg-white text-secondary-700 border border-secondary-200 hover:border-primary-300'
        }`}
      >
        الكل
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selected === cat.slug
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-white text-secondary-700 border border-secondary-200 hover:border-primary-300'
          }`}
        >
          {cat.name_ar}
        </button>
      ))}
    </div>
  );
}
