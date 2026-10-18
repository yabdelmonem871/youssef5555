import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import { LoadingSpinner, EmptyState } from '@/components/States';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high'>('default');
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get('q') ?? '';
  const categorySlug = searchParams.get('category');

  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_available', true);

    if (searchQuery) {
      query = query.ilike('name_ar', `%${searchQuery}%`);
    }

    query.order('sort_order').then(({ data }) => {
      let filtered = (data ?? []) as Product[];
      if (categorySlug) {
        filtered = filtered.filter((p) => p.category?.slug === categorySlug);
      }
      setProducts(filtered);
      setLoading(false);
    });
  }, [searchQuery, categorySlug]);

  const sortedProducts = useMemo(() => {
    if (sortBy === 'price-low') return [...products].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') return [...products].sort((a, b) => b.price - a.price);
    return products;
  }, [products, sortBy]);

  const handleCategorySelect = (slug: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set('category', slug);
    else params.delete('category');
    setSearchParams(params);
  };

  const clearSearch = () => {
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="section-title mb-6">منتجاتنا</h1>

      {/* Search & sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            defaultValue={searchQuery}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              if (e.target.value) params.set('q', e.target.value);
              else params.delete('q');
              setSearchParams(params);
            }}
            placeholder="ابحث عن منتج..."
            className="input pr-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="input sm:w-48"
        >
          <option value="default">ترتيب افتراضي</option>
          <option value="price-low">السعر: من الأقل للأعلى</option>
          <option value="price-high">السعر: من الأعلى للأقل</option>
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary sm:hidden"
        >
          <SlidersHorizontal className="w-4 h-4" /> فلترة
        </button>
      </div>

      {/* Category filter */}
      <div className={`${showFilters ? 'block' : 'hidden'} sm:block mb-6`}>
        <CategoryFilter selected={categorySlug} onSelect={handleCategorySelect} />
      </div>

      {/* Active filters */}
      {(searchQuery || categorySlug) && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className="text-secondary-500">الفلترة الحالية:</span>
          {searchQuery && (
            <span className="badge bg-secondary-100 text-secondary-700">
              بحث: {searchQuery}
            </span>
          )}
          {categorySlug && (
            <span className="badge bg-secondary-100 text-secondary-700">
              تصنيف: {categorySlug}
            </span>
          )}
          <button onClick={clearSearch} className="text-error-500 hover:text-error-600 flex items-center gap-1">
            <X className="w-3 h-3" /> مسح
          </button>
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <LoadingSpinner message="جاري تحميل المنتجات..." />
      ) : sortedProducts.length === 0 ? (
        <EmptyState
          icon={<Search className="w-8 h-8" />}
          title="لا توجد منتجات"
          message="لم نعثر على منتجات تطابق بحثك. جرب تغيير الفلاتر أو البحث بكلمات أخرى."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
