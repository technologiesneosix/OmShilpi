import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, X, RefreshCcw } from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';
import { ProductGridSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import { collectionsApi } from '../../api/collections.api';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Extract query filters from URL
  const selectedMetal = searchParams.get('metal') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedCollection = searchParams.get('collection') || '';
  const isNewArrival = searchParams.get('isNewArrival') === 'true';
  const isFeatured = searchParams.get('isFeatured') === 'true';
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchFilters = async () => {
    try {
      const [catRes, colRes] = await Promise.all([
        categoriesApi.getCategories().catch(() => ({ data: [] })),
        collectionsApi.getCollections().catch(() => ({ data: [] })),
      ]);
      const catList = catRes.data?.categories || catRes.data || [];
      const colList = colRes.data?.collections || colRes.data || [];
      setCategories(Array.isArray(catList) ? catList : []);
      setCollections(Array.isArray(colList) ? colList : []);
    } catch (err) {
      console.warn('Could not load shop metadata filters:', err);
    }
  };

  const fetchShopProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 12,
        sortBy,
        sortOrder,
      };

      if (selectedMetal) params.metal = selectedMetal;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedCollection) params.collection = selectedCollection;
      if (isNewArrival) params.isNewArrival = true;
      if (isFeatured) params.isFeatured = true;
      if (searchQuery) params.search = searchQuery;

      const res = await productsApi.getProducts(params);
      
      const prodsList = res.data || res.products || (Array.isArray(res) ? res : []);
      const paginationData = res.pagination || res.meta || {};

      setProducts(prodsList);
      setTotalProducts(paginationData.total || prodsList.length);
      setTotalPages(paginationData.pages || Math.ceil((paginationData.total || prodsList.length) / 12) || 1);

    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchShopProducts();
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    if (val === 'price_asc') {
      newParams.set('sortBy', 'price');
      newParams.set('sortOrder', 'asc');
    } else if (val === 'price_desc') {
      newParams.set('sortBy', 'price');
      newParams.set('sortOrder', 'desc');
    } else if (val === 'newest') {
      newParams.set('sortBy', 'createdAt');
      newParams.set('sortOrder', 'desc');
    } else {
      newParams.delete('sortBy');
      newParams.delete('sortOrder');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-[#f7ede0] border border-[#e6e2db] rounded-lg p-8 text-center space-y-2 animate-pop-in shadow-xs">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1c18]">
          {selectedMetal ? `${selectedMetal} Jewellery` : selectedCategory ? `${selectedCategory.toUpperCase()} Collection` : searchQuery ? `Search Results for "${searchQuery}"` : 'Exquisite Jewellery Collection'}
        </h1>
        <p className="text-xs sm:text-sm text-[#645d56] max-w-xl mx-auto">
          Discover our full showcase of certified gold, diamond, and silver creations handcrafted for elegance.
        </p>
      </div>

      {/* Control Bar: Filters & Sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 border border-[#e6e2db] rounded">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-[#fdf9f2] border border-[#d2c4b4] px-4 py-2 rounded text-xs font-semibold text-[#1c1c18]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#7b5818]" /> Filters
          </button>

          <span className="text-xs text-[#645d56] font-medium">
            Showing <strong className="text-[#1c1c18]">{products.length}</strong> of {totalProducts} pieces
          </span>

          {(selectedMetal || selectedCategory || selectedCollection || isNewArrival || isFeatured || searchQuery) && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:underline flex items-center gap-1 font-medium ml-2 cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <label className="text-xs font-semibold text-[#645d56]">Sort By:</label>
          <select
            onChange={handleSortChange}
            value={sortBy === 'price' ? (sortOrder === 'asc' ? 'price_asc' : 'price_desc') : 'newest'}
            className="bg-[#fdf9f2] border border-[#d2c4b4] text-xs font-semibold text-[#1c1c18] px-3 py-2 rounded outline-none cursor-pointer"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 border border-[#e6e2db] rounded h-fit">
          <div className="flex justify-between items-center pb-4 border-b border-[#e6e2db]">
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1c1c18] flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#7b5818]" /> Filter Catalog
            </h3>
          </div>

          {/* Metal Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-[#7b5818] tracking-wider">Metal Type</h4>
            <div className="space-y-1.5 text-xs text-[#4f4539]">
              {['Gold', 'Diamond', 'Silver'].map((metal) => (
                <label key={metal} className="flex items-center gap-2 cursor-pointer hover:text-[#7b5818]">
                  <input
                    type="radio"
                    name="metalFilter"
                    checked={selectedMetal === metal}
                    onChange={() => updateFilter('metal', selectedMetal === metal ? '' : metal)}
                    className="accent-[#7b5818]"
                  />
                  <span>{metal} Jewellery</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2 pt-4 border-t border-[#f1ede6]">
            <h4 className="text-xs font-bold uppercase text-[#7b5818] tracking-wider">Categories</h4>
            <div className="space-y-1.5 text-xs text-[#4f4539]">
              {categories.map((cat) => (
                <label key={cat.id || cat.slug} className="flex items-center gap-2 cursor-pointer hover:text-[#7b5818]">
                  <input
                    type="radio"
                    name="categoryFilter"
                    checked={selectedCategory === cat.slug}
                    onChange={() => updateFilter('category', selectedCategory === cat.slug ? '' : cat.slug)}
                    className="accent-[#7b5818]"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Collections Filter */}
          {collections.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-[#f1ede6]">
              <h4 className="text-xs font-bold uppercase text-[#7b5818] tracking-wider">Collections</h4>
              <div className="space-y-1.5 text-xs text-[#4f4539]">
                {collections.map((col) => (
                  <label key={col.id || col.slug} className="flex items-center gap-2 cursor-pointer hover:text-[#7b5818]">
                    <input
                      type="radio"
                      name="collectionFilter"
                      checked={selectedCollection === col.slug}
                      onChange={() => updateFilter('collection', selectedCollection === col.slug ? '' : col.slug)}
                      className="accent-[#7b5818]"
                    />
                    <span>{col.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {loading ? (
            <ProductGridSkeleton count={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchShopProducts} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No Jewellery Found"
              description="We couldn't find any pieces matching your filter selection. Try resetting filters."
              actionLabel="Clear Filters"
              actionLink="/shop"
            />
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product, idx) => (
                  <ProductCard key={product.id} product={product} delay={(idx % 3) * 80} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6 border-t border-[#e6e2db]">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateFilter('page', pageNum.toString())}
                        className={`w-9 h-9 rounded text-xs font-semibold transition cursor-pointer ${
                          page === pageNum
                            ? 'bg-[#7b5818] text-white'
                            : 'bg-white border border-[#d2c4b4] text-[#1c1c18] hover:bg-[#fdf9f2]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>

      </div>
    </div>
  );
};
