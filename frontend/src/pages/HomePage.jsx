import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { localImages } from "../data/categories";
import { FiArrowUp, FiMic, FiPlus } from "react-icons/fi";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import CategoryTabs from "../components/CategoryTabs";
import ImageCard from "../components/ImageCard";
import "../App.css";

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

  const allCategories = useMemo(() => [
    "All",
    ...new Set(images.map(img => img.category))
  ], [images]);

  const dynamicCategories = useMemo(() => {
    return allCategories;
  }, [allCategories]);

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

  useEffect(() => {
    // Typing animation logic stays the same
    const currentPrompt = animatedPrompts[promptIndex];
    let delay = isDeleting ? 35 : 65;
    if (!isDeleting && typedPrompt === currentPrompt) delay = 1100;
    if (isDeleting && typedPrompt.length === 0) delay = 260;

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
      if (isDeleting) {
        setTypedPrompt(currentPrompt.slice(0, typedPrompt.length - 1));
      } else {
        setTypedPrompt(currentPrompt.slice(0, typedPrompt.length + 1));
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [typedPrompt, isDeleting, promptIndex]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin/images");
      if (res.data.success) {
        setImages([...localImages, ...res.data.data]);
      }
    } catch (err) {
      console.error("Failed to fetch images:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Debug logs requested
  console.log("Local Assets loaded:", images.length);

  const filteredImages = useMemo(() => {
    let result = activeCategory === "All"
      ? images
      : images.filter(img => img.category === activeCategory);

    if (query) {
      result = result.filter((item) => {
        const haystack = `${item.title} ${item.description || ''} ${item.keywords?.join(" ") || item.tags?.join(" ") || ''}`.toLowerCase();
        return haystack.includes(query);
      });
    }

    return result;
  }, [activeCategory, query, images]);

  const handleHeroSearch = (event) => {
    event.preventDefault();
    const value = heroSearch.trim();
    if (!value) {
      setSearchParams({});
      return;
    }
    setSearchParams({ q: value });
  };

  if (activeCategory === null) {
    return <Navigate to="/" replace />;
  }

  return (
    <section>
      <div
        className="relative left-1/2 right-1/2 mb-8 w-screen -translate-x-1/2 overflow-hidden pb-10 text-white md:pb-14"
        style={{ paddingTop: "calc(var(--header-height, 0px) + 1rem)" }}
      >
        <div className="hero-gradient-heart absolute inset-0" aria-hidden="true" />
        <div className="hero-dark-vignette absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-4 text-center md:px-6">
          <div className="w-full max-w-5xl">
            <h1 className="text-2xl font-black leading-tight sm:text-3xl md:text-5xl">
              Creative Images PNGWALE
            </h1>

            <form
              onSubmit={handleHeroSearch}
              className="my-5 w-full rounded-[1.75rem] border border-white/20 bg-white/10 p-3 text-left shadow-2xl backdrop-blur-md transition-all focus-within:border-white/50 focus-within:ring-4 focus-within:ring-white/5 sm:my-6 sm:rounded-[2rem] sm:p-4"
            >
              <textarea
                value={heroSearch}
                onChange={(event) => setHeroSearch(event.target.value)}
                placeholder={`Ask PNGWALE to ${typedPrompt} ...`}
                className="min-h-[92px] w-full resize-none bg-transparent px-2 pt-1 text-lg leading-tight text-white placeholder:text-zinc-400 focus:outline-none sm:min-h-[98px] sm:text-xl md:text-2xl"
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-600 text-zinc-200 transition hover:bg-zinc-700"
                  aria-label="Add attachment"
                >
                  <FiPlus className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 text-zinc-400">
                  <span className="text-base sm:text-lg">Plan</span>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-zinc-700"
                    aria-label="Voice input"
                  >
                    <FiMic className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-zinc-200 text-zinc-900 transition hover:bg-white"
                    aria-label="Submit search"
                  >
                    <FiArrowUp className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </form>

            <p className="mt-2 max-w-2xl text-xs text-white/85 sm:text-sm md:mx-auto md:text-base">
              Download transparent PNG resources in multiple categories with a
              full responsive preview experience.
            </p>
          </div>
        </div>
      </div>

      <CategoryTabs
        categories={dynamicCategories}
        activeCategory={activeCategory}
      />

      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
           <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredImages.map((item, index) => (
              <ImageCard key={item._id} item={item} index={index} />
            ))}
          </div>

          {filteredImages.length === 0 && (
            <p className="rounded-xl border border-brand-100 bg-white p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              No images found for this selection.
            </p>
          )}
        </>
      )}
    </section>
  );
}

export default HomePage;
