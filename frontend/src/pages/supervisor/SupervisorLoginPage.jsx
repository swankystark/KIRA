import React, { useState } from 'react';
import { Building2, UserCog, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupervisorLoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        supervisor_id: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            console.log('🔐 Supervisor Login attempt:', formData.supervisor_id);

            const response = await fetch('http://127.0.0.1:5000/api/supervisor/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Supervisor logged in successfully!');
                // Store supervisor data
                localStorage.setItem('supervisor', JSON.stringify(data.supervisor));
                navigate('/supervisor/dashboard');
            } else {
                setError(data.detail || 'Login failed. Please check credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Unable to connect to server. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F0F4F8',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    backgroundColor: '#1F4E78',
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem auto'
                    }}>
                        <ShieldCheck size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        Supervisor Portal
                    </h1>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                        Review & Approve Resolutions
                    </p>
                </div>

                {/* Login Form */}
                <div style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                padding: '0.75rem',
                                backgroundColor: '#FEF2F2',
                                color: '#991B1B',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                marginBottom: '1.5rem',
                                border: '1px solid #FCA5A5'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                Supervisor ID
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF'
                                }}>
                                    <UserCog size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={formData.supervisor_id}
                                    onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
                                    placeholder="e.g. sup_garbage_01"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9CA3AF'
                                }}>
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Enter verification code"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                        border: '1px solid #D1D5DB',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                backgroundColor: '#1F4E78',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'Accessing Secure Portal...' : (
                                <>
                                    Login to Dashboard <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                            UNIFIED MUNICIPAL PLATFORM • SUPERVISOR ACCESS
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupervisorLoginPage;
