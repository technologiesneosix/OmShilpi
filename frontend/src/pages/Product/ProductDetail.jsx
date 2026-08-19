import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ShieldCheck, Truck, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';
import { ProductGridSkeleton, PageSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { productsApi } from '../../api/products.api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useDialog } from '../../context/DialogContext';

export const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showAuthModal, showAlert } = useDialog();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [adding, setAdding] = useState(false);
  const [addedMsg, setAddedMsg] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await productsApi.getProductBySlug(slug);
      const prodData = res.data?.product || res.product || res.data || res;
      setProduct(prodData);

      const imgs = prodData.images || [];
      const primary = imgs.find(i => i.isPrimary)?.url || imgs[0]?.url || prodData.image;
      setSelectedImage(primary);

      // Load related products based on category/metal
      if (prodData.categoryId || prodData.metal) {
        const relatedRes = await productsApi.getProducts({
          category: prodData.category?.slug,
          metal: prodData.metal,
          limit: 4,
        });
        const list = relatedRes.data?.products || relatedRes.data || relatedRes.products || [];
        setRelatedProducts(Array.isArray(list) ? list.filter(p => p.id !== prodData.id) : []);
      }

    } catch (err) {
      setError(err.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [slug]);

  if (loading) return <PageSkeleton />;
  if (error || !product) return <ErrorState message={error || 'Product not found'} onRetry={loadProduct} />;

  const images = product.images && product.images.length > 0
    ? product.images.map(i => i.url)
    : [product.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800'];

  const price = Number(product.price || 0);
  const comparePrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const isSaved = isInWishlist(product.id);

  const handleAddToCart = async () => {
    const targetId = product?.id || product?.product?.id;
    if (!targetId) {
      showAlert('Product information is not loaded correctly.', 'Error', 'error');
      return;
    }
    try {
      setAdding(true);
      await addToCart(targetId, quantity);
      setAddedMsg(true);
      setTimeout(() => setAddedMsg(false), 3000);
    } catch (err) {
      const msg = err.message || 'Failed to add item to cart';
      if (msg.toLowerCase().includes('sign in') || msg.toLowerCase().includes('login') || msg.toLowerCase().includes('authenticated')) {
        showAuthModal(msg);
      } else {
        showAlert(msg, 'Notice', 'error');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    const targetId = product?.id || product?.product?.id;
    if (!targetId) {
      showAlert('Product information is not loaded correctly.', 'Error', 'error');
      return;
    }
    try {
      setAdding(true);
      await addToCart(targetId, quantity);
      navigate('/checkout');
    } catch (err) {
      const msg = err.message || 'Could not proceed to checkout';
      if (msg.toLowerCase().includes('sign in') || msg.toLowerCase().includes('login') || msg.toLowerCase().includes('authenticated')) {
        showAuthModal(msg);
      } else {
        showAlert(msg, 'Notice', 'error');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    try {
      setWishlistLoading(true);
      await toggleWishlist(product);
    } catch (err) {
      const msg = err.message || 'Failed to update wishlist';
      if (msg.toLowerCase().includes('sign in') || msg.toLowerCase().includes('login') || msg.toLowerCase().includes('authenticated')) {
        showAuthModal(msg);
      } else {
        showAlert(msg, 'Notice', 'error');
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-[#645d56] flex items-center gap-2">
        <Link to="/" className="hover:text-[#7b5818]">Home</Link> /
        <Link to="/shop" className="hover:text-[#7b5818]">Shop</Link> /
        {product.metal && <Link to={`/shop?metal=${product.metal}`} className="hover:text-[#7b5818]">{product.metal}</Link>} /
        <span className="text-[#1c1c18] font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white border border-[#e6e2db] rounded-lg p-6 sm:p-8 shadow-xs animate-pop-in">
        
        {/* Left: Gallery View */}
        <div className="space-y-4">
          <div className="aspect-square bg-[#fdf9f2] rounded border border-[#e6e2db] overflow-hidden relative">
            <img
              src={selectedImage || images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.isNewArrival && (
              <span className="absolute top-4 left-4 bg-[#7b5818] text-white text-[10px] uppercase font-bold px-3 py-1 rounded">
                NEW ARRIVAL
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded border overflow-hidden shrink-0 transition cursor-pointer ${
                    selectedImage === img ? 'border-[#7b5818] ring-2 ring-[#7b5818]/20' : 'border-[#e6e2db] hover:border-[#7b5818]'
                  }`}
                >
                  <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Specs */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category / SKU */}
            <div className="flex justify-between items-center text-xs text-[#645d56]">
              <span className="uppercase font-semibold text-[#7b5818]">
                {product.metal || product.category?.name || 'Fine Jewellery'}
              </span>
              <span>SKU: {product.sku || 'OSJ-1002'}</span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1c1c18] leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#1c1c18]">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-sm text-[#817567] line-through">
                  ₹{comparePrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-[11px] text-[#7b5818] font-semibold">Includes GST & Insured Shipping</span>
            </div>

            {/* Short Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#fdf9f2] border border-[#e6e2db] rounded text-xs text-[#4f4539]">
              {product.metal && <div><strong className="block text-[#1c1c18]">Metal:</strong> {product.metal}</div>}
              {product.purity && <div><strong className="block text-[#1c1c18]">Purity:</strong> {product.purity}</div>}
              {product.grossWeight && <div><strong className="block text-[#1c1c18]">Gross Wt:</strong> {product.grossWeight}g</div>}
              {product.stoneType && <div><strong className="block text-[#1c1c18]">Stone:</strong> {product.stoneType}</div>}
              {product.certification && <div><strong className="block text-[#1c1c18]">Certified:</strong> {product.certification}</div>}
            </div>

            {/* Description snippet */}
            <p className="text-xs sm:text-sm text-[#645d56] leading-relaxed">
              {product.shortDescription || product.description || 'Masterfully crafted fine jewellery engineered to suit everyday grace and grand occasions alike.'}
            </p>
          </div>

          {/* Action Area */}
          <div className="space-y-4 pt-4 border-t border-[#e6e2db]">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-[#1c1c18]">Quantity:</span>
              <div className="flex items-center border border-[#d2c4b4] rounded bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-sm font-semibold hover:bg-[#f1ede6]"
                >
                  -
                </button>
                <span className="px-4 text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-sm font-semibold hover:bg-[#f1ede6]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex items-center justify-center gap-2 bg-[#7b5818] hover:bg-[#604100] text-white py-3 px-6 rounded text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" /> {adding ? 'Adding...' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={adding}
                className="bg-[#1c1c18] hover:bg-[#7b5818] text-white py-3 px-6 rounded text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
              >
                Buy Now
              </button>
            </div>

            {addedMsg && (
              <p className="text-xs text-green-700 bg-green-50 p-2 rounded text-center flex items-center justify-center gap-1">
                <Check className="w-4 h-4" /> Added to your shopping cart!
              </p>
            )}

            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              className="w-full flex items-center justify-center gap-2 border border-[#d2c4b4] text-[#1c1c18] hover:border-[#7b5818] hover:text-[#7b5818] py-2.5 rounded text-xs font-semibold transition cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-600 text-red-600' : ''}`} />
              {isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#e6e2db] text-center text-[11px] text-[#645d56]">
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-[#7b5818] mb-1" />
              <span>100% Certified</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-5 h-5 text-[#7b5818] mb-1" />
              <span>Free Insured Delivery</span>
            </div>
            <div className="flex flex-col items-center">
              <RotateCcw className="w-5 h-5 text-[#7b5818] mb-1" />
              <span>7-Day Easy Return</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Section: Description, Specifications, Care */}
      <div className="bg-white border border-[#e6e2db] rounded p-6 sm:p-8 space-y-6">
        <div className="flex border-b border-[#e6e2db] gap-6 text-xs uppercase font-bold tracking-widest text-[#645d56]">
          {['description', 'specifications', 'shipping', 'care'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 transition cursor-pointer border-b-2 ${
                activeTab === tab
                  ? 'border-[#7b5818] text-[#7b5818]'
                  : 'border-transparent hover:text-[#1c1c18]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="text-xs sm:text-sm text-[#4f4539] leading-relaxed">
          {activeTab === 'description' && (
            <div className="space-y-3">
              <h4 className="font-serif text-base font-bold text-[#1c1c18]">Artisan Description</h4>
              <p>{product.description || product.shortDescription || 'Crafted with uncompromising precision by Om Shilpi master goldsmiths. Every curve and setting reflects four decades of authentic Indian jewellery heritage.'}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-md space-y-2">
              <h4 className="font-serif text-base font-bold text-[#1c1c18] mb-3">Product Specifications</h4>
              <div className="flex justify-between py-1.5 border-b border-[#f1ede6]"><span>Metal Purity</span><strong>{product.purity || '18K / 22K Solid Gold'}</strong></div>
              <div className="flex justify-between py-1.5 border-b border-[#f1ede6]"><span>Metal Color</span><strong>{product.metal || 'Gold'}</strong></div>
              <div className="flex justify-between py-1.5 border-b border-[#f1ede6]"><span>Gross Weight</span><strong>{product.grossWeight ? `${product.grossWeight}g` : 'Varies by size'}</strong></div>
              <div className="flex justify-between py-1.5 border-b border-[#f1ede6]"><span>Certification Authority</span><strong>{product.certification || 'BIS Hallmarked'}</strong></div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-3">
              <h4 className="font-serif text-base font-bold text-[#1c1c18]">Shipping & Returns Policy</h4>
              <p>All Om Shilpi orders are shipped inside tamper-evident, fully insured transit packaging via specialized logistics partners (BVC Logistics / Sequel Global). Delivery timeline is 3-5 business days across India.</p>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-3">
              <h4 className="font-serif text-base font-bold text-[#1c1c18]">Jewellery Maintenance</h4>
              <p>Store individual pieces inside soft cloth pouches. Avoid direct contact with perfumes, hairsprays, and harsh cleaning chemicals. Visit any Om Shilpi showroom for complimentary ultrasonic cleaning.</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#1c1c18]">You May Also Adore</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
