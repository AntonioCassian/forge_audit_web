import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './components/SidebarLayout';
import AuditLogsPage from './pages/AuditLogsPage';
import LoginPage from './pages/LoginPage';
import MachinesPage from './pages/MachinesPage';
import ProductionOrdersPage from './pages/ProductionOrdersPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* 1º nível: exige sessão. 2º nível: exige a permissão da rota (matriz em auth/permissions.ts). */}
      <Route element={<ProtectedRoute />}>
        <Route element={<SidebarLayout />}>
          <Route element={<ProtectedRoute permission="machines:view" />}>
            <Route path="/machines" element={<MachinesPage />} />
          </Route>
          <Route element={<ProtectedRoute permission="orders:view" />}>
            <Route path="/orders" element={<ProductionOrdersPage />} />
          </Route>
          <Route element={<ProtectedRoute permission="audit:view" />}>
            <Route path="/audit" element={<AuditLogsPage />} />
          </Route>
          <Route element={<ProtectedRoute permission="users:manage" />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/machines" replace />} />
    </Routes>
  );
}
