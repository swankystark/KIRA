import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CitizenLanding from './pages/citizen/CitizenLanding';
import ReportIssuePage from './pages/citizen/ReportIssuePage';
import SubmissionConfirmation from './pages/citizen/SubmissionConfirmation';
import MyIssuesPage from './pages/citizen/MyIssuesPage';
import MyComplaintsPage from './pages/citizen/MyComplaintsPage';
import IssueDetailPage from './pages/citizen/IssueDetailPage';
import VerificationPage from './pages/citizen/VerificationPage';
import OfficerLoginPage from './pages/officer/OfficerLoginPage';
import ForgotPassword from './pages/officer/ForgotPassword';
import OfficerRegistration from './pages/officer/OfficerRegistration';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import ComplaintDetail from './pages/officer/ComplaintDetail';
import TasksSLAMonitor from './pages/officer/TasksSLAMonitor';
import OfficerIssueDetail from './pages/officer/OfficerIssueDetail';
import WorkerLogin from './pages/worker/WorkerLogin';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerTaskDetail from './pages/worker/WorkerTaskDetail';
import SupervisorLoginPage from './pages/supervisor/SupervisorLoginPage';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import SupervisorComplaintDetail from './pages/supervisor/SupervisorComplaintDetail';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import LoginSignup from './screens/LoginSignup';
import Dashboard from './screens/Dashboard';

import UnifiedPortal from './pages/UnifiedPortal';
import WardPortal from './screens/WardPortal';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginSignup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portal" element={<UnifiedPortal />} />
            <Route path="/citizen" element={<CitizenLanding />} />
            <Route path="/report" element={<ReportIssuePage />} />
            <Route path="/confirmation/:issueId" element={<SubmissionConfirmation />} />
            <Route path="/my-issues" element={<MyIssuesPage />} />
            <Route path="/my-complaints" element={<MyComplaintsPage />} />
            <Route path="/ward-portal" element={<WardPortal />} />
            <Route path="/ward/:wardId" element={<WardPortal />} />
            <Route path="/issue/:issueId" element={<IssueDetailPage />} />
            <Route path="/verify/:issueId" element={<VerificationPage />} />
            <Route path="/officer/login" element={<OfficerLoginPage />} />
            <Route path="/officer/forgot-password" element={<ForgotPassword />} />
            <Route path="/officer/register" element={<OfficerRegistration />} />
            <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            <Route path="/officer/tasks" element={<TasksSLAMonitor />} />
            <Route path="/officer/complaints/:complaintId" element={<ComplaintDetail />} />
            <Route path="/officer/issue/:issueId" element={<OfficerIssueDetail />} />
            
            {/* Worker Routes */}
            <Route path="/worker/login" element={<WorkerLogin />} />
            <Route path="/worker/dashboard" element={<WorkerDashboard />} />
            <Route path="/worker/task/:taskId" element={<WorkerTaskDetail />} />
            
            {/* Supervisor Routes */}
            <Route path="/supervisor/login" element={<SupervisorLoginPage />} />
            <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
            <Route path="/supervisor/complaints/:id" element={<SupervisorComplaintDetail />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;