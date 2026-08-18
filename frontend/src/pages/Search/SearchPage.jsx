import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';
import { ProductGridSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { productsApi } from '../../api/products.api';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await productsApi.getProducts({ search: query, limit: 16 });
        const list = res.data || res.products || (Array.isArray(res) ? res : []);
        setProducts(list);
      } catch (err) {
        console.warn('Search fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSearchResults();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-[#e6e2db] pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1c1c18]">
            Search Results for "{query}"
          </h1>
          <p className="text-xs text-[#645d56] mt-1">Found {products.length} matching pieces</p>
        </div>
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Search}
          title={`No results found for "${query}"`}
          description="Try searching with different keywords like 'gold ring', 'diamond necklace', or 'bangles'."
          actionLabel="Explore All Jewellery"
          actionLink="/shop"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
