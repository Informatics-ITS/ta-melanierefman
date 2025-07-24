import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';

import { Typography } from '../../../../components/atom/typography';
import Loading from '../../../../components/atom/loading';
import BackButton from '../../../../components/atom/button/back';

import { PenelitianProps } from "../../../../entities/penelitian";
import { useFetchData } from '../../../../hooks/crud/useFetchData';

import Overview from './overview';
import ProgresPenelitian from './progres penelitian';
import FotoKegiatan from './foto kegiatan';
import VideoKegiatan from './video kegiatan';

const DetailPenelitianAdmin: React.FC = () => {
  const { title = ""} = useParams<{ title: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const { data, loading, error } = useFetchData<PenelitianProps[]>(`${baseUrl}/api/research`);

  const processedData = data
    ? data.map((research: PenelitianProps) => ({
        ...research,
        partners: research.partners || [],
        research_progress: research.research_progress || [],
        documentation: research.documentations || [],
        members: research.members || [],
        publication: research.publication,
      }))
    : [];

  const currentPenelitian = processedData.find((item) =>
    title === item.judul.toLowerCase().replace(/\s+/g, '+')
  );

  const queryTab = searchParams.get("tab")?.replace(/\+/g, " ") || "Overview";
  const [activeBagian, setActiveBagian] = useState<string>(queryTab);

  useEffect(() => {
    if (activeBagian !== queryTab) {
      navigate(
        {
          pathname: window.location.pathname,
          search: `?tab=${activeBagian.replace(/\s+/g, "+")}`
        },
        { replace: true }
      );
    }
  }, [activeBagian, navigate, queryTab]);

  useEffect(() => {
    setActiveBagian(queryTab);
  }, [queryTab]);

  if (loading) return <Loading />;
  if (error) return <div>{error}</div>;
  if (!currentPenelitian) return <div>Penelitian Tidak Ditemukan</div>;

  return (
    <div>
      <div className="flex-1 px-4 md:py-24 py-20">
        <BackButton />
        <div className="flex items-center justify-between gap-8 my-2">
          <div>
            <Typography
              type="heading6"
              weight="semibold"
              className="text-typo"
            >
              {currentPenelitian.judul}
            </Typography>
            <Typography
              type="caption1"
              font="dm-sans"
              className="text-typo-secondary"
            >
              {currentPenelitian.created_at
                ? format(new Date(currentPenelitian.created_at), "dd MMMM yyyy")
                : ""}
            </Typography>
          </div>
        </div>

        <div className="flex overflow-x-auto whitespace-nowrap space-x-4 mb-4 border-b-2 border-typo-outline pb-1">
          {["Overview", "Progres Penelitian", "Foto Kegiatan", "Video Kegiatan"].map(
            (bagian) => (
              <button
                key={bagian}
                onClick={() => setActiveBagian(bagian)}
                className={`${
                  activeBagian === bagian
                    ? "text-primary font-dm-sans font-semibold"
                    : "text-typo-secondary font-dm-sans hover:text-primary font-medium"
                }`}
              >
                <Typography
                  type="button"
                  font="dm-sans"
                  weight={activeBagian === bagian ? "semibold" : "regular"}
                >
                  {bagian}
                </Typography>
              </button>
            )
          )}
        </div>

        <div className="mt-4">
          {activeBagian === "Overview" && <Overview currentPenelitian={currentPenelitian} />}
          {activeBagian === "Progres Penelitian" && <ProgresPenelitian currentPenelitian={currentPenelitian} />}
          {activeBagian === "Foto Kegiatan" && <FotoKegiatan currentPenelitian={currentPenelitian} />}
          {activeBagian === "Video Kegiatan" && <VideoKegiatan currentPenelitian={currentPenelitian} />}
        </div>
      </div>
    </div>
  );
};

export default DetailPenelitianAdmin;