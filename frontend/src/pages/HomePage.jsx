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

  // ❌ Hide categories
  const HIDDEN_CATEGORIES = ["Alphabet", "Numbers"];

  // ✅ Dynamic categories (hidden remove)
  const allCategories = useMemo(() => {
    const unique = [...new Set(images.map(img => img.category))];
    return ["All", ...unique.filter(cat => !HIDDEN_CATEGORIES.includes(cat))];
  }, [images]);

  const dynamicCategories = allCategories;

  // slug mapping
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

  // 🔥 Typing animation
  useEffect(() => {
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
      const res = await axios.get("https://pngweb-production.up.railway.app/api/admin/images");
      if (res.data.success) {
        setImages([...localImages, ...res.data.data]);
      }
    } catch (err) {
      console.error("Failed to fetch images:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 FILTER LOGIC (IMPORTANT FIX)
  const filteredImages = useMemo(() => {
    let result;

    if (activeCategory === "All") {
      result = images; // 🔥 All ma badha ave (including Alphabet & Numbers)
    } else {
      result = images.filter(img => img.category === activeCategory);
    }

    if (query) {
      result = result.filter((item) => {
        const haystack = `${item.title} ${item.description || ''} ${item.tags?.join(" ") || ''}`.toLowerCase();
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
      {/* HERO */}
      <div className="hero-section">
        <h1 className="text-3xl font-bold text-center">
          Creative Images PNGWALE
        </h1>

        <form onSubmit={handleHeroSearch}>
          <textarea
            value={heroSearch}
            onChange={(e) => setHeroSearch(e.target.value)}
            placeholder={`Ask PNGWALE to ${typedPrompt} ...`}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* ✅ CATEGORY TABS */}
      <CategoryTabs
        categories={dynamicCategories}
        activeCategory={activeCategory}
      />

      {/* IMAGES */}
      {isLoading ? (
        <div className="loader">Loading...</div>
      ) : (
        <>
          <div className="grid">
            {filteredImages.map((item, index) => (
              <ImageCard key={item._id} item={item} index={index} />
            ))}
          </div>

          {filteredImages.length === 0 && (
            <p>No images found</p>
          )}
        </>
      )}
    </section>
  );
}

export default HomePage;