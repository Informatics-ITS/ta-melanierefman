import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

import { Typography } from '../../../components/atom/typography';
import { Button } from '../../../components/atom/button';
import Loading from '../../../components/atom/loading';
import SingleImage from '../../../components/molecule/card/image/single';
import Mapping from '../../../components/molecule/map';
import ResearchCard from '../../../components/molecule/card/research1-card';
import Carousel from '../../../components/molecule/card/image/carousel';
import PublicationCard from '../../../components/molecule/card/publication-card';

import { AboutResponse, TentangProps } from "../../../entities/tentang";
import { DocumentationProps } from '../../../entities/dokumentasi';
import { PenelitianProps } from "../../../entities/penelitian";
import { PublikasiProps } from '../../../entities/publikasi';

import { useFetchData } from "../../../hooks/crud/useFetchData";

const Home: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { t, i18n } = useTranslation();
  const lang = i18n.language;   

  const { data: aboutData, loading: aboutLoading } = 
    useFetchData<AboutResponse>(`${import.meta.env.VITE_API_BASE_URL}/api/about`);

  const { data: researchData, loading: researchLoading } = 
    useFetchData<PenelitianProps[]>(`${import.meta.env.VITE_API_BASE_URL}/api/research`);

  const { data: publicationData, loading: publicationLoading } = 
    useFetchData<PublikasiProps[]>(`${import.meta.env.VITE_API_BASE_URL}/api/publication`);

  if (aboutLoading || researchLoading || publicationLoading) return <div className="h-screen flex items-center justify-center"><Loading /></div>;

  const item = aboutData?.about as TentangProps;

  const getCarouselByType = (aboutType: string, limit?: number): DocumentationProps[] => {
    return item?.documentation
      ?.filter((doc: any) => doc.about_type === aboutType)
      .slice(0, limit || item.documentation.length) || [];
  };

  const getSingleImageByType = (aboutType: string, limit?: number) => {
    const docs = item?.documentation?.filter((doc: any) => doc.about_type === aboutType) || [];
    if (docs.length === 0) return [];
    return docs
      .slice(0, limit || docs.length)
      .map((doc: any) => ({
        imageUrl: `${baseUrl}/storage/${doc.image}`,
        keterangan: doc.keterangan,
        caption: doc.caption,
      }));
  };

  const latestResearch = Array.isArray(researchData)
    ? researchData
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
    : [];

  const latestPublication = Array.isArray(publicationData)
    ? publicationData
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
    : [];

  const formatDateMY = (dateStr: string) =>
    new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'id-ID', { month: 'long', year: 'numeric' })
      .format(new Date(dateStr));

  const transformedData = Array.isArray(researchData)
  ? researchData
      .filter(
        (item) =>
          item.latitude &&
          item.longitude &&
          !isNaN(parseFloat(item.latitude)) &&
          !isNaN(parseFloat(item.longitude))
      )
      .map((item) => {
        const startDate = item.start_date ? formatDateMY(item.start_date) : "";
        const endDate = item.end_date ? formatDateMY(item.end_date) : "";

        const date = startDate && endDate ? `${startDate} - ${endDate}` : "";

        return {
          id: item.id,
          judul: item.judul,
          title: item.title,
          deskripsi: item.deskripsi,
          description: item.description,
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude),
          date: date,
          location: `${item.latitude}, ${item.longitude}`,
        };
      })
  : [];

  const getResearchById = (research_id: number) => {
    return researchData?.find((research) => research.id === research_id);
  };

  const publikasiWithResearch = (latestPublication ?? []).map((pub) => {
    const research = pub.research_id !== null ? getResearchById(pub.research_id) : null;
    return {
      ...pub,
      research,
    };
  });

  return (
    <div>
      <Helmet>
        <title>{t('kr')}</title>
        <meta name="description" content={t('meta_deskripsi_beranda')} />
        <meta property="og:title" content="KR Paleo" />
        <meta property="og:description" content={t('meta_deskripsi_beranda')} />
        <meta property="og:image" content="https://kr-paleo-brin.com/og-image.jpg" />
        <meta property="og:url" content="https://kr-paleo-brin.com" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      {/* Hero */}
      <div className="pt-16">
        <div className="relative w-full h-screen md:h-[680px] overflow-hidden">
          {/* Video Background */}
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src="/kr-paleo.mp4"
            autoPlay
            loop
            muted
            playsInline
          ></video>

          {/* Gradient Overlay & Content */}
          <div className="absolute bottom-0 h-[28rem] bg-gradient-to-t from-black to-transparent flex flex-col justify-center text-white p-2 w-full">
            <div className="flex flex-col lg:space-y-10 space-y-4 text-center px-4 lg:px-[140px]">
              <div>
                <p className="text-lg font-dm-sans">{t('selamat')}</p>
                <p className="lg:text-6xl md:text-[42px] text-4xl font-bold font-work-sans">{t('kr')}</p>
              </div>
              <p className="text-base font-dm-sans md:px-20 lg:px-28">{t('opening')}</p>
              <Button to={t('routes.tentang')} variant="primary" className="w-fit mx-auto uppercase">
                {t('tentang_kami')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Penelitian */}
      <div className="bg-typo-white items-center justify-center space-y-6 px-4 lg:px-[160px] py-8 lg:py-16">
        <div className="flex items-center justify-between">
          <div className="mb-2">
            <Typography type="heading4" weight="semibold">
              {t('n_penelitian')}
            </Typography>
            <div className="w-14 h-1 bg-primary" />
          </div>
          <Button to={t('routes.penelitian')} variant="outline">{t('button.selengkapnya2')}</Button>
        </div>
        {latestResearch && latestResearch.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {latestResearch.map((item, index) => (
              <ResearchCard key={index} data={item} />
            ))}
          </div>
        ) : (
          <Typography type="body" font="dm-sans" className="text-typo-secondary mt-8">
            {t('data_belum_tersedia')}
          </Typography>
        )}
      </div>

      {/* Publikasi */}
      <div className="bg-typo-white2 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-centers px-4 lg:px-[140px] py-8 lg:py-16">
        {getCarouselByType('section1', 2).length > 1 ? (
          <Carousel
            images={getCarouselByType('section1')}
            baseUrl={baseUrl}
            className="lg:aspect-[4/3] aspect-square"
          />
        ) : getSingleImageByType('section1', 1).length > 0 ? (
          <SingleImage
            image={getSingleImageByType('section1', 1)[0]}
            className="aspect-[4/3]"
            variant="rounded"
          />
        ) : (
          <Typography type="body" font="dm-sans" className="text-typo-secondary mt-8">
            {t('data_belum_tersedia')}
          </Typography>
        )}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="mb-2">
                <Typography type="heading4" weight="semibold">
                  {t('publikasi')}
                </Typography>
                <div className="w-14 h-1 bg-primary" />
            </div>
            <Button to={t('routes.publikasi')} variant="outline">{t('button.selengkapnya2')}</Button>
          </div>
          {publikasiWithResearch && publikasiWithResearch.length > 0 ? (
            <PublicationCard data={publikasiWithResearch} variant="no-citation" />
          ) : (
            <Typography type="body" font="dm-sans" className="text-typo-secondary mt-8">
              {t('data_belum_tersedia')}
            </Typography>
          )}
        </div>
      </div>

      {/* Research Mapping */}
      <div className="md:flex md:space-x-4 space-y-4 bg-typo-white px-4 gap-12 lg:px-[140px] py-8 lg:py-16">
        <div className="md:w-1/3">
          <div className="mb-4">
              <Typography type="heading4" weight="semibold">
                {t('l_penelitian')}
              </Typography>
              <div className="w-14 h-1 bg-primary" />
          </div>
          <Typography type="body" font="dm-sans">{t('d_l_penelitian')}</Typography>
        </div>
        <Mapping data={transformedData} />
      </div>
    </div>
  );
};

export default Home;