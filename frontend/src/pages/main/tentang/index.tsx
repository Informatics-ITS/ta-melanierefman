import { useTranslation } from 'react-i18next';
import { useEffect } from "react";

import { Typography } from '../../../components/atom/typography';
import Loading from '../../../components/atom/loading';
import SingleImage from '../../../components/molecule/card/image/single';
import Carousel from '../../../components/molecule/card/image/carousel';

import { DocumentationProps } from "../../../entities/dokumentasi";
import { AboutResponse, TentangProps } from "../../../entities/tentang";

import { useFetchData } from "../../../hooks/crud/useFetchData";
import { useLocation } from 'react-router-dom';

const Tentang: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const { data, loading } = useFetchData<AboutResponse>(`${baseUrl}/api/about`);
  const item = data?.about as TentangProps;

  const location = useLocation();

  useEffect(() => {
    if (!data || !item) return;

    const elementId = location.hash.replace('#', '');
    const el = document.getElementById(elementId);
    if (el) {
      const rect = el.getBoundingClientRect();
      const scrollTop = window.scrollY + rect.top;
      const offset = scrollTop - (window.innerHeight / 2) + (el.offsetHeight / 2);

      window.scrollTo({
        top: offset,
        behavior: 'auto'
      });
    }
  }, [location.hash, data, item]);

  const getSingleImageByType = (aboutType: string, limit?: number) => {
    const docs = Array.isArray(item?.documentation)
      ? item.documentation.filter((doc: any) => doc.about_type === aboutType)
      : [];

    if (docs.length === 0) return [];

    return docs
      .slice(0, limit || docs.length)
      .map((doc: any) => ({
        imageUrl: `${baseUrl}/storage/${doc.image}`,
        keterangan: doc.keterangan,
        caption: doc.caption,
      }));
  };
   
  const getCarouselByType = (aboutType: string, limit?: number): DocumentationProps[] => {
    return item?.documentation
      ?.filter((doc: any) => doc.about_type === aboutType)
      .slice(0, limit || item.documentation.length) || [];
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loading /></div>; 

  return (
    <div>
      {/* Hero */}
      <div className="pt-16">
        <div className="relative w-full h-[200px] md:h-[300px] overflow-hidden">
          {/* Image Background */}
          <img
            src="/view1.png"
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradient Overlay & Content */}
          <div className="absolute bottom-0 h-[6rem] md:h-[8rem] bg-gradient-to-t from-black to-transparent flex flex-col justify-center text-white w-full">
            <Typography type="heading1" weight="semibold" className="px-4 lg:px-[140px]">
              About Us
            </Typography>
          </div>
        </div>
      </div>

      <div className="bg-typo-white grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-12 items-center justify-center px-4 lg:px-[140px] py-8 lg:py-16">
        <div className="space-y-4">
          <div className="mb-2">
            <Typography type="heading4" weight="semibold">
              Who We Are
            </Typography>
            <div className="w-14 h-1 bg-primary" />
          </div>
          <Typography type="body" font="dm-sans">
            {lang === 'id' ? item?.tentang : item?.about}
          </Typography>
        </div>
        {getCarouselByType('section1', 2).length > 1 ? (
          <Carousel
            images={getCarouselByType('section1')}
            baseUrl={baseUrl}
            className="lg:aspect-[4/3] aspect-square"
          />
        ) : getSingleImageByType('section1', 1).length > 0 ? (
          <SingleImage image={getSingleImageByType('section1', 1)[0]} className="aspect-[4/3]" variant="rounded" />
        ) : (
          <Typography type="body" font="dm-sans" className="text-typo-secondary mt-8">
            {t('data_belum_tersedia')}
          </Typography>
        )}
      </div>

      <div className="bg-typo-white2 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-12 items-center justify-center px-4 lg:px-[140px] py-8 lg:py-16">
        <div className="w-full h-full overflow-hidden rounded-xl">
          <div>
            {getSingleImageByType('section2', 3).length > 0 ? (
              getSingleImageByType('section2', 3).map((img, index, arr) => {
                const isFirst = index === 0;
                const isLast = index === arr.length - 1;

                return (
                  <div
                    key={index}
                    className={`overflow-hidden ${
                      isFirst ? 'rounded-t-xl' : isLast ? 'rounded-b-xl' : ''
                    }`}
                  >
                    <SingleImage image={img} className="aspect-[4/3]"/>
                  </div>
                );
              })
            ) : (
              <Typography type="body" font="dm-sans" className="text-typo-secondary mt-8">
                {t('data_belum_tersedia')}
              </Typography>
            )}
          </div>
        </div>
        <div className="md:space-y-8 space-y-4">
          <div id="our_mission">
            <div className="mb-2">
              <Typography type="heading4" weight="semibold">
                Our Mission
              </Typography>
              <div className="w-14 h-1 bg-primary" />
            </div>
            <Typography type="body" font="dm-sans">
              {lang === 'id' ? item?.tujuan : item?.purpose}
            </Typography>
          </div>
          <div id="research_focus">
            <div className="mb-2">
              <Typography type="heading4" weight="semibold">
                Research Focus Areas
              </Typography>
              <div className="w-14 h-1 bg-primary" />
            </div>
            <Typography type="body" font="dm-sans">
              {lang === 'id' ? item?.fokus_penelitian : item?.research_focus}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tentang;