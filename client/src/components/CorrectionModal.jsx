import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const CorrectionModal = ({ record, onClose, onUpdate, token }) => {
    const [amount, setAmount] = useState(record.recordId.amount);
    const [referenceNumber, setReferenceNumber] = useState(record.recordId.referenceNumber);
    const [notes, setNotes] = useState(record.notes || '');
    const [updating, setUpdating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await axios.put(`/api/reconciliation/record/${record.recordId._id}`, 
                { amount, referenceNumber, notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onUpdate();
            onClose();
        } catch (error) {
            console.error('Update failed', error);
            alert('Update failed');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-surface rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-main">
                    <X size={20} />
                </button>
                
                <h3 className="text-lg font-bold mb-4">Correct Record</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Transaction ID</label>
                        <input type="text" value={record.recordId.transactionId} disabled className="bg-slate-100" />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <input 
                            type="number" 
                            step="0.01"
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Reference Number</label>
                        <input 
                            type="text" 
                            value={referenceNumber} 
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1">Notes (Audit Purpose)</label>
                        <textarea 
                            value={notes} 
                            onChange={(e) => setNotes(e.target.value)}
                            className="h-20"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="btn bg-slate-100 text-slate-700 hover:bg-slate-200">
                            Cancel
                        </button>
                        <button type="submit" disabled={updating} className="btn btn-primary">
                            {updating ? 'Saving...' : 'Save Correction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CorrectionModal;
