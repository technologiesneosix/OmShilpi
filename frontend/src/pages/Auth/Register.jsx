import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await signup(formData);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-[#e6e2db] rounded p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-2xl font-bold text-[#1c1c18]">Create Account</h1>
          <p className="text-xs text-[#645d56]">Join Om Shilpi Jewels to enjoy personalized concierge services and order tracking.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#1c1c18] font-semibold mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#817567] absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="First & Last Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border border-[#d2c4b4] rounded outline-none focus:border-[#7b5818] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#1c1c18] font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#817567] absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border border-[#d2c4b4] rounded outline-none focus:border-[#7b5818] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#1c1c18] font-semibold mb-1">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#817567] absolute left-3 top-3" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 border border-[#d2c4b4] rounded outline-none focus:border-[#7b5818] text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7b5818] hover:bg-[#604100] text-white py-3 rounded text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow"
          >
            {loading ? 'Creating Account...' : 'Register'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-4 border-t border-[#e6e2db] text-xs text-[#645d56]">
          Already have an account?{' '}
          <Link to={`/login?redirect=${redirectPath}`} className="text-[#7b5818] font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
