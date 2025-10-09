// frontend/src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  BanknotesIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChartBarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Receipt } from 'lucide-react';

const Layout = () => {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
    { to: '/properties', label: 'Properties', icon: BuildingOfficeIcon },
    { to: '/tenants', label: 'All Tenants', icon: UsersIcon },
    { to: '/payments', label: 'Payments', icon: BanknotesIcon },
    { to: '/expenses', label: 'Expenses', icon: Receipt },
    { to: '/reports', label: 'Reports', icon: ChartBarIcon },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white text-black rounded-lg shadow-lg"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} hidden md:flex bg-black text-gray-100 transition-all duration-300 flex-col shadow-xl`}>
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <img 
              src="/logo5.png" 
              alt="PG-Pal Logo" 
              className="h-12 w-auto object-contain"
            />
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <aside className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden fixed inset-y-0 left-0 w-64 bg-black text-gray-100 transition-transform duration-300 flex flex-col shadow-xl z-50`}>
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <img 
            src="/logo5.png" 
            alt="PG-Pal Logo" 
            className="h-12 w-auto object-contain"
          />
          <button 
            onClick={closeMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => {
              logout();
              closeMobileMenu();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto md:ml-0">
        <div className="max-w-7xl mx-auto p-6 md:p-8 pt-16 md:pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;