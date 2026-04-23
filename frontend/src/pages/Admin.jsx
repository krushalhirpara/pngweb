import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiUpload, FiImage, FiLogOut, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { categories as allCategories } from '../data/categories';

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: allCategories.filter(c => c !== 'All')[0] || 'Vector',
    tags: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out');
    navigate('/admin/login');
  };

  const fetchImages = async () => {
    try {
      const res = await axios.get("/api/admin/images");
      if (res.data.success) {
        setImages(res.data.data);
      }
    } catch (err) {
      console.error("FETCH ERROR:", err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        return toast.error('Image is too large. Max 10MB allowed.');
      }
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    console.log("🚀 Upload process started...");

    if (!imageFile) {
      console.log("❌ No image file selected");
      return toast.error("Please select an image");
    }
    if (!formData.title.trim()) {
      console.log("❌ No title entered");
      return toast.error("Enter title");
    }
    if (!formData.category) {
      console.log("❌ No category selected");
      return toast.error("Select category");
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("❌ No token found in localStorage");
      toast.error("Session expired, please login again");
      return handleLogout();
    }

    try {
      setLoading(true);
      console.log("📦 Preparing FormData...", {
        title: formData.title,
        category: formData.category,
        tags: formData.tags,
        file: imageFile.name
      });

      const form = new FormData();
      form.append("image", imageFile); // Multer expects "image"
      form.append("title", formData.title);
      form.append("category", formData.category);
      form.append("tags", formData.tags);

      console.log("📡 Sending POST request to /api/admin/upload...");
      const res = await axios.post(
        "/api/admin/upload",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("✅ Response received:", res.data);

      if (res.data.success) {
        toast.success("Image Uploaded Successfully!");
        
        // Reset form
        setFormData({
          title: "",
          category: allCategories.filter(c => c !== 'All')[0] || "Vector",
          tags: ""
        });
        setImageFile(null);
        setPreview(null);
        
        console.log("🔄 Refreshing image list...");
        fetchImages();
      }
    } catch (err) {
      console.error("🔥 UPLOAD ERROR:", err);
      if (err.response?.status === 401) {
        console.log("🚫 Unauthorized - logging out...");
        handleLogout();
      } else {
        const errorMsg = err.response?.data?.message || "Upload failed. Please try again.";
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
      console.log("🏁 Upload process finished.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(
        `/api/admin/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.data.success) {
        toast.success('Image Deleted');
        fetchImages();
      }
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        toast.error('Delete failed');
      }
    }
  };

  return (
    <div className="py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your gallery assets</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium transition-colors"
        >
          <FiLogOut /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiUpload /> Upload Asset
              </h2>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Image File</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    accept="image/png, image/jpeg, image/webp"
                  />
                  {imageFile && <span className="text-sm text-slate-500 truncate">{imageFile.name}</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Red Rose"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white"
                  required
                >
                  {allCategories.filter(c => c !== 'All').map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  placeholder="flower, red, nature"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {preview && (
                <div className="relative mt-2">
                  <img src={preview} alt="preview" className="h-40 w-full object-contain bg-slate-100 dark:bg-slate-800 rounded-xl" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload Image'}
              </button>
            </form>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white">
              <FiImage /> Uploaded Assets
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map(img => (
                <div key={img._id} className="group relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <div className="aspect-square p-4 flex items-center justify-center">
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      className="max-h-full max-w-full object-contain drop-shadow-md"
                    />
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                    <p className="font-medium text-sm truncate dark:text-white">{img.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{img.category}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(img._id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Delete Image"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}

              {images.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500">
                  No images uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
