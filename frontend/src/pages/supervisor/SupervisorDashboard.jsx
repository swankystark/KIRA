import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    LayoutDashboard, LogOut, CheckCircle2, Clock, AlertTriangle, 
    Filter, RefreshCw, UserCheck, Search, ChevronRight
} from 'lucide-react';

const SupervisorDashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [supervisor, setSupervisor] = useState(null);
    const [stats, setStats] = useState({ new_today: 0, pending: 0, overdue: 0 });
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') || 'pending');

    useEffect(() => {
        const session = localStorage.getItem('supervisor');
        if (!session) {
            navigate('/supervisor/login');
            return;
        }
        setSupervisor(JSON.parse(session));
    }, [navigate]);

    useEffect(() => {
        if (supervisor) {
            fetchData();
        }
    }, [supervisor, activeFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/supervisor/complaints?supervisor_id=${supervisor.supervisor_id}&filter=${activeFilter}`);
            const data = await response.json();
            setStats(data.stats);
            setComplaints(data.complaints);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('supervisor');
        navigate('/supervisor/login');
    };

    const getStatusColor = (status, supervisorStatus, deadline) => {
        if (supervisorStatus === 'APPROVED') return '#10B981'; // Green
        if (supervisorStatus === 'REJECTED') return '#EF4444'; // Red
        
        // Check overdue
        if (deadline && new Date() > new Date(deadline)) return '#EF4444'; // Red (Overdue)
        
        return '#F59E0B'; // Amber (Pending)
    };

    const getStatusText = (status, supervisorStatus, deadline) => {
        if (supervisorStatus === 'APPROVED') return 'Approved';
        if (supervisorStatus === 'REJECTED') return 'Sent Back';
        if (deadline && new Date() > new Date(deadline)) return 'Overdue';
        return 'Review Pending';
    };

    if (!supervisor) return null;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
            {/* Navbar */}
            <nav style={{ backgroundColor: '#1F4E78', color: 'white', padding: '1rem 2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}>
                            <UserCheck size={24} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Supervisor Portal</h1>
                            <p style={{ fontSize: '0.875rem', opacity: '0.9' }}>{supervisor.name} • {supervisor.department.toUpperCase()}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', 
                            backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '0.375rem', 
                            color: 'white', cursor: 'pointer' 
                        }}
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </nav>

            <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div 
                        onClick={() => setActiveFilter('all')}
                        style={{ 
                            backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', 
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer',
                            border: activeFilter === 'all' ? '2px solid #3B82F6' : '2px solid transparent'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <p style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>New Reviews Today</p>
                                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{stats.new_today}</h3>
                            </div>
                            <div style={{ padding: '0.75rem', backgroundColor: '#EFF6FF', borderRadius: '0.5rem', color: '#3B82F6' }}>
                                <Clock size={24} />
                            </div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Escalated in last 24h</p>
                    </div>

                    <div 
                        onClick={() => setActiveFilter('pending')}
                        style={{ 
                            backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', 
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer',
                            border: activeFilter === 'pending' ? '2px solid #F59E0B' : '2px solid transparent'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <p style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>Pending Action</p>
                                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{stats.pending}</h3>
                            </div>
                            <div style={{ padding: '0.75rem', backgroundColor: '#FFFBEB', borderRadius: '0.5rem', color: '#F59E0B' }}>
                                <AlertTriangle size={24} />
                            </div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Awaiting your review</p>
                    </div>

                    <div 
                        onClick={() => setActiveFilter('overdue')}
                        style={{ 
                            backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', 
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer',
                            border: activeFilter === 'overdue' ? '2px solid #EF4444' : '2px solid transparent'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <p style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: '500' }}>Overdue Reviews</p>
                                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#EF4444' }}>{stats.overdue}</h3>
                            </div>
                            <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', borderRadius: '0.5rem', color: '#EF4444' }}>
                                <Clock size={24} />
                            </div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#EF4444', fontWeight: '500' }}>Missed 24h/72h deadline</p>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                            onClick={() => setActiveFilter('pending')}
                            style={{ 
                                padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: '500', transition: 'all 0.2s',
                                backgroundColor: activeFilter === 'pending' ? '#1F4E78' : 'white',
                                color: activeFilter === 'pending' ? 'white' : '#6B7280',
                                border: '1px solid', borderColor: activeFilter === 'pending' ? '#1F4E78' : '#E5E7EB'
                            }}
                        >
                            Pending Reviews
                        </button>
                        <button 
                            onClick={() => setActiveFilter('overdue')}
                            style={{ 
                                padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: '500', transition: 'all 0.2s',
                                backgroundColor: activeFilter === 'overdue' ? '#EF4444' : 'white',
                                color: activeFilter === 'overdue' ? 'white' : '#6B7280',
                                border: '1px solid', borderColor: activeFilter === 'overdue' ? '#EF4444' : '#E5E7EB'
                            }}
                        >
                            Overdue Only
                        </button>
                        <button 
                            onClick={() => setActiveFilter('all')}
                            style={{ 
                                padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: '500', transition: 'all 0.2s',
                                backgroundColor: activeFilter === 'all' ? '#6B7280' : 'white',
                                color: activeFilter === 'all' ? 'white' : '#6B7280',
                                border: '1px solid', borderColor: activeFilter === 'all' ? '#6B7280' : '#E5E7EB'
                            }}
                        >
                            All History
                        </button>
                    </div>
                    <button 
                        onClick={fetchData}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh List
                    </button>
                </div>

                {/* Complaint Table */}
                <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Loading complaints...</div>
                    ) : complaints.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                            <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto', color: '#D1D5DB' }} />
                            <p>No complaints found for this filter.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                <tr>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Complaint ID</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Category</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Escalated By</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Deadline</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {complaints.map((complaint) => (
                                    <tr 
                                        key={complaint.complaint_id}
                                        onClick={() => navigate(`/supervisor/complaints/${complaint.complaint_id}`)}
                                        style={{ borderBottom: '1px solid #E5E7EB', cursor: 'pointer', transition: 'background-color 0.1s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                    >
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#111827' }}>{complaint.complaint_id}</td>
                                        <td style={{ padding: '1rem', color: '#374151' }}>
                                            <span style={{ 
                                                display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: '500',
                                                backgroundColor: '#EFF6FF', color: '#1F4E78'
                                            }}>
                                                {complaint.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#6B7280', fontSize: '0.875rem' }}>
                                            Officer
                                        </td>
                                        <td style={{ padding: '1rem', color: '#374151', fontSize: '0.875rem' }}>
                                            {complaint.supervisor_deadline ? new Date(complaint.supervisor_deadline).toLocaleString() : 'N/A'}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ 
                                                    width: '8px', height: '8px', borderRadius: '50%', 
                                                    backgroundColor: getStatusColor(complaint.status, complaint.supervisor_status, complaint.supervisor_deadline)
                                                }} />
                                                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                                                    {getStatusText(complaint.status, complaint.supervisor_status, complaint.supervisor_deadline)}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            <ChevronRight size={20} color="#9CA3AF" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SupervisorDashboard;
