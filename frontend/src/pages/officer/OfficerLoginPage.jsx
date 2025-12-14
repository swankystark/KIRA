import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, ChevronDown, ArrowLeft } from 'lucide-react';

const OfficerLoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        officerId: '',
        password: '',
        role: 'Department Officer'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const roles = [
        'Department Officer',
        'Nodal Officer', 
        'Zonal Officer'
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError(''); // Clear error when user types
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        console.log('🔐 Login attempt:', formData.officerId);

        try {
            // Call real API
            const formDataObj = new FormData();
            formDataObj.append('officer_id', formData.officerId);
            formDataObj.append('password', formData.password);
            
            console.log('📡 Calling API: http://127.0.0.1:5000/api/officer/login');

            const response = await fetch('http://127.0.0.1:5000/api/officer/login', {
                method: 'POST',
                body: formDataObj
            });
            
            console.log('📡 API Response status:', response.status);

            const data = await response.json();
            console.log('📡 API Response data:', data);

            if (!response.ok) {
                throw new Error(data.detail || 'Login failed');
            }

            // Store officer session to correct key
            console.log('💾 Storing to localStorage:', data.officer);
            localStorage.setItem('officer', JSON.stringify(data.officer));
            
            // Verify storage
            const stored = localStorage.getItem('officer');
            console.log('💾 Verified storage:', stored);
            console.log('✅ Officer logged in successfully!');
            
            // Navigate to dashboard
            navigate('/officer/dashboard');
        } catch (err) {
            console.error('❌ Login error:', err);
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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
                    {/* Logo - Click to home */}
                    <div 
                        onClick={() => navigate('/')}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{
                            width: '50px',
                            height: '50px',
                            backgroundColor: '#F77F00',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            🏛️
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
                                UNIFIED MUNICIPAL PLATFORM
                            </h1>
                            <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>
                                Officer Portal • Official Officer Portal
                            </p>
                        </div>
                    </div>

                    {/* Back to Citizen Portal */}
                    <button
                        onClick={() => navigate('/citizen/login')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1rem',
                            backgroundColor: 'transparent',
                            border: '2px solid white',
                            borderRadius: '0.375rem',
                            color: 'white',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.color = '#1F4E78';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = 'white';
                        }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Citizen Portal
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
                    maxWidth: '450px',
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    boxShadow: '0 8px 24px rgba(31, 78, 120, 0.15)',
                    border: '1px solid #E3EEF7',
                    overflow: 'hidden'
                }}>
                    {/* Header */}
                    <div style={{
                        backgroundColor: '#1F4E78',
                        color: 'white',
                        padding: '2rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            backgroundColor: '#F77F00',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem auto'
                        }}>
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
                            Officer Login
                        </h2>
                        <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>
                            Municipal Corporation Portal Access
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} style={{ padding: '2rem' }}>
                        {error && (
                            <div style={{
                                backgroundColor: '#FEF2F2',
                                border: '1px solid #FECACA',
                                borderRadius: '0.375rem',
                                padding: '0.75rem',
                                marginBottom: '1.5rem',
                                color: '#DC2626',
                                fontSize: '0.875rem'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Officer ID / Email */}
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
                                Officer ID / Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User className="w-5 h-5 text-gray-400" style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }} />
                                <input
                                    type="text"
                                    value={formData.officerId}
                                    onChange={(e) => handleInputChange('officerId', e.target.value)}
                                    placeholder="Enter your Officer ID or Email"
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

                        {/* Password */}
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
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock className="w-5 h-5 text-gray-400" style={{
                                    position: 'absolute',
                                    left: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }} />
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder="Enter your password"
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

                        {/* Role Dropdown */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#1B3A4B',
                                marginBottom: '0.5rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.025em'
                            }}>
                                Role (Optional)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={formData.role}
                                    onChange={(e) => handleInputChange('role', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #E3EEF7',
                                        borderRadius: '0.375rem',
                                        fontSize: '0.875rem',
                                        backgroundColor: 'white',
                                        color: '#1B3A4B',
                                        outline: 'none',
                                        appearance: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-5 h-5 text-gray-400" style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none'
                                }} />
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                backgroundColor: isLoading ? '#9CA3AF' : '#1F4E78',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '0.025em',
                                transition: 'all 0.2s',
                                marginBottom: '1rem'
                            }}
                            onMouseOver={(e) => {
                                if (!isLoading) {
                                    e.target.style.backgroundColor = '#153456';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (!isLoading) {
                                    e.target.style.backgroundColor = '#1F4E78';
                                }
                            }}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>

                        {/* Forgot Password Link */}
                        <div style={{ textAlign: 'center' }}>
                            <button
                                type="button"
                                onClick={() => navigate('/officer/forgot-password')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#1F4E78',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                Forgot password?
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OfficerLoginPage;