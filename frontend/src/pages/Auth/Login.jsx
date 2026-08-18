import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login({ email, password });
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-[#e6e2db] rounded p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-2xl font-bold text-[#1c1c18]">Welcome Back</h1>
          <p className="text-xs text-[#645d56]">Sign in to access your orders, wishlist, and exclusive privileges.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#1c1c18] font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#817567] absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-[#d2c4b4] rounded outline-none focus:border-[#7b5818] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#1c1c18] font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#817567] absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-[#d2c4b4] rounded outline-none focus:border-[#7b5818] text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7b5818] hover:bg-[#604100] text-white py-3 rounded text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow"
          >
            {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-4 border-t border-[#e6e2db] text-xs text-[#645d56]">
          Don't have an account yet?{' '}
          <Link to={`/register?redirect=${redirectPath}`} className="text-[#7b5818] font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};
