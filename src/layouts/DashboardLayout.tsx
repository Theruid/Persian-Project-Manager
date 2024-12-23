import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Clock, Users, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import TimeEntries from '../pages/TimeEntries';
import Teams from '../pages/Teams';

const NavLink = ({ tab, icon: Icon, children }: { tab: 'dashboard' | 'projects' | 'time-entries' | 'teams'; icon: React.ElementType; children: React.ReactNode }) => {
  const { activeTab, setActiveTab } = useNavigation();
  const isActive = activeTab === tab;
  
  return (
    <button
      onClick={() => setActiveTab(tab)}
      className={`inline-flex items-center px-3 pt-1 text-sm font-medium border-b-2 ${
        isActive 
          ? 'border-primary-500 text-primary-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon className="w-4 h-4 ml-2" />
      {children}
    </button>
  );
};

export default function DashboardLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'time-entries':
        return <TimeEntries />;
      case 'teams':
        return <Teams />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-vazir">
      <nav className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">مدیریت پروژه</h1>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden md:ml-6 md:flex md:gap-2">
                <NavLink tab="dashboard" icon={LayoutDashboard}>داشبورد</NavLink>
                <NavLink tab="projects" icon={Briefcase}>پروژه‌ها</NavLink>
                <NavLink tab="time-entries" icon={Clock}>ثبت زمان</NavLink>
                <NavLink tab="teams" icon={Users}>تیم‌ها</NavLink>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="hidden md:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <LogOut className="w-4 h-4 ml-2" />
                خروج
              </button>
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden pb-3`}>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'dashboard' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 ml-2" />
                داشبورد
              </button>
              <button
                onClick={() => { setActiveTab('projects'); setIsMobileMenuOpen(false); }}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'projects' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Briefcase className="w-4 h-4 ml-2" />
                پروژه‌ها
              </button>
              <button
                onClick={() => { setActiveTab('time-entries'); setIsMobileMenuOpen(false); }}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'time-entries' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-4 h-4 ml-2" />
                ثبت زمان
              </button>
              <button
                onClick={() => { setActiveTab('teams'); setIsMobileMenuOpen(false); }}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'teams' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4 ml-2" />
                تیم‌ها
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <LogOut className="w-4 h-4 ml-2" />
                خروج
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[calc(100vh-8rem)]">
        {renderContent()}
      </main>
      <footer className="bg-white py-4 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              ساخته شده توسط مسعود با ❤️
            </div>
            <div>
              {new Date().getFullYear()} تمامی حقوق محفوظ است
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}