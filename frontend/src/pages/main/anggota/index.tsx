import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { Typography } from '../../../components/atom/typography';
import Loading from '../../../components/atom/loading';
import Card from '../../../components/molecule/card/staff-card';

import { AnggotaProps } from "../../../entities/anggota";

import { useFetchData } from '../../../hooks/crud/useFetchData';

const Anggota: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeBagian = searchParams.get('tab') || 'researcher';

  const { data: anggotaData, loading } = useFetchData<AnggotaProps[]>(`${import.meta.env.VITE_API_BASE_URL}/api/members`);

  const processedData = Array.isArray(anggotaData)
    ? anggotaData.map((members: AnggotaProps) => ({
        ...members,
        education: members.members_education || [],
        expertise: members.members_expertise || [],
        documentation: members.documentation || [],
      }))
    : [];

  const filteredData = processedData.filter((item) => {
    if (activeBagian === 'alumni') {
      return item.is_alumni;
    }

    return item.role.toLowerCase() === activeBagian && !item.is_alumni;
  });

  if (loading) return <div className="h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div>
      {/* Hero */}
      <div className="pt-16">
        <div className="relative w-full h-[200px] md:h-[300px] overflow-hidden">
          {/* Image Background */}
          <img
            src="/view2.png"
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradient Overlay & Content */}
          <div className="absolute bottom-0  h-[6rem] md:h-[8rem] bg-gradient-to-t from-black to-transparent flex flex-col justify-center text-white w-full">
            <Typography type="heading1" weight="semibold" className="px-4 lg:px-[140px]">
              {t('anggota')}
            </Typography>
          </div>
        </div>
      </div>
      <div className="space-y-4 pt-8 px-4 lg:px-[140px] pb-8 md:pb-16">
        <div className="flex flex-col text-center p-4">
          <div className="flex overflow-x-auto whitespace-nowrap space-x-4 mb-2">
            {[
              { label: t('peneliti'), value: 'researcher' },
              { label: 'Postdoctoral', value: 'postdoc' },
              { label: t('ar'), value: 'research assistant' },
              { label: t('mahasiswa'), value: 'student' },
              { label: 'Alumni', value: 'alumni' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setSearchParams({ tab: tab.value })}
                className={`${activeBagian === tab.value ? 'text-primary font-dm-sans font-bold' : 'text-typo-secondary font-dm-sans hover:text-primary font-medium'} uppercase`}
              >
                <Typography type="button" font="dm-sans" weight={activeBagian === tab.value ? 'bold' : 'medium'}>
                  {tab.label}
                </Typography>
              </button>
            ))}
          </div>
          <span className="block border-t-2 border-typo-outline mb-8 w-full"></span>
          {filteredData.length > 0 ? (
            <Card data={filteredData} />
          ) : (
            <Typography type="body" font="dm-sans" className="text-typo-secondary mt-8">
              {t('data_belum_tersedia')}
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};

export default Anggota;