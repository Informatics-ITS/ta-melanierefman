import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Typography } from '../../atom/typography';
import useIsMobile from '../../../hooks/useIsMobile';

interface ItemProps {
    title: string;
    to: string;
    onClick?: () => void;
}

const Item = ({ title, to, onClick }: ItemProps) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            onClick={onClick}
            className={`group flex items-center gap-3 px-10 py-2 ${
                isActive ? 'bg-primary font-semibold text-white' : 'hover:bg-primary'
            }`}
        >
            <Typography
                type="body"
                font="dm-sans"
                className={`text-typo ${
                    isActive ? 'font-semibold text-white' : 'group-hover:font-semibold group-hover:text-white'
                }`}
            >
                {title}
            </Typography>
        </Link>
    );
};

interface MainItemProps {
    onItemClick?: () => void;
}

const MainItem = ({ onItemClick }: MainItemProps) => {
    const role = localStorage.getItem('role');

    const superadminMenu = [
        { title: 'DASHBOARD', to: '/admin' },
        { title: 'AKUN', to: '/admin/akun' },
        { title: 'TENTANG', to: '/admin/tentang' },
        { title: 'KONTAK', to: '/admin/kontak' },
        { title: 'ANGGOTA', to: '/admin/anggota' },
        { title: 'PENELITIAN', to: '/admin/penelitian' },
        { title: 'PUBLIKASI', to: '/admin/publikasi' },
        { title: 'KERJASAMA', to: '/admin/kerjasama' },
        { title: 'MATERI', to: '/admin/materi' },
        { title: 'DOKUMENTASI', to: '/admin/dokumentasi/foto' },
    ];

    const adminMenu = superadminMenu.filter(item => item.title !== 'AKUN' && item.title !== 'TENTANG' && item.title !== 'KONTAK' && item.title !== 'ANGGOTA');
    const menuItems = role === 'superadmin' ? superadminMenu : adminMenu;

    return (
        <nav className="space-y-0.5">
            {menuItems.map((item, index) => (
                <Item
                    key={index}
                    title={item.title}
                    to={item.to}
                    onClick={onItemClick}
                />
            ))}
        </nav>
    );
};

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useIsMobile();

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleItemClick = () => {
        if (isMobile) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isMobile) {
            document.body.style.overflow = isOpen ? 'hidden' : 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, isMobile]);

    return (
        <>
            {isMobile && (
                <button
                    onClick={toggleSidebar}
                    type="button"
                    className="inline-flex items-center justify-center w-10 h-10 m-3 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                    <span className="sr-only">Open sidebar</span>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            clipRule="evenodd"
                            fillRule="evenodd"
                            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                        />
                    </svg>
                </button>
            )}

            <aside
                className={`fixed top-0 left-0 z-40 w-56 h-screen bg-typo-white2 border-r border-r-typo-outline shadow-md transition-transform ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}
            >
                <img src="/logo-brin-1.png" alt="Logo BRIN" className="px-10 pt-10 mb-4 h-20 w-auto" />
                <MainItem onItemClick={handleItemClick} />
            </aside>

            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-30 z-30"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
};

export default Sidebar;