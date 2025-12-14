
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../utils/language';
import LanguageSelector from '../components/Auth/LanguageSelector';
import LoginForm from '../components/Auth/LoginForm';
import SignupForm from '../components/Auth/SignupForm';

const LoginSignup = () => {
    const { language, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('signup'); // Default to signup for new users
    const navigate = useNavigate();

    // Auto-redirect to dashboard when authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            // Small delay for better UX (shows success state briefly)
            const timer = setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, navigate]);

    // If authenticated, show brief success message before redirect
    if (isAuthenticated) {
        return (
            <div style={{ 
                minHeight: '100vh', 
                backgroundColor: '#F3F4F6', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '1rem' 
            }}>
                <div style={{ 
                    width: '100%', 
                    maxWidth: '450px', 
                    backgroundColor: 'white', 
                    borderRadius: '0.5rem', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
                    padding: '2rem', 
                    textAlign: 'center' 
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
                        {activeTab === 'signup' ? 'Account Created!' : 'Login Successful!'}
                    </h2>
                    <p style={{ color: '#4B5563', marginBottom: '1.5rem' }}>
                        Redirecting to dashboard...
                    </p>
                    <div style={{
                        width: '3rem',
                        height: '3rem',
                        border: '4px solid #E5E7EB',
                        borderTopColor: '#10B981',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                    <style>{`
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{ backgroundColor: 'white', padding: '1rem 1.5rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
                        🧞
                    </div>
                     <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>GrievanceGenie</h1>
                        <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>Fix Your City in Minutes</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <LanguageSelector />
                    {/* Officer Login Button */}
                    <button
                        onClick={() => navigate('/officer/login')}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#1F4E78',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#153456';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#1F4E78';
                        }}
                    >
                        🏛️ Officer Login
                    </button>
                    {/* Theme Toggle - Placeholder */}
                    {/* <button>🌙</button> */}
                </div>
            </header>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                <div style={{ width: '100%', maxWidth: '450px', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
                         <button
                            onClick={() => setActiveTab('signup')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                border: 'none',
                                borderBottom: activeTab === 'signup' ? '2px solid #10B981' : 'none',
                                backgroundColor: activeTab === 'signup' ? '#F9FAFB' : 'white',
                                color: activeTab === 'signup' ? '#10B981' : '#6B7280',
                                fontWeight: activeTab === 'signup' ? '600' : '400',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {getTranslation(language, 'signup')}
                        </button>
                        <button
                            onClick={() => setActiveTab('login')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                border: 'none',
                                borderBottom: activeTab === 'login' ? '2px solid #10B981' : 'none',
                                backgroundColor: activeTab === 'login' ? '#F9FAFB' : 'white',
                                color: activeTab === 'login' ? '#10B981' : '#6B7280',
                                fontWeight: activeTab === 'login' ? '600' : '400',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {getTranslation(language, 'login')}
                        </button>
                    </div>

                    {/* Form Container */}
                    <div style={{ padding: '1.5rem' }}>
                        {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
                    </div>

                    {/* Footer Links */}
                    <div style={{ backgroundColor: '#F9FAFB', padding: '1rem', textAlign: 'center', borderTop: '1px solid #E5E7EB' }}>
                        {activeTab === 'login' ? (
                             <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
                                New user? <br/>
                                <button 
                                    onClick={() => setActiveTab('signup')}
                                    style={{ color: '#10B981', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600', marginTop: '0.25rem' }}
                                >
                                    Sign up now →
                                </button>
                             </p>
                        ) : (
                            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>
                                Already have account? <br/>
                                 <button 
                                    onClick={() => setActiveTab('login')}
                                    style={{ color: '#10B981', border: 'none', background: 'none', cursor: 'pointer', fontWeight: '600', marginTop: '0.25rem' }}
                                >
                                    Login here →
                                </button>
                             </p>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ backgroundColor: 'white', padding: '1rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.75rem', borderTop: '1px solid #E5E7EB' }}>
                 <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: 0 }}>
                    🔒 {getTranslation(language, 'privacy')}
                 </p>
            </footer>
        </div>
    );
};

export default LoginSignup;
