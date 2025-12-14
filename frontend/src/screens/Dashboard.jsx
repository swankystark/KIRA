
import React, { useState, useEffect, useRef } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import StatsCards from '../components/Dashboard/StatsCards';
import ComplaintCard from '../components/Dashboard/ComplaintCard';
import WardStats from '../components/Dashboard/WardStats';
import Leaderboard from '../components/Dashboard/Leaderboard';
import BottomNav from '../components/common/BottomNav';
import GovernmentHeader from '../components/common/GovernmentHeader';
import GovernmentBanner from '../components/common/GovernmentBanner';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { data, loading, refreshData } = useDashboardData();
    const { logout, language, changeLanguage, toggleTheme, theme } = useAuth();
    const navigate = useNavigate();
    const [refreshing, setRefreshing] = useState(false);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const leaderboardRef = useRef(null);
    
    // Force re-render with government theme
    const [themeVersion] = useState('government-v2');

    // Pull-to-refresh simulation
    const handleRefresh = () => {
        setRefreshing(true);
        refreshData();
        setTimeout(() => setRefreshing(false), 1500);
    };

    // Scroll to leaderboard section
    const scrollToLeaderboard = () => {
        leaderboardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7FA' }}>
                <div style={{ color: '#1F4E78', fontWeight: '600' }}>🔄 Loading your dashboard...</div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div key={themeVersion} style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
            {/* Government Header */}
            <GovernmentHeader 
                user={data.user}
                onLogout={handleLogout}
                onToggleTheme={toggleTheme}
                theme={theme}
            />

            {/* Welcome Section */}
            <div style={{
                backgroundColor: 'white',
                borderBottom: '1px solid #E3EEF7',
                padding: '1.5rem 0'
            }}>
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto', 
                    padding: '0 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: '600', 
                            color: '#1B3A4B',
                            margin: 0,
                            marginBottom: '0.25rem'
                        }}>
                            Welcome back, {data.user.name.split(' ')[0]}
                        </h1>
                        <p style={{ 
                            fontSize: '0.875rem', 
                            color: '#6B7280', 
                            margin: 0,
                            fontWeight: '500'
                        }}>
                            {data.user.ward} • Citizen Dashboard • Last login: Today
                        </p>
                    </div>
                    
                    {/* Professional Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {/* Compact Professional Navigation */}
                        <BottomNav />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: '2rem 1rem' 
            }}>
                {/* Breadcrumb */}
                <div style={{ 
                    marginBottom: '2rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'white',
                    borderRadius: '0.375rem',
                    border: '1px solid #E3EEF7',
                    fontSize: '0.875rem',
                    color: '#6B7280'
                }}>
                    <span style={{ color: '#1F4E78', fontWeight: '500' }}>🏠 Home</span>
                    <span style={{ margin: '0 0.5rem', color: '#C7DDEE' }}>›</span>
                    <span style={{ color: '#1F4E78', fontWeight: '500' }}>Citizen Corner</span>
                    <span style={{ margin: '0 0.5rem', color: '#C7DDEE' }}>›</span>
                    <span style={{ fontWeight: '600' }}>Dashboard</span>
                </div>

                {/* Government Announcements Banner */}
                <div style={{ marginBottom: '2rem' }}>
                    <GovernmentBanner />
                </div>

                {/* Government News Ticker */}
                <div style={{
                    backgroundColor: '#F77F00',
                    color: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.375rem',
                    marginBottom: '2rem',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            flexShrink: 0
                        }}>
                            📢 LATEST UPDATES
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            animation: 'scroll-left 30s linear infinite',
                            whiteSpace: 'nowrap'
                        }}>
                            🚨 Emergency helpline 100 now available 24/7 • 
                            🌱 Tree plantation drive starts Monday in all zones • 
                            💧 Water supply maintenance scheduled for Sunday 6-8 AM • 
                            📱 New mobile app launched for faster complaint tracking • 
                            🏥 Free health checkup camps in community centers this week
                        </div>
                    </div>
                    
                    <style>{`
                        @keyframes scroll-left {
                            0% { transform: translateX(100%); }
                            100% { transform: translateX(-100%); }
                        }
                    `}</style>
                </div>

                {/* Quick Government Services */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.375rem',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '1px solid #E3EEF7',
                    borderLeft: '4px solid #1F4E78'
                }}>
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1B3A4B',
                        marginBottom: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em'
                    }}>
                        🏛️ QUICK GOVERNMENT SERVICES
                    </h3>
                    
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        {[
                            { icon: '📝', title: 'Report Issue', desc: 'Submit civic complaints', color: '#1F4E78' },
                            { icon: '📋', title: 'Track Status', desc: 'Monitor complaint progress', color: '#F77F00' },
                            { icon: '🏥', title: 'Birth Certificate', desc: 'Apply for certificates', color: '#2E7D32' },
                            { icon: '🏠', title: 'Property Tax', desc: 'Pay municipal taxes', color: '#D32F2F' },
                            { icon: '💧', title: 'Water Connection', desc: 'New water services', color: '#1565C0' },
                            { icon: '📞', title: 'Helpline', desc: '24/7 citizen support', color: '#7B1FA2' }
                        ].map((service, index) => (
                            <button
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem',
                                    backgroundColor: '#F5F7FA',
                                    border: `2px solid ${service.color}20`,
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = `${service.color}10`;
                                    e.target.style.borderColor = `${service.color}40`;
                                    e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#F5F7FA';
                                    e.target.style.borderColor = `${service.color}20`;
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{
                                    fontSize: '1.5rem',
                                    backgroundColor: service.color,
                                    color: 'white',
                                    borderRadius: '0.375rem',
                                    padding: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '3rem',
                                    minHeight: '3rem'
                                }}>
                                    {service.icon}
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#1B3A4B',
                                        marginBottom: '0.25rem'
                                    }}>
                                        {service.title}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#6B7280'
                                    }}>
                                        {service.desc}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 🎨 PART 4: MAIN CONTENT AREA - QUICK STATS SECTION */}
                <div style={{ 
                    backgroundColor: 'white',
                    borderRadius: '0.375rem',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '1px solid #E3EEF7',
                    borderLeft: '4px solid #1F4E78',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <h2 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1B3A4B',
                        marginBottom: '1.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        📊 QUICK STATS SECTION
                    </h2>
                    
                    {/* 4-Column Grid Layout as per specification */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(4, 1fr)', 
                        gap: '1rem' 
                    }}>
                        {/* Column 1: Total Issues This Month */}
                        <div style={{
                            textAlign: 'center',
                            padding: '1.5rem 1rem',
                            backgroundColor: '#F5F7FA',
                            borderRadius: '0.375rem',
                            border: '2px solid #E3EEF7',
                            borderLeft: '4px solid #1F4E78'
                        }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1F4E78', marginBottom: '0.5rem' }}>
                                {data.wardStats.totalIssues}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#1B3A4B', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                Issues
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '500' }}>
                                This Month
                            </div>
                        </div>
                        
                        {/* Column 2: Resolved (91%) */}
                        <div style={{
                            textAlign: 'center',
                            padding: '1.5rem 1rem',
                            backgroundColor: '#F5F7FA',
                            borderRadius: '0.375rem',
                            border: '2px solid #E3EEF7',
                            borderLeft: '4px solid #2E7D32'
                        }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2E7D32', marginBottom: '0.5rem' }}>
                                {data.wardStats.resolved}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#1B3A4B', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                Resolved
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#2E7D32', fontWeight: '600' }}>
                                {data.wardStats.resolutionRate}%
                            </div>
                        </div>
                        
                        {/* Column 3: Average Fix Time */}
                        <div style={{
                            textAlign: 'center',
                            padding: '1.5rem 1rem',
                            backgroundColor: '#F5F7FA',
                            borderRadius: '0.375rem',
                            border: '2px solid #E3EEF7',
                            borderLeft: '4px solid #F77F00'
                        }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F77F00', marginBottom: '0.5rem' }}>
                                {data.wardStats.avgFixTime}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#1B3A4B', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                Avg Fix
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '500' }}>
                                Time
                            </div>
                        </div>
                        
                        {/* Column 4: Satisfaction (94%) */}
                        <div style={{
                            textAlign: 'center',
                            padding: '1.5rem 1rem',
                            backgroundColor: '#F5F7FA',
                            borderRadius: '0.375rem',
                            border: '2px solid #E3EEF7',
                            borderLeft: '4px solid #2E7D32'
                        }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2E7D32', marginBottom: '0.5rem' }}>
                                {data.stats.satisfaction}%
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#1B3A4B', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                Satisfaction
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '500' }}>
                                Rate
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🎨 URGENT ACTIONS (Red Box) */}
                <div style={{
                    backgroundColor: '#FEF2F2',
                    border: '3px solid #DC2626',
                    borderRadius: '0.5rem',
                    padding: '2rem',
                    marginBottom: '2rem',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginBottom: '1.5rem' 
                    }}>
                        <div style={{
                            backgroundColor: '#DC2626',
                            borderRadius: '50%',
                            padding: '1rem',
                            marginRight: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 8px rgba(220, 38, 38, 0.3)'
                        }}>
                            <span style={{ fontSize: '2rem', color: 'white' }}>⚠️</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#991B1B',
                                margin: 0,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '0.5rem'
                            }}>
                                URGENT CIVIC ACTION
                            </h2>
                            <p style={{
                                fontSize: '1rem',
                                color: '#7F1D1D',
                                margin: 0,
                                fontWeight: '600'
                            }}>
                                Report civic issues immediately for priority resolution
                            </p>
                        </div>
                    </div>
                    
                    {/* Big CTA Button */}
                    <button 
                        onClick={() => navigate('/report')}
                        style={{
                            width: '100%',
                            padding: '1.75rem 2rem',
                            background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                            color: 'white',
                            border: '3px solid #DC2626',
                            borderRadius: '0.5rem',
                            fontWeight: '800',
                            fontSize: '1.375rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-4px) scale(1.02)';
                            e.target.style.boxShadow = '0 12px 24px rgba(220, 38, 38, 0.5)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0) scale(1)';
                            e.target.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.4)';
                        }}
                    >
                        <span style={{ fontSize: '2rem' }}>📝</span> 
                        REPORT NEW ISSUE
                        <span style={{ fontSize: '2rem', animation: 'pulse 2s infinite' }}>🚨</span>
                    </button>
                    
                    {/* Emergency Contact Info */}
                    <div style={{
                        marginTop: '1rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: '#7F1D1D',
                        fontWeight: '600'
                    }}>
                        🚨 Emergency Helpline: <span style={{ color: '#991B1B', fontWeight: '700' }}>100</span> | 
                        📞 MCD Helpline: <span style={{ color: '#991B1B', fontWeight: '700' }}>1800-11-4455</span>
                    </div>
                </div>

                {/* 🎨 TWO-COLUMN LAYOUT: MY COMPLAINTS & WARD DASHBOARD */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '2rem', 
                    marginBottom: '2rem' 
                }}>
                    {/* 📋 MY COMPLAINTS (Left Column) */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.375rem',
                        padding: '1.5rem',
                        border: '1px solid #E3EEF7',
                        borderLeft: '4px solid #1F4E78',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ 
                                fontSize: '1.125rem', 
                                fontWeight: '600', 
                                margin: '0', 
                                color: '#1B3A4B',
                                textTransform: 'uppercase',
                                letterSpacing: '0.025em'
                            }}>
                                📋 MY COMPLAINTS
                            </h3>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.75rem',
                                backgroundColor: '#FEF3C7',
                                color: '#92400E',
                                borderRadius: '0.375rem',
                                fontWeight: '600',
                                border: '1px solid #FDE68A'
                            }}>
                                {data.stats.pending} PENDING
                            </span>
                        </div>
                        
                        {data.recentComplaints.length > 0 ? (
                            <>
                                {/* Complaint Cards */}
                                {data.recentComplaints.slice(0, 2).map(complaint => (
                                    <div key={complaint.id} style={{
                                        padding: '1rem',
                                        backgroundColor: '#F5F7FA',
                                        borderRadius: '0.375rem',
                                        marginBottom: '1rem',
                                        border: '1px solid #E3EEF7',
                                        borderLeft: '3px solid #1F4E78'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                            <div>
                                                <div style={{ 
                                                    fontSize: '0.875rem', 
                                                    color: '#1F4E78', 
                                                    fontWeight: '600',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    {complaint.id}
                                                </div>
                                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1B3A4B', marginTop: '0.25rem' }}>
                                                    {complaint.category}
                                                </div>
                                            </div>
                                            <span style={{
                                                fontSize: '0.625rem',
                                                padding: '0.25rem 0.5rem',
                                                backgroundColor: complaint.status === 'pending' ? '#FEF3C7' : '#ECFDF5',
                                                color: complaint.status === 'pending' ? '#92400E' : '#059669',
                                                borderRadius: '0.25rem',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                border: `1px solid ${complaint.status === 'pending' ? '#FDE68A' : '#BBF7D0'}`
                                            }}>
                                                {complaint.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                                            📍 {complaint.location} • 🕒 {complaint.daysAgo} days ago
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                backgroundColor: '#1F4E78',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '0.25rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                textTransform: 'uppercase'
                                            }}>
                                                📍 TRACK
                                            </button>
                                            <button style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                backgroundColor: '#F77F00',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '0.25rem',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                textTransform: 'uppercase'
                                            }}>
                                                ⭐ RATE
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* View All Button */}
                                <button 
                                    onClick={() => navigate('/my-complaints')}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        backgroundColor: 'white',
                                        color: '#1F4E78',
                                        border: '2px solid #1F4E78',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.025em',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = '#1F4E78';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = 'white';
                                        e.target.style.color = '#1F4E78';
                                    }}
                                >
                                    [View All →]
                                </button>
                            </>
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '3rem 1rem', 
                                backgroundColor: '#F5F7FA',
                                borderRadius: '0.375rem',
                                border: '1px solid #E3EEF7'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                                <p style={{ color: '#1B3A4B', fontWeight: '600', margin: 0, fontSize: '1rem' }}>
                                    No complaints yet
                                </p>
                                <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                                    Start reporting civic issues!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 🗺️ WARD DASHBOARD (Right Column) */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.375rem',
                        padding: '1.5rem',
                        border: '1px solid #E3EEF7',
                        borderLeft: '4px solid #F77F00',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ 
                                fontSize: '1.125rem', 
                                fontWeight: '600', 
                                margin: '0', 
                                color: '#1B3A4B',
                                textTransform: 'uppercase',
                                letterSpacing: '0.025em'
                            }}>
                                🗺️ WARD DASHBOARD
                            </h3>
                        </div>
                        
                        {/* 91% Resolved Stats */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '1.25rem', 
                                    backgroundColor: '#ECFDF5', 
                                    borderRadius: '0.375rem',
                                    border: '2px solid #BBF7D0',
                                    borderLeft: '4px solid #2E7D32'
                                }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2E7D32', marginBottom: '0.25rem' }}>
                                        {data.wardStats.resolutionRate}%
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#1B3A4B', fontWeight: '600', textTransform: 'uppercase' }}>
                                        Resolved Stats
                                    </div>
                                </div>
                                <div style={{ 
                                    textAlign: 'center', 
                                    padding: '1.25rem', 
                                    backgroundColor: '#F0F9FF', 
                                    borderRadius: '0.375rem',
                                    border: '2px solid #BAE6FD',
                                    borderLeft: '4px solid #1F4E78'
                                }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F4E78', marginBottom: '0.25rem' }}>
                                        {data.wardStats.totalIssues}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#1B3A4B', fontWeight: '600', textTransform: 'uppercase' }}>
                                        Total Issues
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map: 47 pins */}
                        <div style={{
                            height: '140px',
                            backgroundColor: '#E5E7EB',
                            borderRadius: '0.375rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundImage: `
                                radial-gradient(circle at 15% 25%, rgba(220, 38, 38, 0.8) 3px, transparent 4px),
                                radial-gradient(circle at 65% 75%, rgba(46, 125, 50, 0.8) 3px, transparent 4px),
                                radial-gradient(circle at 85% 35%, rgba(46, 125, 50, 0.8) 3px, transparent 4px),
                                radial-gradient(circle at 25% 85%, rgba(247, 127, 0, 0.8) 3px, transparent 4px),
                                radial-gradient(circle at 75% 15%, rgba(220, 38, 38, 0.8) 3px, transparent 4px),
                                radial-gradient(circle at 45% 55%, rgba(46, 125, 50, 0.8) 3px, transparent 4px),
                                radial-gradient(circle at 35% 45%, rgba(247, 127, 0, 0.8) 3px, transparent 4px),
                                radial-gradient(circle at 55% 25%, rgba(46, 125, 50, 0.8) 3px, transparent 4px)
                            `,
                            backgroundSize: '100% 100%',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            marginBottom: '1.5rem',
                            border: '2px solid #D1D5DB'
                        }}
                        onClick={() => navigate('/ward-portal')}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'scale(1.02)';
                            e.target.style.borderColor = '#F77F00';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'scale(1)';
                            e.target.style.borderColor = '#D1D5DB';
                        }}
                        >
                            <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.9)', padding: '1rem', borderRadius: '0.375rem' }}>
                                <div style={{ fontSize: '1.125rem', color: '#1B3A4B', fontWeight: '700', marginBottom: '0.25rem' }}>
                                    📍 Map: {data.wardStats.totalIssues} pins
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '500' }}>
                                    Interactive ward visualization
                                </div>
                            </div>
                        </div>

                        {/* View Ward Portal Button */}
                        <button 
                            onClick={() => navigate('/ward-portal')}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                backgroundColor: 'white',
                                color: '#F77F00',
                                border: '2px solid #F77F00',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '0.025em',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#F77F00';
                                e.target.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = 'white';
                                e.target.style.color = '#F77F00';
                            }}
                        >
                            [View Ward Portal →]
                        </button>
                    </div>
                </div>

                {/* 🎨 OFFICER PROFILES / RESPONSIBLE OFFICERS */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.375rem',
                    padding: '2rem',
                    marginBottom: '2rem',
                    border: '1px solid #E3EEF7',
                    borderLeft: '4px solid #2E7D32',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1B3A4B',
                        marginBottom: '2rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em',
                        textAlign: 'center',
                        borderBottom: '3px solid #2E7D32',
                        paddingBottom: '0.75rem'
                    }}>
                        👥 OFFICER PROFILES / RESPONSIBLE OFFICERS
                    </h2>
                    
                    {/* 3-Column Grid Layout as per specification */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '1.5rem' 
                    }}>
                        {[
                            {
                                name: 'Sh. Rajesh Kumar',
                                designation: 'Ward Officer',
                                department: 'Municipal Corporation',
                                phone: '+91-11-2337-8001',
                                email: 'ward12@mcd.gov.in',
                                avatar: '👤',
                                color: '#1F4E78'
                            },
                            {
                                name: 'Smt. Priya Sharma',
                                designation: 'Health Officer',
                                department: 'Public Health Dept.',
                                phone: '+91-11-2337-8002',
                                email: 'health.ward12@mcd.gov.in',
                                avatar: '👩‍⚕️',
                                color: '#F77F00'
                            },
                            {
                                name: 'Sh. Amit Patel',
                                designation: 'Engineering Officer',
                                department: 'PWD Department',
                                phone: '+91-11-2337-8003',
                                email: 'engineer.ward12@mcd.gov.in',
                                avatar: '👷‍♂️',
                                color: '#2E7D32'
                            }
                        ].map((officer, index) => (
                            <div key={index} style={{
                                padding: '1.5rem',
                                backgroundColor: '#F5F7FA',
                                borderRadius: '0.5rem',
                                border: '2px solid #E3EEF7',
                                borderLeft: `4px solid ${officer.color}`,
                                textAlign: 'center',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-4px)';
                                e.target.style.boxShadow = `0 8px 16px ${officer.color}20`;
                                e.target.style.borderColor = officer.color;
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                                e.target.style.borderColor = '#E3EEF7';
                                e.target.style.borderLeftColor = officer.color;
                            }}
                            >
                                {/* Officer Avatar */}
                                <div style={{
                                    fontSize: '4rem',
                                    marginBottom: '1rem',
                                    backgroundColor: officer.color,
                                    borderRadius: '50%',
                                    width: '80px',
                                    height: '80px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem auto',
                                    boxShadow: `0 4px 8px ${officer.color}30`
                                }}>
                                    <span style={{ fontSize: '2.5rem', filter: 'brightness(0) invert(1)' }}>
                                        {officer.avatar}
                                    </span>
                                </div>
                                
                                {/* Officer Name */}
                                <h4 style={{
                                    fontSize: '1.125rem',
                                    fontWeight: '700',
                                    color: '#1B3A4B',
                                    margin: '0 0 0.5rem 0',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.025em'
                                }}>
                                    {officer.name}
                                </h4>
                                
                                {/* Designation */}
                                <p style={{
                                    fontSize: '1rem',
                                    color: officer.color,
                                    fontWeight: '600',
                                    margin: '0 0 0.25rem 0',
                                    textTransform: 'uppercase'
                                }}>
                                    {officer.designation}
                                </p>
                                
                                {/* Department */}
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#6B7280',
                                    margin: '0 0 1rem 0',
                                    fontWeight: '500'
                                }}>
                                    {officer.department}
                                </p>
                                
                                {/* Contact Information */}
                                <div style={{ 
                                    backgroundColor: 'white',
                                    padding: '1rem',
                                    borderRadius: '0.375rem',
                                    marginBottom: '1rem',
                                    border: '1px solid #E3EEF7'
                                }}>
                                    <div style={{ fontSize: '0.8125rem', color: '#1F4E78', marginBottom: '0.5rem', fontWeight: '600' }}>
                                        📞 {officer.phone}
                                    </div>
                                    <div style={{ fontSize: '0.8125rem', color: '#1F4E78', fontWeight: '600' }}>
                                        📧 {officer.email}
                                    </div>
                                </div>
                                
                                {/* Contact Button */}
                                <button style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: officer.color,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.025em',
                                    transition: 'all 0.2s',
                                    boxShadow: `0 2px 4px ${officer.color}30`
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = `0 4px 8px ${officer.color}40`;
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = `0 2px 4px ${officer.color}30`;
                                }}
                                >
                                    📞 CONTACT OFFICER
                                </button>
                            </div>
                        ))}
                    </div>
                    
                    {/* Additional Contact Information */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1.5rem',
                        backgroundColor: '#F0F9FF',
                        borderRadius: '0.375rem',
                        border: '2px solid #BAE6FD',
                        textAlign: 'center'
                    }}>
                        <h4 style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#1B3A4B',
                            margin: '0 0 1rem 0',
                            textTransform: 'uppercase'
                        }}>
                            🚨 EMERGENCY CONTACTS
                        </h4>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.875rem', fontWeight: '600' }}>
                            <div style={{ color: '#DC2626' }}>
                                🚨 Emergency: <span style={{ fontWeight: '700' }}>100</span>
                            </div>
                            <div style={{ color: '#1F4E78' }}>
                                📞 MCD Control Room: <span style={{ fontWeight: '700' }}>1800-11-4455</span>
                            </div>
                            <div style={{ color: '#2E7D32' }}>
                                💧 Water Emergency: <span style={{ fontWeight: '700' }}>1916</span>
                            </div>
                        </div>
                    </div>
                </div>

                <WardStats 
                    wardName={data.user.ward} 
                    stats={data.wardStats} 
                    onViewFullStats={() => navigate('/ward-portal')}
                    onMapClick={() => navigate('/ward-portal')}
                />

                {/* Quick Analytics Summary */}
                <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '0.375rem', 
                    padding: '1rem', 
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', 
                    marginBottom: '1.5rem',
                    border: '1px solid #E3EEF7',
                    borderLeft: '4px solid #1F4E78'
                }}>
                    <h3 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '600', 
                        margin: '0 0 1rem 0', 
                        color: '#1B3A4B',
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em'
                    }}>
                        📊 YOUR CIVIC IMPACT SUMMARY
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280', marginBottom: '0.5rem' }}>
                                Response Time
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1F4E78' }}>
                                {data.stats.responseTime || '4.2 hours'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                Avg first response
                            </div>
                        </div>
                        
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280', marginBottom: '0.5rem' }}>
                                Satisfaction Rate
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1F4E78' }}>
                                {data.stats.satisfaction}%
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                Citizen feedback
                            </div>
                        </div>
                    </div>
                    
                    {/* Achievement Badges */}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
                        <div style={{ 
                            fontSize: '0.875rem', 
                            fontWeight: '600', 
                            color: '#1B3A4B', 
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em'
                        }}>
                            🏆 ACHIEVEMENT BADGES
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {data.user.badges.map((badge, index) => (
                                <span key={index} style={{
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: '#E3EEF7',
                                    color: '#1F4E78',
                                    borderRadius: '0.375rem',
                                    fontWeight: '500',
                                    border: '1px solid #C7DDEE'
                                }}>
                                    {badge}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div ref={leaderboardRef}>
                    <Leaderboard 
                        list={data.leaderboard} 
                        onViewTop10={scrollToLeaderboard}
                    />
                </div>
            </main>

            {/* 🎨 PART 5: FOOTER (Government Official) */}
            <footer style={{
                backgroundColor: '#1B3A4B',
                color: 'white',
                padding: '2.5rem 0 1.5rem 0',
                marginTop: '3rem',
                borderTop: '4px solid #F77F00'
            }}>
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto', 
                    padding: '0 1rem'
                }}>
                    {/* Main Footer Content - 4 Column Layout */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(4, 1fr)', 
                        gap: '2rem',
                        marginBottom: '2rem'
                    }}>
                        {/* Column 1: QUICK LINKS */}
                        <div>
                            <h3 style={{ 
                                fontSize: '1rem', 
                                fontWeight: '700', 
                                marginBottom: '1.25rem',
                                color: '#F77F00',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderBottom: '2px solid #F77F00',
                                paddingBottom: '0.5rem'
                            }}>
                                QUICK LINKS
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <a href="#" style={{ 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = 'white'}
                                >
                                    • HOME
                                </a>
                                <a href="#" style={{ 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = 'white'}
                                >
                                    • ABOUT US
                                </a>
                                <a href="#" style={{ 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = 'white'}
                                >
                                    • DEPARTMENTS
                                </a>
                                <a href="#" style={{ 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = 'white'}
                                >
                                    • CITIZEN CORNER
                                </a>
                            </div>
                        </div>
                        
                        {/* Column 2: ABOUT */}
                        <div>
                            <h3 style={{ 
                                fontSize: '1rem', 
                                fontWeight: '700', 
                                marginBottom: '1.25rem',
                                color: '#F77F00',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderBottom: '2px solid #F77F00',
                                paddingBottom: '0.5rem'
                            }}>
                                ABOUT
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <a href="#" style={{ 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = 'white'}
                                >
                                    • MCD Organization
                                </a>
                                <a href="#" style={{ 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = 'white'}
                                >
                                    • Vision & Mission
                                </a>
                                <a href="#" style={{ 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = 'white'}
                                >
                                    • History
                                </a>
                                <a href="#" style={{ 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = 'white'}
                                >
                                    • Officers
                                </a>
                            </div>
                        </div>
                        
                        {/* Column 3: CONTACT */}
                        <div>
                            <h3 style={{ 
                                fontSize: '1rem', 
                                fontWeight: '700', 
                                marginBottom: '1.25rem',
                                color: '#F77F00',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderBottom: '2px solid #F77F00',
                                paddingBottom: '0.5rem'
                            }}>
                                CONTACT
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <a href="#" style={{ 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = 'white'}
                                >
                                    • Support
                                </a>
                                <a href="#" style={{ 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = 'white'}
                                >
                                    • Feedback
                                </a>
                                <a href="#" style={{ 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = 'white'}
                                >
                                    • Complaint
                                </a>
                                <a href="#" style={{ 
                                    color: 'white', 
                                    textDecoration: 'none', 
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    transition: 'color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = 'white'}
                                >
                                    • Emergency
                                </a>
                            </div>
                        </div>

                        {/* Column 4: Government Emblem & Info */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                backgroundColor: '#F77F00',
                                borderRadius: '50%',
                                width: '80px',
                                height: '80px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem auto',
                                boxShadow: '0 4px 8px rgba(247, 127, 0, 0.3)'
                            }}>
                                <span style={{ fontSize: '2rem', color: 'white' }}>🏛️</span>
                            </div>
                            <h4 style={{
                                fontSize: '0.875rem',
                                fontWeight: '700',
                                color: '#F77F00',
                                margin: '0 0 0.5rem 0',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                UNIFIED MUNICIPAL PLATFORM
                            </h4>
                            <p style={{
                                fontSize: '0.75rem',
                                color: '#C7DDEE',
                                margin: '0 0 1rem 0',
                                lineHeight: '1.4'
                            }}>
                                Serving Citizens with Excellence
                            </p>
                            <div style={{
                                fontSize: '0.75rem',
                                color: 'white',
                                lineHeight: '1.6'
                            }}>
                                <p style={{ margin: '0 0 0.25rem 0' }}>📞 1800-11-4455</p>
                                <p style={{ margin: '0 0 0.25rem 0' }}>📧 info@mcd.gov.in</p>
                                <p style={{ margin: '0 0 0.25rem 0' }}>🚨 Emergency: 100</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom Section - Copyright & Legal */}
                    <div style={{ 
                        borderTop: '2px solid #374151',
                        paddingTop: '1.5rem',
                        marginTop: '1.5rem'
                    }}>
                        {/* Copyright Line */}
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '1rem'
                        }}>
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#F77F00',
                                fontWeight: '600',
                                margin: 0,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                © 2025 Unified Municipal Platform. All Rights Reserved
                            </p>
                        </div>
                        
                        {/* Legal Links & Browser Requirements */}
                        <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.75rem',
                            color: '#9CA3AF',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <a href="#" style={{ 
                                    color: '#9CA3AF', 
                                    textDecoration: 'none',
                                    transition: 'color 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = '#9CA3AF'}
                                >
                                    Privacy Policy
                                </a>
                                <span style={{ color: '#6B7280' }}>|</span>
                                <a href="#" style={{ 
                                    color: '#9CA3AF', 
                                    textDecoration: 'none',
                                    transition: 'color 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = '#9CA3AF'}
                                >
                                    Terms & Conditions
                                </a>
                                <span style={{ color: '#6B7280' }}>|</span>
                                <a href="#" style={{ 
                                    color: '#9CA3AF', 
                                    textDecoration: 'none',
                                    transition: 'color 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.color = '#F77F00'}
                                onMouseOut={(e) => e.target.style.color = '#9CA3AF'}
                                >
                                    Accessibility
                                </a>
                            </div>
                            <div style={{ 
                                fontSize: '0.6875rem',
                                color: '#6B7280',
                                fontStyle: 'italic'
                            }}>
                                Site optimized for IE 8+, Netscape 6.2+ | 800×600 min
                            </div>
                        </div>
                    </div>
                </div>
            </footer>


            
            {/* Government CSS Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
                
                .government-card {
                    animation: fadeIn 0.6s ease-out;
                }
                
                .government-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(31, 78, 120, 0.4);
                }
                
                .government-nav-item:hover {
                    background-color: rgba(247, 127, 0, 0.2);
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
