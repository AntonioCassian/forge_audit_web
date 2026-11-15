import { useState } from 'react';
import type { ReactElement } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PeopleIcon from '@mui/icons-material/People';
import { useAuth } from '../contexts/AuthContext';
import { Permission, ROLE_LABEL } from '../auth/permissions';
import type { Role } from '../types';

const DRAWER_WIDTH = 248;

interface NavItem {
  to: string;
  label: string;
  icon: ReactElement;
  permission: Permission;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/machines', label: 'Máquinas', icon: <PrecisionManufacturingIcon />, permission: 'machines:view' },
  { to: '/orders', label: 'Ordens de produção', icon: <AssignmentIcon />, permission: 'orders:view' },
  { to: '/audit', label: 'Trilha de auditoria', icon: <FactCheckIcon />, permission: 'audit:view' },
  { to: '/users', label: 'Usuários', icon: <PeopleIcon />, permission: 'users:manage' },
];

const ROLE_BADGE: Record<Role, { bg: string; color: string }> = {
  OPERATOR: { bg: 'rgba(255,255,255,0.16)', color: '#E6ECF2' },
  SUPERVISOR: { bg: '#6FA8DC', color: '#0F1B2B' },
  AUDITOR: { bg: '#E0B84C', color: '#2B2100' },
};

export default function SidebarLayout() {
  const { user, logout, can } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => can(item.permission));

  const drawerContent = (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#17263A', color: '#E6ECF2' }}>
      <div className="px-5 py-5">
        <Typography variant="h6">ForgeAudit</Typography>
        <Typography variant="caption" sx={{ color: '#9FB0C3' }}>
          Manufatura e rastreabilidade
        </Typography>
      </div>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      <List component="nav" aria-label="Navegação principal" sx={{ px: 1, py: 1.5, flexGrow: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              color: 'inherit',
              '&.active': { bgcolor: 'rgba(255,255,255,0.12)', boxShadow: 'inset 3px 0 0 #6FA8DC' },
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex flex-col items-start gap-1">
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {user?.name}
          </Typography>
          {user && (
            <Chip
              size="small"
              label={ROLE_LABEL[user.role]}
              sx={{ bgcolor: ROLE_BADGE[user.role].bg, color: ROLE_BADGE[user.role].color, fontWeight: 600 }}
            />
          )}
        </div>
        <Button
          size="small"
          startIcon={<LogoutIcon />}
          onClick={() => logout()}
          sx={{ color: '#E6ECF2', justifyContent: 'flex-start', px: 0 }}
        >
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" color="primary" sx={{ display: { md: 'none' } }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" aria-label="Abrir menu" onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            ForgeAudit
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="aside" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 0 } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 0 } }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 4 } }}>
        <Toolbar sx={{ display: { md: 'none' } }} />
        <Outlet />
      </Box>
    </Box>
  );
}
