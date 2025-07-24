import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Typography } from "../../../../../components/atom/typography";
import { Button } from "../../../../../components/atom/button";
import Loading from "../../../../../components/atom/loading";
import Breadcrumb from "../../../../../components/molecule/breadcrumb";
import Carousel from "../../../../../components/molecule/card/image/carousel";
import SingleImage from "../../../../../components/molecule/card/image/single";
import ThreeCards from "../../../../../components/molecule/card/3-cards";

import { ProgresPenelitianProps, ProgressVideoProps, TextEditorProps, ProgressImageProps, ProgressMapProps } from "../../../../../entities/progres-penelitian";
import { PenelitianProps } from "../../../../../entities/penelitian";

import { useFetchData } from "../../../../../hooks/crud/useFetchData";
import { useLocalizedRoute } from "../../../../../hooks/useLocalizedRoute";

const PenelitianProgres: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const getLocalizedRoute = useLocalizedRoute();
  const { title, progressTitle } = useParams<{ title: string; progressTitle: string }>();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const [researchId, setResearchId] = useState<number | null>(null);
  const [progressId, setProgressId] = useState<number | null>(null);
  const [otherProgress, setOtherProgress] = useState<ProgresPenelitianProps[]>([]);
  const [otherResearch, setOtherResearch] = useState<any[]>([]);
  const [currentPenelitian, setCurrentPenelitian] = useState<any>(null);

  const [totalProgress, setTotalProgress] = useState<number>(0);

  const { data: researchData, loading: researchLoading } = useFetchData<PenelitianProps[]>(`${baseUrl}/api/research`);

  useEffect(() => {
    if (Array.isArray(researchData)) {
      const foundResearch = researchData.find((research: any) => {
        const researchTitleSlug = research.title?.toLowerCase().replace(/\s+/g, "+");
        const researchJudulSlug = research.judul?.toLowerCase().replace(/\s+/g, "+");
        return title === researchTitleSlug || title === researchJudulSlug;
      });

      if (foundResearch) {
        setResearchId(foundResearch.id);
        setCurrentPenelitian(foundResearch);

        const otherResearchesList = Array.isArray(researchData)
          ? researchData
              .filter((r: any) => r?.id !== foundResearch?.id)
              .filter((r: any) => r?.updated_at || r?.created_at)
              .sort((a, b) => {
                const dateA = new Date(a.updated_at || a.created_at || "").getTime();
                const dateB = new Date(b.updated_at || b.created_at || "").getTime();
                return dateB - dateA;
              })
              .slice(0, 3)
          : [];
        setOtherResearch(otherResearchesList);

      }
    }
  }, [title, researchData]);

  useEffect(() => {
    if (researchId) {
      const progressUrl = `${baseUrl}/api/research/${researchId}/progress`;
      fetch(progressUrl)
      .then((res) => res.json())
      .then((progressData) => {
        const data = progressData as ProgresPenelitianProps[];

        setTotalProgress(data.length);

        const selectedProgress = data.find((progress) => {
          const progressTitleSlug = progress.title_progress?.toLowerCase().replace(/\s+/g, "+");
          const progressJudulSlug = progress.judul_progres?.toLowerCase().replace(/\s+/g, "+");
          return progressTitle === progressTitleSlug || progressTitle === progressJudulSlug;
        });

        if (selectedProgress) {
          setProgressId(selectedProgress.id);
          const filteredProgress = Array.isArray(data)
            ? data
                .filter((prog) => prog?.id !== selectedProgress?.id)
                .sort((a, b) => {
                  const dateA = a?.created_at ? new Date(a.created_at).getTime() : 0;
                  const dateB = b?.created_at ? new Date(b.created_at).getTime() : 0;
                  return dateB - dateA;
                })
                .slice(0, 3)
            : [];

          setOtherProgress(filteredProgress);
        }
      })
      .catch((err) => console.error("Error fetching progress data:", err));
    }
  }, [researchId, progressTitle, progressId]); 

  const { data, loading } = useFetchData<ProgresPenelitianProps[]>(
    title && progressTitle ? `${baseUrl}/api/research/${title}/progress/${progressTitle}` : ""
  );

  if (loading || researchLoading || !currentPenelitian) return <div className="h-screen flex items-center justify-center"><Loading /></div>;
  if (!data || data.length === 0) return <div>Error loading data</div>;

  const parsedData = {
    judul_progres: data[0]?.judul_progres || "",
    title_progress: data[0]?.title_progress || "",
    deskripsi: data[0]?.deskripsi || "",
    description: data[0]?.description || "",
    images: data
      .filter((item) => "image" in item && "keterangan" in item && "caption" in item)
      .map((item) => item as unknown as ProgressImageProps),
    videos: data
      .filter((item) => "youtube_link" in item)
      .map((item) => item as unknown as ProgressVideoProps),
    maps: data
      .filter((item) => "longitude" in item)
      .map((item) => item as unknown as ProgressMapProps),
    text_editors: data
      .filter((item) => "text_editor_id" in item && "text_editor_en" in item)
      .map((item) => item as unknown as TextEditorProps),
  };

  const mergedContent = [...parsedData.images, ...parsedData.videos, ...parsedData.text_editors, ...parsedData.maps];
  const sortedContent = Array.isArray(mergedContent)
    ? [...mergedContent].sort((a, b) => (a.index_order ?? 0) - (b.index_order ?? 0))
    : [];

  const groupedImages: { [key: number]: ProgressImageProps[] } = {};
    parsedData.images.forEach((img) => {
      const index = img.index_order ?? 0;
      if (!groupedImages[index]) {
        groupedImages[index] = [];
      }
      groupedImages[index].push(img);
    });
  
  const renderedImageIndexes = new Set<number>();

  const breadcrumbItems = [
    { label: t("beranda"), path: "/" },
    { label: t("penelitian"), path: getLocalizedRoute("penelitian") },
    {
      label: currentPenelitian?.judul || currentPenelitian?.title || t("unk"),
      path: currentPenelitian?.judul || currentPenelitian?.title
        ? getLocalizedRoute('detail_penelitian', {
            title: lang === 'id'
              ? currentPenelitian?.judul?.toLowerCase().replace(/\s+/g, '+')
              : currentPenelitian?.title?.toLowerCase().replace(/\s+/g, '+'),
          })
        : getLocalizedRoute("researchNotFound"),
    },
    {
      label: data ? (lang === "id" ? parsedData.judul_progres : parsedData.title_progress) : t("unk"),
      path: "#",
    },
  ];

  const showOtherResearch = totalProgress < 4;
  const showOtherProgress = totalProgress >= 4;

  return (
    <div className="space-y-4 pt-[100px] lg:pt-[120px] px-4 lg:px-[140px] pb-8 lg:pb-16">
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 lg:mr-4 lg:mb-0 space-y-4">
          <Typography type="heading5" weight="bold" className="text-typo !leading-tight">
            {lang === "id" ? parsedData.judul_progres : parsedData.title_progress}
          </Typography>

          {sortedContent.map((item, index) => {
            if ("youtube_link" in item) {
              const videoId = item.youtube_link.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=))([^&]+)/)?.[1];

              return (
                <div key={index} className="my-8 w-full max-w-[1280px] mx-auto">
                  {videoId && (
                    <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingTop: "56.25%" }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full shadow-lg yt-video"
                        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                        title="YouTube Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              );
            } else if ("text_editor_id" in item || "text_editor_en" in item) {
              return (
                <div key={index} className="my-4 tiptap-editor">
                  <Typography type="body">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: lang === "id"
                          ? (item as TextEditorProps).text_editor_id
                          : (item as TextEditorProps).text_editor_en,
                      }}
                    />
                  </Typography>
                </div>
              );
            } else if ("longitude" in item) {
              return (
                <div key={index} className="my-8 w-full max-w-[1280px] mx-auto">
                  <div className="w-full lg:aspect-[16/9] aspect-[4/3] rounded-xl overflow-hidden border">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&center=${item.latitude || '-6.20876'},${item.longitude || '106.84513'}&zoom=${item.zoom || 12}`}
                      loading="lazy"
                      style={{ border: 0 }}
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              );
            } else if ("image" in item && "index_order" in item) {
              const currentIndex = item.index_order ?? 0;

              if (renderedImageIndexes.has(currentIndex)) {
                return null;
              }
            
              renderedImageIndexes.add(currentIndex);
            
              const images = groupedImages[currentIndex] || [];
            
              return (
                <div key={index} className="my-4">
                  {images.length === 1 ? (
                    <SingleImage
                      image={{
                        imageUrl: `${baseUrl}/storage/${images[0].image}`,
                        keterangan: images[0].keterangan,
                        caption: images[0].caption,
                      }}
                      variant="rounded"
                      className="aspect-[4/3] lg:aspect-[16/9]"
                    />
                  ) : (
                    <Carousel baseUrl={baseUrl} images={images} className="lg:aspect-[16/9] aspect-[4/3]"/>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
        <div className="w-full lg:w-1/3 space-y-2">
          {showOtherProgress && (
            <>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <Typography type="heading5" weight="semibold">
                    {t("lain")}
                  </Typography>
                  <div className="w-14 h-1 bg-primary" />
                </div>
                <Button 
                  to={getLocalizedRoute('list_progres_penelitian', {
                    title: lang === 'id'
                      ? currentPenelitian.judul.toLowerCase().replace(/\s+/g, '+')
                      : currentPenelitian.title.toLowerCase().replace(/\s+/g, '+'),
                  })}
                  variant='outline'
                  >{t('button.selengkapnya2')}
                </Button>
              </div>
              <ThreeCards data={otherProgress} parentData={{ judul: currentPenelitian.judul, title: currentPenelitian.title }} />
            </>
          )}
          {showOtherResearch && (
            <>
              <div className='flex items-center justify-between mb-4'>
                <div>
                  <Typography type="heading6" weight="semibold">
                    {t("lain")}
                  </Typography>
                  <div className="w-14 h-1 bg-primary" />
                </div>
                <Button 
                  to={t('routes.penelitian')}
                  variant="outline">{t('button.selengkapnya2')}
                </Button>
              </div>
              <ThreeCards data={otherResearch} parentData={{ judul: currentPenelitian.judul, title: currentPenelitian.title }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PenelitianProgres;