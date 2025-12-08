import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Shield, Bell } from 'lucide-react';

const CitizenLanding = () => {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState('english');

  const languages = [
    { code: 'english', name: 'English' },
    { code: 'hindi', name: 'हिन्दी' },
    { code: 'tamil', name: 'தமிழ்' },
    { code: 'telugu', name: 'తెలుగు' }
  ];

  const steps = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Tell us your issue',
      description: 'Speak or type about the civic problem you see'
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: 'AI structures it',
      description: 'We categorize it for the right department'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Locals verify it',
      description: 'Nearby residents confirm the issue is real'
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: 'Officers act on it',
      description: 'Government resolves and updates you'
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', minHeight: '100vh' }}>
      {/* Header */}
      <header 
        className="py-4 px-6 shadow-sm"
        style={{ backgroundColor: 'var(--bg-white)' }}
      >
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-md flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <span className="text-2xl font-bold text-white">GG</span>
            </div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
              GrievanceGenie
            </h1>
          </div>
          
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
            style={{ color: 'var(--text-primary)' }}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 text-center">
        <h2 
          className="text-4xl md:text-5xl font-bold mb-6"
          style={{ color: 'var(--primary)' }}
        >
          Report local civic problems in minutes
        </h2>
        <p 
          className="text-xl mb-12 max-w-2xl mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          No complex forms. Just describe the issue, and track it until it's fixed.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/report')}
            className="btn-primary px-8 py-4 text-lg"
          >
            Report an Issue
          </button>
          <button
            onClick={() => navigate('/my-issues')}
            className="btn-secondary px-8 py-4 text-lg"
          >
            Track My Issues
          </button>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16">
        <h3 
          className="text-3xl font-bold text-center mb-12"
          style={{ color: 'var(--text-primary)' }}
        >
          How It Works
        </h3>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0, 61, 130, 0.1)', color: 'var(--primary)' }}
              >
                {step.icon}
              </div>
              <div 
                className="w-8 h-8 rounded-full mx-auto mb-3 flex items-center justify-center font-bold"
                style={{ backgroundColor: 'var(--accent)', color: 'white' }}
              >
                {index + 1}
              </div>
              <h4 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {step.title}
              </h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-8 mt-16"
        style={{ backgroundColor: 'var(--primary)', color: 'white' }}
      >
        <div className="container text-center">
          <p className="mb-2">© 2025 GrievanceGenie - Municipal Civic Portal</p>
          <p className="text-sm opacity-80">For civic infrastructure issues only</p>
        </div>
      </footer>
    </div>
  );
};

export default CitizenLanding;