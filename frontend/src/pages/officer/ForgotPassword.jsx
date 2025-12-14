import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock password reset - replace with real API call
        setTimeout(() => {
            setIsSubmitted(true);
            setIsLoading(false);
        }, 1500);
    };

    if (isSubmitted) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                backgroundColor: '#F5F7FA',
                display: 'flex',
                flexDirection: 'column'
            }}>
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
                                    Officer Portal • Password Reset
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                <div style={{ 
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '400px',
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 12px rgba(31, 78, 120, 0.15)',
                        border: '1px solid #E3EEF7',
                        padding: '2rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: '#ECFDF5',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem auto'
                        }}>
                            <Mail className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0', color: '#1B3A4B' }}>
                            Reset Link Sent
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            We've sent a password reset link to <strong>{email}</strong>. 
                            Please check your email and follow the instructions to reset your password.
                        </p>
                        <button
                            onClick={() => navigate('/officer/login')}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                backgroundColor: '#1F4E78',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '0.025em',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#F5F7FA',
            display: 'flex',
            flexDirection: 'column'
        }}>
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
                                Officer Portal • Password Reset
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/officer/login')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: 'transparent',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ 
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 12px rgba(31, 78, 120, 0.15)',
                    border: '1px solid #E3EEF7',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        backgroundColor: '#1F4E78',
                        color: 'white',
                        padding: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: '#F77F00',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem auto'
                        }}>
                            <Mail className="w-8 h-8 text-white" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                            FORGOT PASSWORD
                        </h2>
                        <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: '0.5rem 0 0 0' }}>
                            Enter your email to reset password
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#1B3A4B',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.025em'
                            }}>
                                Officer Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your registered email"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        border: '2px solid #E3EEF7',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        backgroundColor: 'white',
                                        color: '#1B3A4B',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#1F4E78'}
                                    onBlur={(e) => e.target.style.borderColor = '#E3EEF7'}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                background: isLoading ? '#9CA3AF' : 'linear-gradient(135deg, #1F4E78 0%, #153456 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '0.025em',
                                transition: 'all 0.2s',
                                marginBottom: '1rem'
                            }}
                        >
                            {isLoading ? 'SENDING RESET LINK...' : 'SEND RESET LINK'}
                        </button>

                        <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6B7280' }}>
                            Remember your password?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/officer/login')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#1F4E78',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;