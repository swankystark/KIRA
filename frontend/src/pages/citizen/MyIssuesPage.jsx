import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Filter } from 'lucide-react';
import IssueCard from '../../components/IssueCard';
import { mockCategories } from '../../data/mock';
import apiService from '../../services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const MyIssuesPage = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Mock user data for now - in real app would come from auth context
  const mockUser = {
    name: 'Citizen User',
    level: 'Community Helper',
    points: 150,
    stats: { resolved: 3 },
    badges: [
      { id: 1, icon: '🏆', name: 'First Report', description: 'Reported first issue' },
      { id: 2, icon: '👥', name: 'Verifier', description: 'Verified 5 issues' }
    ]
  };

  useEffect(() => {
    loadIssues();
  }, [filterStatus, filterCategory]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const issuesData = await apiService.getIssues({
        status: filterStatus,
        category: filterCategory
      });
      setIssues(issuesData || []);
    } catch (error) {
      console.error('Failed to load issues:', error);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-surface)', minHeight: '100vh' }}>
      {/* Header */}
      <header 
        className="py-4 px-6 shadow-sm"
        style={{ backgroundColor: 'var(--bg-white)' }}
      >
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/citizen')}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" style={{ color: 'var(--primary)' }} />
            </button>
            <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
              My Issues
            </h1>
          </div>
          <button
            onClick={() => navigate('/report')}
            className="btn-accent flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Report New
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        {/* Gamification / Impact Section */}
        <div className="card mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-100">
           <div className="flex justify-between items-start mb-6">
              <div>
                 <h2 className="text-2xl font-bold text-indigo-900">Hello, {mockUser.name}</h2>
                 <p className="text-indigo-600 font-medium">{mockUser.level} • {mockUser.points} pts</p>
              </div>
              <div className="text-right">
                 <div className="text-sm text-indigo-500 uppercase tracking-wide font-semibold">Impact Score</div>
                 <div className="text-3xl font-bold text-indigo-700">{mockUser.stats.resolved} Fixed</div>
              </div>
           </div>
           
           <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3">Earned Badges</h3>
           <div className="flex gap-4 overflow-x-auto pb-2">
              {mockUser.badges.map(badge => (
                 <div key={badge.id} className="flex flex-col items-center bg-white p-3 rounded-lg shadow-sm border border-indigo-100 min-w-[100px]">
                    <div className="text-3xl mb-1">{badge.icon}</div>
                    <div className="text-xs font-bold text-gray-800 text-center">{badge.name}</div>
                    <div className="text-[10px] text-gray-500 text-center">{badge.description}</div>
                 </div>
              ))}
              <div className="flex flex-col items-center justify-center bg-indigo-100/50 p-3 rounded-lg border border-dashed border-indigo-200 min-w-[100px]">
                 <div className="text-xl text-indigo-300 mb-1">🔒</div>
                 <div className="text-xs font-bold text-indigo-400">Next Badge</div>
              </div>
           </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h3 style={{ color: 'var(--text-primary)' }}>Filters</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* Issues List */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            {issues.length} Issue{issues.length !== 1 ? 's' : ''} Found
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading issues...</p>
          </div>
        ) : issues.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {issues.map(issue => (
              <IssueCard 
                key={issue.id} 
                issue={issue}
                onClick={() => navigate(`/issue/${issue.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p style={{ color: 'var(--text-secondary)' }}>No issues found with current filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyIssuesPage;