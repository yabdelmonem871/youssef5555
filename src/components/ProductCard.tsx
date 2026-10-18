import { Link } from 'react-router-dom';
import { Plus, Star, Sparkles } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.is_available && product.stock > 0) {
      addItem(product);
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="card overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name_ar}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-secondary-300 text-4xl">🥖</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          {product.is_bestseller && (
            <span className="badge bg-accent-500 text-white shadow-sm">
              <Star className="w-3 h-3 fill-current" /> الأكثر مبيعاً
            </span>
          )}
          {product.is_new && (
            <span className="badge bg-success-500 text-white shadow-sm">
              <Sparkles className="w-3 h-3" /> جديد
            </span>
          )}
        </div>

        {/* Availability */}
        {!product.is_available || product.stock <= 0 ? (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="badge bg-error-500 text-white text-sm px-3 py-1.5">غير متوفر</span>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-secondary-900 mb-1 line-clamp-1">{product.name_ar}</h3>
        <p className="text-sm text-secondary-500 mb-3 line-clamp-2 flex-1">
          {product.description_ar ?? ''}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <span className="font-display font-bold text-primary-700 text-lg">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={handleAdd}
            disabled={!product.is_available || product.stock <= 0}
            className="btn-primary !p-2 !px-3 text-sm"
            aria-label="أضف إلى السلة"
          >
            <Plus className="w-4 h-4" /> أضف
          </button>
        </div>
      </div>
    </Link>
  );
}
