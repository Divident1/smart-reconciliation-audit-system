import { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, File, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const UploadPage = () => {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [dragging, setDragging] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [step, setStep] = useState(1); // 1: Select, 2: Map & Preview
    const [headers, setHeaders] = useState([]);
    const [previewRows, setPreviewRows] = useState([]);
    const [mapping, setMapping] = useState({
        transactionId: '',
        amount: '',
        referenceNumber: '',
        date: ''
    });

    const fetchJobs = async () => {
        try {
            const { data } = await API.get('/api/upload', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setJobs(data);
        } catch (error) {
            console.error('Error fetching jobs', error);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [user.token]);

    const handleFileSelect = (selectedFile) => {
        setFile(selectedFile);
        parseFilePreview(selectedFile);
    };

    const parseFilePreview = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = text.split('\n').map(row => row.split(','));
            if (rows.length > 0) {
                const cols = rows[0].map(h => h.trim());
                setHeaders(cols);
                setPreviewRows(rows.slice(1, 21)); // First 20 rows
                
                // Auto-map if possible
                const newMapping = { ...mapping };
                cols.forEach(col => {
                    const c = col.toLowerCase();
                    if (c.includes('id')) newMapping.transactionId = col;
                    if (c.includes('amount')) newMapping.amount = col;
                    if (c.includes('ref')) newMapping.referenceNumber = col;
                    if (c.includes('date')) newMapping.date = col;
                });
                setMapping(newMapping);
                setStep(2);
            }
        };
        reader.readAsText(file.slice(0, 10000)); // Read first 10KB
    };

    const handleUpload = async () => {
        if (!file) return;

        // Validate mapping
        if (!mapping.transactionId || !mapping.amount || !mapping.referenceNumber || !mapping.date) {
            setMessage('Please map all mandatory fields.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('mapping', JSON.stringify(mapping));

        setUploading(true);
        setMessage('');

        try {
            await API.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                }
            });
            setMessage('File uploaded successfully! Processing started.');
            setFile(null);
            setStep(1);
            fetchJobs();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-main">Upload Transaction Data</h2>

            {step === 1 ? (
                <div 
                    className={`card border-2 border-dashed p-10 flex flex-col items-center justify-center text-center transition-colors ${
                        dragging ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
                    }}
                >
                    <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
                        <UploadCloud size={40} />
                    </div>
                    
                    <h3 className="text-lg font-medium text-text-main mb-2">Drag & Drop file here</h3>
                    <p className="text-text-muted text-sm mb-4">or click to browse (CSV, Excel)</p>
                    <input 
                        type="file" 
                        id="fileInput" 
                        className="hidden" 
                        accept=".csv, .xlsx, .xls"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                    />
                    <label htmlFor="fileInput" className="btn btn-primary cursor-pointer">
                        Browse Files
                    </label>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="card p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold">Step 2: Column Mapping</h3>
                            <button onClick={() => setStep(1)} className="text-sm text-primary hover:underline">Change File</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {['transactionId', 'amount', 'referenceNumber', 'date'].map(field => (
                                <div key={field} className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-text-muted">
                                        {field.replace(/([A-Z])/g, ' $1')} <span className="text-danger">*</span>
                                    </label>
                                    <select 
                                        value={mapping[field]} 
                                        onChange={(e) => setMapping({...mapping, [field]: e.target.value})}
                                        className="w-full text-sm"
                                    >
                                        <option value="">-- Select Column --</option>
                                        {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <h4 className="text-sm font-bold mb-2">File Preview (First 20 rows)</h4>
                            <div className="overflow-x-auto border border-border rounded">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 border-b border-border">
                                        <tr>
                                            {headers.map((h, i) => <th key={i} className="p-2 min-w-[100px]">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewRows.map((row, i) => (
                                            <tr key={i} className="border-b border-border/50">
                                                {row.map((cell, j) => <td key={j} className="p-2 truncate max-w-[150px]">{cell}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => setStep(1)} className="btn bg-slate-100">Cancel</button>
                            <button onClick={handleUpload} disabled={uploading} className="btn btn-primary px-8">
                                {uploading ? 'Processing...' : 'Submit & Reconcile'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {message.includes('success') ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <p className="text-sm font-medium">{message}</p>
                </div>
            )}

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-text-main">Recent Uploads</h3>
                <div className="card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-border text-sm text-text-muted">
                                <th className="p-4 font-medium">Filename</th>
                                <th className="p-4 font-medium">Date</th>
                                <th className="p-4 font-medium">Records</th>
                                <th className="p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {jobs.map((job) => (
                                <tr key={job._id} className="hover:bg-slate-50/50">
                                    <td className="p-4 text-text-main font-medium flex items-center gap-2">
                                        <File size={16} className="text-text-muted" />
                                        {job.filename}
                                    </td>
                                    <td className="p-4 text-text-muted text-sm">
                                        {new Date(job.createdAt).toLocaleDateString()} {new Date(job.createdAt).toLocaleTimeString()}
                                    </td>
                                    <td className="p-4 text-text-main">{job.totalRecords}</td>
                                    <td className="p-4">
                                        <span className={`badge ${
                                            job.status === 'Completed' ? 'badge-success' : 
                                            job.status === 'Failed' ? 'badge-danger' : 'badge-warning'
                                        } flex items-center w-fit gap-1`}>
                                            {job.status === 'Completed' && <CheckCircle size={12} />}
                                            {job.status === 'Failed' && <AlertCircle size={12} />}
                                            {job.status === 'Processing' && <Loader size={12} className="animate-spin" />}
                                            {job.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {jobs.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-text-muted">No uploads yet</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;
