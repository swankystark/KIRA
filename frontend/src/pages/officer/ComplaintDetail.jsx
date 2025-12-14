import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Building2, ArrowLeft, MapPin, Calendar, User, FileText, Phone, 
    Edit3, Users, Clock, MessageSquare, Camera, Eye, Filter,
    CheckCircle, AlertTriangle, X, Printer, ExternalLink,
    ChevronDown, Search, Plus, Send, Upload, Download
} from 'lucide-react';

const ComplaintDetail = () => {
    const { complaintId } = useParams();
    const navigate = useNavigate();
    const [officerData, setOfficerData] = useState(null);
    const [escalating, setEscalating] = useState(false); // New state for loading
    
    // Modal states
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [showInfoRequestModal, setShowInfoRequestModal] = useState(false);
    const [showDepartmentModal, setShowDepartmentModal] = useState(false);
    const [showWorkerModal, setShowWorkerModal] = useState(false);
    
    // Form states
    const [newStatus, setNewStatus] = useState('');
    const [statusReason, setStatusReason] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedWorker, setSelectedWorker] = useState('');
    const [newNote, setNewNote] = useState('');
    const [timelineFilter, setTimelineFilter] = useState('all');
    const [infoRequest, setInfoRequest] = useState('');

    const [complaintData, setComplaintData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check officer session - use correct key
        const session = localStorage.getItem('officer');
        if (!session) {
            navigate('/officer/login');
            return;
        }
        setOfficerData(JSON.parse(session));
        
        // Fetch complaint from API
        fetchComplaint();
    }, [navigate, complaintId]);

    const fetchComplaint = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`http://127.0.0.1:5000/api/complaints/${complaintId}`);
            const data = await response.json();
            
            console.log('📋 Complaint data:', data);
            setComplaintData(data);
        } catch (error) {
            console.error('❌ Failed to fetch complaint:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!officerData || !complaintData) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#F5F7FA' 
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
                    <div>Loading complaint details...</div>
                </div>
            </div>
        );
    }

    // Transform API data to match UI expectations
    const complaint = {
        id: complaintData.complaint_id,
        category: complaintData.category?.charAt(0).toUpperCase() + complaintData.category?.slice(1) || 'Unknown',
        subcategory: complaintData.subcategory || '',
        description: complaintData.description || 'No description provided',
        location: complaintData.location?.address || `${complaintData.location?.lat}, ${complaintData.location?.lng}`,
        coordinates: { lat: complaintData.location?.lat || 0, lng: complaintData.location?.lng || 0 },
        status: complaintData.status === 'assigned' ? 'New' : complaintData.status?.charAt(0).toUpperCase() + complaintData.status?.slice(1) || 'New',
        priority: complaintData.severity || 'Medium',
        reportedAt: complaintData.created_at,
        citizenName: complaintData.citizen?.name || 'Unknown',
        citizenPhone: complaintData.citizen?.phone || 'N/A',
        citizenEmail: complaintData.citizen?.email || 'N/A',
        photos: complaintData.image_url ? [
            { id: 1, url: `http://127.0.0.1:5000${complaintData.image_url}`, caption: 'Complaint image' }
        ] : [],
        slaBreached: false,
        supervisor_status: complaintData.supervisor_status,
        supervisor_deadline: complaintData.supervisor_deadline,
        estimatedResolution: '3-5 business days',
        assignedDepartment: complaintData.assigned_officer?.department || 'Pending',
        assignedWorker: complaintData.assigned_officer?.name || 'Not assigned',
        workerPhone: complaintData.assigned_officer?.phone || 'N/A',
        aiAnalysis: {
            confidence: 85,
            detectedObjects: [complaintData.category],
            issueType: complaintData.category,
            severity: complaintData.severity,
            recommendation: 'Review required'
        },
        forensics: {
            sourceType: 'PHONE_PHOTO',
            confidence: 90,
            authenticity: 'Verified'
        },
        timeline: [
            { id: 1, timestamp: complaintData.created_at, action: 'Complaint Submitted', actor: complaintData.citizen?.name, type: 'citizen' },
            { id: 2, timestamp: complaintData.created_at, action: `Auto-assigned to ${complaintData.assigned_officer?.name}`, actor: 'System', type: 'system' }
        ],
        notes: [],
        duplicates: [],
        relatedComplaints: []
    };

    // Mock departments and workers
    const departments = [
        { id: 'electrical', name: 'Electrical Maintenance', workload: 23, avgTime: '2.1 days' },
        { id: 'civil', name: 'Civil & Roads', workload: 45, avgTime: '4.2 days' },
        { id: 'water', name: 'Water Supply', workload: 12, avgTime: '1.8 days' },
        { id: 'drainage', name: 'Drainage & Sewage', workload: 18, avgTime: '3.1 days' },
        { id: 'waste', name: 'Waste Management', workload: 31, avgTime: '1.5 days' }
    ];

    const workers = [
        { id: 'amit', name: 'Amit Singh', department: 'electrical', workload: 3, rating: 4.8, phone: '+91-98765-12345' },
        { id: 'priya', name: 'Priya Verma', department: 'electrical', workload: 5, rating: 4.6, phone: '+91-98765-12346' },
        { id: 'rajesh', name: 'Rajesh Gupta', department: 'electrical', workload: 2, rating: 4.9, phone: '+91-98765-12347' }
    ];

    // Use transformed complaint for rendering
    const displayComplaint = complaint;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F5F7FA' }}>
            {/* Government Header Bar */}
            <div style={{
                backgroundColor: '#1F4E78',
                color: 'white',
                padding: '0.75rem 0',
                borderBottom: '3px solid #F77F00'
            }}>
                <div style={{ 
                    maxWidth: '1400px', 
                    margin: '0 auto',
                    padding: '0 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Left: Breadcrumb Navigation */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/officer/dashboard')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                padding: '0.5rem',
                                borderRadius: '0.375rem',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(247, 127, 0, 0.2)'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to List
                        </button>
                        <span style={{ color: '#F77F00' }}>•</span>
                        <span style={{ fontSize: '0.875rem' }}>Complaint {displayComplaint.id}</span>
                    </div>

                    {/* Center: Complaint Title with Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                                {complaint.category} - {complaint.subcategory}
                            </h1>
                            <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.9 }}>
                                {complaint.location}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowStatusModal(true)}
                            style={{
                                backgroundColor: 
                                    complaint.status === 'New' ? '#3B82F6' :
                                    complaint.status === 'In Progress' ? '#F59E0B' :
                                    complaint.status === 'Resolved' ? '#10B981' :
                                    '#6B7280',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {complaint.status} ▼
                        </button>
                    </div>

                    {/* Right: Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                            onClick={() => window.print()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: 'transparent',
                                border: '1px solid rgba(255,255,255,0.3)',
                                color: 'white',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                            }}
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                            {officerData.name} • {officerData.designation}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                
                {/* LEFT COLUMN: Citizen Info, Complaint Details, Evidence */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Citizen Information Card */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                        border: '1px solid #E3EEF7',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            backgroundColor: '#1F4E78',
                            color: 'white',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <User className="w-5 h-5" />
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                                    Citizen Information
                                </h3>
                            </div>
                            <button
                                onClick={() => window.open(`tel:${complaint.citizenPhone}`)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#10B981',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                <Phone className="w-4 h-4" />
                                Call Citizen
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Name</div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B' }}>{complaint.citizenName}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Phone</div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B' }}>{complaint.citizenPhone}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Email</div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B' }}>{complaint.citizenEmail}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Reported</div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B' }}>
                                        {new Date(complaint.reportedAt).toLocaleDateString('en-IN')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Complaint Details Card */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                        border: '1px solid #E3EEF7',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            backgroundColor: '#1F4E78',
                            color: 'white',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <FileText className="w-5 h-5" />
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                                    Complaint Details
                                </h3>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <select
                                    value={complaint.category}
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: 'white',
                                        border: 'none',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.75rem',
                                        color: '#1B3A4B'
                                    }}
                                >
                                    <option>Streetlight</option>
                                    <option>Garbage</option>
                                    <option>Roads</option>
                                    <option>Water</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            {/* Supervisor Status Banner */}
                            {(complaint.status === 'awaiting_supervisor' || complaint.supervisor_status) && (
                                <div style={{ 
                                    marginBottom: '1rem', 
                                    padding: '1rem', 
                                    backgroundColor: complaint.supervisor_status === 'REJECTED' ? '#FEF2F2' : '#F0F9FF',
                                    border: `1px solid ${complaint.supervisor_status === 'REJECTED' ? '#FCA5A5' : '#BAE6FD'}`,
                                    borderRadius: '0.375rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <AlertTriangle size={18} color={complaint.supervisor_status === 'REJECTED' ? '#DC2626' : '#0284C7'} />
                                        <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '700', color: complaint.supervisor_status === 'REJECTED' ? '#DC2626' : '#0369A1' }}>
                                            Supervisor Review: {complaint.supervisor_status || 'PENDING'}
                                        </h4>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#475569' }}>
                                        {complaint.supervisor_status === 'REJECTED' 
                                            ? 'The supervisor has sent this back. Please check timeline for remarks.' 
                                            : 'This complaint is currently with the supervisor for review.'}
                                    </p>
                                </div>
                            )}
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>Description</div>
                                <div style={{ fontSize: '0.875rem', color: '#1B3A4B', lineHeight: '1.5' }}>
                                    {complaint.description}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Priority</div>
                                    <div style={{ 
                                        fontSize: '0.875rem', 
                                        fontWeight: '600',
                                        color: complaint.priority === 'High' ? '#DC2626' : complaint.priority === 'Medium' ? '#F59E0B' : '#10B981'
                                    }}>
                                        {complaint.priority}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Location</div>
                                    <button
                                        onClick={() => setShowMapModal(true)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            background: 'none',
                                            border: 'none',
                                            color: '#1F4E78',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                    >
                                        <MapPin className="w-4 h-4" />
                                        View on Map
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Evidence Section */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                        border: '1px solid #E3EEF7',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            backgroundColor: '#1F4E78',
                            color: 'white',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Camera className="w-5 h-5" />
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                                    Evidence & Analysis
                                </h3>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setShowPhotoModal(true)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#F77F00',
                                        border: 'none',
                                        borderRadius: '0.375rem',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Eye className="w-4 h-4" />
                                    View Photos
                                </button>
                                <button
                                    onClick={() => setShowAIModal(true)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#10B981',
                                        border: 'none',
                                        borderRadius: '0.375rem',
                                        color: 'white',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    AI Analysis
                                </button>
                            </div>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>Photos Uploaded</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1F4E78' }}>
                                        {complaint.photos.length}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>AI Confidence</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#10B981' }}>
                                        {complaint.aiAnalysis.confidence}%
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>Source Verification</div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10B981' }}>
                                        {complaint.forensics.authenticity}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>Detected Objects</div>
                                    <div style={{ fontSize: '0.875rem', color: '#1B3A4B' }}>
                                        {complaint.aiAnalysis.detectedObjects.join(', ')}
                                    </div>
                                </div>
                            </div>
                            </div>
                            
                            {/* Supervisor Status Banner */}
                            {(complaint.status === 'awaiting_supervisor' || complaint.supervisor_status) && (
                                <div style={{ 
                                    marginTop: '1rem', 
                                    padding: '1rem', 
                                    backgroundColor: complaint.supervisor_status === 'REJECTED' ? '#FEF2F2' : '#F0F9FF',
                                    border: `1px solid ${complaint.supervisor_status === 'REJECTED' ? '#FCA5A5' : '#BAE6FD'}`,
                                    borderRadius: '0.375rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <AlertTriangle size={18} color={complaint.supervisor_status === 'REJECTED' ? '#DC2626' : '#0284C7'} />
                                        <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: '700', color: complaint.supervisor_status === 'REJECTED' ? '#DC2626' : '#0369A1' }}>
                                            Supervisor Review: {complaint.supervisor_status || 'PENDING'}
                                        </h4>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#475569' }}>
                                        {complaint.supervisor_status === 'REJECTED' 
                                            ? 'The supervisor has sent this back. Please check timeline for remarks.' 
                                            : 'This complaint is currently with the supervisor for review.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Department Routing, Worker Assignment, Status Management */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Department Routing */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                        border: '1px solid #E3EEF7',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            backgroundColor: '#F77F00',
                            color: 'white',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                                Department Routing
                            </h3>
                            <button
                                onClick={() => setShowDepartmentModal(true)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Change Dept
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>Current Department</div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1F4E78' }}>
                                    {complaint.assignedDepartment}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.75rem' }}>
                                <div>
                                    <div style={{ color: '#6B7280' }}>Current Workload</div>
                                    <div style={{ fontWeight: '600', color: '#F59E0B' }}>23 cases</div>
                                </div>
                                <div>
                                    <div style={{ color: '#6B7280' }}>Avg Resolution</div>
                                    <div style={{ fontWeight: '600', color: '#10B981' }}>2.1 days</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Worker Assignment */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                        border: '1px solid #E3EEF7',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            backgroundColor: '#10B981',
                            color: 'white',
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                                Worker Assignment
                            </h3>
                            <button
                                onClick={() => setShowWorkerModal(true)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Reassign
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>Assigned Worker</div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1F4E78' }}>
                                    {complaint.assignedWorker}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                    {complaint.workerPhone}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.75rem' }}>
                                <div>
                                    <div style={{ color: '#6B7280' }}>Current Load</div>
                                    <div style={{ fontWeight: '600', color: '#F59E0B' }}>3 cases</div>
                                </div>
                                <div>
                                    <div style={{ color: '#6B7280' }}>Rating</div>
                                    <div style={{ fontWeight: '600', color: '#10B981' }}>4.8/5</div>
                                </div>
                            </div>
                            
                            {/* Actions Column */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                <button
                                    onClick={() => window.open(`tel:${complaint.workerPhone}`)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        backgroundColor: '#10B981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Phone className="w-4 h-4" />
                                    Call Worker
                                </button>
                                
                                <button
                                    onClick={() => navigate(`/officer/tasks?workerId=ravi123`)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        backgroundColor: 'white',
                                        color: '#1F4E78',
                                        border: '2px solid #1F4E78',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
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
                                    <Users className="w-4 h-4" />
                                    View all tasks for this worker
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Status Management */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                        border: '1px solid #E3EEF7',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            backgroundColor: '#1F4E78',
                            color: 'white',
                            padding: '1rem'
                        }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                                Status Management
                            </h3>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {/* Escalate to Supervisor Button */}
                                {complaint.status !== 'resolved' && complaint.status !== 'closed' && complaint.status !== 'awaiting_supervisor' && (
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Are you sure you want to send this to the supervisor for review?')) {
                                                setEscalating(true);
                                                try {
                                                    const response = await fetch(`http://127.0.0.1:5000/api/complaints/${complaint.id}/escalate`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({
                                                            officer_name: officerData?.name || 'Officer'
                                                        })
                                                    });
                                                    const resData = await response.json();
                                                    if (resData.success) {
                                                        alert(`Sent to Supervisor: ${resData.supervisor}`);
                                                        fetchComplaint();
                                                    } else {
                                                        // Handle specific error messages
                                                        const errorMsg = resData.message || resData.error || 'Failed to escalate.';
                                                        alert(errorMsg);
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Error calling escalation API');
                                                } finally {
                                                    setEscalating(false);
                                                }
                                            }
                                        }}
                                        disabled={escalating}
                                        style={{
                                            padding: '0.75rem',
                                            backgroundColor: '#7C3AED',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            cursor: escalating ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            opacity: escalating ? 0.7 : 1
                                        }}
                                    >
                                        <Send className="w-4 h-4" />
                                        {escalating ? 'Sending...' : 'Send to Supervisor'}
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowStatusModal(true)}
                                    style={{
                                        padding: '0.75rem',
                                        backgroundColor: '#1F4E78',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Update Status
                                </button>
                                
                                <button
                                    onClick={() => setShowDuplicateModal(true)}
                                    style={{
                                        padding: '0.75rem',
                                        backgroundColor: '#F59E0B',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    Mark as Duplicate
                                </button>
                                
                                <button
                                    onClick={() => setShowInfoRequestModal(true)}
                                    style={{
                                        padding: '0.75rem',
                                        backgroundColor: 'white',
                                        color: '#1F4E78',
                                        border: '2px solid #1F4E78',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Request Info
                                </button>
                            </div>

                            {/* SLA Information */}
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                backgroundColor: complaint.slaBreached ? '#FEF2F2' : '#F0F9FF',
                                border: `1px solid ${complaint.slaBreached ? '#FECACA' : '#BAE6FD'}`,
                                borderRadius: '0.375rem'
                            }}>
                                <div style={{ 
                                    fontSize: '0.875rem', 
                                    fontWeight: '600', 
                                    color: complaint.slaBreached ? '#DC2626' : '#1E40AF',
                                    marginBottom: '0.5rem' 
                                }}>
                                    SLA Status
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                                    Expected Resolution: {complaint.estimatedResolution}
                                </div>
                                <div style={{ 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600',
                                    color: complaint.slaBreached ? '#DC2626' : '#10B981' 
                                }}>
                                    {complaint.slaBreached ? '⚠️ SLA Breached' : '✅ Within SLA'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem 1.5rem' }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                    border: '1px solid #E3EEF7',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        backgroundColor: '#1F4E78',
                        color: 'white',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Clock className="w-5 h-5" />
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                                Timeline & Audit Trail
                            </h3>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                                value={timelineFilter}
                                onChange={(e) => setTimelineFilter(e.target.value)}
                                style={{
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: 'white',
                                    border: 'none',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem',
                                    color: '#1B3A4B'
                                }}
                            >
                                <option value="all">All Activities</option>
                                <option value="officer">Officer Actions</option>
                                <option value="worker">Worker Updates</option>
                                <option value="system">System Events</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {complaint.timeline.map((event, index) => (
                                <div key={event.id} style={{ 
                                    display: 'flex', 
                                    alignItems: 'start', 
                                    gap: '1rem',
                                    padding: '1rem',
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: '0.375rem',
                                    border: '1px solid #E5E7EB'
                                }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: 
                                            event.type === 'citizen' ? '#10B981' :
                                            event.type === 'officer' ? '#1F4E78' :
                                            event.type === 'worker' ? '#F59E0B' :
                                            '#6B7280',
                                        marginTop: '0.5rem'
                                    }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B', marginBottom: '0.25rem' }}>
                                            {event.action}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>
                                            by {event.actor} • {new Date(event.timestamp).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Internal Notes Section */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem 1.5rem' }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 8px rgba(31, 78, 120, 0.1)',
                    border: '1px solid #E3EEF7',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        backgroundColor: '#F59E0B',
                        color: 'white',
                        padding: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <MessageSquare className="w-5 h-5" />
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                                Internal Notes (Officer Only)
                            </h3>
                        </div>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        {/* Add New Note */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add internal note for other officers..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #E3EEF7',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    resize: 'vertical',
                                    marginBottom: '0.75rem'
                                }}
                            />
                            <button
                                onClick={() => {
                                    if (newNote.trim()) {
                                        // Add note logic here
                                        setNewNote('');
                                    }
                                }}
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
                                <Send className="w-4 h-4" />
                                Add Note
                            </button>
                        </div>

                        {/* Existing Notes */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {complaint.notes.map((note) => (
                                <div key={note.id} style={{
                                    padding: '1rem',
                                    backgroundColor: '#FFFBEB',
                                    border: '1px solid #FDE68A',
                                    borderLeft: '4px solid #F59E0B',
                                    borderRadius: '0.375rem'
                                }}>
                                    <div style={{ fontSize: '0.875rem', color: '#1B3A4B', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                                        {note.content}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                        {note.author} • {new Date(note.timestamp).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Change Modal */}
            {showStatusModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F4E78', margin: 0 }}>
                                Update Status
                            </h3>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6B7280'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                New Status
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #E3EEF7',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem'
                                }}
                            >
                                <option value="">Select new status...</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Pending">Pending</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                Reason for Status Change
                            </label>
                            <textarea
                                value={statusReason}
                                onChange={(e) => setStatusReason(e.target.value)}
                                placeholder="Explain the reason for this status change..."
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #E3EEF7',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: 'white',
                                    color: '#6B7280',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Update status logic here
                                    setShowStatusModal(false);
                                    setNewStatus('');
                                    setStatusReason('');
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#1F4E78',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Gallery Modal */}
            {showPhotoModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        padding: '2rem',
                        maxWidth: '800px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F4E78', margin: 0 }}>
                                Evidence Photos ({complaint.photos.length})
                            </h3>
                            <button
                                onClick={() => setShowPhotoModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6B7280'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                            {complaint.photos.map((photo) => (
                                <div key={photo.id} style={{
                                    border: '1px solid #E3EEF7',
                                    borderRadius: '0.375rem',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '200px',
                                        backgroundColor: '#F3F4F6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#6B7280'
                                    }}>
                                        📷 Photo {photo.id}
                                    </div>
                                    <div style={{ padding: '1rem' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#1B3A4B', fontWeight: '600' }}>
                                            {photo.caption}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* AI Analysis Modal */}
            {showAIModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        padding: '2rem',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F4E78', margin: 0 }}>
                                AI Analysis Report
                            </h3>
                            <button
                                onClick={() => setShowAIModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6B7280'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{
                                padding: '1rem',
                                backgroundColor: '#F0F9FF',
                                border: '1px solid #BAE6FD',
                                borderRadius: '0.375rem'
                            }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1F4E78', marginBottom: '0.5rem' }}>
                                    Confidence Score
                                </div>
                                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>
                                    {complaint.aiAnalysis.confidence}%
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                    Detected Issue Type
                                </div>
                                <div style={{ fontSize: '1rem', color: '#1B3A4B' }}>
                                    {complaint.aiAnalysis.issueType}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                    Detected Objects
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {complaint.aiAnalysis.detectedObjects.map((obj, index) => (
                                        <span key={index} style={{
                                            padding: '0.25rem 0.75rem',
                                            backgroundColor: '#E3EEF7',
                                            color: '#1F4E78',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {obj}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                    Severity Assessment
                                </div>
                                <div style={{ 
                                    fontSize: '1rem', 
                                    fontWeight: '600',
                                    color: complaint.aiAnalysis.severity === 'HIGH' ? '#DC2626' : 
                                          complaint.aiAnalysis.severity === 'MEDIUM' ? '#F59E0B' : '#10B981'
                                }}>
                                    {complaint.aiAnalysis.severity}
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                    AI Recommendation
                                </div>
                                <div style={{ 
                                    fontSize: '0.875rem', 
                                    color: '#1B3A4B',
                                    padding: '1rem',
                                    backgroundColor: '#FFFBEB',
                                    border: '1px solid #FDE68A',
                                    borderRadius: '0.375rem'
                                }}>
                                    {complaint.aiAnalysis.recommendation}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Map View Modal */}
            {showMapModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        padding: '2rem',
                        maxWidth: '800px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F4E78', margin: 0 }}>
                                Location Map
                            </h3>
                            <button
                                onClick={() => setShowMapModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6B7280'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{
                            height: '400px',
                            backgroundColor: '#F3F4F6',
                            borderRadius: '0.375rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ textAlign: 'center', color: '#6B7280' }}>
                                <MapPin className="w-12 h-12 mx-auto mb-2" />
                                <div style={{ fontSize: '1rem', fontWeight: '600' }}>Interactive Map</div>
                                <div style={{ fontSize: '0.875rem' }}>
                                    {complaint.coordinates.lat}°N, {complaint.coordinates.lng}°E
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Address</div>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B' }}>
                                    {complaint.location}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.25rem' }}>Coordinates</div>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B', fontFamily: 'monospace' }}>
                                    {complaint.coordinates.lat}, {complaint.coordinates.lng}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Worker Assignment Modal */}
            {showWorkerModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        padding: '2rem',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F4E78', margin: 0 }}>
                                Assign Worker
                            </h3>
                            <button
                                onClick={() => setShowWorkerModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6B7280'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                Available Workers (Electrical Department)
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {workers.map((worker) => (
                                    <label key={worker.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '1rem',
                                        border: `2px solid ${selectedWorker === worker.id ? '#1F4E78' : '#E5E7EB'}`,
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        backgroundColor: selectedWorker === worker.id ? '#F0F9FF' : 'white'
                                    }}>
                                        <input
                                            type="radio"
                                            name="worker"
                                            value={worker.id}
                                            checked={selectedWorker === worker.id}
                                            onChange={(e) => setSelectedWorker(e.target.value)}
                                            style={{ accentColor: '#1F4E78' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1B3A4B' }}>
                                                {worker.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                                {worker.phone} • Current load: {worker.workload} cases • Rating: {worker.rating}/5
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: '0.25rem 0.75rem',
                                            backgroundColor: worker.workload <= 3 ? '#ECFDF5' : '#FEF3C7',
                                            color: worker.workload <= 3 ? '#059669' : '#D97706',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {worker.workload <= 3 ? 'Available' : 'Busy'}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowWorkerModal(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: 'white',
                                    color: '#6B7280',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Assign worker logic here
                                    setShowWorkerModal(false);
                                    setSelectedWorker('');
                                }}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#10B981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Assign Worker
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Information Request Modal */}
            {showInfoRequestModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1F4E78', margin: 0 }}>
                                Request Additional Information
                            </h3>
                            <button
                                onClick={() => setShowInfoRequestModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6B7280'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                Information Request Message
                            </label>
                            <textarea
                                value={infoRequest}
                                onChange={(e) => setInfoRequest(e.target.value)}
                                placeholder="What additional information do you need from the citizen?"
                                rows={5}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid #E3EEF7',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.5rem' }}>
                                This message will be sent to the citizen via SMS and email.
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowInfoRequestModal(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: 'white',
                                    color: '#6B7280',
                                    border: '2px solid #E5E7EB',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Send info request logic here
                                    setShowInfoRequestModal(false);
                                    setInfoRequest('');
                                }}
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
                                <Send className="w-4 h-4" />
                                Send Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default ComplaintDetail;