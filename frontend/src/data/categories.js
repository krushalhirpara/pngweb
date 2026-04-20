export const categories = [
  "Alphabet",
  "Clipart",
  "Festival",
  "Flower",
  "Numbers",
  "Shape",
  "Vector"
];

// 🔥 Dynamic Local Asset Discovery
const rawAssets = import.meta.glob('../assets/**/*.{png,jpg,jpeg,svg}', { eager: true });

export const localImages = Object.entries(rawAssets)
  .map(([path, module]) => {
    const parts = path.split('/');
    const category = parts[parts.length - 2];
    const filename = parts[parts.length - 1];
    
    // Skip if file is directly in the assets folder
    if (!category || category.toLowerCase() === 'assets') return null;

    const title = filename
      .replace(/\.[^/.]+$/, "")
      .replace(/-/g, " ")
      .replace(/_/g, " ")
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    const id = btoa(path).replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
    const slug = filename
      .toLowerCase()
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return {
      _id: id,
      id: id,
      slug: slug,
      title: title,
      category: category,
      imageUrl: module.default,
      tags: [category],
      isLocal: true, // Mark as local for URL resolution
      path: path
    };
  })
  .filter(img => img !== null);
