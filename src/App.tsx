import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Supports from './pages/Supports';
import Reports from './pages/Reports';
import NFSe from './pages/NFSe';

function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
        <Route element={token ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="supports" element={<Supports />} />
          <Route path="reports" element={<Reports />} />
          <Route path="nfse" element={<NFSe />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;