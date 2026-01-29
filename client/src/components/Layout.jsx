import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, UploadCloud, FileCheck, History, LogOut, Menu } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <Home size={20} />, roles: ['Admin', 'Analyst', 'Viewer'] },
        { path: '/upload', label: 'Upload Data', icon: <UploadCloud size={20} />, roles: ['Admin', 'Analyst'] },
        { path: '/reconciliation', label: 'Reconciliation', icon: <FileCheck size={20} />, roles: ['Admin', 'Analyst'] },
        { path: '/audit', label: 'Audit Trail', icon: <History size={20} />, roles: ['Admin', 'Analyst'] }
    ];

    return (
        <div className="app-container">
            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <div className="p-6 flex items-center gap-3 h-16" style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <div className="flex items-center gap-2" style={{ overflow: 'hidden' }}>
                        <div style={{ background: 'var(--primary-soft)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                            <FileCheck size={24} style={{ color: 'var(--primary)' }} />
                        </div>
                        {isSidebarOpen && (
                            <span className="text-xl font-bold" style={{ 
                                background: 'linear-gradient(to right, var(--primary), var(--primary-light))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                whiteSpace: 'nowrap'
                            }}>
                                SmartReco
                            </span>
                        )}
                    </div>
                </div>
                
                <nav style={{ flex: 1, paddingTop: '1rem', overflowY: 'auto' }}>
                    {navItems.map((item) => {
                        if (!item.roles.includes(user?.role)) return null;
                        
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                title={!isSidebarOpen ? item.label : ''}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="nav-item-icon">
                                    {item.icon}
                                </span>
                                {isSidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4" style={{ borderTop: '1px solid var(--border-light)', margin: '8px' }}>
                    <div className="flex items-center gap-3" style={{ background: 'var(--background)', padding: '12px', borderRadius: '12px' }}>
                        <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            background: 'linear-gradient(to tr, var(--primary), var(--primary-light))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 8px rgba(124, 58, 237, 0.2)'
                        }}>
                            {user?.username?.[0]?.toUpperCase()}
                        </div>
                        {isSidebarOpen && (
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p className="text-sm font-semibold truncate" style={{ marginBottom: 0 }}>{user?.username}</p>
                                <p className="text-xs font-medium" style={{ color: 'var(--primary)', marginTop: 0 }}>{user?.role}</p>
                            </div>
                        )}
                        {isSidebarOpen && (
                            <button 
                                onClick={logout}
                                style={{ padding: '8px', borderRadius: '8px', color: 'var(--text-muted)' }}
                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = 'var(--danger)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            >
                                <LogOut size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`main-content ${isSidebarOpen ? 'main-content-shifted' : 'main-content-narrow'}`}>
                {/* Header */}
                <header className="top-header">
                     <button onClick={toggleSidebar} className="burger-btn">
                        <Menu size={24} />
                    </button>
                    <div className="text-sm text-text-muted">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                <div className="boxed-wrapper animate-in">
                    {/* "Boxed" Layout Container */}
                    <div className="content-box">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};


export default Layout;
