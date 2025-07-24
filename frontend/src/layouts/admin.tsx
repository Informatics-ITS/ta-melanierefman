import { useEffect, useState } from 'react';
import Sidebar from '../components/organism/sidebar';
import Header from '../components/organism/header';
import { useBackNavigation } from '../hooks/useBackNavigation';
import useIsMobile from '../hooks/useIsMobile';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<string | null>(null);
  const isMobile = useIsMobile();
  useBackNavigation();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);

    if (!storedRole || (storedRole !== 'admin' && storedRole !== 'superadmin')) {
      window.location.href = '/login';
    }
  }, []);

  if (role === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      {isMobile ? (
        <div className="w-full">
          <div className="fixed w-full py-1 flex bg-typo-white2 items-center justify-between shadow-md z-10">
            <Sidebar />
            <Header />
          </div>
          <main id="admin-main-content" className="flex-1">
            {children}
          </main>
        </div>
      ) : (
        <>
          <Sidebar />
          <div className="flex flex-col w-full md:ml-56">
            <Header />
            <main id="admin-main-content" className="flex-1 overflow-y-auto px-6">
              {children}
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminLayout;