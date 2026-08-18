import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Gem, Sparkles, Award, Star, Clock } from 'lucide-react';
import { ProductCard } from '../../components/product/ProductCard';
import { ProductGridSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import { productsApi } from '../../api/products.api';
import { categoriesApi } from '../../api/categories.api';
import { collectionsApi } from '../../api/collections.api';
import { cmsApi } from '../../api/cms.api';

export const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [goldProducts, setGoldProducts] = useState([]);
  const [diamondProducts, setDiamondProducts] = useState([]);
  const [silverProducts, setSilverProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        bannersRes,
        categoriesRes,
        collectionsRes,
        bestsellersRes,
        goldRes,
        diamondRes,
        silverRes,
        newArrivalsRes,
        testimonialsRes,
      ] = await Promise.allSettled([
        cmsApi.getBanners(),
        categoriesApi.getCategories(),
        collectionsApi.getCollections(),
        productsApi.getProducts({ isFeatured: true, limit: 8 }),
        productsApi.getProducts({ metal: 'Gold', limit: 4 }),
        productsApi.getProducts({ metal: 'Diamond', limit: 4 }),
        productsApi.getProducts({ metal: 'Silver', limit: 4 }),
        productsApi.getProducts({ isNewArrival: true, limit: 8 }),
        cmsApi.getTestimonials(),
      ]);

      if (bannersRes.status === 'fulfilled') {
        const b = bannersRes.value.data?.banners || bannersRes.value.data || bannersRes.value;
        setBanners(Array.isArray(b) ? b : []);
      }
      if (categoriesRes.status === 'fulfilled') {
        const c = categoriesRes.value.data?.categories || categoriesRes.value.data || categoriesRes.value;
        setCategories(Array.isArray(c) ? c : []);
      }
      if (collectionsRes.status === 'fulfilled') {
        const col = collectionsRes.value.data?.collections || collectionsRes.value.data || collectionsRes.value;
        setCollections(Array.isArray(col) ? col : []);
      }
      
      const extractProducts = (res) => {
        if (res.status !== 'fulfilled') return [];
        const val = res.value;
        if (Array.isArray(val.data)) return val.data;
        if (Array.isArray(val.products)) return val.products;
        if (Array.isArray(val)) return val;
        return [];
      };

      setBestsellers(extractProducts(bestsellersRes));
      setGoldProducts(extractProducts(goldRes));
      setDiamondProducts(extractProducts(diamondRes));
      setSilverProducts(extractProducts(silverRes));
      setNewArrivals(extractProducts(newArrivalsRes));
      if (testimonialsRes.status === 'fulfilled') setTestimonials(testimonialsRes.value.data || testimonialsRes.value || []);

    } catch (err) {
      setError(err.message || 'Failed to load store front data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Default luxury hero slideshow copy
  const defaultSlides = [
    {
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1920",
      tag: "CRAFTED FOR EVERY CELEBRATION",
      title: "Radiance woven in gold",
      highlightTitle: "The Gold Edit",
      description: "Hallmarked 22K gold pieces hand-carved by India's master artisans, made for everyday radiance.",
      ctaLink: "/shop?metal=Gold",
      ctaText: "Shop Gold",
      secLink: "/shop",
      secText: "Explore Collections",
    },
    {
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1920",
      tag: "REFINED BRILLIANCE",
      title: "Diamonds that tell your story",
      highlightTitle: "The Diamond Edit",
      description: "IGI-certified natural diamonds set in refined designs, for moments worth remembering.",
      ctaLink: "/shop?metal=Diamond",
      ctaText: "Explore Diamonds",
      secLink: "/shop?metal=Diamond",
      secText: "View Certification",
    },
    {
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1920",
      tag: "JUST LANDED",
      title: "New arrivals, timeless craft",
      highlightTitle: "Fresh designs for every day",
      description: "The newest additions to the Om Shilpi collection, from everyday chains to statement rings.",
      ctaLink: "/shop?isNewArrival=true",
      ctaText: "Shop New Arrivals",
      secLink: "/shop?isFeatured=true",
      secText: "See Bestsellers",
    },
  ];

  const isValidImageUrl = (url) =>
    url &&
    typeof url === 'string' &&
    !url.includes('example.com') &&
    (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/'));

  const activeBanners = banners.filter((b) => b.isActive !== false);

  const heroSlides = activeBanners.length > 0
    ? activeBanners.map((b, idx) => {
        const fallback = defaultSlides[idx % defaultSlides.length];
        return {
          image: isValidImageUrl(b.imageUrl) ? b.imageUrl : fallback.image,
          tag: b.subtitle || fallback.tag,
          title: b.title || fallback.title,
          highlightTitle: fallback.highlightTitle,
          description: fallback.description,
          ctaLink: b.linkUrl || fallback.ctaLink,
          ctaText: b.buttonText || fallback.ctaText,
          secLink: fallback.secLink,
          secText: fallback.secText,
        };
      })
    : defaultSlides;

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [heroSlides.length]);

  return (
    <div className="space-y-16 pb-16">
      {/* SECTION 1: HERO BANNER SLIDESHOW */}
      <section className="relative bg-[#1c1c18] text-white min-h-[520px] md:min-h-[620px] flex items-center overflow-hidden">
        
        {/* Background Image Slideshow with Smooth Crossfade */}
        <div className="absolute inset-0 z-0">
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100 scale-105' : 'opacity-0 scale-100 pointer-events-none'
              }`}
              style={{ transitionProperty: 'opacity, transform' }}
            >
              <img
                src={slide.image}
                alt={`Om Shilpi Slide ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultSlides[idx % defaultSlides.length].image;
                }}
              />
            </div>
          ))}
          {/* Dark Luxury Gradient Overlays for High Legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/30"></div>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
        </div>

        {/* Hero Slide Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#7b5818]/90 text-white rounded text-xs uppercase tracking-widest font-semibold backdrop-blur-sm border border-[#b98f4a]/30">
              <Sparkles className="w-3.5 h-3.5" /> {heroSlides[currentSlide]?.tag}
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-[#fdf9f2]">
              {heroSlides[currentSlide]?.title} <br />
              <span className="text-[#b98f4a] italic font-normal">{heroSlides[currentSlide]?.highlightTitle}</span>
            </h1>

            <p className="text-sm sm:text-base text-[#d0c5b2] leading-relaxed max-w-xl font-light">
              {heroSlides[currentSlide]?.description}
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to={heroSlides[currentSlide]?.ctaLink || '/shop'}
                className="bg-[#7b5818] hover:bg-[#604100] text-white px-8 py-3.5 rounded text-xs font-semibold uppercase tracking-widest transition flex items-center gap-2 shadow-lg"
              >
                {heroSlides[currentSlide]?.ctaText || 'Explore Collection'} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to={heroSlides[currentSlide]?.secLink || '/shop?metal=Gold'}
                className="border border-[#b98f4a] text-[#fdf9f2] hover:bg-[#b98f4a] hover:text-white px-8 py-3.5 rounded text-xs font-semibold uppercase tracking-widest transition backdrop-blur-xs"
              >
                {heroSlides[currentSlide]?.secText || 'Shop Gold Jewellery'}
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Slide Indicators (Dots & Controls) */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide ? 'w-8 bg-[#b98f4a]' : 'w-2 bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION 2: SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-in-up">
          <span className="text-xs uppercase tracking-widest text-[#7b5818] font-bold">Curated Treasures</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1c1c18] mt-1">Shop By Category</h2>
          <div className="w-12 h-0.5 bg-[#7b5818] mx-auto mt-3"></div>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id || cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="group relative rounded overflow-hidden aspect-4/5 bg-white border border-[#e6e2db] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 animate-pop-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <img
                  src={cat.image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600"}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
                  <h3 className="font-serif text-lg font-semibold transform group-hover:-translate-y-1 transition duration-300">{cat.name}</h3>
                  <p className="text-xs text-[#d0c5b2] mt-0.5 flex items-center gap-1 group-hover:text-[#b98f4a] transition">
                    Explore Pieces <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition duration-300" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Rings', slug: 'rings', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600' },
              { name: 'Earrings', slug: 'earrings', img: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=600' },
              { name: 'Necklaces', slug: 'necklaces', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600' },
              { name: 'Bangles', slug: 'bangles', img: 'https://images.unsplash.com/photo-1611591475824-287707c30789?auto=format&fit=crop&q=80&w=600' },
            ].map((cat, idx) => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="group relative rounded overflow-hidden aspect-4/5 bg-white border border-[#e6e2db] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5 animate-pop-in"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
                  <h3 className="font-serif text-lg font-semibold transform group-hover:-translate-y-1 transition duration-300">{cat.name}</h3>
                  <p className="text-xs text-[#d0c5b2] mt-0.5 flex items-center gap-1 group-hover:text-[#b98f4a] transition">
                    Explore Pieces <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition duration-300" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: BESTSELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white border border-[#e6e2db] rounded-lg p-8 shadow-xs animate-fade-in-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#7b5818] font-bold">Most Coveted</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1c1c18] mt-1">Our Bestsellers</h2>
          </div>
          <Link
            to="/shop?isFeatured=true"
            className="text-xs font-semibold uppercase tracking-wider text-[#7b5818] hover:text-[#604100] flex items-center gap-1 group"
          >
            View All Bestsellers <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition duration-300" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : bestsellers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestsellers.slice(0, 4).map((product, idx) => (
              <ProductCard key={product.id} product={product} delay={(idx % 4) * 100} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-[#645d56] py-8">Explore our catalog to view bestselling jewellery.</p>
        )}
      </section>

      {/* SECTION 4 & 5: GOLD & DIAMOND SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Gold Showcase */}
        <div className="bg-[#f7ede0] rounded-lg border border-[#e6e2db] p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center hover:shadow-lg transition duration-500">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#7b5818] font-bold">22K & 18K Hallmarked</span>
            <h3 className="font-serif text-3xl font-bold text-[#1c1c18]">The Pure Gold Collection</h3>
            <p className="text-xs text-[#645d56] leading-relaxed">
              From traditional temple gold design to modern minimalist wear, each piece carries certified hallmark purity and handcrafted brilliance.
            </p>
            <Link
              to="/shop?metal=Gold"
              className="inline-block bg-[#7b5818] text-white text-xs font-semibold uppercase tracking-wider py-3 px-6 rounded hover:bg-[#604100] transition shadow-md hover:scale-102"
            >
              Shop Gold Collection
            </Link>
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-2 gap-4">
            {goldProducts.slice(0, 2).map((prod, idx) => (
              <ProductCard key={prod.id} product={prod} delay={idx * 150} />
            ))}
          </div>
        </div>

        {/* Diamond Showcase */}
        <div className="bg-white rounded-lg border border-[#e6e2db] p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center hover:shadow-lg transition duration-500">
          <div className="lg:order-2 space-y-4">
            <span className="text-xs uppercase tracking-widest text-[#7b5818] font-bold">IGI & SGL Certified</span>
            <h3 className="font-serif text-3xl font-bold text-[#1c1c18]">Natural Diamond Luxury</h3>
            <p className="text-xs text-[#645d56] leading-relaxed">
              Experience the unblemished clarity and radiance of hand-selected VVS-VS natural diamonds set in 18K solid gold.
            </p>
            <Link
              to="/shop?metal=Diamond"
              className="inline-block bg-[#1c1c18] text-white text-xs font-semibold uppercase tracking-wider py-3 px-6 rounded hover:bg-[#7b5818] transition shadow-md hover:scale-102"
            >
              Shop Diamond Collection
            </Link>
          </div>

          <div className="lg:col-span-2 lg:order-1 grid grid-cols-2 sm:grid-cols-2 gap-4">
            {diamondProducts.slice(0, 2).map((prod, idx) => (
              <ProductCard key={prod.id} product={prod} delay={idx * 150} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#7b5818] font-bold">Fresh Designs</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1c1c18] mt-1">New Arrivals</h2>
          <div className="w-12 h-0.5 bg-[#7b5818] mx-auto mt-3"></div>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.slice(0, 4).map((product, idx) => (
              <ProductCard key={product.id} product={product} delay={(idx % 4) * 100} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-[#645d56] py-8">Check back soon for upcoming handcrafted arrivals.</p>
        )}
      </section>

      {/* SECTION 7: WHY OM SHILPI JEWELS */}
      <section className="bg-[#1c1c18] text-[#fdf9f2] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase tracking-widest text-[#b98f4a] font-bold">The Om Shilpi Difference</span>
          <h2 className="font-serif text-3xl font-bold text-[#fdf9f2] mt-1 mb-12">Why Choose Om Shilpi Jewels</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: "100% Certified", desc: "Every piece is hallmarked by BIS & certified by international diamond institutes." },
              { icon: Gem, title: "Transparent Pricing", desc: "Full breakup of gold rate, net weight, stone cost, and minimal making charges." },
              { icon: Clock, title: "40 Years Trust", desc: "Serving generations of families with authentic craftsmanship since 1985." },
              { icon: Award, title: "Bespoke Customization", desc: "Custom design services to turn your dream jewellery concepts into reality." }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-[#201b0f] rounded-lg border border-[#31302c] flex flex-col items-center space-y-3 hover:-translate-y-1.5 transition-all duration-300 hover:border-[#b98f4a]/60 animate-fade-in-up"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <Icon className="w-10 h-10 text-[#b98f4a] transition-transform duration-300 hover:scale-110" />
                  <h4 className="font-serif text-lg font-semibold">{item.title}</h4>
                  <p className="text-xs text-[#d0c5b2]">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 8: TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-in-up">
            <span className="text-xs uppercase tracking-widest text-[#7b5818] font-bold">Patron Stories</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1c1c18] mt-1">Loved By Generations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((item, idx) => (
              <div
                key={item.id}
                className="p-6 bg-white border border-[#e6e2db] rounded-lg shadow-sm flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-[#7b5818]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-[#4f4539] italic leading-relaxed">"{item.content || item.review}"</p>
                </div>
                <div className="mt-4 pt-4 border-t border-[#f1ede6]">
                  <p className="font-serif text-sm font-semibold text-[#1c1c18]">{item.author || item.name}</p>
                  <p className="text-[11px] text-[#817567]">{item.location || 'Verified Patron'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
