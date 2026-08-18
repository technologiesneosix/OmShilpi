import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { contactApi } from '../../api/contact.api';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);
      await contactApi.submitEnquiry(formData);
      setSuccessMsg(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSuccessMsg(false), 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-[#7b5818]">Concierge & Support</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1c1c18]">Contact Om Shilpi Jewels</h1>
        <p className="text-xs sm:text-sm text-[#645d56]">
          We welcome your enquiries regarding bespoke jewellery designs, store appointments, or order assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info */}
        <div className="bg-[#1c1c18] text-[#fdf9f2] p-8 rounded border border-[#31302c] space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#fdf9f2] border-b border-[#31302c] pb-3">
            Flagship Store & HQ
          </h3>

          <div className="space-y-4 text-xs text-[#d0c5b2]">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#b98f4a] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white mb-0.5">Showroom Address</strong>
                <span>Om Shilpi Jewels, Zaveri Bazaar, Mumbai, Maharashtra 400002</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#b98f4a] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white mb-0.5">Phone Enquiries</strong>
                <span>+91 (022) 2890-4821 / +91 98200 12345</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#b98f4a] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white mb-0.5">Email Assistance</strong>
                <span>care@omshilpijewels.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enquiry Form */}
        <div className="lg:col-span-2 bg-white border border-[#e6e2db] rounded p-8 space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#1c1c18]">Send Us A Message</h3>

          {successMsg && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs rounded flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <span>Thank you! Your enquiry has been received. Our concierge team will reach out shortly.</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#1c1c18] font-semibold mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2.5 border border-[#d2c4b4] rounded outline-none focus:border-[#7b5818]"
                />
              </div>

              <div>
                <label className="block text-[#1c1c18] font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2.5 border border-[#d2c4b4] rounded outline-none focus:border-[#7b5818]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#1c1c18] font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-2.5 border border-[#d2c4b4] rounded outline-none focus:border-[#7b5818]"
                />
              </div>

              <div>
                <label className="block text-[#1c1c18] font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Custom Design Enquiry"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full p-2.5 border border-[#d2c4b4] rounded outline-none focus:border-[#7b5818]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#1c1c18] font-semibold mb-1">Message</label>
              <textarea
                rows="4"
                required
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full p-2.5 border border-[#d2c4b4] rounded outline-none focus:border-[#7b5818]"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#7b5818] hover:bg-[#604100] text-white px-8 py-3 rounded font-semibold uppercase tracking-wider text-xs transition flex items-center gap-2 cursor-pointer"
            >
              {submitting ? 'Sending...' : 'Send Message'} <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
