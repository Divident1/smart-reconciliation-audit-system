import { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Clock, User as UserIcon, ArrowRight } from 'lucide-react';

const AuditPage = () => {
    const { user } = useAuth();
    // For now getting audit logs might need a specific endpoint for "ALL logs" or search.
    // The backend `getAuditLogs` was specific to `recordId` (/api/audit/:recordId).
    // I need a global audit log endpoint or just show a text "Select a record from Reconciliation to view audit trail".
    // Requirement says "Show a timeline view for each record".
    // So the Audit Page in the sidebar might be a bit weird if it doesn't show anything.
    // Let's implement a global fetch in backend? Or simpler:
    // Just allow searching by Transaction ID.
    
    // Actually, I'll update the backend to allow fetching recent logs if no ID?
    // Or just strictly follow "Show a timeline view for each record".
    // I'll add an input to search by Record ID / Transaction ID.
    // But Transaction ID to Record ID mapping is needed.
    
    // For now, let's create a placeholder "Select a record" message and maybe a recent activity list if I had the endpoint.
    // Since I don't have a global audit endpoint, I will just show instructions.
    // OR I can quickly add a `GET /api/audit` endpoint for recent logs.
    // It's better UX. I'll stick to the "Select Record" approach for now to save time, 
    // but maybe implement the UI component `AuditTimeline` that takes `logs`.
    
    // Wait, the prompt requirements say "Audit Timeline (UI)... Visual sequence".
    // use a Timeline component.
    
    // I'll create a `AuditTimeline` component that can represent logs.
    // And in AuditPage, I'll simulate or instructions.
    // Actually, I should probably link from Reconciliation Page "History" button.
    
    // I'll implement `AuditTimeline` component logic inside AuditPage for now.
    
    const [recordId, setRecordId] = useState(new URLSearchParams(window.location.search).get('recordId') || '');
    const [searchId, setSearchId] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchLogs = async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const { data } = await API.get(`/api/audit/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (recordId) fetchLogs(recordId);
    }, [recordId, user.token]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchId) setRecordId(searchId);
    };

    const TimelineItem = ({ log, isLast }) => (
        <div className="flex gap-4 min-h-[100px]">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary z-10 bg-white">
                    <UserIcon size={14} />
                </div>
                {!isLast && <div className="w-0.5 h-full bg-border -my-1"></div>}
            </div>
            <div className="flex-1 pb-8">
                <div className="card p-4 transition-all hover:shadow-md border-l-4 border-l-primary">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-text-main">{log.changedBy?.username || 'System'}</span>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(log.timestamp).toLocaleString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-text-muted font-mono">{log.field}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-danger line-through">{log.oldValue}</span>
                            <ArrowRight size={14} className="text-text-muted" />
                            <span className="text-success font-bold">{log.newValue}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text-main">Audit Timeline</h2>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Enter Record ID..." 
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="w-64 text-sm"
                    />
                    <button type="submit" className="btn btn-primary text-sm py-1">View Timeline</button>
                </form>
            </div>
            
            {!recordId && (
                <div className="card p-12 text-center border-2 border-dashed border-border opacity-60">
                    <Clock size={48} className="mx-auto text-primary/40 mb-4" />
                    <h3 className="text-lg font-medium text-text-main">No Record Selected</h3>
                    <p className="text-text-muted mt-2">
                        Navigate to <strong>Reconciliation</strong> and click the history icon to see the visual audit trail.
                    </p>
                </div>
            )}

            {loading && <div className="text-center py-12 text-text-muted">Loading timeline...</div>}

            {recordId && !loading && logs.length === 0 && (
                <div className="card p-12 text-center">
                    <p className="text-text-muted">No audit logs found for this record.</p>
                </div>
            )}

            <div className="max-w-3xl mx-auto py-4">
                {logs.map((log, index) => (
                    <TimelineItem 
                        key={log._id} 
                        log={log} 
                        isLast={index === logs.length - 1} 
                    />
                ))}
            </div>
        </div>
    );
};

export default AuditPage;
