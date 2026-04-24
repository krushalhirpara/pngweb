import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      return toast.error("Please fill all fields");
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return toast.error("Enter valid email");
    }

    setLoading(true);

    try {
      console.log("🚀 Attempting to send message directly to Railway...");
      
      // ✅ DIRECT API CALL (No more .htaccess proxy dependency)
      const res = await axios.post("https://pngweb-production.up.railway.app/api/contact", formData);

      if (res.data.success) {
        toast.success("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      } else {
        toast.error(res.data.message || "Failed to send message");
      }

    } catch (err) {
      console.error("🔥 Direct API Error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Server connection failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-8 dark:border-slate-700 dark:bg-slate-800 transition-all duration-300">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
          <div className="rounded-2xl bg-slate-900 p-6 text-white dark:bg-slate-950">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-blue-400">Contact Us</p>
            <h1 className="mb-4 text-3xl font-black">Reach PNGWALE</h1>
            <p className="text-sm leading-7 text-slate-300">
              For copyright claims, custom design requests, or business inquiries, please use the form below. 
              Our team typically responds within 24-48 hours.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span className="text-sm"><strong>Support:</strong> support@pngwale.com</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-slate-400 leading-relaxed">
                Tip: Include specific image URLs or IDs for faster resolution of technical issues.
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white transition-all"
                placeholder="John Doe"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="min-h-40 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white transition-all resize-none"
                placeholder="How can we help you?"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-max rounded-xl bg-blue-600 px-8 py-4 text-sm font-bold text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
