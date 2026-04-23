import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { localImages } from "../data/categories";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import CategoryTabs from "../components/CategoryTabs";
import ImageCard from "../components/ImageCard";

const animatedPrompts = [
  "find transparent flower PNG",
  "show latest festival clipart",
  "search vector logo shapes",
  "download clean HD PNG assets",
];

function HomePage() {
  const [images, setImages] = useState(localImages);
  const [isLoading, setIsLoading] = useState(true);
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [heroSearch, setHeroSearch] = useState("");

  const [promptIndex, setPromptIndex] = useState(0);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ Categories (Alphabet & Numbers removed)
  const dynamicCategories = ["All", "Clipart", "Festival", "Flower", "Shape", "Vector"];

  const dynamicSlugToCategory = useMemo(() => {
    const map = {};
    images.forEach((img) => {
      const slug = img.category.toLowerCase().replace(/\s+/g, "-");
      map[slug] = img.category;
    });
    return map;
  }, [images]);

  const activeCategory = useMemo(() => {
    if (!categorySlug) return "All";
    return dynamicSlugToCategory[categorySlug] ?? null;
  }, [categorySlug, dynamicSlugToCategory]);

  const query = (searchParams.get("q") ?? "").trim().toLowerCase();

  // 🔥 Typing animation (clean)
  useEffect(() => {
    const currentPrompt = animatedPrompts[promptIndex];
    let delay = isDeleting ? 40 : 70;

    const timeout = setTimeout(() => {
      if (!isDeleting && typedPrompt === currentPrompt) {
        setIsDeleting(true);
        return;
      }
      if (isDeleting && typedPrompt.length === 0) {
        setIsDeleting(false);
        setPromptIndex((prev) => (prev + 1) % animatedPrompts.length);
        return;
      }
      setTypedPrompt(
        isDeleting
          ? currentPrompt.slice(0, typedPrompt.length - 1)
          : currentPrompt.slice(0, typedPrompt.length + 1)
      );
    }, delay);

    return () => clearTimeout(timeout);
  }, [typedPrompt, isDeleting, promptIndex]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("https://pngweb-production.up.railway.app/api/images");
      if (res.data.success) {
        setImages([...localImages, ...res.data.data]);
      }
    } catch (err) {
      console.error("Failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 FILTER (Robust filtering for production)
  const filteredImages = useMemo(() => {
    // 1. Initial images set
    let result = images;

    // 2. Category Filter
    if (activeCategory && activeCategory !== "All") {
      result = result.filter((img) => img.category === activeCategory);
    }

    // 3. Search Query Filter
    if (query) {
      result = result.filter((item) => {
        const title = (item.title || "").toLowerCase();
        const tags = (item.tags || []).join(" ").toLowerCase();
        const cat = (item.category || "").toLowerCase();
        return title.includes(query) || tags.includes(query) || cat.includes(query);
      });
    }

    // 4. Remove unwanted categories (Alphabet/Numbers)
    result = result.filter(
      (img) => !["Alphabet", "Numbers"].includes(img.category)
    );

    return result;
  }, [activeCategory, query, images]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const value = heroSearch.trim();
    setSearchParams(value ? { q: value } : {});
  };

  if (activeCategory === null) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* 🔥 HERO SECTION (Modern & Premium) */}
      <div className="relative mb-8 overflow-hidden bg-white pt-24 pb-12 text-center md:mb-12 md:pt-32 md:pb-32 dark:bg-slate-900">
        {/* Glow Blobs Background Layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Purple Blob - Left */}
          <div className="absolute -left-[15%] top-[10%] h-[300px] w-[300px] md:h-[500px] md:w-[500px] rounded-full bg-[#a78bfa] opacity-60 dark:opacity-40 blur-[80px] md:blur-[100px]" />
          
          {/* Pink Blob - Top Right */}
          <div className="absolute -right-[15%] -top-[10%] h-[400px] w-[400px] md:h-[600px] md:w-[600px] rounded-full bg-[#f472b6] opacity-60 dark:opacity-40 blur-[80px] md:blur-[100px]" />
          
          {/* Cyan Blob - Bottom Center */}
          <div className="absolute left-1/2 -bottom-[20%] h-[300px] w-[400px] md:h-[500px] md:w-[700px] -translate-x-1/2 rounded-full bg-[#22d3ee] opacity-70 dark:opacity-50 blur-[80px] md:blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4">
          <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl dark:text-white">
            Creative Images <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PNGWALE</span>
          </h1>
          <p className="mb-8 text-base font-medium text-slate-600 md:mb-10 md:text-xl dark:text-slate-300">
            Download high-quality transparent PNG images
          </p>

          <form onSubmit={handleHeroSearch} className="mx-auto max-w-2xl">
            <div className="relative group flex flex-col gap-3 sm:block">
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder={`Search for ${typedPrompt}...`}
                className="w-full rounded-2xl border border-slate-200 bg-white/40 px-6 py-4 text-base sm:px-8 sm:py-5 sm:text-lg text-slate-900 placeholder-slate-500 backdrop-blur-xl outline-none transition-all focus:bg-white/60 focus:ring-8 focus:ring-blue-500/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-white/40 dark:focus:bg-white/10"
              />
              <button
                type="submit"
                className="sm:absolute sm:right-3 sm:top-1/2 sm:-translate-y-1/2 rounded-xl bg-blue-600 px-6 py-3 sm:py-2.5 text-sm font-black text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 active:scale-95"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ PAGE CONTENT CONTAINER */}
      <div className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        {/* ✅ CATEGORY TABS */}
        <CategoryTabs
          categories={dynamicCategories}
          activeCategory={activeCategory}
        />

        {/* 🔥 IMAGES GRID */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredImages.map((item, index) => (
                <ImageCard key={item._id || index} item={item} index={index} />
              ))}
            </div>

            {filteredImages.length === 0 && (
              <div className="mt-20 text-center">
                <p className="text-xl font-bold text-slate-400">No images found</p>
                <p className="mt-2 text-slate-500">Try searching for something else</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default HomePage;