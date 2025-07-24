import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../atom/button';
import { Typography } from '../../atom/typography';
import { LanguageSwitcher } from '../../molecule/lang';
import { DropdownMegaMenu } from './dropdownmegamenu';

import { PenelitianProps } from '../../../entities/penelitian';
import { ProgresPenelitianProps } from '../../../entities/progres-penelitian';
import { PublikasiProps } from '../../../entities/publikasi';

import { useLocalizedRoute } from '../../../hooks/useLocalizedRoute';
import { useFetchData } from '../../../hooks/crud/useFetchData';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const location = useLocation();
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const lang = i18n.language;
  const getLocalizedRoute = useLocalizedRoute();

  const { data: researchList = [] } = useFetchData<PenelitianProps[]>(
    `${import.meta.env.VITE_API_BASE_URL}/api/research`
  );

  const { data: allPublications } = useFetchData<PublikasiProps[]>(`${import.meta.env.VITE_API_BASE_URL}/api/publication`);

  const uniqueYears = Array.isArray(allPublications)
    ? Array.from(new Set(allPublications.map((pub) => pub.year))).sort((a, b) => Number(b) - Number(a))
    : [];

  const routeMapping: Record<string, string[]> = {
    [t('penelitian')]: ['/penelitian', '/research', '/id/penelitian', '/en/research'],
    [t('tentang')]: ['/tentang', '/about', '/id/tentang', '/en/about'],
    [t('anggota')]: ['/anggota', '/members', '/member', '/id/anggota', '/id/member', '/en/members', '/en/member'],
    [t('publikasi')]: ['/publikasi', '/publication', '/id/publikasi', '/en/publication'],
    [t('n_mitra')]: ['/kerjasama', '/partners', '/id/kerjasama', '/en/partners'],
    [t('materi')]: ['/materi', '/lecturer', '/id/materi', '/en/lecturer'],
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleContactClick = () => {
    setActiveIndex(null);
    sessionStorage.removeItem('activeNavIndex');
  };

  const navItemsMobile = [
    { route: t('routes.tentang'), label: t('tentang') },
    { route: t('routes.anggota'), label: t('anggota') },
    { route: t('routes.penelitian'), label: t('penelitian') },
    { route: t('routes.publikasi'), label: t('publikasi') },
    { route: t('routes.kerjasama'), label: t('n_mitra') },
    { route: t('routes.materi'), label: t('materi') },
  ];

  const navItemsDesktop = [
    {
      label: t('tentang'),
      to: t('routes.tentang'),
      route: t('routes.tentang'),
      dropdown: [
        { label: 'Our Mission', to: `${t('routes.tentang')}#our_mission` },
        { label: 'Research Focus', to: `${t('routes.tentang')}#research_focus` }
      ]
    },
    {
      label: t('anggota'),
      to: t('routes.anggota'),
      route: t('routes.anggota'),
      dropdown: [
        { label: t('peneliti'), to: `${t('routes.anggota')}?tab=researcher` },
        { label: 'Postdoctoral', to: `${t('routes.anggota')}?tab=postdoc` },
        { label: t('ar'), to: `${t('routes.anggota')}?tab=research_assistant` },
        { label: t('mahasiswa'), to: `${t('routes.anggota')}?tab=student` },
        { label: 'Alumni', to: `${t('routes.anggota')}?tab=alumni` },
      ]
    },
    {
      label: t('penelitian'),
      to: t('routes.penelitian'),
      route: t('routes.penelitian'),
      dropdown: [...(Array.isArray(researchList) ? researchList : [])]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((item) => ({
          label: lang === 'id' ? item.judul : item.title,
          to: getLocalizedRoute('detail_penelitian', {
            title: (lang === 'id' ? item.judul : item.title).toLowerCase().replace(/\s+/g, '+')
          }),
          progressDropdown: Array.isArray(item.research_progress)
          ? item.research_progress.map((progress: ProgresPenelitianProps) => ({
              label: lang === 'id' ? progress.judul_progres : progress.title_progress,
              to: getLocalizedRoute('progres_penelitian', {
                title: (lang === 'id' ? item.judul : item.title).toLowerCase().replace(/\s+/g, '+'),
                progressTitle: (lang === 'id' ? progress.judul_progres : progress.title_progress)
                  .toLowerCase()
                  .replace(/\s+/g, '+')
              })
            }))
          : []
        }))
    }, 
    {
      label: t('publikasi'),
      to: t('routes.publikasi'),
      route: t('routes.publikasi'),
      dropdown: Array.isArray(uniqueYears)
        ? uniqueYears.map((year) => ({
            label: `${t('publikasi')} ${year}`,
            to: `${t('routes.publikasi')}/archive/${year}`
          }))
        : []
    },
    { 
      route: t('routes.kerjasama'),  
      label: t('n_mitra') 
    },
    {
      label: t('materi'),
      to: t('routes.materi'),
      route: t('routes.materi'),
      dropdown: [
        { label: t('doc_materi'), to: `${t('routes.materi')}#doc`,
          progressDropdown: [
            { label: t('materi_belajar'), to: `${t('routes.materi')}?tab=lecturer` },
            { label: t('petunjuk_teknis'), to: `${t('routes.materi')}?tab=guideline` },
          ],
        },
        { label: t('video_materi'), to: `${t('routes.materi_video')}` }
      ]
    },
  ];

  const handleItemClick = (index: number) => {
    setActiveIndex(index);
    sessionStorage.setItem('activeNavIndex', index.toString());
    setIsOpen(false);
    setDropdownIndex(null);
  };

  const isPathActive = (item: any, currentPath: string): boolean => {
    const cleanPath = currentPath.split('?')[0].split('#')[0];

    const getRoutePrefixes = (navItem: any): string[] => {
      const prefixes: string[] = [];

      if (navItem.route) {
        prefixes.push(navItem.route);
      }
      
      const mappedRoutes = routeMapping[navItem.label];
      if (mappedRoutes) {
        prefixes.push(...mappedRoutes);
      }
      
      return prefixes;
    };
    
    const routePrefixes = getRoutePrefixes(item);

    const isMainRouteActive = routePrefixes.some(prefix => {
      return cleanPath === prefix || cleanPath.startsWith(prefix + '/');
    });
    
    if (isMainRouteActive) {
      return true;
    }

    if (item.dropdown) {
      return item.dropdown.some((dropdownItem: any) => {
        const dropdownPath = dropdownItem.to.split('?')[0].split('#')[0];
        if (cleanPath === dropdownPath) {
          return true;
        }

        if (dropdownItem.progressDropdown) {
          return dropdownItem.progressDropdown.some((progressItem: any) => {
            const progressPath = progressItem.to.split('?')[0].split('#')[0];
            return cleanPath === progressPath;
          });
        }
        
        return false;
      });
    }
    
    return false;
  };

  useEffect(() => {
    const currentPath = location.pathname;
    const activeRoute = navItemsDesktop.findIndex(item => 
      isPathActive(item, currentPath)
    );
    
    if (activeRoute !== -1) {
      setActiveIndex(activeRoute);
      sessionStorage.setItem('activeNavIndex', activeRoute.toString());
    } else {
      setActiveIndex(null);
      sessionStorage.removeItem('activeNavIndex');
    }
  }, [location.pathname, navItemsDesktop, t]);   

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu') && !target.closest('.nav-link')) {
        setDropdownIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 z-50 shadow-sm bg-typo w-full">
      <div className="relative mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to={t('routes.home')} onClick={() => handleItemClick(-1)}>
            <img src="/logo-brin.png" className="h-[40px]" alt="BRIN Logo" />
          </Link>
        </div>

        <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-max">
          <ul className="flex font-medium items-center space-x-4">
            {navItemsDesktop.map((item, index) => (
              <li key={index} className="relative">
                {item.dropdown ? (
                  <DropdownMegaMenu
                    label={item.label}
                    to={item.to}
                    isOpen={dropdownIndex === index}
                    isActive={activeIndex === index || dropdownIndex === index}
                    onToggle={() =>
                      setDropdownIndex(dropdownIndex === index ? null : index)
                    }
                    onNavigate={() => {
                      setActiveIndex(index);
                      setDropdownIndex(null);
                      sessionStorage.setItem('activeNavIndex', index.toString());
                  
                      const target = item.dropdown?.[0]?.to;
                      if (target?.startsWith('/#')) {
                        const [base, hash] = target.split('#');
                        sessionStorage.setItem('scrollToId', hash);
                        navigate(base + '#' + hash);
                      } else if (target) {
                        navigate(target);
                      }
                    }}
                    items={item.dropdown}
                  />                            
                ) : (
                  <Link
                    to={item.route}
                    onClick={() => handleItemClick(index)}
                    className={`relative block lg:p-0 text-typo-white rounded hover:text-white group ${
                      activeIndex === index ? 'hover:font-bold font-bold text-white' : ''
                    }`}
                  >
                    <Typography
                      type="body"
                      font="dm-sans"
                      weight={activeIndex === index ? 'semibold' : 'medium'}
                      className="group-hover:font-semibold uppercase px-3 py-2"
                    >
                      {item.label}
                    </Typography>
                    <span
                      className={`absolute left-0 right-0 bottom-0 h-1 bg-primary scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
                        activeIndex === index ? 'scale-x-100' : ''
                      }`}
                    />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden lg:flex items-center gap-x-4">
          <Link to={t('routes.kontak')} onClick={handleContactClick}>
            <Button variant="primary" className="uppercase">{t('kontak')}</Button>
          </Link>
          <LanguageSwitcher onChange={() => handleItemClick(-1)} />
        </div>

        <div className="lg:hidden flex items-center space-x-4">
          <Link to={t('routes.kontak')} className="hidden lg:block" onClick={handleContactClick}>
            <Button variant="primary" className="uppercase">{t('kontak')}</Button>
          </Link>
          <LanguageSwitcher onChange={() => handleItemClick(-1)} />
          <button
            onClick={toggleMenu}
            className="p-2 w-10 h-10 text-white hover:bg-primary rounded focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-typo px-4 pb-4 pt-2">
          <ul className="flex flex-col space-y-2 font-medium">
            {navItemsMobile.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.route}
                  onClick={() => handleItemClick(index)}
                  className={`relative block py-2 px-3 lg:p-0 text-typo-white rounded hover:text-white group ${
                    activeIndex === index ? 'hover:font-bold font-bold text-white' : ''
                  }`}
                >
                  <Typography
                    type="body"
                    font="dm-sans"
                    weight={activeIndex === index ? 'semibold' : 'medium'}
                    className="group-hover:font-semibold uppercase"
                  >
                    {item.label}
                  </Typography>
                  <span
                    className={`absolute left-0 right-0 bottom-0 h-1 bg-primary scale-x-0 transition-transform duration-300 group-hover:scale-x-100 ${
                      activeIndex === index ? 'scale-x-100' : ''
                    }`}
                  />
                </Link>
              </li>
            ))}
            <li>
              <Link
                to={t('routes.kontak')}
                onClick={() => {
                  handleContactClick();
                  setIsOpen(false);
                }}
                className="relative block py-2 px-3 lg:p-0 text-typo-white rounded hover:text-white group lg:hidden"
              >
                <Typography type="body" font="dm-sans" weight="medium" className="group-hover:font-semibold uppercase">
                  {t('kontak')}
                </Typography>
                <span className="absolute left-0 right-0 bottom-0 h-1 bg-primary scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}