import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Lock, User, Terminal } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden">

            {/* Background decoration */}
            <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="card w-full max-w-md p-8 relative z-10 backdrop-blur-sm bg-dark-card/90">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-brand-500/20 p-3 rounded-xl mb-4 text-brand-500 ring-1 ring-brand-500/50 shadow-[0_0_15px_rgba(20,184,166,0.5)]">
                        <Package size={32} />
                    </div>
                    <h1 className="text-2xl font-bold font-sans tracking-tight text-white mb-2">Inventory System</h1>
                    <p className="text-dark-muted text-sm text-center">Sign in to your account</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-6 text-sm flex items-start">
                        <Terminal size={16} className="mt-0.5 mr-2 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-dark-text text-sm font-medium mb-1.5" htmlFor="username">
                            Username
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-muted">
                                <User size={18} />
                            </div>
                            <input
                                id="username"
                                type="text"
                                className="input-field pl-10"
                                placeholder="admin"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-dark-text text-sm font-medium mb-1.5" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-muted">
                                <Lock size={18} />
                            </div>
                            <input
                                id="password"
                                type="password"
                                className="input-field pl-10"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex justify-center items-center mt-2 group relative overflow-hidden"
                    >
                        {loading ? (
                            <span className="animate-spin inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
                        ) : (
                            <span className="relative z-10 flex items-center">
                                Sign In
                            </span>
                        )}
                        <div className="absolute inset-0 h-full w-full scale-0 rounded-md bg-white/20 transition-all duration-300 group-active:scale-100"></div>
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-dark-border pt-4">
                    <p className="text-xs text-dark-muted">For demo: user <strong>admin</strong>, pass <strong>admin123</strong></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
