import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Typography } from "../../atom/typography";
import { Button } from "../../atom/button";

import { ProgresPenelitianProps } from "../../../entities/progres-penelitian";
import { useFormatDate } from "../../../hooks/useFormatDate";
import { useLocalizedRoute } from "../../../hooks/useLocalizedRoute";

interface ResearchProgressCardProps {
  data: ProgresPenelitianProps;
  parentData?: { judul?: string; title?: string };
}

const ResearchProgressCard: React.FC<ResearchProgressCardProps> = ({ data, parentData = {} }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const getLocalizedRoute = useLocalizedRoute();
  const { formatDate } = useFormatDate();

  const thumbnailImages = data.progress_images?.filter(img => img?.image) || [];
  const imageUrl = Array.isArray(thumbnailImages) && thumbnailImages.length > 0
    ? `${import.meta.env.VITE_API_BASE_URL}/storage/${[...thumbnailImages].sort((a, b) => a.index_order - b.index_order)[0].image}`
    : "/no-image.png";
  const parentTitle = lang === "id" ? parentData.judul || "data-not-available" : parentData.title || "data-not-available";
  const progressTitle = lang === "id" ? data.judul_progres || "data-not-available" : data.title_progress || "data-not-available";

  return (
    <div className="items-center mb-4">
      <div className="md:flex">
        <div className="md:w-[180px] w-full h-[160px] mr-3 mb-2 md:mb-0 flex items-center justify-center bg-gray-200 border border-typo-outline rounded-lg">
          <img
            className="w-full h-full object-cover rounded-lg border border-typo-outline"
            src={imageUrl || "/no-image.png"}
            alt={data.judul_progres}
          />
        </div>
        <div className="flex flex-col justify-between w-full">
          <div className="space-y-1 md:mb-0">
            <Link
              to={getLocalizedRoute("progres_penelitian", {
                title: parentTitle.toLowerCase().replace(/\s+/g, "+"),
                progressTitle: progressTitle.toLowerCase().replace(/\s+/g, "+"),
              })}
            >
              <Typography type="paragraph" weight="semibold" className="text-typo line-clamp-2 !leading-tight">
                {progressTitle}
              </Typography>
            </Link>
            <Typography type="caption1" font="dm-sans" className="text-primary">
              {formatDate(data.created_at ?? "", lang)}
            </Typography>
            <div className="text-typo line-clamp-3">
              <Typography type="caption1" font="dm-sans">
                {lang === "id" ? data.deskripsi : data.description}
              </Typography>
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Button
              to={getLocalizedRoute("progres_penelitian", {
                title: parentTitle.toLowerCase().replace(/\s+/g, "+"),
                progressTitle: progressTitle.toLowerCase().replace(/\s+/g, "+"),
              })}
              key={data.id}
              variant="underline"
            >
              {t("button.selengkapnya1")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchProgressCard;