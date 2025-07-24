import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import { Typography } from "../../../../components/atom/typography";
import Loading from "../../../../components/atom/loading";
import SingleImage from "../../../../components/molecule/card/image/single";
import Carousel from "../../../../components/molecule/card/image/carousel";

import { AboutResponse, TentangProps } from "../../../../entities/tentang";
import { DocumentationProps } from "../../../../entities/dokumentasi";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/about`;

const Preview: React.FC = () => {
  const { lang } = useParams<{ lang: "id" | "en" }>();
  const [data, setData] = useState<TentangProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<AboutResponse>(API_URL);
        setData(response.data.about);
        localStorage.setItem("about_data", JSON.stringify(response.data.about));
      } catch (error) {
        setError("Gagal mengambil data");
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };

    const storedData = localStorage.getItem("about_data");
    if (storedData) {
      setData(JSON.parse(storedData));
      setLoading(false);
    } else {
      fetchData();
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "about_data") {
        setData(JSON.parse(event.newValue || "{}"));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (loading) return <Loading/>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available.</div>;

  const content =
    lang === "id"
      ? {
          kr: "Kelompok Riset Iklim & Lingkungan Masa Lampau",
          pr: "Pusat Riset Iklim dan Atmosfer, Organisasi Riset Kebumian dan Maritim",
          about: data.tentang || "Belum ada data.",
          focus: data.fokus_penelitian || "Belum ada data.",
          goal: data.tujuan || "Belum ada data.",
        }
      : {
          kr: "Paleoclimate & Paleoenvironment Research Group",
          pr: "Climate and Atmosphere Research Center, Earth and Maritime Research Organization",
          about: data.about || "No data available.",
          focus: data.research_focus || "No data available.",
          goal: data.purpose || "No data available.",
        };

  const getSingleImageByType = (aboutType: string, limit?: number) => {
    const docs = data?.documentation?.filter((doc: any) => doc.about_type === aboutType) || [];
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
    return data?.documentation
      ?.filter((doc: any) => doc.about_type === aboutType)
      .slice(0, limit || data.documentation.length) || [];
  };

  return (
    <div>
      {/* Bagian Header */}
      <div className="space-y-2 px-4 md:px-[200px] py-8 md:py-16">
        <div className="flex flex-col text-center">
          <Typography type="heading4" weight="bold">
            {content.kr}
          </Typography>
          <Typography type="title" font="dm-sans" weight="regular">
            {content.pr}
          </Typography>
        </div>
      </div>

      {/* Tentang KR */}
      <div className="bg-typo-white2 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center justify-center px-4 md:px-[200px] py-8 md:py-16">
        <div className="space-y-4">
          <div className="mb-2">
            <Typography type="heading4" weight="semibold">
              Who We Are
            </Typography>
            <div className="w-14 h-1 bg-primary" />
          </div>
          <Typography type="body" font="dm-sans">
            {content.about}
          </Typography>
        </div>
        {getCarouselByType('section1', 2).length > 1 ? (
          <Carousel
            images={getCarouselByType('section1')}
            baseUrl={baseUrl}
            forceLang={lang}
            className="aspect-[4/3]"
          />
        ) : (
          <SingleImage
            image={getSingleImageByType('section1', 1)[0]} 
            forceLang={lang}
            className="aspect-[4/3]"
            variant="rounded" 
          />
        )}
      </div>

      {/* Tujuan & Fokus Penelitian */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center justify-center px-4 md:px-[200px] py-8 md:py-16">
        <div className="w-full h-full overflow-hidden rounded-xl">
          <div>
            {getSingleImageByType('section2', 3).map((img, index, arr) => {
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
            })}
          </div>
        </div>
        <div className="md:space-y-16 space-y-4">
          <div>
            <div className="mb-2">
              <Typography type="heading4" weight="semibold">
                Our Mission
              </Typography>
              <div className="w-14 h-1 bg-primary" />
            </div>
            <Typography type="body" font="dm-sans">
              {content.goal}
            </Typography>
          </div>
          <div>
            <div className="mb-2">
              <Typography type="heading4" weight="semibold">
                Research Focus Area
              </Typography>
              <div className="w-14 h-1 bg-primary" />
            </div>
            <Typography type="body" font="dm-sans">
              {content.focus}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;