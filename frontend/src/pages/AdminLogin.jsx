import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiLock } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("🚀 Login process started...");
    console.log("🔑 Secret Key entered:", secretKey ? "****" : "EMPTY");

    if (!secretKey) {
      console.log("❌ No secret key entered");
      return toast.error('Please enter secret key');
    }

    setLoading(true);
    try {
      console.log("📡 Sending POST request to /api/admin/login...");
      const res = await axios.post('/api/admin/login', { secretKey });
      
      console.log("✅ Response received:", res.data);

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        toast.success('Login successful');
        console.log("🏃 Redirecting to /admin/dashboard...");
        navigate('/admin/dashboard');
      } else {
        console.log("❌ Login failed:", res.data.message);
        toast.error(res.data.message || 'Login failed');
      }
    } catch (err) {
      console.error("🔥 LOGIN ERROR:", err);
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your key.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      console.log("🏁 Login process finished.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center -mt-8">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 dark:bg-indigo-900/40 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="text-indigo-600 dark:text-indigo-400 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold dark:text-white">Admin Access</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Enter secret key to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              placeholder="Secret Key"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
