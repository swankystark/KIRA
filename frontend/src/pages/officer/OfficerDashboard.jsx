import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, TrendingUp, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { mockCategories, mockSocialPosts } from '../../data/mock';
import MapComponent from '../../components/MapComponent';
import IssueCard from '../../components/IssueCard';
import apiService from '../../services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('currentUser')));
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterVerification, setFilterVerification] = useState('all');

  // Verify login and load data
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!storedUser) {
      navigate('/officer/login');
    } else {
      setUser(storedUser);
      loadData();
    }
  }, [navigate]);

  // Load issues and stats from API
  const loadData = async () => {
    try {
      setLoading(true);
      const [issuesResponse, statsResponse] = await Promise.all([
        apiService.getIssues({ 
          status: filterStatus, 
          category: filterCategory, 
          verification: filterVerification 
        }),
        apiService.getStats()
      ]);
      
      setIssues(issuesResponse || []);
      setStats(statsResponse || {});
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fallback to empty data
      setIssues([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  // Reload data when filters change
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [filterStatus, filterCategory, filterVerification]);

  // Filter issues by department (API already handles other filters)
  const filteredIssues = issues.filter(issue => {
    // Filter by Department if user has one
    if (user && user.department && issue.department !== user.department) {
      return false;
    }
    return true;
  });

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Prepare map markers
  const mapMarkers = filteredIssues.map(issue => ({
    lat: issue.coordinates.lat,
    lng: issue.coordinates.lng,
    title: issue.id,
    description: issue.categoryName
  }));

  const statCards = [
    { 
      title: 'New Today', 
      value: stats.new_today || 0, 
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'var(--primary)'
    },
    { 
      title: 'In Verification', 
      value: stats.verifying || 0, 
      icon: <Clock className="w-6 h-6" />,
      color: 'var(--warning)'
    },
    { 
      title: 'In Progress', 
      value: stats.in_progress || 0, 
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'var(--accent)'
    },
    { 
      title: 'Resolved This Week', 
      value: stats.resolved_this_week || 0, 
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'var(--success)'
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/officer/login');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', minHeight: '100vh' }}>
      {/* Header */}
      <header 
        className="py-4 px-6 shadow-sm"
        style={{ backgroundColor: 'var(--bg-white)' }}
      >
        <div className="container flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
              {user.department}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Welcome, Officer {user.name}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <div key={idx} className="card">
              <div className="flex items-center justify-between mb-2">
                <div style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <span className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stat.value}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {stat.title}
              </p>
            </div>
          ))}
        </div>

        {/* Hotspot Map */}
        <div className="card mb-8">
          <h3 className="mb-4" style={{ color: 'var(--text-primary)' }}>Issue Hotspot Map</h3>
          <div className="h-96">
            <MapComponent 
              position={{ lat: 12.9716, lng: 77.5946 }} 
              zoom={12}
              markers={mapMarkers}
              height="100%"
            />
          </div>
          <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)' }}>
            Click on markers to see issue details. Red clusters indicate high-severity verified issues.
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <h3 className="mb-4" style={{ color: 'var(--text-primary)' }}>Filter Issues</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Status
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                  <SelectItem value="verifying">Verifying</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Category
              </label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {mockCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Verification
              </label>
              <Select value={filterVerification} onValueChange={setFilterVerification}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Needs Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Social Media Candidates (Link to v2 Feature 6) */}
        <div className="mb-8">
           <h3 className="mb-4 flex items-center gap-2 font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
              <span className="bg-blue-100 text-blue-700 p-1 rounded">New</span> 
              Social Media Signals
           </h3>
           <div className="grid md:grid-cols-2 gap-6">
              {mockSocialPosts.map(post => (
                 <div key={post.id} className="card border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold uppercase text-gray-400">{post.platform} • {post.timestamp}</span>
                       <span className="badge badge-warning text-xs">{(post.confidence * 100)}% Confidence</span>
                    </div>
                    <p className="font-medium text-gray-800 mb-2">"{post.content}"</p>
                    <div className="flex gap-4 text-sm text-gray-500 mb-3">
                       <span>📍 {post.predictedLocation}</span>
                       <span>🏷️ {post.predictedCategory}</span>
                    </div>
                    <div className="flex gap-2">
                       <button className="btn-primary text-xs py-1 px-3">Verify & Add</button>
                       <button className="btn-secondary text-xs py-1 px-3">Ignore</button>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Issues List */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {filteredIssues.length} Issue{filteredIssues.length !== 1 ? 's' : ''}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredIssues.map(issue => (
            <IssueCard 
              key={issue.id} 
              issue={issue}
              onClick={() => navigate(`/officer/issue/${issue.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfficerDashboard;