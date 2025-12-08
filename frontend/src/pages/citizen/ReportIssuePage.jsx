import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import VoiceInput from '../../components/VoiceInput';
import MapComponent from '../../components/MapComponent';
import PhotoUpload from '../../components/PhotoUpload';
import { mockCategories } from '../../data/mock';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const ReportIssuePage = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });
  const [locationText, setLocationText] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [editingCategory, setEditingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');

  const handleVoiceTranscript = (transcript) => {
    setDescription(transcript);
    // Simulate AI categorization
    setTimeout(() => {
      analyzeDescription(transcript);
    }, 500);
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setDescription(text);
    if (text.length > 20) {
      analyzeDescription(text);
    }
  };

  const analyzeDescription = (text) => {
    // Simple keyword-based categorization simulation
    const lowercaseText = text.toLowerCase();
    let category = 'others';
    let categoryName = 'Others';
    let severity = 'Medium';

    if (lowercaseText.includes('water') || lowercaseText.includes('supply') || lowercaseText.includes('tap')) {
      category = 'water';
      categoryName = 'Water Supply';
    } else if (lowercaseText.includes('drainage') || lowercaseText.includes('sewage') || lowercaseText.includes('leak')) {
      category = 'drainage';
      categoryName = 'Drainage / Sewage';
      severity = 'High';
    } else if (lowercaseText.includes('road') || lowercaseText.includes('pothole')) {
      category = 'roads';
      categoryName = 'Roads / Potholes';
    } else if (lowercaseText.includes('garbage') || lowercaseText.includes('trash') || lowercaseText.includes('waste')) {
      category = 'garbage';
      categoryName = 'Garbage & Sanitation';
    } else if (lowercaseText.includes('light') || lowercaseText.includes('electricity') || lowercaseText.includes('power')) {
      category = 'electricity';
      categoryName = 'Street Light / Electricity';
    }

    // Detect severity
    if (lowercaseText.includes('urgent') || lowercaseText.includes('emergency') || lowercaseText.includes('severe') || lowercaseText.includes('days')) {
      severity = 'High';
    }

    setAiSuggestion({ category, categoryName, severity });
    setSelectedCategory(category);
    setSelectedSeverity(severity);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.info('Getting your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setUseCurrentLocation(true);
          toast.success('Location captured');
        },
        (error) => {
          toast.error('Unable to get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('Please describe the issue');
      return;
    }

    if (!selectedCategory) {
      toast.error('Please confirm or select a category');
      return;
    }

    // Create new issue (mock)
    const newIssueId = `GG-2025-${String(Math.floor(Math.random() * 90000) + 10000).padStart(5, '0')}`;
    
    toast.success('Issue reported successfully!');
    navigate(`/confirmation/${newIssueId}`);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', minHeight: '100vh' }}>
      {/* Header */}
      <header 
        className="py-4 px-6 shadow-sm"
        style={{ backgroundColor: 'var(--bg-white)' }}
      >
        <div className="container flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
            Report Civic Issue
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          {/* Language Info */}
          <div className="card mb-6">
            <p style={{ color: 'var(--text-primary)' }}>
              You can speak or type in your own language to describe the problem.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Voice Input */}
            <div>
              <h3 className="mb-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                1. Describe the Issue (Voice)
              </h3>
              <VoiceInput onTranscript={handleVoiceTranscript} />
            </div>

            {/* Text Input */}
            <div>
              <h3 className="mb-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                2. Or Type It Here
              </h3>
              <div className="card">
                <textarea
                  value={description}
                  onChange={handleTextChange}
                  placeholder="Example: There is drainage water leaking on the main road near the market for the last 3 days."
                  className="input-field"
                  rows="5"
                />
              </div>
            </div>

            {/* AI Category Suggestion */}
            {aiSuggestion && (
              <div>
                <h3 className="mb-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                  3. We Understood This As
                </h3>
                <div className="card">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="badge badge-accent">{aiSuggestion.categoryName}</span>
                    <span className={`badge badge-${aiSuggestion.severity === 'High' ? 'error' : 'warning'}`}>
                      {aiSuggestion.severity} Severity
                    </span>
                  </div>
                  
                  <p className="mb-3" style={{ color: 'var(--text-primary)' }}>
                    Is this correct?
                  </p>
                  
                  {!editingCategory ? (
                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => toast.success('Category confirmed')}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Yes, Correct
                      </button>
                      <button 
                        type="button"
                        onClick={() => setEditingCategory(true)}
                        className="btn-secondary"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                          Category
                        </label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockCategories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                          Severity
                        </label>
                        <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingCategory(false);
                          toast.success('Category updated');
                        }}
                        className="btn-accent"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location */}
            <div>
              <h3 className="mb-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                4. Where Is This Happening?
              </h3>
              <div className="card space-y-4">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  className="btn-accent w-full"
                >
                  Use My Current Location
                </button>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1" style={{ backgroundColor: '#ddd' }}></div>
                  <span style={{ color: 'var(--text-secondary)' }}>OR</span>
                  <div className="h-px flex-1" style={{ backgroundColor: '#ddd' }}></div>
                </div>
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="Type area/landmark/ward"
                  className="input-field"
                />
                <div className="h-64">
                  <MapComponent position={location} interactive={true} onLocationSelect={setLocation} />
                </div>
              </div>
            </div>

            {/* Photos */}
            <div>
              <h3 className="mb-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                5. Add Evidence Photos (Optional)
              </h3>
              <PhotoUpload onPhotosChange={setPhotos} />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full py-4 text-lg"
            >
              Submit This Issue
            </button>
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              You will get an ID and can track the status anytime
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportIssuePage;