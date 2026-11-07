"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/frontend/components/Navbar";
import Footer from "@/frontend/components/Footer";
import ProductCard from "@/frontend/components/ProductCard";
import ProductDetailModal from "@/frontend/components/ProductDetailModal";
import { Product } from "@/shared/db";
import { useWishlist } from "@/frontend/context/WishlistContext";
import {
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  SlidersHorizontal,
  MapPin,
  Search,
  Hammer,
  Scissors,
  UtensilsCrossed,
  Leaf,
  Package,
  Heart,
  Grid3X3,
  LayoutGrid,
  RotateCcw,
  Truck,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const kategoriQuery = searchParams.get("kategori") || "semua";
  const filterQuery = searchParams.get("filter") || "";

  const { wishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({
    Kerajinan: 0,
    Fashion: 0,
    Kuliner: 0,
    Kecantikan: 0,
    Lainnya: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(kategoriQuery);
  const [selectedRegion, setSelectedRegion] = useState<string>("semua");
  const [selectedPrice, setSelectedPrice] = useState<string>("semua");
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(filterQuery === "favorit");
  const [sortBy, setSortBy] = useState<"terbaru" | "termurah" | "termahal" | "stok">("terbaru");
  const [viewMode, setViewMode] = useState<"grid" | "editorial">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Hero Search input
  const [heroSearchInput, setHeroSearchInput] = useState("");

  // Manual carousel state for the hero showcase
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const heroSlides = useMemo(
    () => [
      {
        id: 2,
        tag: "Koleksi Mahakarya Wastra",
        title: "Tenun Ikat Pakan Tradisional Sumba",
        desc: "Pewarna alami mengkudu dan nila biru, ditenun manual 3 bulan.",
        location: "Sumba Timur, NTT",
        badge: "Wastra Pusaka",
        image: "/uploads/produk/tenun_sumba.jpg",
      },
      {
        id: 4,
        tag: "Kriya Tembikar Tradisional",
        title: "Gerabah Kasongan Tanah Liat Asli",
        desc: "Dibentuk telaten putaran roda kayu dan dipanggang tungku alami.",
        location: "Kasongan, Bantul",
        badge: "Tembikar Pusaka",
        image: "/uploads/produk/gerabah_kasongan_asli.jpg",
      },
      {
        id: 7,
        tag: "Wastra Batik Pesisir",
        title: "Batik Cap Katun Primissima Pekalongan",
        desc: "Motif klasik pesisiran dengan canting malam tembaga otentik.",
        location: "Pekalongan, Jawa Tengah",
        badge: "Batik Cap",
        image: "/uploads/produk/batik_pekalongan.jpg",
      },
      {
        id: 6,
        tag: "Kriya Anyaman Serat Alam",
        title: "Tas Serat Rotan Ketak Sasak Ende",
        desc: "Jalinan serat rotan hutan alami tanpa bahan sintetis kimia.",
        location: "Lombok Barat, NTB",
        badge: "Serat Alami",
        image: "/uploads/produk/tas_rotan_lombok.jpg",
      },
      {
        id: 5,
        tag: "Cita Rasa Rempah Nusantara",
        title: "Biji Kopi Robusta Lereng Gunung Ijen",
        desc: "Petik merah kebun vulkanik, aroma rempah dan cokelat pekat.",
        location: "Banyuwangi, Jawa Timur",
        badge: "Robusta Ijen",
        image: "/uploads/produk/kopi_ijen.jpg",
      },
    ],
    []
  );

  const handleNextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const fetchProducts = async (cat: string, query: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (cat && cat !== "semua") params.set("kategori", cat);
      if (query) params.set("search", query);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal mengambil data dari server.");
      const data = await res.json();
      setProducts(data.products || []);
      if (data.categoryCounts) setCategoryCounts(data.categoryCounts);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat memuat produk.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveCategory(kategoriQuery);
    if (filterQuery === "favorit") setOnlyFavorites(true);
    fetchProducts(kategoriQuery, search);
  }, [kategoriQuery, search, filterQuery]);

  const handleCategorySelect = (slug: string) => {
    setActiveCategory(slug);
    fetchProducts(slug, search);
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearchInput.trim()) return;
    router.push(`/?search=${encodeURIComponent(heroSearchInput.trim())}#katalog`);
  };

  const categories = [
    {
      name: "Kerajinan Tangan",
      slug: "Kerajinan",
      icon: Hammer,
      regionHint: "Kasongan, Bantul & Gianyar",
      desc: "Tembikar tanah liat, ukir kayu, anyaman bambu",
      image: "/uploads/produk/gerabah_kasongan_asli.jpg",
    },
    {
      name: "Wastra & Busana",
      slug: "Fashion",
      icon: Scissors,
      regionHint: "Pekalongan, Sumba & Toraja",
      desc: "Batik tulis, cap primissima, dan tenun pakan",
      image: "/uploads/produk/batik_pekalongan.jpg",
    },
    {
      name: "Kuliner & Rempah",
      slug: "Kuliner",
      icon: UtensilsCrossed,
      regionHint: "Gunung Ijen & Dataran Tinggi",
      desc: "Biji kopi lereng gunung, madu hutan, racikan jamu",
      image: "/uploads/produk/kopi_ijen.jpg",
    },
    {
      name: "Perawatan Alami",
      slug: "Kecantikan",
      icon: Leaf,
      regionHint: "Gianyar & Sentra Herbal Jawa",
      desc: "Minyak atsiri serai wangi, dupa herbal, lulur rempah",
      image: "/uploads/produk/dupa_atsiri.jpg",
    },
    {
      name: "Kriya Anyaman",
      slug: "Lainnya",
      icon: Package,
      regionHint: "Lombok Barat & NTB",
      desc: "Tas rotan Sasak Ende, wadah serat alami serbaguna",
      image: "/uploads/produk/tas_rotan_lombok.jpg",
    },
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];
    if (onlyFavorites) list = list.filter((p) => wishlist.includes(p.id));
    if (selectedRegion === "jawa") list = list.filter((p) => (p.asal_daerah || "").toLowerCase().match(/jawa|yogyakarta|bantul|pekalongan/));
    else if (selectedRegion === "bali-ntb") list = list.filter((p) => (p.asal_daerah || "").toLowerCase().match(/bali|gianyar|lombok|ntb/));
    else if (selectedRegion === "sulawesi") list = list.filter((p) => (p.asal_daerah || "").toLowerCase().match(/toraja|sulawesi/));
    if (selectedPrice === "under-100k") list = list.filter((p) => p.harga < 100000);
    else if (selectedPrice === "100k-300k") list = list.filter((p) => p.harga >= 100000 && p.harga <= 300000);
    else if (selectedPrice === "above-300k") list = list.filter((p) => p.harga > 300000);
    if (sortBy === "termurah") return list.sort((a, b) => a.harga - b.harga);
    if (sortBy === "termahal") return list.sort((a, b) => b.harga - a.harga);
    if (sortBy === "stok") return list.sort((a, b) => b.stok - a.stok);
    return list.sort((a, b) => b.id - a.id);
  }, [products, sortBy, onlyFavorites, wishlist, selectedRegion, selectedPrice]);

  const hasActiveFilters = activeCategory !== "semua" || selectedRegion !== "semua" || selectedPrice !== "semua" || onlyFavorites || Boolean(search);

  const resetAllFilters = () => {
    setActiveCategory("semua");
    setSelectedRegion("semua");
    setSelectedPrice("semua");
    setOnlyFavorites(false);
    fetchProducts("semua", "");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] dark:bg-[#120F0D] text-[#1A110B] dark:text-[#FAF7F2] transition-colors duration-300">
      <Navbar initialSearch={search} activeCategory={activeCategory} />

      <main className="flex-1">
        {/* ======================================================== */}
        {/* HERO SECTION: Editorial Artisan Lookbook Showcase        */}
        {/* ======================================================== */}
        <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-[#E7DFD4] dark:border-[#261E19]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-7 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              
              {/* Left Column: Story, Title, Search & Tags */}
              <div className="space-y-6 lg:space-y-8">
                {/* Hero Title */}
                <div className="space-y-4">
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A110B] dark:text-[#FAF7F2] leading-[1.08]">
                    Mahakarya Kriya Nusantara
                  </h1>
                  <p className="max-w-xl text-lg leading-relaxed text-[#5C4F44] dark:text-[#C5B8AA]">
                    PasarNusa adalah jembatan antara pengrajin tradisional desa dan pencinta karya adiluhung: batik cap Pekalongan, tenun ikat Sumba, tembikar Kasongan, hingga robusta lereng Gunung Ijen.
                  </p>
                </div>

                {/* Hero Search Box */}
                <form
                  onSubmit={handleHeroSearch}
                  className="flex flex-col sm:flex-row gap-2.5 max-w-xl pt-2"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7E72] dark:text-[#A89887]" />
                    <input
                      type="text"
                      value={heroSearchInput}
                      onChange={(e) => setHeroSearchInput(e.target.value)}
                      placeholder="Cari batik tulis, tenun Sumba, gerabah..."
                      className="w-full h-12 pl-11 pr-4 bg-white dark:bg-[#1A1411] border border-[#D8CEBF] dark:border-[#2C211A] rounded-lg text-sm text-[#1A110B] dark:text-[#FAF7F2] placeholder-[#8C7E72] dark:placeholder-[#A89887] focus:border-[#C94B1A] focus:ring-1 focus:ring-[#C94B1A] focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-12 px-7 rounded-lg bg-[#C94B1A] hover:bg-[#B33F14] text-white text-sm font-bold transition-colors active:scale-[0.98] flex items-center justify-center gap-2 flex-shrink-0"
                  >
                    <span>Cari Karya</span>
                  </button>
                </form>

                {/* Quick Artisan Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="font-semibold text-[#8C7E72] dark:text-[#9C9084]">Pencarian Populer:</span>
                  {[
                    { label: "Batik Cap Sanghai", query: "Batik" },
                    { label: "Tenun Ikat Toraja", query: "Tenun" },
                    { label: "Gerabah Kasongan", query: "Gerabah" },
                    { label: "Kopi Robusta Ijen", query: "Kopi" },
                  ].map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => {
                        setHeroSearchInput(tag.query);
                        router.push(`/?search=${encodeURIComponent(tag.query)}#katalog`);
                      }}
                      className="rounded bg-white dark:bg-[#1A1411] border border-[#E0D7CB] dark:border-[#2C211A] px-3.5 py-1 font-medium text-[#1A110B] dark:text-[#FAF7F2] hover:border-[#C94B1A] hover:text-[#C94B1A] transition-colors"
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Interactive Artisan Showcase Endless Carousel */}
              <div className="relative">
                {/* Main Featured Showcase Card */}
                <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-[#181310] border border-[#E7DFD4] dark:border-[#2C211A] p-3 sm:p-4">
                  
                  {/* Top Slide Stage with Framer Motion Endless Transition */}
                  <div
                    onClick={() => {
                      const p = products.find((item) => item.id === heroSlides[currentSlideIndex].id);
                      if (p) {
                        setSelectedProduct(p);
                      } else {
                        router.push(`/?search=${encodeURIComponent(heroSlides[currentSlideIndex].title)}#katalog`);
                      }
                    }}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F3EEE6] dark:bg-[#201814] cursor-pointer group"
                  >
                    <div className="absolute inset-0">
                      <img
                        src={heroSlides[currentSlideIndex].image}
                        alt={heroSlides[currentSlideIndex].title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 select-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                    </div>

                    {/* Top Left: Provenance Badge */}
                    <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 rounded bg-black/70 px-3 py-1 text-xs font-semibold text-white pointer-events-none">
                      <MapPin className="w-3.5 h-3.5 text-[#FFA07A]" />
                      <span>{heroSlides[currentSlideIndex].location}</span>
                    </div>

                    {/* Top Right: Category Badge & Slide Counter */}
                    <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2">
                      <span className="rounded bg-white/95 dark:bg-[#1A1411]/95 px-3 py-1 text-xs font-bold text-[#8A5912] dark:text-[#E09F3E] border border-[#B8872A]/30">
                        {heroSlides[currentSlideIndex].badge}
                      </span>
                      <span className="rounded bg-black/70 px-2 py-1 text-[11px] font-semibold text-white/90">
                        0{currentSlideIndex + 1}/0{heroSlides.length}
                      </span>
                    </div>

                    {/* Floating Prev / Next Navigation Arrows */}
                    <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between z-10 pointer-events-none">
                      <button
                        type="button"
                        onClick={handlePrevSlide}
                        aria-label="Karya Sebelumnya"
                        className="pointer-events-auto h-9 w-9 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center transition-colors active:scale-95"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextSlide}
                        aria-label="Karya Berikutnya"
                        className="pointer-events-auto h-9 w-9 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center transition-colors active:scale-95"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Caption Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white z-10 pointer-events-none">
                      <p className="text-[11px] font-semibold text-[#FFA07A]">
                        {heroSlides[currentSlideIndex].tag}
                      </p>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold mt-1 leading-snug line-clamp-1">
                        {heroSlides[currentSlideIndex].title}
                      </h3>
                      <p className="text-xs text-white/85 mt-1 line-clamp-1">
                        {heroSlides[currentSlideIndex].desc}
                      </p>
                    </div>
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="flex items-center gap-2 sm:gap-2.5 mt-3 overflow-x-auto no-scrollbar py-0.5">
                    {heroSlides.map((slide, idx) => {
                      const isActive = currentSlideIndex === idx;
                      return (
                        <button
                          key={slide.id}
                          type="button"
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`relative flex-1 min-w-[58px] sm:min-w-[70px] rounded-lg overflow-hidden aspect-[4/3] bg-[#F3EEE6] dark:bg-[#201814] border transition-colors ${
                            isActive
                              ? "border-[#C94B1A]"
                              : "border-[#E7DFD4] dark:border-[#2C211A] opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                          />
                          <div className={`absolute inset-0 transition-colors ${isActive ? "bg-transparent" : "bg-black/30 hover:bg-black/10"}`} />
                          <span className="absolute bottom-1 inset-x-1 text-[9px] font-semibold text-white bg-black/70 px-1 py-0.5 rounded-sm truncate text-center">
                            {slide.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* TRUST & INTEGRITY PILLARS (Understated Editorial Strip)   */}
        {/* ======================================================== */}
        <section className="bg-white dark:bg-[#16110E] py-7 border-b border-[#E7DFD4] dark:border-[#261E19]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-7 lg:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div className="flex items-start gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1A110B] dark:text-[#FAF7F2]">Kriya Tangan Otentik</h4>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-[#5C4F44] dark:text-[#C5B8AA] leading-relaxed">
                    Dibuat manual dengan teknik turun-temurun leluhur.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1A110B] dark:text-[#FAF7F2]">Kemitraan Adil UMKM</h4>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-[#5C4F44] dark:text-[#C5B8AA] leading-relaxed">
                    Tanpa tengkulak, harga adil langsung bagi pengrajin.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1A110B] dark:text-[#FAF7F2]">Kemasan Proteksi Kriya</h4>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-[#5C4F44] dark:text-[#C5B8AA] leading-relaxed">
                    Proteksi berlapis untuk gerabah dan produk wastra.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1A110B] dark:text-[#FAF7F2]">Jaminan Keaslian Mutu</h4>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-[#5C4F44] dark:text-[#C5B8AA] leading-relaxed">
                    Terstandarisasi bahan alami dan kelestarian budaya.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* CATEGORIES SECTION: Curated Lookbook Cards               */}
        {/* ======================================================== */}
        <section className="py-14 sm:py-20 border-b border-[#E7DFD4] dark:border-[#261E19]">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-7 lg:px-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-4">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A110B] dark:text-[#FAF7F2]">
                  Ragam Mahakarya Daerah
                </h2>
              </div>
              <p className="text-sm text-[#5C4F44] dark:text-[#C5B8AA] max-w-md">
                Pilih sentra kriya favorit untuk menemukan keunikan motif, teknik tenun, dan cita rasa rempah khas pulau-pulau Nusantara.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
              {categories.map((cat) => {
                const count = categoryCounts[cat.slug] || 0;
                const isSelected = activeCategory === cat.slug;
                const IconComp = cat.icon;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => {
                      handleCategorySelect(cat.slug);
                      document.getElementById("katalog")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`group relative flex flex-col overflow-hidden rounded-xl text-left transition-colors ${
                      isSelected
                        ? "border-2 border-[#C94B1A] bg-white dark:bg-[#1A1411]"
                        : "bg-white dark:bg-[#181310] border border-[#E7DFD4] dark:border-[#2C211A] hover:border-[#C94B1A]"
                    }`}
                  >
                    {/* Image with zoom */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F3EEE6] dark:bg-[#201814]">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Icon Badge */}
                      <div className="absolute top-2.5 left-2.5 flex h-7 w-7 items-center justify-center rounded bg-white/95 dark:bg-[#1A1411]/95">
                        <IconComp className="h-3.5 w-3.5 text-[#C94B1A]" />
                      </div>

                      {/* Region Tag */}
                      <span className="absolute bottom-2 left-2 text-[10px] font-semibold text-white/95 truncate max-w-[85%]">
                        {cat.regionHint}
                      </span>
                    </div>

                    {/* Meta Info */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-[#1A110B] dark:text-[#FAF7F2] group-hover:text-[#C94B1A] transition-colors leading-tight">
                          {cat.name}
                        </h3>
                        <p className="mt-1 text-[11px] text-[#5C4F44] dark:text-[#C5B8AA] line-clamp-1">
                          {cat.desc}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[#EAE3D8] dark:border-[#261E19] flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#8A5912] dark:text-[#E09F3E] text-[11px]">
                          {count} karya
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#8C7E72] group-hover:text-[#C94B1A] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* PRODUCT CATALOG & DISCOVERY TOOLBAR                      */}
        {/* ======================================================== */}
        <section id="katalog" className="py-14 sm:py-20 px-4 sm:px-7 lg:px-10">
          <div className="mx-auto max-w-[1440px] space-y-8">
            {/* Catalog Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A110B] dark:text-[#FAF7F2]">
                  {onlyFavorites
                    ? "Karya Favorit Tersimpan"
                    : activeCategory === "semua"
                    ? "Katalog Mahakarya Kriya Nusantara"
                    : `Koleksi ${activeCategory}`}
                </h2>
                <p className="mt-1.5 text-sm text-[#5C4F44] dark:text-[#C5B8AA]">
                  Menampilkan <span className="font-bold text-[#1A110B] dark:text-[#FAF7F2]">{filteredAndSortedProducts.length}</span> karya artisan terverifikasi
                </p>
              </div>

              {/* Search Active Indicator */}
              {search && (
                <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-[#1A1411] border border-[#E7DFD4] dark:border-[#2C211A] px-3.5 py-2 text-xs text-[#5C4F44] dark:text-[#C5B8AA]">
                  <span>Hasil cari: &ldquo;<strong className="text-[#1A110B] dark:text-[#FAF7F2]">{search}</strong>&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => router.push(activeCategory !== "semua" ? `/?kategori=${activeCategory}#katalog` : "/#katalog")}
                    className="font-bold text-[#C94B1A] hover:underline ml-1"
                  >
                    Hapus
                  </button>
                </div>
              )}

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center gap-1 p-1 bg-white dark:bg-[#1A1411] border border-[#E7DFD4] dark:border-[#2C211A] rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`min-h-8 min-w-8 flex items-center justify-center rounded transition ${
                    viewMode === "grid"
                      ? "bg-[#1A110B] text-white dark:bg-[#FAF7F2] dark:text-[#1A110B]"
                      : "text-[#6B5E52] dark:text-[#B8ADA2] hover:text-[#1A110B] dark:hover:text-white"
                  }`}
                  aria-label="Tampilan kisi 4 kolom"
                  title="Tampilan kisi 4 kolom"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("editorial")}
                  className={`min-h-8 min-w-8 flex items-center justify-center rounded transition ${
                    viewMode === "editorial"
                      ? "bg-[#1A110B] text-white dark:bg-[#FAF7F2] dark:text-[#1A110B]"
                      : "text-[#6B5E52] dark:text-[#B8ADA2] hover:text-[#1A110B] dark:hover:text-white"
                  }`}
                  aria-label="Tampilan editorial 2 kolom"
                  title="Tampilan editorial 2 kolom"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Faceted Discovery Toolbar (Clean Behance Style with High Contrast) */}
            <div className="bg-white dark:bg-[#181310] p-4 sm:p-5 rounded-xl border border-[#E7DFD4] dark:border-[#2C211A] space-y-4 transition-colors">
              {/* Category Horizontal Typographic Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOnlyFavorites(false);
                    handleCategorySelect("semua");
                  }}
                  className={`min-h-9 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeCategory === "semua" && !onlyFavorites
                      ? "bg-[#C94B1A] text-white"
                      : "bg-[#F7F4EE] dark:bg-[#221A15] text-[#1A110B] dark:text-[#FAF7F2] hover:bg-[#EAE3D8] dark:hover:bg-[#2D221B] border border-[#E7DFD4] dark:border-[#332720]"
                  }`}
                >
                  Semua Produk ({products.length})
                </button>
                {categories.map((c) => {
                  const count = categoryCounts[c.slug] || 0;
                  const isActive = activeCategory === c.slug && !onlyFavorites;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => {
                        setOnlyFavorites(false);
                        handleCategorySelect(c.slug);
                      }}
                      className={`min-h-9 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[#C94B1A] text-white"
                          : "bg-[#F7F4EE] dark:bg-[#221A15] text-[#1A110B] dark:text-[#FAF7F2] hover:bg-[#EAE3D8] dark:hover:bg-[#2D221B] border border-[#E7DFD4] dark:border-[#332720]"
                      }`}
                    >
                      {c.name} ({count})
                    </button>
                  );
                })}
                
                {/* Wishlist Toggle Button */}
                <button
                  type="button"
                  onClick={() => setOnlyFavorites(!onlyFavorites)}
                  className={`min-h-9 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ml-auto ${
                    onlyFavorites
                      ? "bg-[#8A5912] text-white"
                      : "bg-[#FAF2E6] dark:bg-[#251B14] text-[#8A5912] dark:text-[#E09F3E] border border-[#B8872A]/40 dark:border-[#B8872A]/20 hover:bg-[#8A5912] hover:text-white"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? "fill-current" : ""}`} />
                  <span>Favorit ({wishlist.length})</span>
                </button>
              </div>

              {/* Filters Row: Region, Price Range, Sort */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5 border-t border-[#EAE3D8] dark:border-[#261E19]">
                <div className="flex flex-wrap items-center gap-3.5 text-xs">
                  {/* Region Filter */}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C94B1A]" />
                    <span className="font-semibold text-[#5C4F44] dark:text-[#C5B8AA] hidden sm:inline">Sentra Kriya:</span>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="min-h-9 bg-[#F7F4EE] dark:bg-[#221A15] border border-[#E7DFD4] dark:border-[#332720] rounded-lg px-2.5 py-1 font-bold text-[#1A110B] dark:text-[#FAF7F2] focus:border-[#C94B1A] focus:outline-none"
                    >
                      <option value="semua">Semua Wilayah</option>
                      <option value="jawa">Jawa &amp; DIY (Pekalongan, Bantul)</option>
                      <option value="bali-ntb">Bali &amp; NTB (Gianyar, Lombok)</option>
                      <option value="sulawesi">Sulawesi (Tana Toraja)</option>
                    </select>
                  </div>

                  {/* Price Filter */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#5C4F44] dark:text-[#C5B8AA] hidden sm:inline">Harga:</span>
                    <select
                      value={selectedPrice}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                      className="min-h-9 bg-[#F7F4EE] dark:bg-[#221A15] border border-[#E7DFD4] dark:border-[#332720] rounded-lg px-2.5 py-1 font-bold text-[#1A110B] dark:text-[#FAF7F2] focus:border-[#C94B1A] focus:outline-none"
                    >
                      <option value="semua">Semua Harga</option>
                      <option value="under-100k">&lt; Rp 100.000</option>
                      <option value="100k-300k">Rp 100.000 - Rp 300.000</option>
                      <option value="above-300k">&gt; Rp 300.000</option>
                    </select>
                  </div>
                </div>

                {/* Right controls: Reset & Sort */}
                <div className="flex items-center gap-3">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="min-h-9 flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#A82A2A] dark:text-[#FF8080] hover:bg-[#FBEAEA] dark:hover:bg-[#381A1A] rounded-lg transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Atur Ulang
                    </button>
                  )}
                  
                  <div className="flex items-center gap-2 pl-3 border-l border-[#EAE3D8] dark:border-[#261E19]">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#5C4F44] dark:text-[#C5B8AA]" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="min-h-9 bg-[#F7F4EE] dark:bg-[#221A15] border border-[#E7DFD4] dark:border-[#332720] rounded-lg px-2.5 py-1 font-bold text-[#1A110B] dark:text-[#FAF7F2] focus:border-[#C94B1A] focus:outline-none"
                    >
                      <option value="terbaru">Terbaru</option>
                      <option value="termurah">Harga Terendah</option>
                      <option value="termahal">Harga Tertinggi</option>
                      <option value="stok">Stok Terbanyak</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid Content (with 3:4 aspect ratio luxury cards) */}
            {loading ? (
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-white dark:bg-[#181310] rounded-xl border border-[#E7DFD4] dark:border-[#2C211A] overflow-hidden animate-pulse">
                    <div className="aspect-[3/4] bg-[#F3EEE6] dark:bg-[#201814]" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-[#E7DFD4] dark:bg-[#2C211A] rounded w-3/4" />
                      <div className="h-3 bg-[#E7DFD4] dark:bg-[#2C211A] rounded w-1/2" />
                      <div className="h-10 bg-[#E7DFD4] dark:bg-[#2C211A] rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-10 text-center bg-white dark:bg-[#181310] rounded-xl border border-[#E7DFD4] dark:border-[#2C211A] max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-lg bg-[#FBEAEA] dark:bg-[#381A1A] text-[#A82A2A] dark:text-[#FF8080] flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1A110B] dark:text-[#FAF7F2]">Kendala Memuat Katalog</h3>
                <p className="mt-2 text-sm text-[#5C4F44] dark:text-[#C5B8AA]">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchProducts(activeCategory, search)}
                  className="mt-6 min-h-11 inline-flex items-center gap-2 px-6 py-2.5 bg-[#1A110B] dark:bg-[#221A15] text-white text-sm font-bold rounded-lg hover:bg-[#3D2B1A] dark:hover:bg-[#2D221B] border border-transparent dark:border-[#332720] transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Coba Muat Ulang
                </button>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-[#181310] rounded-xl border border-[#E7DFD4] dark:border-[#2C211A] max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-xl bg-[#FAF2E6] dark:bg-[#251B14] text-[#8A5912] dark:text-[#E09F3E] flex items-center justify-center mx-auto mb-4 border border-[#B8872A]/20">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1A110B] dark:text-[#FAF7F2]">Karya Belum Ditemukan</h3>
                <p className="mt-2 text-sm text-[#5C4F44] dark:text-[#C5B8AA] leading-relaxed">
                  Tidak ada karya kriya yang sesuai dengan filter atau kata kunci pencarian Anda saat ini.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="mt-6 min-h-11 inline-flex items-center gap-2 px-6 py-2.5 bg-[#C94B1A] text-white text-sm font-bold rounded-lg hover:bg-[#B33F14] transition"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Tampilkan Semua Karya
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}>
                {filteredAndSortedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} onViewDetail={setSelectedProduct} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ======================================================== */}
        {/* EDITORIAL STORY: "Warisan Luhur Pengrajin Nusantara"     */}
        {/* ======================================================== */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-7 lg:px-10">
            {/* Masterpiece Framed Card */}
            <div className="relative overflow-hidden rounded-2xl border border-[#E3DACB] dark:border-[#2E221B] bg-[#FAF5EE] dark:bg-[#1A1410] p-6 sm:p-10 lg:p-14">
              
              <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                
                {/* Visual Showcase (Left) */}
                <div className="relative">
                  <div className="relative rounded-xl overflow-hidden border border-[#DCD3C6] dark:border-[#38281F] aspect-[4/3] sm:aspect-[16/11]">
                    <img
                      src="/uploads/produk/tenun_sumba.jpg"
                      alt="Dedikasi Pengrajin Wastra &amp; Kriya Tradisional Nusantara"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                    
                    {/* Top Provenance Badge */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">
                      <MapPin className="w-3.5 h-3.5 text-[#FFA07A]" />
                      <span>Sentra Tenun &amp; Kriya Nusantara</span>
                    </div>

                    {/* Bottom Caption Pill */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 rounded-lg bg-white dark:bg-[#181310] p-4 border border-white/40 dark:border-white/10 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[#1A110B] dark:text-[#FAF7F2]">Warisan Luhur Karya Tangan Otentik</p>
                        <p className="text-[11px] text-[#706253] dark:text-[#A89887] mt-0.5">Ditenun, diukir, dan dibentuk manual dengan ketelatenan rasa lintas generasi</p>
                      </div>
                      <span className="hidden sm:inline-block px-3 py-1 rounded text-[10px] font-semibold bg-[#FAF0E6] dark:bg-[#2A1B14] text-[#C94B1A] dark:text-[#E06334] border border-[#C94B1A]/20 flex-shrink-0">
                        Kriya tangan
                      </span>
                    </div>
                  </div>

                  {/* Floating Artisan Quote Accent Badge */}
                  <div className="hidden sm:flex absolute -bottom-4 -right-4 z-20 max-w-xs rounded-lg bg-white dark:bg-[#201814] p-3.5 border border-[#E2D8CA] dark:border-[#38281F] items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FAF0E6] dark:bg-[#2E1E16] text-[#C94B1A] flex items-center justify-center flex-shrink-0 font-serif font-bold text-base">
                      &ldquo;
                    </div>
                    <p className="text-xs text-[#4A3D31] dark:text-[#C5B8AA] leading-snug italic font-serif">
                      Setiap karya membawa doa, pelestarian alam, dan denyut nadi keluarga desa.
                    </p>
                  </div>
                </div>

                {/* Narrative & Values (Right) */}
                <div className="space-y-6 lg:pl-4">
                  {/* Title */}
                  <div className="space-y-3">
                    <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A110B] dark:text-[#FAF7F2] leading-[1.12]">
                      Kriya desa untuk ruang Anda
                    </h2>
                    <p className="text-sm sm:text-base leading-relaxed text-[#5C4F44] dark:text-[#C5B8AA]">
                      Setiap guratan canting pada sehelai batik, putaran roda pembuat gerabah, dan jalinan helai serat rotan menyimpan dedikasi bergenerasi. Di PasarNusa, Anda membeli karya berjiwa yang menghidupkan dapur keluarga pengrajin di pelosok nusantara secara adil dan bermartabat.
                    </p>
                  </div>

                  {/* Feature Value Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div className="rounded-lg bg-white dark:bg-[#201712] border border-[#E3DACB] dark:border-[#33251D] p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#FAF0E6] dark:bg-[#2A1B14] text-[#C94B1A] flex items-center justify-center flex-shrink-0">
                          <Leaf className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="font-bold text-xs sm:text-sm text-[#1A110B] dark:text-[#FAF7F2]">Bahan Alami Lokal</h3>
                      </div>
                      <p className="text-xs text-[#706253] dark:text-[#A89887] mt-2 leading-relaxed">
                        Pewarna nabati daun indigo, kayu secang, tanah liat murni, dan serat rotan alami lestari.
                      </p>
                    </div>

                    <div className="rounded-lg bg-white dark:bg-[#201712] border border-[#E3DACB] dark:border-[#33251D] p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#FAF2E6] dark:bg-[#251B14] text-[#8A5912] dark:text-[#E09F3E] flex items-center justify-center flex-shrink-0">
                          <HeartHandshake className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="font-bold text-xs sm:text-sm text-[#1A110B] dark:text-[#FAF7F2]">Harga Adil untuk Pengrajin</h3>
                      </div>
                      <p className="text-xs text-[#706253] dark:text-[#A89887] mt-2 leading-relaxed">
                        Harga adil transparan tanpa potongan sepihak perantara, mengalir langsung ke pengrajin desa.
                      </p>
                    </div>
                  </div>

                  {/* CTA Action */}
                  <div className="pt-2">
                    <Link
                      href="/tentang-kami"
                      className="inline-flex h-12 items-center rounded-lg bg-[#C94B1A] hover:bg-[#B33F14] text-white px-7 font-bold text-sm transition-colors active:scale-[0.98]"
                    >
                      <span>Baca Kisah Pengrajin Kami</span>
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] dark:bg-[#120F0D] flex items-center justify-center font-bold text-sm text-[#1A110B] dark:text-[#FAF7F2]">Memuat PasarNusa...</div>}>
      <HomeContent />
    </Suspense>
  );
}
