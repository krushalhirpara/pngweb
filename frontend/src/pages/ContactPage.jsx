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
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      return toast.error("Please fill all fields");
    }

    setLoading(true);
    try {
      console.log("🚀 Sending contact message...", formData);
      
      const res = await axios.post(
        "https://pngweb-production.up.railway.app/api/contact",
        formData
      );

      if (res.data.success) {
        toast.success("Message sent successfully!");
        setFormData({ name: '', email: '', message: '' }); // Clear form
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("🔥 Contact Form Error:", err);
      toast.error(err.response?.data?.message || "Something went wrong. Please try later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft md:p-8 dark:border-slate-700 dark:bg-slate-800">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
        <div className="rounded-2xl bg-brand-900 p-6 text-white dark:bg-slate-950">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Contact Us</p>
          <h1 className="mb-4 text-2xl font-black md:text-3xl">Reach PNGWALE</h1>
          <p className="text-sm leading-7 text-white/80">
            For copyright, licensing, custom design requests, or partnership discussions, use
            the form and share complete details. We strive to respond to all inquiries within 24-48 hours.
          </p>
          <div className="mt-6 space-y-4 text-sm text-white/85">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <strong>Email:</strong> support@pngwale.com
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Response Type: Copyright claims, licensing questions, and business requests.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Best Practice: Include image title, page link, and your message context clearly.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 lg:min-w-0">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="rounded-xl border border-brand-100 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            placeholder="Your Name"
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="rounded-xl border border-brand-100 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            placeholder="Your Email"
          />
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="min-h-40 rounded-xl border border-brand-100 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            placeholder="Your Message"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-black text-white lg:w-auto lg:justify-self-start hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ContactPage;
