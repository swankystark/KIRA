import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react';
import StatusTimeline from '../../components/StatusTimeline';
import MapComponent from '../../components/MapComponent';
import { mockIssues } from '../../data/mock';

const IssueDetailPage = () => {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const issue = mockIssues.find(i => i.id === issueId) || mockIssues[0];

  const getStatusBadge = (status) => {
    const statusMap = {
      reported: { text: 'Reported', class: 'badge-primary' },
      verifying: { text: 'Verifying', class: 'badge-warning' },
      assigned: { text: 'Assigned', class: 'badge-accent' },
      in_progress: { text: 'In Progress', class: 'badge-accent' },
      resolved: { text: 'Resolved', class: 'badge-success' },
      unverified: { text: 'Unverified', class: 'badge-error' }
    };
    const statusInfo = statusMap[status] || statusMap.reported;
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getSeverityBadge = (severity) => {
    const severityMap = {
      High: 'badge-error',
      Medium: 'badge-warning',
      Low: 'badge-primary'
    };
    return <span className={`badge ${severityMap[severity]}`}>{severity}</span>;
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
            onClick={() => navigate('/my-issues')}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          </button>
          <h1 className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
            Issue Details
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Card */}
          <div className="card mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="mono-text text-2xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                  {issue.id}
                </p>
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                  {issue.categoryName}
                </p>
              </div>
              <div className="flex gap-2">
                {getSeverityBadge(issue.severity)}
                {getStatusBadge(issue.status)}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div className="card">
                <h3 className="mb-3" style={{ color: 'var(--text-primary)' }}>Description</h3>
                <p style={{ color: 'var(--text-primary)' }}>{issue.description}</p>
              </div>

              {/* Location */}
              <div className="card">
                <h3 className="mb-3" style={{ color: 'var(--text-primary)' }}>Location</h3>
                <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-secondary)' }}>
                  <MapPin className="w-4 h-4" />
                  <span>{issue.location}</span>
                </div>
                <div className="h-64">
                  <MapComponent position={issue.coordinates} />
                </div>
              </div>

              {/* Photos */}
              {issue.photos && issue.photos.length > 0 && (
                <div className="card">
                  <h3 className="mb-3" style={{ color: 'var(--text-primary)' }}>Evidence Photos</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {issue.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Details */}
              <div className="card">
                <h3 className="mb-3" style={{ color: 'var(--text-primary)' }}>Community Verification</h3>
                {issue.verifications.total > 0 ? (
                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span style={{ color: 'var(--text-secondary)' }}>Confirmed by locals</span>
                        <span className="font-semibold" style={{ color: 'var(--success)' }}>
                          {issue.verifications.yes} Yes
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span style={{ color: 'var(--text-secondary)' }}>Denied</span>
                        <span className="font-semibold" style={{ color: 'var(--error)' }}>
                          {issue.verifications.no} No
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Not sure</span>
                        <span className="font-semibold" style={{ color: 'var(--warning)' }}>
                          {issue.verifications.notSure} Unsure
                        </span>
                      </div>
                    </div>
                    {issue.verifications.yes >= 3 && (
                      <div 
                        className="p-3 rounded-md flex items-center gap-2"
                        style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}
                      >
                        <Users className="w-5 h-5" style={{ color: 'var(--success)' }} />
                        <span className="font-semibold" style={{ color: 'var(--success)' }}>
                          Highly Verified by Community
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Waiting for community verification...
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Details */}
              <div className="card">
                <h3 className="mb-3" style={{ color: 'var(--text-primary)' }}>Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Department</p>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {issue.department}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Reported At</p>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {new Date(issue.reportedAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <StatusTimeline 
                timeline={issue.timeline} 
                currentStatus={issue.status === 'verifying' ? 'Being verified' : 
                             issue.status === 'in_progress' ? 'In Progress' : 
                             issue.status === 'resolved' ? 'Resolved' :
                             issue.status === 'assigned' ? 'Assigned' : 'Reported'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailPage;