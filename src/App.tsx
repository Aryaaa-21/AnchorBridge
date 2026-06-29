import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { CreateProject } from './pages/CreateProject';
import { ProjectDetails } from './pages/ProjectDetails';
import { Wallet } from './pages/Wallet';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { SmartContract } from './pages/SmartContract';
import { Toaster } from 'sonner';

import { useEffect } from 'react';
import { sorobanEventListener } from './services/eventListener';

function App() {
  useEffect(() => {
    // Start listening to live Soroban events
    sorobanEventListener.start();
    return () => {
      sorobanEventListener.stop();
    };
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton toastOptions={{ style: { fontFamily: 'var(--font-sans)' } }} />
      <Routes>
        {/* Public Routes with Navbar / No Sidebar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Dashboard Pages (layout wraps Navbar + Sidebar) */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/create" element={<CreateProject />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="contracts" element={<SmartContract />} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
