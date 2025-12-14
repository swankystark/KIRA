import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, Clock, MapPin, User, FileText, CheckCircle2, 
    XCircle, AlertTriangle, Send
} from 'lucide-react';

const SupervisorComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [supervisor, setSupervisor] = useState(null);
    const [actionModal, setActionModal] = useState(null); // 'reject' | 'escalate'
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem('supervisor');
        if (!session) {
            navigate('/supervisor/login');
            return;
        }
        setSupervisor(JSON.parse(session));
        fetchComplaint();
    }, [id, navigate]);

    const fetchComplaint = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/complaints/${id}`);
            const data = await response.json();
            setComplaint(data);
        } catch (error) {
            console.error('Failed to fetch complaint:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        if (action === 'REJECT' && !notes.trim()) {
            alert('Please provide remarks for sending back to officer.');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/complaints/${id}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    notes: notes,
                    supervisor_name: supervisor.name
                })
            });
            
            const data = await response.json();
            if (data.success) {
                alert(action === 'APPROVE' ? 'Resolution Approved!' : 'Sent back to officer.');
                navigate('/supervisor/dashboard');
            }
        } catch (error) {
            console.error('Action failed:', error);
            alert('Failed to process action.');
        } finally {
            setSubmitting(false);
            setActionModal(null);
        }
    };

    if (loading || !complaint) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F3F4F6' }}>
            Loading details...
        </div>
    );

    const isOverdue = complaint.supervisor_deadline && new Date() > new Date(complaint.supervisor_deadline);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', paddingBottom: '4rem' }}>
            {/* Header */}
            <div style={{ backgroundColor: '#1F4E78', color: 'white', padding: '1.5rem 2rem', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => navigate('/supervisor/dashboard')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Complaint Review</h1>
                            <p style={{ fontSize: '0.875rem', opacity: '0.9' }}>ID: {complaint.complaint_id}</p>
                        </div>
                    </div>
                    {isOverdue && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FEF2F2', color: '#DC2626', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: '600' }}>
                            <Clock size={16} /> OVERDUE
                        </div>
                    )}
                </div>
            </div>

            <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                
                {/* Left Column: Complaint Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Image & Description */}
                    <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        {complaint.image_url && (
                            <div style={{ height: '300px', backgroundColor: '#E5E7EB', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <img 
                                    src={`http://127.0.0.1:5000${complaint.image_url}`} 
                                    alt="Complaint Evidence"
                                    style={{ height: '100%', width: '100%', objectFit: 'contain' }}
                                />
                            </div>
                        )}
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>Description</h3>
                            <p style={{ color: '#374151', lineHeight: '1.6' }}>{complaint.description}</p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={20} /> Action Timeline
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {(complaint.timeline || []).map((event, index) => (
                                <div key={index} style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3B82F6', marginTop: '0.375rem' }} />
                                        {index < (complaint.timeline || []).length - 1 && (
                                            <div style={{ width: '2px', flex: 1, backgroundColor: '#E5E7EB', margin: '0.25rem 0' }} />
                                        )}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>{event.action.replace(/_/g, ' ').toUpperCase()}</p>
                                        <p style={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                            {new Date(event.timestamp || event.datetime).toLocaleString()} • by {event.actor}
                                        </p>
                                        {event.details && (
                                            <p style={{ marginTop: '0.25rem', color: '#374151', fontSize: '0.875rem', backgroundColor: '#F3F4F6', padding: '0.5rem', borderRadius: '0.375rem' }}>
                                                {event.details}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!complaint.timeline || complaint.timeline.length === 0) && (
                                <p style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No timeline events recorded.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Meta & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Meta Info */}
                    <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem' }}>
                         <div style={{ marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>Category</p>
                            <p style={{ fontSize: '1rem', fontWeight: '500', color: '#111827' }}>{complaint.category}</p>
                        </div>
                         <div style={{ marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>Severity</p>
                            <span style={{ 
                                display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: '600',
                                backgroundColor: complaint.severity === 'High' ? '#FEF2F2' : '#EFF6FF',
                                color: complaint.severity === 'High' ? '#DC2626' : '#1D4ED8'
                            }}>
                                {complaint.severity}
                            </span>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>Citizen</p>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <User size={16} color="#6B7280" />
                                <p style={{ fontSize: '0.95rem', color: '#111827' }}>{complaint.citizen?.name || 'Anonymous'}</p>
                            </div>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>Location</p>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                <MapPin size={16} color="#6B7280" style={{ flexShrink: 0 }} />
                                <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.4' }}>{complaint.location?.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Panel */}
                    <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '1.5rem', borderTop: '4px solid #1F4E78' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: '#1F4E78' }}>Supervisor Action</h3>
                        
                        {complaint.supervisor_status === 'APPROVED' ? (
                            <div style={{ padding: '1rem', backgroundColor: '#ECFDF5', border: '1px solid #10B981', borderRadius: '0.5rem', textAlign: 'center', color: '#047857', fontWeight: '600' }}>
                                ✓ Already Approved
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <button
                                    onClick={() => handleAction('APPROVE')}
                                    disabled={submitting}
                                    style={{
                                        padding: '0.875rem', borderRadius: '0.5rem', border: 'none',
                                        backgroundColor: '#059669', color: 'white', fontWeight: '600',
                                        cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <CheckCircle2 size={18} /> Approve Resolution
                                </button>
                                
                                <button
                                    onClick={() => setActionModal('reject')}
                                    disabled={submitting}
                                    style={{
                                        padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid #DC2626',
                                        backgroundColor: 'white', color: '#DC2626', fontWeight: '600',
                                        cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <XCircle size={18} /> Send Back to Officer
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal for Reject Reason */}
            {actionModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', width: '90%', maxWidth: '500px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                            {actionModal === 'reject' ? 'Send Back to Officer' : 'Escalate Complaint'}
                        </h3>
                        <p style={{ marginBottom: '1rem', color: '#6B7280' }}>
                            Please provide remarks for this action. This will be visible to the officer.
                        </p>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Enter notes/remarks here..."
                            rows={4}
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #D1D5DB',
                                marginBottom: '1.5rem', fontFamily: 'inherit', resize: 'vertical'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button 
                                onClick={() => setActionModal(null)}
                                style={{ padding: '0.5rem 1rem', border: 'none', background: 'none', color: '#6B7280', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(actionModal === 'reject' ? 'REJECT' : 'ESCALATE')}
                                style={{
                                    padding: '0.5rem 1.5rem', backgroundColor: '#DC2626', color: 'white',
                                    border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Confirm Action
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupervisorComplaintDetail;
