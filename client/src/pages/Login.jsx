import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { FileCheck } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(username, password);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
    };

    if (loading) return null;

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div className="text-center mb-8">
                    <div style={{ 
                        inlineFlex: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '56px', 
                        height: '56px', 
                        borderRadius: '16px', 
                        background: 'var(--primary-soft)', 
                        color: 'var(--primary)', 
                        margin: '0 auto 1.5rem',
                        display: 'flex'
                    }}>
                        <FileCheck size={28} />
                    </div>
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-text-muted mt-2">Sign in to SmartReco Portal</p>
                </div>

                {error && (
                    <div className="mb-4 p-3" style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: '10px', fontSize: '0.875rem', border: '1px solid #fecaca' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-semibold text-text-muted mb-2" style={{ display: 'block' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="e.g. admin"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-text-muted mb-2" style={{ display: 'block' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-full mt-4" style={{ height: '52px' }}>
                        Sign In
                    </button>
                </form>
                
                <div className="mt-8 text-center" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                    <p className="text-xs text-text-muted font-medium mb-1">Demo Access:</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>admin / 123456</p>
                </div>
            </div>
        </div>
    );
};


export default Login;
