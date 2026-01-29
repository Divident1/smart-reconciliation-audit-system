import { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { FileStack, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const COLORS = ['#7c3aed', '#f59e0b', '#ef4444', '#94a3b8'];

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        status: '',
        userId: ''
    });

    const fetchStats = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.status) params.append('status', filters.status);
            if (filters.userId) params.append('userId', filters.userId);

            const { data } = await API.get(`/api/dashboard/stats?${params.toString()}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [user.token, filters]);

    const handleReset = () => {
        setFilters({ startDate: '', endDate: '', status: '', userId: '' });
    };

    if (loading) return <div className="p-8 text-center text-text-muted">Loading dashboard...</div>;

    const pieData = stats ? [
        { name: 'Matched', value: stats.matched },
        { name: 'Partial', value: stats.partiallyMatched },
        { name: 'Duplicate', value: stats.duplicate },
        { name: 'Unmatched', value: stats.unmatched }
    ].filter(d => d.value > 0) : [];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Dashboard <span className="text-[10px] font-normal text-text-muted bg-slate-100 px-2 py-0.5 rounded ml-2"></span></h2>
                    <p className="text-text-muted">Overview of your reconciliation status</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleReset} className="btn bg-slate-100 text-text-main">
                        Reset Filters
                    </button>
                    <button onClick={fetchStats} className="btn bg-primary text-white">
                        <RefreshCw size={18} className="mr-2 inline" /> Refresh
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card p-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-text-muted uppercase">Start Date</label>
                    <input 
                        type="date" 
                        value={filters.startDate} 
                        onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                        className="text-sm"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-text-muted uppercase">End Date</label>
                    <input 
                        type="date" 
                        value={filters.endDate} 
                        onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                        className="text-sm"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-text-muted uppercase">Match Status</label>
                    <select 
                        value={filters.status} 
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="text-sm"
                    >
                        <option value="">All Statuses</option>
                        <option value="Matched">Matched</option>
                        <option value="Partially Matched">Partially Matched</option>
                        <option value="Duplicate">Duplicate</option>
                        <option value="Unmatched">Unmatched</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-text-muted uppercase">User ID</label>
                    <input 
                        type="text" 
                        placeholder="Search by User ID..." 
                        value={filters.userId} 
                        onChange={(e) => setFilters({...filters, userId: e.target.value})}
                        className="text-sm"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid-stats">
                <div className="card" style={{ borderLeft: '4px solid var(--primary-light)' }}>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                            <FileStack size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">Total Records</p>
                            <h3 className="text-2xl font-bold">{stats?.totalRecords || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">Matched</p>
                            <h3 className="text-2xl font-bold">{stats?.matched || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">Reconciliation Rate</p>
                            <h3 className="text-2xl font-bold">{(stats?.accuracy || 0).toFixed(1)}%</h3>
                        </div>
                    </div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-text-muted">Mismatch/Dup</p>
                            <h3 className="text-2xl font-bold">
                                {(stats?.unmatched || 0) + (stats?.duplicate || 0) + (stats?.partiallyMatched || 0)}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="card" style={{ flex: 1 }}>
                    <h3 className="text-lg font-semibold mb-4 text-text-main">Reconciliation Breakdown</h3>
                    <div style={{ height: '300px' }}>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-text-muted">No data available</div>
                    )}
                    </div>
                </div>
                
                <div className="card" style={{ flex: 1 }}>
                    <h3 className="text-lg font-semibold mb-4 text-text-main">Status Overview</h3>
                     <div style={{ height: '300px' }}>
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pieData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
                                    <Tooltip 
                                        cursor={{fill: 'var(--primary-soft)'}} 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)' }}
                                    />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-muted">No data available</div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="card" style={{ borderLeft: '4px solid var(--primary)', background: 'var(--primary-soft)' }}>
                 <h3 className="font-semibold text-lg mb-2">Getting Started</h3>
                 <p className="text-text-muted text-sm" style={{ lineHeight: '1.6' }}>
                     To perform reconciliation, go to the <strong>Upload Data</strong> section and upload your transaction files.
                     Our AI-driven engine will automatically cross-reference IDs, amounts, and reference numbers to identify 
                     exact matches, partial matches, and duplicates within seconds.
                 </p>
            </div>
        </div>
    );
};

export default Dashboard;
