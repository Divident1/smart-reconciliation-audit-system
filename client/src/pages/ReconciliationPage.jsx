import { useState, useEffect } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, AlertTriangle, Edit2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import CorrectionModal from '../components/CorrectionModal';

const ReconciliationPage = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState('');
    const [results, setResults] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingRecord, setEditingRecord] = useState(null);

    // Fetch jobs on mount
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const { data } = await API.get('/api/upload', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setJobs(data);
                if (data.length > 0) setSelectedJob(data[0]._id);
            } catch (error) {
                console.error(error);
            }
        };
        fetchJobs();
    }, [user.token]);

    // Fetch results when job or page changes
    useEffect(() => {
        if (!selectedJob) return;
        fetchResults();
        fetchStats();
    }, [selectedJob, page]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/api/reconciliation/${selectedJob}?pageNumber=${page}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setResults(data.results);
            setTotalPages(data.pages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
         try {
            const { data } = await API.get(`/api/reconciliation/${selectedJob}/stats`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setStats(data);
        } catch (error) {
            console.error(error);
        }
    };

    const StatusBadge = ({ status }) => {
        const config = {
            'Matched': { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
            'Partially Matched': { color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
            'Duplicate': { color: 'bg-red-100 text-red-700', icon: AlertCircle },
            'Not Matched': { color: 'bg-slate-100 text-slate-700', icon: AlertCircle }, // Unmatched
            'Unmatched': { color: 'bg-slate-100 text-slate-700', icon: AlertCircle }
        };
        const style = config[status] || config['Unmatched'];
        const Icon = style.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.color}`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-text-main">Reconciliation Results</h2>
                
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-text-muted">Select Upload:</span>
                    <select 
                        value={selectedJob} 
                        onChange={(e) => { setSelectedJob(e.target.value); setPage(1); }}
                        className="w-64 text-sm"
                    >
                        {jobs.map(job => (
                            <option key={job._id} value={job._id}>
                                {job.filename} - {new Date(job.createdAt).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="card p-4 text-center">
                        <p className="text-xs text-text-muted uppercase font-bold">Total</p>
                        <p className="text-xl font-bold">{stats.Total}</p>
                    </div>
                    <div className="card p-4 text-center border-b-4 border-emerald-400">
                        <p className="text-xs text-text-muted uppercase font-bold">Matched</p>
                        <p className="text-xl font-bold text-emerald-600">{stats.Matched}</p>
                    </div>
                    <div className="card p-4 text-center border-b-4 border-amber-400">
                        <p className="text-xs text-text-muted uppercase font-bold">Partial</p>
                        <p className="text-xl font-bold text-amber-600">{stats['Partially Matched']}</p>
                    </div>
                    <div className="card p-4 text-center border-b-4 border-red-400">
                        <p className="text-xs text-text-muted uppercase font-bold">Duplicate</p>
                        <p className="text-xl font-bold text-red-600">{stats.Duplicate}</p>
                    </div>
                    <div className="card p-4 text-center border-b-4 border-slate-400">
                        <p className="text-xs text-text-muted uppercase font-bold">Unmatched</p>
                        <p className="text-xl font-bold text-slate-600">{stats['Not Matched'] || stats['Unmatched'] || 0}</p>
                    </div>
                </div>
            )}

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-border text-xs uppercase text-text-muted font-semibold">
                                <th className="p-4">Transaction ID</th>
                                <th className="p-4">Reference</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Notes</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center">Loading...</td></tr>
                            ) : results.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-text-muted">No records found</td></tr>
                            ) : (
                                results.map((res) => {
                                    const isPartial = res.status === 'Partially Matched';
                                    const amountDiffers = isPartial && res.systemRecordId && Math.abs(res.recordId.amount - res.systemRecordId.amount) > 0.01;
                                    
                                    return (
                                        <tr key={res._id} className={`hover:bg-slate-50/50 ${isPartial ? 'bg-amber-50/20' : ''}`}>
                                            <td className="p-4 font-mono text-xs">{res.recordId.transactionId}</td>
                                            <td className="p-4">{res.recordId.referenceNumber}</td>
                                            <td className={`p-4 font-medium ${amountDiffers ? 'text-danger flex items-center gap-1' : ''}`}>
                                                ${res.recordId.amount.toFixed(2)}
                                                {amountDiffers && <AlertTriangle size={12} title={`System: $${res.systemRecordId.amount}`} />}
                                            </td>
                                            <td className="p-4 text-text-muted">{new Date(res.recordId.date).toLocaleDateString()}</td>
                                            <td className="p-4"><StatusBadge status={res.status} /></td>
                                            <td className="p-4 text-text-muted max-w-xs truncate" title={res.notes}>{res.notes}</td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <Link 
                                                    to={`/audit?recordId=${res.recordId._id}`}
                                                    className="p-1 text-text-muted hover:text-primary rounded"
                                                    title="View Timeline"
                                                >
                                                    <Clock size={16} />
                                                </Link>
                                                <button 
                                                    onClick={() => setEditingRecord(res)}
                                                    className="p-1 text-primary hover:bg-primary/10 rounded"
                                                    title="Correct Record"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="border-t border-border p-4 flex items-center justify-between">
                    <button 
                        disabled={page === 1} 
                        onClick={() => setPage(p => p - 1)}
                        className="btn bg-white border border-border disabled:opacity-50"
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>
                    <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
                     <button 
                        disabled={page === totalPages} 
                        onClick={() => setPage(p => p + 1)}
                        className="btn bg-white border border-border disabled:opacity-50"
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {editingRecord && (
                <CorrectionModal 
                    record={editingRecord} 
                    token={user.token} 
                    onClose={() => setEditingRecord(null)} 
                    onUpdate={() => { fetchResults(); fetchStats(); }}
                />
            )}
        </div>
    );
};

export default ReconciliationPage;
