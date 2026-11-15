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
      {/* Rota de login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rota inicial */}
      <Route path="/" element={<Navigate to="/machines" replace />} />

      {/* Exige autenticação */}
      <Route element={<ProtectedRoute />}>
        <Route element={<SidebarLayout />}>
          
          {/* Máquinas */}
          <Route
            path="/machines"
            element={
              <ProtectedRoute permission="machines:view" />
            }
          >
            <Route index element={<MachinesPage />} />
          </Route>

          {/* Ordens de produção */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute permission="orders:view" />
            }
          >
            <Route index element={<ProductionOrdersPage />} />
          </Route>

          {/* Auditoria */}
          <Route
            path="/audit"
            element={
              <ProtectedRoute permission="audit:view" />
            }
          >
            <Route index element={<AuditLogsPage />} />
          </Route>

          {/* Usuários */}
          <Route
            path="/users"
            element={
              <ProtectedRoute permission="users:manage" />
            }
          >
            <Route index element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      {/* Qualquer rota inexistente */}
      <Route path="*" element={<Navigate to="/machines" replace />} />
    </Routes>
  );
}
