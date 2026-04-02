import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../ui/layouts/MainLayout';
import ProtectedRoute from '../ui/components/ProtectedRoute';

// Pages
import Login from '../ui/pages/Login';
import Register from '../ui/pages/Register';
import Dashboard from '../ui/pages/Dashboard';
import Library from '../ui/pages/Library';
import Search from '../ui/pages/Search';
import KnowledgeGraph from '../ui/pages/KnowledgeGraph';
import MemoryDetail from '../ui/pages/MemoryDetail';
import Collections from '../ui/pages/Collections';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/search" element={<Search />} />
          <Route path="/graph" element={<KnowledgeGraph />} />
          <Route path="/memory/:id" element={<MemoryDetail />} />
          <Route path="/collections" element={<Collections />} />
        </Route>
      </Route>

    
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;