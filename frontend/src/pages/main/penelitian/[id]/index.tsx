import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCirclePlay } from 'react-icons/fa6';

import { Typography } from '../../../../components/atom/typography';
import { Button } from '../../../../components/atom/button';
import Loading from '../../../../components/atom/loading';
import Breadcrumb from '../../../../components/molecule/breadcrumb';
import Carousel from '../../../../components/molecule/card/image/carousel';
import Card from '../../../../components/molecule/card/card-info';
import HighlightCard from '../../../../components/molecule/card/highlight-card';
import TwoCards from '../../../../components/molecule/card/2-cards';
import SingleImage from '../../../../components/molecule/card/image/single';

import { PenelitianProps } from "../../../../entities/penelitian";

import { useFetchData } from '../../../../hooks/crud/useFetchData';
import { useLocalizedRoute } from '../../../../hooks/useLocalizedRoute';
import { useFormatDate } from '../../../../hooks/useFormatDate';

import PenelitianDetailGaleri from './galeri';
import PenelitianDetailMap from './map';

const PenelitianDetail: React.FC = () => {
  const { title } = useParams<{ title: string }>();

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data, loading } = useFetchData<PenelitianProps[]>(`${baseUrl}/api/research`);
  
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const getLocalizedRoute = useLocalizedRoute();
  const { formatDate } = useFormatDate();

  if (loading) return <div className="h-screen items-center justify-center"><Loading /></div>;

  const processedData = data
    ? data
        .map((research: PenelitianProps) => ({
          ...research,
          partners: research.partners || [],
          research_progress: research.research_progress || [],
          documentation: research.documentations || [],
          members: research.members || [],
          publication: research.publication,
        }))
    : [];

  const currentPenelitian = processedData.find((item) =>
    title === (lang === 'id' 
      ? item.judul.toLowerCase().replace(/\s+/g, '+') 
      : item.title.toLowerCase().replace(/\s+/g, '+')
    )
  );

  if (!currentPenelitian) return <div>{t('researchNotFound')}</div>

  const images = currentPenelitian?.documentation || [];

  const breadcrumbItems = [
    { label: t('beranda'), path: '/' },
    { label: t('penelitian'), path: getLocalizedRoute('penelitian') },
    {
      label: currentPenelitian 
        ? lang === 'id' 
          ? currentPenelitian.judul 
          : currentPenelitian.title 
        : t('unk'),
      path: currentPenelitian
        ? getLocalizedRoute('detail_penelitian', { 
            name: lang === 'id' 
              ? currentPenelitian.judul.toLowerCase().replace(/\s+/g, '+') 
              : currentPenelitian.title.toLowerCase().replace(/\s+/g, '+'),
          })
        : getLocalizedRoute('researchNotFound'),
    },
  ];

  const formattedDate = currentPenelitian?.created_at
  ? formatDate(currentPenelitian.created_at, lang)
  : t('unk');

  const formatDateMY = (dateStr: string) =>
    new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(dateStr));

  const latestResearchProgress = Array.isArray(currentPenelitian?.research_progress)
  ? [...currentPenelitian.research_progress]
      .filter(p => p?.created_at && !isNaN(new Date(p.created_at).getTime()))
      .sort((a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime())[0]
  : null;

  const otherResearchProgress = Array.isArray(currentPenelitian?.research_progress)
  ? [...currentPenelitian.research_progress]
      .filter((progress) => progress?.id !== latestResearchProgress?.id)
      .filter((progress) => progress?.created_at && !isNaN(new Date(progress.created_at).getTime()))
      .sort((a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime())
      .slice(0, 2)
  : [];

  const progressCount = currentPenelitian?.research_progress?.length ?? 0;
  const fewProgress = progressCount >= 1 && progressCount < 3;
  const noProgress = progressCount === 0;
  const hasResearchProgress = progressCount >= 3;

  const filteredImages = Array.isArray(images)
  ? images.filter(doc => doc.image && doc.pivot?.is_thumbnail === 1)
  : [];

  const availableImages = Array.isArray(currentPenelitian.documentation)
  ? currentPenelitian.documentation.filter(doc => doc.image)
  : [];

  const randDocImage = availableImages.length > 0
    ? availableImages[Math.floor(Math.random() * availableImages.length)]
    : null;

  const infoContent = Object.fromEntries(
    Object.entries({
      [t('durasi')]: currentPenelitian.start_date && currentPenelitian.end_date
        ? `${formatDateMY(currentPenelitian.start_date)} - ${formatDateMY(currentPenelitian.end_date)}`
        : undefined,
      [t('koor')]: currentPenelitian.members.find(member => member.pivot.is_coor)?.name || "",
      [t('anggota')]: currentPenelitian.members
        .filter(member => !member.pivot.is_coor)
        .map(member => member.name || "")
        .join(', '),
      [t('colab')]: currentPenelitian.partners
        .flatMap(partner =>
          (partner.partners_member?.length
            ? partner.partners_member.map(member => `${member.name} (${partner.name})`)
            : [`(${partner.name})`])
        )
        .join(', ')
    }).filter(([_, value]) => String(value ?? '').trim() !== "")
  );
  
  const contactContent = Object.fromEntries(
    Object.entries({
      [t('telp')]: currentPenelitian.members.find(member => member.pivot.is_coor)?.phone,
      Email: currentPenelitian.members.find(member => member.pivot.is_coor)?.email,
    }).filter(([_, value]) => String(value ?? '').trim() !== "")
  );  

  return (
    <div>
      {/* Detail Penelitian */}
      <div className="space-y-8 pt-[100px] md:pt-[120px] px-4 lg:px-[140px] pb-8 md:pb-16">
        <div className="space-y-2">
          <Breadcrumb items={breadcrumbItems} />
          <div>
            <Typography type="heading5" weight="bold" className="text-typo !leading-tight">
              {lang === "id" ? currentPenelitian?.judul : currentPenelitian?.title}
            </Typography>
            <Typography type="body" font="dm-sans" className="text-typo-secondary">
              {formattedDate || t('unknown')}
            </Typography>
          </div>
        </div>
        <div className="md:flex md:space-x-6">
          <div className="md:w-2/3 space-y-4">
            {filteredImages.length === 1 ? (
              <SingleImage
                image={{
                  imageUrl: `${baseUrl}/storage/${filteredImages[0].image}`,
                  caption: filteredImages[0].caption,
                  keterangan: filteredImages[0].keterangan,
                }}
                className="md:aspect-[16/9] aspect-[4/3]"
                variant="rounded"
              />
            ) : (
              <Carousel
                images={filteredImages}
                baseUrl={baseUrl}
                className="md:aspect-[16/9] aspect-[4/3]"
              />
            )}
            <Typography type="body" font="dm-sans" className="text-typo">
              {lang === "id" ? currentPenelitian?.deskripsi : currentPenelitian?.description}
            </Typography>
          </div>
          <div className="md:w-1/3 md:mt-0 mt-4 space-y-4">
            {Object.keys(infoContent).length > 0 && (
              <Card
                title={t('i_penelitian')}
                content={infoContent}
              />
            )}
            
            {Object.keys(contactContent).length > 0 && (
              <Card
                title={t('info_kontak_koor')}
                content={contactContent}
              />
            )}
          </div>
        </div>
      </div>
      { noProgress && (
        <>
          <PenelitianDetailGaleri currentPenelitian={currentPenelitian} />
          {/* Map */}
          {currentPenelitian.latitude && currentPenelitian.longitude && currentPenelitian.zoom && (
            <PenelitianDetailMap
              latitude={currentPenelitian.latitude}
              longitude={currentPenelitian.longitude}
              zoom={currentPenelitian.zoom ? Number(currentPenelitian.zoom) : null}
              variant="white"
            />
          )}
        </>
      )}

      { fewProgress && (
        <>
          {/* Penelitian Terbaru */}
          <div className="bg-typo-white2 flex flex-col md:flex-row md:items-end lg:items-start justify-center px-4 lg:px-[140px] py-8 lg:py-16">
            <div className="w-full md:w-2/3 md:mr-8 md:mb-0 mb-4">
              <div className='flex items-center justify-between md:mb-8 mb-4'>
                <div>
                  <Typography type="heading4" weight="semibold">
                    {t('progres_n_penelitian')}
                  </Typography>
                  <div className="w-14 h-1 bg-primary" />
                </div>
                <Button 
                  to={getLocalizedRoute('list_progres_penelitian', {
                    title: lang === 'id'
                      ? currentPenelitian.judul.toLowerCase().replace(/\s+/g, '+')
                      : currentPenelitian.title.toLowerCase().replace(/\s+/g, '+'),
                  })}
                  className="whitespace-nowrap"
                  variant='outline'
                  >{t('button.selengkapnya2')}
                </Button>
              </div>
              {latestResearchProgress && currentPenelitian ? (
                <HighlightCard 
                  data={latestResearchProgress} 
                  parentData={{
                    judul: currentPenelitian.judul,
                    title: currentPenelitian.title
                  }} 
                />
              ) : (
                <Typography type="paragraph">{t('data_not_available')}</Typography>
              )}
            </div>
            {/* Galeri */}
            <div className="w-full md:w-1/3">
              <div className="md:mb-8 mb-4">
                <Typography type="heading4" weight="semibold">
                  {t('d_penelitian')}
                </Typography>
                <div className="w-14 h-1 bg-primary" />
              </div>
              <div className="flex flex-col gap-4 md:mb-4 mb-0">
                <Link to={getLocalizedRoute('foto_penelitian', {
                  title: lang === 'id'
                    ? currentPenelitian.judul.toLowerCase().replace(/\s+/g, '+')
                    : currentPenelitian.title.toLowerCase().replace(/\s+/g, '+'),
                })}>
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      className="w-full h-[210px] object-cover"
                      src={
                        randDocImage
                          ? `${baseUrl}/storage/${randDocImage.image}`
                          : '/no-image.png'
                      }
                      alt={randDocImage?.caption || 'Dokumentasi Penelitian'}
                    />
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent px-4 py-3 text-white">
                      <Typography type="title" weight="semibold">{t('foto')}</Typography>
                    </div>
                  </div>
                </Link>
                <Link to={getLocalizedRoute('video_penelitian', {
                  title: lang === 'id'
                    ? currentPenelitian.judul.toLowerCase().replace(/\s+/g, '+')
                    : currentPenelitian.title.toLowerCase().replace(/\s+/g, '+'),
                  })}>
                  <div className="relative overflow-hidden rounded-xl">
                    <img
                      className="w-full h-[210px] object-cover"
                      src={
                        randDocImage
                          ? `${baseUrl}/storage/${randDocImage.image}`
                          : '/no-image.png'
                      }
                      alt={randDocImage?.caption || 'Dokumentasi Penelitian'}
                    />
                    <div className="absolute inset-0 bg-black/30 z-10" />
                    <div className="absolute inset-0 flex items-center justify-center z-30">
                      <FaCirclePlay className="text-white text-5xl group-hover:scale-110 transition-transform opacity-75" />
                    </div>
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent px-4 py-3 text-white z-40">
                      <Typography type="title" weight="semibold">{t('video')}</Typography>
                    </div>
                  </div>
                </Link>
              </div>
              
            </div>
          </div>
          {/* Map */}
          {currentPenelitian.latitude && currentPenelitian.longitude && currentPenelitian.zoom && (
            <PenelitianDetailMap
              latitude={currentPenelitian.latitude}
              longitude={currentPenelitian.longitude}
              zoom={currentPenelitian.zoom ? Number(currentPenelitian.zoom) : null}
              variant="white"
            />
          )}
        </>
      )}

      {hasResearchProgress && (
        <>
          {/* Penelitian Terbaru */}
          <div className="bg-typo-white2 px-4 lg:px-[140px] py-8 lg:py-16">
            <div className="flex items-center justify-between md:mb-8 mb-4">
              <div>
                <Typography type="heading4" weight="semibold">
                  {t('progres_n_penelitian')}
                </Typography>
                <div className="w-14 h-1 bg-primary" />
              </div>
              <Button 
                to={getLocalizedRoute('list_progres_penelitian', {
                  title: lang === 'id'
                    ? currentPenelitian.judul.toLowerCase().replace(/\s+/g, '+')
                    : currentPenelitian.title.toLowerCase().replace(/\s+/g, '+'),
                })}
                className="whitespace-nowrap"
                variant='outline'
                >{t('button.selengkapnya2')}
              </Button>
            </div>
            <div className="flex flex-col md:flex-row justify-center">
              <div className="w-full md:w-2/3 md:mr-4 md:mb-0">
                {latestResearchProgress && currentPenelitian ? (
                  <HighlightCard 
                    data={latestResearchProgress } 
                    parentData={{
                      judul: currentPenelitian.judul,
                      title: currentPenelitian.title
                    }} 
                  />
                ) : (
                  <Typography type="paragraph">{t('data_not_available')}</Typography>
                )}
              </div>           
              {otherResearchProgress && otherResearchProgress.length > 0 && (
                <div className="w-full md:w-1/3">
                  <TwoCards
                    data={otherResearchProgress}
                    parentData={{
                      judul: currentPenelitian?.judul || 'Data tidak tersedia',
                      title: currentPenelitian?.title || 'Data not available',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <PenelitianDetailGaleri currentPenelitian={currentPenelitian} variant="white"/>
          {currentPenelitian.latitude && currentPenelitian.longitude && currentPenelitian.zoom && (
            <PenelitianDetailMap
              latitude={currentPenelitian.latitude}
              longitude={currentPenelitian.longitude}
              zoom={currentPenelitian.zoom ? Number(currentPenelitian.zoom) : null}
            />
          )}
        </>
      )}

    </div>
  );
};

export default PenelitianDetail;