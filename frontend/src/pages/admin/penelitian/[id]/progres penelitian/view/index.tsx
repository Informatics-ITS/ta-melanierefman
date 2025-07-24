import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Typography } from "../../../../../../components/atom/typography";
import BackButton from "../../../../../../components/atom/button/back";
import SingleImage from "../../../../../../components/molecule/card/image/single";
import Carousel from "../../../../../../components/molecule/card/image/carousel";

import { ProgresPenelitianProps, ProgressImageProps, ProgressVideoProps, TextEditorProps, ProgressMapProps } from "../../../../../../entities/progres-penelitian";

import useIsMobile from "../../../../../../hooks/useIsMobile";
import { useFetchData } from "../../../../../../hooks/crud/useFetchData";

const ViewProgresPenelitian: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { title, progressTitle } = useParams<{ title: string; progressTitle: string }>();
  
  const [, setResearchId] = useState<string | null>(null);

  const researchUrl = `${baseUrl}/api/research`;
  const { data: researchData = [], loading: researchLoading, error: researchError } = useFetchData(researchUrl);

  const isMobile = useIsMobile();

  useEffect(() => {
    if (!title) return;

    if (Array.isArray(researchData)) {
      const foundResearch = researchData.find((research: any) => {
        const researchJudulSlug = research.judul?.toLowerCase().replace(/\s+/g, "+") || "";
        return title === researchJudulSlug;
      });

      if (foundResearch) {
        setResearchId(foundResearch.id);
      } else {
        console.error("Research not found:", title);
      }
    }
  }, [title, researchData]);

  const { data, loading, error } = useFetchData<ProgresPenelitianProps[]>(
    title && progressTitle ? `${baseUrl}/api/research/${title}/progress/${progressTitle}` : ""
  );

  if (loading || researchLoading) return <div>Loading...</div>;
  if (error || researchError || !data) return <div>Error loading data</div>;

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

  const renderedImageIndexesID = new Set<number>();
  const renderedImageIndexesEN = new Set<number>();

  return (
    <div className="flex-1 px-4 lg:py-24 py-20">
      <BackButton />
      {isMobile && (
        <div className="my-2 underline decoration-primary decoration-2">
          <Typography type="paragraph" weight="semibold">
            Bahasa Indonesia
          </Typography>
        </div>
      )}
      <div className="lg:flex lg:space-x-8 w-full">
        <div className="lg:w-1/2 space-y-4">
          <Typography type="heading6" weight="semibold" className="text-typo">
            {parsedData.judul_progres}
          </Typography>

          {/* Bahasa */}
          {sortedContent.map((item, index) => {
            if ("youtube_link" in item) {
              const videoId = item.youtube_link.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=))([^&]+)/)?.[1];

              return (
                <div key={index} className="my-8 aspect-video mx-auto">
                  {videoId && (
                    <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-xl yt-video"
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
            } else if ("text_editor_id" in item) {
              return (
                <div key={index} className="my-4 tiptap-editor">
                  <Typography type="body" className="text-justify">
                    <div dangerouslySetInnerHTML={{ __html: item.text_editor_id }} />
                  </Typography>
                </div>
              );
            } else if ("longitude" in item) {
              return (
                <div key={index} className="my-8 mx-auto">
                  <div className="w-full aspect-video rounded-xl overflow-hidden border">
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

              if (renderedImageIndexesID.has(currentIndex)) {
                return null;
              }
            
              renderedImageIndexesID.add(currentIndex);
            
              const images = groupedImages[currentIndex] || [];
            
              return (
                <div key={index} className="my-4">
                  {images.length === 1 ? (
                    <SingleImage
                      image={{
                        imageUrl: `${baseUrl}/storage/${images[0].image}`,
                        keterangan: images[0].keterangan,
                      }}
                      forceLang="id"
                      className="aspect-video"
                      variant="rounded"
                    />
                  ) : (
                    <Carousel baseUrl={baseUrl} forceLang="id" images={images} className="aspect-video"/>
                  )}
                </div>
              );
            }            
            return null;
          })}
        </div>

        <div className="lg:border-l-2 border-gray-300"></div>

        {/* EN */}
        <div className="lg:w-1/2 space-y-4 lg:mt-0 mt-8">
          {isMobile && (
            <div className="underline decoration-primary decoration-2">
              <Typography type="paragraph" weight="semibold">
                Bahasa Inggris
              </Typography>
            </div>
          )}
          <Typography type="heading6" weight="semibold" className="text-typo">
            {parsedData.title_progress}
          </Typography>

          {sortedContent.map((item, index) => {
            if ("youtube_link" in item) {
              const videoId = item.youtube_link.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=))([^&]+)/)?.[1];

              return (
                <div key={index} className="my-8 aspect-video mx-auto">
                  {videoId && (
                    <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-xl yt-video"
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
            } else if ("text_editor_en" in item) {
              return (
                <div key={index} className="my-4 tiptap-editor">
                  <Typography type="body" className="text-justify">
                    <div dangerouslySetInnerHTML={{ __html: item.text_editor_en }} />
                  </Typography>
                </div>
              );
            } else if ("longitude" in item) {
              return (
                <div key={index} className="my-8 mx-auto">
                  <div className="w-full aspect-video rounded-xl overflow-hidden border">
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
            
              if (renderedImageIndexesEN.has(currentIndex)) {
                return null;
              }
            
              renderedImageIndexesEN.add(currentIndex);
            
              const images = groupedImages[currentIndex] || [];
            
              return (
                <div key={index} className="my-4">
                  {images.length === 1 ? (
                    <SingleImage
                      image={{
                        imageUrl: `${baseUrl}/storage/${images[0].image}`,
                        caption: images[0].caption,
                      }}
                      forceLang="en"
                      className="aspect-video"
                      variant="rounded"
                    />
                  ) : (
                    <Carousel baseUrl={baseUrl} forceLang="en" images={images} className="aspect-video"/>
                  )}
                </div>
              );
            }            
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default ViewProgresPenelitian;