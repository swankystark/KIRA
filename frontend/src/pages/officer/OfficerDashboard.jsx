import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    Building2, LogOut, Home, FileText, BarChart3, Settings,
    Clock, AlertTriangle, CheckCircle, TrendingUp,
    Filter, Search, Eye, MapPin, Calendar
} from 'lucide-react';

const OfficerDashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [officerData, setOfficerData] = useState(null);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'inbox');
    const [filterType, setFilterType] = useState(searchParams.get('filter') || 'all');
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check officer session - use 'officer' key
        const session = localStorage.getItem('officer');
        console.log('📦 localStorage officer:', session);
        
        if (!session) {
            console.log('❌ No officer session found, redirecting to login');
            navigate('/officer/login');
            return;
        }
        
        try {
            const officer = JSON.parse(session);
            console.log('✅ Officer parsed:', officer);
            setOfficerData(officer);
            
            // Fetch complaints from API
            fetchComplaints(officer.officer_id);
        } catch (e) {
            console.error('❌ Failed to parse officer session:', e);
            navigate('/officer/login');
        }
    }, [navigate]);

    const fetchComplaints = async (officerId) => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://127.0.0.1:5000/api/officer/complaints?officer_id=${officerId}`);
            const data = await response.json();
            
            if (data.complaints) {
                // Transform complaints to match UI format
                const transformed = data.complaints.map(c => ({
                    id: c.complaint_id,
                    category: c.category?.charAt(0).toUpperCase() + c.category?.slice(1) || 'Unknown',
                    location: c.location?.address || `${c.location?.lat}, ${c.location?.lng}`,
                    ward: `Ward ${c.location?.ward || 'N/A'}`,
                    age: getAge(c.created_at),
                    status: mapStatus(c.status),
                    priority: c.severity || 'Medium',
                    reportedAt: c.created_at,
                    slaBreached: isSlaBreeched(c.created_at, c.status),
                    citizen: c.citizen,
                    description: c.description,
                    imageUrl: c.image_url
                }));
                setComplaints(transformed);
                console.log('✅ Loaded complaints:', transformed);
            }
        } catch (error) {
            console.error('❌ Failed to fetch complaints:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getAge = (createdAt) => {
        if (!createdAt) return '0d';
        const created = new Date(createdAt);
        const now = new Date();
        const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        return `${diffDays}d`;
    };

    const mapStatus = (status) => {
        const statusMap = {
            'assigned': 'New',
            'pending': 'Pending',
            'in_progress': 'In Progress',
            'resolved': 'Resolved',
            'unassigned': 'New'
        };
        return statusMap[status] || status?.charAt(0).toUpperCase() + status?.slice(1) || 'New';
    };

    const isSlaBreeched = (createdAt, status) => {
        if (!createdAt || status === 'resolved') return false;
        const created = new Date(createdAt);
        const now = new Date();
        const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        return diffDays > 5; // SLA is 5 days
    };

    useEffect(() => {
        // Update URL when tab or filter changes
        const params = new URLSearchParams();
        if (activeTab !== 'inbox') params.set('tab', activeTab);
        if (filterType !== 'all') params.set('filter', filterType);
        setSearchParams(params);
    }, [activeTab, filterType, setSearchParams]);

    const handleLogout = () => {
        localStorage.removeItem('officer');
        navigate('/officer/login');
    };

    const handleKPICardClick = (filter) => {
        setActiveTab('inbox');
        setFilterType(filter);
    };

    const handleComplaintClick = (complaintId) => {
        navigate(`/officer/complaints/${complaintId}`);
    };

    const getFilteredComplaints = () => {
        let filtered = complaints;

        // Filter by tab
        switch (activeTab) {
            case 'inbox':
                filtered = complaints.filter(c => ['New', 'Pending'].includes(c.status));
                break;
            case 'in-progress':
                filtered = complaints.filter(c => c.status === 'In Progress');
                break;
            case 'completed':
                filtered = complaints.filter(c => c.status === 'Resolved');
                break;
            default:
                break;
        }

        // Apply additional filters
        switch (filterType) {
            case 'today':
                const today = new Date().toDateString();
                filtered = filtered.filter(c => new Date(c.reportedAt).toDateString() === today);
                break;
            case 'pending':
                filtered = filtered.filter(c => c.status === 'Pending');
                break;
            case 'sla-breached':
                filtered = filtered.filter(c => c.slaBreached);
                break;
            default:
                break;
        }

        return filtered;
    };

    const getKPIData = () => {
        const today = new Date().toDateString();
        const newToday = complaints.filter(c => 
            new Date(c.reportedAt).toDateString() === today && c.status === 'New'
        ).length;
        
        const totalPending = complaints.filter(c => 
            ['New', 'Pending'].includes(c.status)
        ).length;
        
        const slaBreached = complaints.filter(c => c.slaBreached).length;
        
        const pendingAges = complaints
            .filter(c => ['New', 'Pending'].includes(c.status))
            .map(c => parseInt(c.age));
        const avgAge = pendingAges.length > 0 
            ? Math.round(pendingAges.reduce((a, b) => a + b, 0) / pendingAges.length)
            : 0;

        return { newToday, totalPending, avgAge, slaBreached };
    };

    const kpiData = getKPIData();
    const filteredComplaints = getFilteredComplaints();

    // Debug logging
    console.log('🎯 Dashboard state:', { officerData, complaints, isLoading });

    if (!officerData) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: '#F5F7FA' 
            }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
                <div>Loading officer data...</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.5rem' }}>
                    If stuck, check console for errors
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
            {/* Government Header */}
            <div style={{
                backgroundColor: '#1F4E78',
                color: 'white',
                padding: '1rem 0',
                borderBottom: '3px solid #F77F00'
            }}>
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto',
                    padding: '0 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Logo */}
                    <div 
                        onClick={() => navigate('/')}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        <Building2 className="w-8 h-8" />
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                                UNIFIED MUNICIPAL PLATFORM
                            </h1>
                            <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.9 }}>
                                Officer Portal • Official Officer Portal
                            </p>
                        </div>
                    </div>

                    {/* Officer Info & Logout */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                                Welcome, {officerData.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                {officerData.title || officerData.department}
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: '#F77F00',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div style={{
                backgroundColor: 'white',
                borderBottom: '1px solid #E3EEF7',
                padding: '0.75rem 0'
            }}>
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto',
                    padding: '0 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#6B7280'
                }}>
                    <Home 
                        className="w-4 h-4 cursor-pointer hover:text-blue-600" 
                        onClick={() => navigate('/')}
                    />
                    <span>{'>'}</span>
                    <span 
                        style={{ color: '#1F4E78', cursor: 'pointer' }}
                        onClick={() => navigate('/officer/dashboard')}
                    >
                        Officer Dashboard
                    </span>
                </div>
            </div>

            {/* Navigation Bar */}
            <div style={{
                backgroundColor: 'white',
                borderBottom: '1px solid #E3EEF7',
                padding: '1rem 0'
            }}>
                <div style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto',
                    padding: '0 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <button
                        onClick={() => navigate('/officer/dashboard')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#1F4E78',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <BarChart3 className="w-4 h-4" />
                        Dashboard
                    </button>
                    
                    <button
                        onClick={() => navigate('/officer/tasks')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: 'white',
                            color: '#1F4E78',
                            border: '2px solid #1F4E78',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
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
                        <Clock className="w-4 h-4" />
                        Workers & SLA
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
                {/* KPI Cards Row */}
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    {/* New Complaints Today */}
                    <div 
                        onClick={() => handleKPICardClick('today')}
                        style={{
                            backgroundColor: 'white',
                            padding: '1.5rem',
                            borderRadius: '0.5rem',
                            boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                            border: '1px solid #E3EEF7',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderLeft: '4px solid #3B82F6'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 78, 120, 0.15)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(31, 78, 120, 0.1)';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                backgroundColor: '#EBF8FF',
                                padding: '0.75rem',
                                borderRadius: '0.5rem'
                            }}>
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1F4E78' }}>
                                    {kpiData.newToday}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                    New Complaints Today
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Pending */}
                    <div 
                        onClick={() => handleKPICardClick('pending')}
                        style={{
                            backgroundColor: 'white',
                            padding: '1.5rem',
                            borderRadius: '0.5rem',
                            boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                            border: '1px solid #E3EEF7',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderLeft: '4px solid #F59E0B'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 78, 120, 0.15)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(31, 78, 120, 0.1)';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                backgroundColor: '#FFFBEB',
                                padding: '0.75rem',
                                borderRadius: '0.5rem'
                            }}>
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1F4E78' }}>
                                    {kpiData.totalPending}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                    Total Pending
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Avg Age of Pending */}
                    <div 
                        onClick={() => alert('Analytics feature coming soon')}
                        style={{
                            backgroundColor: 'white',
                            padding: '1.5rem',
                            borderRadius: '0.5rem',
                            boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                            border: '1px solid #E3EEF7',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderLeft: '4px solid #10B981'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 78, 120, 0.15)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(31, 78, 120, 0.1)';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                backgroundColor: '#ECFDF5',
                                padding: '0.75rem',
                                borderRadius: '0.5rem'
                            }}>
                                <TrendingUp className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1F4E78' }}>
                                    {kpiData.avgAge}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                    Avg Age of Pending (days)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SLA Breached */}
                    <div 
                        onClick={() => handleKPICardClick('sla-breached')}
                        style={{
                            backgroundColor: 'white',
                            padding: '1.5rem',
                            borderRadius: '0.5rem',
                            boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                            border: '1px solid #E3EEF7',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            borderLeft: '4px solid #EF4444'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(31, 78, 120, 0.15)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(31, 78, 120, 0.1)';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                backgroundColor: '#FEF2F2',
                                padding: '0.75rem',
                                borderRadius: '0.5rem'
                            }}>
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1F4E78' }}>
                                    {kpiData.slaBreached}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                                    SLA Breached
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                    border: '1px solid #E3EEF7',
                    overflow: 'hidden'
                }}>
                    {/* Tab Headers */}
                    <div style={{
                        display: 'flex',
                        borderBottom: '1px solid #E3EEF7',
                        backgroundColor: '#F8FAFC'
                    }}>
                        {[
                            { key: 'inbox', label: 'Inbox – New & Pending', count: complaints.filter(c => ['New', 'Pending'].includes(c.status)).length },
                            { key: 'in-progress', label: 'In Progress', count: complaints.filter(c => c.status === 'In Progress').length },
                            { key: 'completed', label: 'Completed', count: complaints.filter(c => c.status === 'Resolved').length }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setFilterType('all');
                                }}
                                style={{
                                    flex: 1,
                                    padding: '1rem 1.5rem',
                                    backgroundColor: activeTab === tab.key ? '#1F4E78' : 'transparent',
                                    color: activeTab === tab.key ? 'white' : '#6B7280',
                                    border: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {tab.label}
                                <span style={{
                                    backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#E5E7EB',
                                    color: activeTab === tab.key ? 'white' : '#6B7280',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                }}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Complaints Table */}
                    <div style={{ padding: '1.5rem' }}>
                        {filteredComplaints.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem',
                                color: '#6B7280'
                            }}>
                                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p>No complaints found for the selected filter.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #E3EEF7' }}>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B' }}>
                                                Complaint ID
                                            </th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B' }}>
                                                Category
                                            </th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B' }}>
                                                Location / Ward
                                            </th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B' }}>
                                                Age
                                            </th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B' }}>
                                                Status
                                            </th>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B' }}>
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredComplaints.map(complaint => (
                                            <tr 
                                                key={complaint.id}
                                                style={{ 
                                                    borderBottom: '1px solid #F3F4F6',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <td style={{ padding: '0.75rem' }}>
                                                    <button
                                                        onClick={() => handleComplaintClick(complaint.id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#1F4E78',
                                                            fontSize: '0.875rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            textDecoration: 'underline'
                                                        }}
                                                    >
                                                        {complaint.id}
                                                    </button>
                                                    {complaint.slaBreached && (
                                                        <span style={{
                                                            marginLeft: '0.5rem',
                                                            backgroundColor: '#FEF2F2',
                                                            color: '#DC2626',
                                                            padding: '0.125rem 0.375rem',
                                                            borderRadius: '0.25rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '500'
                                                        }}>
                                                            SLA
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <button
                                                        onClick={() => {
                                                            // Filter by category
                                                            setFilterType('all');
                                                            // Could add category filter here
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: '#6B7280',
                                                            fontSize: '0.875rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {complaint.category}
                                                    </button>
                                                </td>
                                                <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6B7280' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <MapPin className="w-4 h-4" />
                                                        {complaint.location}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6B7280' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Calendar className="w-4 h-4" />
                                                        {complaint.age}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <span style={{
                                                        backgroundColor: 
                                                            complaint.status === 'New' ? '#EBF8FF' :
                                                            complaint.status === 'Pending' ? '#FFFBEB' :
                                                            complaint.status === 'In Progress' ? '#F0F9FF' :
                                                            '#ECFDF5',
                                                        color: 
                                                            complaint.status === 'New' ? '#1E40AF' :
                                                            complaint.status === 'Pending' ? '#D97706' :
                                                            complaint.status === 'In Progress' ? '#0369A1' :
                                                            '#059669',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {complaint.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <button
                                                        onClick={() => handleComplaintClick(complaint.id)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            padding: '0.5rem 0.75rem',
                                                            backgroundColor: '#1F4E78',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '0.375rem',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '500',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar Navigation (Optional for Phase 1) */}
            <div style={{
                position: 'fixed',
                top: '50%',
                right: '1rem',
                transform: 'translateY(-50%)',
                backgroundColor: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 12px rgba(31, 78, 120, 0.15)',
                border: '1px solid #E3EEF7',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                <button
                    onClick={() => navigate('/officer/dashboard')}
                    style={{
                        padding: '0.75rem',
                        backgroundColor: '#1F4E78',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Dashboard"
                >
                    <BarChart3 className="w-5 h-5" />
                </button>
                <button
                    onClick={() => navigate('/officer/complaints')}
                    style={{
                        padding: '0.75rem',
                        backgroundColor: '#F3F4F6',
                        color: '#6B7280',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="All Complaints"
                >
                    <FileText className="w-5 h-5" />
                </button>
                <button
                    onClick={() => navigate('/officer/reports')}
                    style={{
                        padding: '0.75rem',
                        backgroundColor: '#F3F4F6',
                        color: '#6B7280',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Reports & Analytics"
                >
                    <BarChart3 className="w-5 h-5" />
                </button>
                <button
                    onClick={() => navigate('/officer/settings')}
                    style={{
                        padding: '0.75rem',
                        backgroundColor: '#F3F4F6',
                        color: '#6B7280',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    title="Settings"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default OfficerDashboard;