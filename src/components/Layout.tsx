import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  Headphones, 
  FileText,
  Receipt,
  LogOut
} from 'lucide-react';
import { Logo } from './Logo';

function Layout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const linkClass = (path: string) => `
    flex items-center gap-2 p-3 rounded transition-colors
    ${isActive(path) 
      ? 'bg-indigo-600 text-white' 
      : 'text-white hover:bg-indigo-600'}
  `;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <div className="w-64 bg-indigo-700 text-white p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <Logo className="text-white" size={36} />
            <span className="text-xl font-bold">DBA Expert</span>
          </div>
          
          <nav className="space-y-2 flex-1">
            <Link to="/" className={linkClass('/')}>
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link to="/clients" className={linkClass('/clients')}>
              <Users className="w-5 h-5" />
              Clientes
            </Link>
            <Link to="/supports" className={linkClass('/supports')}>
              <Headphones className="w-5 h-5" />
              Atendimentos
            </Link>
            <Link to="/reports" className={linkClass('/reports')}>
              <FileText className="w-5 h-5" />
              Relatórios
            </Link>
            <Link to="/nfse" className={linkClass('/nfse')}>
              <Receipt className="w-5 h-5" />
              Notas Fiscais
            </Link>
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 p-3 rounded hover:bg-indigo-600 transition-colors mt-auto"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>

        <main className="flex-1 overflow-auto bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;