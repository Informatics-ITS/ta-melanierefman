import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Typography } from "../../../../../components/atom/typography";
import Loading from "../../../../../components/atom/loading";
import Image from "../../../../../components/molecule/image";
import Breadcrumb from '../../../../../components/molecule/breadcrumb';

import { PenelitianProps } from "../../../../../entities/penelitian";
import { DocumentationProps } from "../../../../../entities/dokumentasi";

import { useLocalizedRoute } from '../../../../../hooks/useLocalizedRoute';
import { useFetchData } from "../../../../../hooks/crud/useFetchData";

const FotoPenelitian: React.FC = () => {
  const { title } = useParams<{ title: string }>();
  const { t, i18n } = useTranslation();
  const getLocalizedRoute = useLocalizedRoute();
  const lang = i18n.language;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const { data: researchData, loading: loadingResearch } = useFetchData<PenelitianProps[]>(`${baseUrl}/api/research`);
  
  const currentPenelitian = researchData?.find((penelitian) =>
    title?.toLowerCase().replace(/\s+/g, '+') === (lang === 'id' 
      ? penelitian.judul.toLowerCase().replace(/\s+/g, '+') 
      : penelitian.title.toLowerCase().replace(/\s+/g, '+')
    )
  );

  const imagesUrl = currentPenelitian?.id ? `${baseUrl}/api/documentation/images/${currentPenelitian.id}` : null;
  const { data: rawImagesData, loading: loadingImages } = useFetchData<DocumentationProps[]>(imagesUrl ?? '');
  
  const images = Array.isArray(rawImagesData)
    ? [...rawImagesData]
        .filter(img => img?.created_at && !isNaN(new Date(img.created_at).getTime()))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [];

  const breadcrumbItems = [
    { label: t('beranda'), path: '/' },
    { label: t('penelitian'), path: getLocalizedRoute('penelitian') },
    {
      label: currentPenelitian
        ? lang === "id"
          ? currentPenelitian.judul
          : currentPenelitian.title
        : t("unk"),
      path: currentPenelitian
        ? getLocalizedRoute('detail_penelitian', { 
          title: lang === 'id' 
            ? currentPenelitian.judul.toLowerCase().replace(/\s+/g, '+') 
            : currentPenelitian.title.toLowerCase().replace(/\s+/g, '+'),
        })
        : getLocalizedRoute("researchNotFound"),
    },
    { label: t('foto'), path: '/' },
  ];

  if (loadingResearch || loadingImages) return <div className="h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="space-y-4 pt-[100px] md:pt-[120px] px-4 lg:px-[140px] pb-8 md:pb-16">
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <div className="mt-2 mb-4">
          <Typography type="heading5" weight="semibold">
            {t("d_f_dokumentasi")}
          </Typography>
          <div className="w-10 h-1 bg-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {images.length > 0 ? (
          images.map((image, index) => (
            <Image key={image.id} image={image} index={index} images={images} baseUrl={baseUrl} showOptions={false} isDeleting={false} variant="default" mode="main" />
          ))
        ) : (
          <div>No images available</div>
        )}
      </div>
    </div>
  );
};

export default FotoPenelitian;