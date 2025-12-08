import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDepartments } from '../../data/mock';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const OfficerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    department: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.department) {
      toast.error('Please fill all fields');
      return;
    }

    // Mock login - in real app would validate credentials
    toast.success('Login successful');
    navigate('/officer/dashboard');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--bg-surface)' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 rounded-md mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <span className="text-3xl font-bold text-white">GG</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
            GrievanceGenie
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Officer Portal</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Sign In
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                Email / Username
              </label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
                className="input-field"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className="input-field"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                Department
              </label>
              <Select value={formData.department} onValueChange={(val) => setFormData({ ...formData, department: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          For authorized government personnel only
        </p>
      </div>
    </div>
  );
};

export default OfficerLogin;