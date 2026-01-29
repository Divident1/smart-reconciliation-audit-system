import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import ReconciliationPage from './pages/ReconciliationPage';
import AuditPage from './pages/AuditPage';

const Stub = ({ title }) => <div className="p-8"><h2 className="text-2xl font-bold">{title}</h2><p className="mt-4 text-text-muted">Coming soon...</p></div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
             <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/reconciliation" element={<ReconciliationPage />} />
                <Route path="/audit" element={<AuditPage />} />
             </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
