import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, User, MapPin, Clock, ArrowRight, Home } from 'lucide-react';

const SuccessModal = ({ complaintData }) => {
    const navigate = useNavigate();

    // Extract data from complaint response
    const {
        complaint_id,
        assigned_officer,
        status,
        message
    } = complaintData || {};

    const handleGoToDashboard = () => {
        navigate('/dashboard');
    };

    const handleTrackComplaint = () => {
        navigate(`/complaints/${complaint_id}`);
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#F5F7FA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                maxWidth: '500px',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 20px 60px rgba(31, 78, 120, 0.15)',
                overflow: 'hidden',
                animation: 'slideUp 0.4s ease-out'
            }}>
                {/* Success Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        animation: 'scaleIn 0.5s ease-out 0.2s both'
                    }}>
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        marginBottom: '0.5rem'
                    }}>
                        Complaint Submitted!
                    </h2>
                    <p style={{
                        opacity: 0.9,
                        fontSize: '0.875rem'
                    }}>
                        Your complaint has been registered and assigned
                    </p>
                </div>

                {/* Complaint Details */}
                <div style={{ padding: '1.5rem' }}>
                    {/* Complaint ID */}
                    <div style={{
                        backgroundColor: '#F0FDF4',
                        border: '2px solid #BBF7D0',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '0.75rem',
                            color: '#059669',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            marginBottom: '0.25rem'
                        }}>
                            Complaint ID
                        </div>
                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#047857',
                            fontFamily: 'monospace'
                        }}>
                            {complaint_id}
                        </div>
                    </div>

                    {/* Assigned Officer */}
                    {assigned_officer ? (
                        <div style={{
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #DBEAFE',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'start',
                                gap: '0.75rem'
                            }}>
                                <div style={{
                                    backgroundColor: '#3B82F6',
                                    borderRadius: '0.5rem',
                                    padding: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#3B82F6',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginBottom: '0.25rem'
                                    }}>
                                        Assigned To
                                    </div>
                                    <div style={{
                                        fontWeight: '600',
                                        color: '#1E40AF',
                                        marginBottom: '0.125rem'
                                    }}>
                                        {assigned_officer.name}
                                    </div>
                                    <div style={{
                                        fontSize: '0.875rem',
                                        color: '#60A5FA'
                                    }}>
                                        {assigned_officer.title}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#93C5FD',
                                        marginTop: '0.25rem'
                                    }}>
                                        {assigned_officer.department.charAt(0).toUpperCase() + assigned_officer.department.slice(1)} Department
                                        {assigned_officer.ward && ` • Ward ${assigned_officer.ward}`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            backgroundColor: '#FEF3C7',
                            border: '1px solid #FDE68A',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                fontSize: '0.875rem',
                                color: '#92400E',
                                fontWeight: '500'
                            }}>
                                ⚠️ Awaiting Manual Assignment
                            </div>
                            <div style={{
                                fontSize: '0.75rem',
                                color: '#B45309',
                                marginTop: '0.25rem'
                            }}>
                                An administrator will assign an officer shortly
                            </div>
                        </div>
                    )}

                    {/* Expected Resolution */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                            Expected resolution: <span style={{ fontWeight: '600', color: '#374151' }}>3-5 business days</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            onClick={handleTrackComplaint}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                backgroundColor: '#1F4E78',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.9375rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#153456'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1F4E78'}
                        >
                            Track this Complaint
                            <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handleGoToDashboard}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                backgroundColor: 'white',
                                color: '#1F4E78',
                                border: '2px solid #1F4E78',
                                borderRadius: '0.5rem',
                                fontSize: '0.9375rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#F5F7FA';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                            }}
                        >
                            <Home className="w-4 h-4" />
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes scaleIn {
                    from {
                        transform: scale(0);
                    }
                    to {
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
};

export default SuccessModal;
