import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Typography } from "../../../../../components/atom/typography";
import Loading from "../../../../../components/atom/loading";
import Video from "../../../../../components/molecule/video";
import Breadcrumb from "../../../../../components/molecule/breadcrumb";

import { PenelitianProps } from "../../../../../entities/penelitian";
import { DocumentationProps } from "../../../../../entities/dokumentasi";

import { useFetchData } from "../../../../../hooks/crud/useFetchData";
import { useLocalizedRoute } from "../../../../../hooks/useLocalizedRoute";

const VideoPenelitian: React.FC = () => {
  const { title } = useParams<{ title: string }>();
  const { t, i18n } = useTranslation();
  const getLocalizedRoute = useLocalizedRoute();
  const lang = i18n.language;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const { data: researchData, loading: loadingResearch } = useFetchData<PenelitianProps[]>(`${baseUrl}/api/research`);
  
  const currentPenelitian = researchData?.find((penelitian) =>
    title?.toLowerCase().replace(/\s+/g, "+") === (lang === "id" 
      ? penelitian.judul.toLowerCase().replace(/\s+/g, "+") 
      : penelitian.title.toLowerCase().replace(/\s+/g, "+")
    )
  );

  const videosUrl = currentPenelitian?.id ? `${baseUrl}/api/documentation/videos/${currentPenelitian.id}` : null;

  const { data: rawVideosData, loading: loadingVideos } = useFetchData<DocumentationProps[]>(videosUrl ?? "");

  const videos = Array.isArray(rawVideosData) ? rawVideosData : [];

  const breadcrumbItems = [
    { label: t("beranda"), path: "/" },
    { label: t("penelitian"), path: getLocalizedRoute("penelitian") },
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
    { label: t("video"), path: "/" },
  ];

  if (loadingResearch || loadingVideos) return <div className="h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="space-y-4 pt-[100px] md:pt-[120px] px-4 lg:px-[140px] pb-8 md:pb-16">
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <div className="mt-2 mb-4">
          <Typography type="heading5" weight="semibold">
            {t("d_v_dokumentasi")}
          </Typography>
          <div className="w-10 h-1 bg-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {videos.length > 0 ? (
          videos.map((video) => (
            <Video key={video.id} video={{ id: video.id, youtube_link: video.youtube_link, judul: video.title || video.judul }} isDeleting={false} />
          ))
        ) : (
          <div>No videos available</div>
        )}
      </div>
    </div>
  );
};

export default VideoPenelitian;