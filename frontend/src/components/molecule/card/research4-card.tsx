import { Link } from "react-router-dom";
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";

import { Typography } from '../../atom/typography';
import { Button } from '../../atom/button';
import DropdownMenu from "../dropdown";

import { PenelitianProps } from '../../../entities/penelitian';
import { ProgresPenelitianProps } from "../../../entities/progres-penelitian";

interface CardProps {
  data: ProgresPenelitianProps[];
  currentPenelitian: PenelitianProps;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

const ResearchCard: React.FC<CardProps> = ({ data, onDelete, isDeleting, currentPenelitian }) => {
  const navigate = useNavigate();
  return (
    <div className="w-full max-w-full">
      {data.map((item) => {
        const formattedDate = item.created_at ? format(new Date(item.created_at), "dd MMMM yyyy") : "Tanggal Tidak Diketahui";
        const thumbnailImages = item.progress_images?.filter(img => img?.image) || [];
        const imageUrl = Array.isArray(thumbnailImages) && thumbnailImages.length > 0
          ? `${import.meta.env.VITE_API_BASE_URL}/storage/${[...thumbnailImages].sort((a, b) => a.index_order - b.index_order)[0].image}`
          : "/no-image.png";
          
        return (
          <div key={item.id} className="mb-4">
            <div className="md:flex">
              <div className="md:w-[180px] w-full h-[160px] md:mr-3 mb-2 md:mb-0 flex bg-gray-200 border border-typo-outline items-center justify-center rounded-lg">
                <img
                  className="w-full h-full object-cover rounded-lg border border-typo-outline"
                  src={imageUrl || "/no-image.png"}
                  alt={item.title_progress}
                />
              </div>
              <div className="flex flex-col w-full justify-between">
                <div className="space-y-1 md:mb-0">
                  <Link to={`/admin/${currentPenelitian.judul.toLowerCase().replace(/\s+/g, '+')}/${item.judul_progres.toLowerCase().replace(/\s+/g, '+')}`}>
                    <Typography type="paragraph" weight="semibold" className="text-typo line-clamp-2 !leading-tight">
                      {item.judul_progres}
                    </Typography>
                  </Link>
                  <Typography type="caption1" font="dm-sans" weight="regular" className="text-primary">
                    {formattedDate}
                  </Typography>
                  <div className="text-typo line-clamp-3">
                    <Typography type="caption1" font="dm-sans" weight="regular">
                      {item.deskripsi}
                    </Typography>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button to={`/admin/${currentPenelitian.judul.toLowerCase().replace(/\s+/g, '+')}/${item.judul_progres.toLowerCase().replace(/\s+/g, '+')}`} key={item.id} variant="underline">
                    Selengkapnya
                  </Button>
                </div>
              </div>
              <DropdownMenu
                items={[
                  {
                    label: "Edit",
                    onClick: () => navigate(`/admin/penelitian/${currentPenelitian.id}/progres-penelitian/${item.id}/edit`),
                  },
                  {
                    label: isDeleting ? "Menghapus..." : "Hapus",
                    onClick: async () => await onDelete(item.id),
                    textClassName: "text-red-600",
                    disabled: isDeleting,
                  },
                ]}
                variant="default"
                position="top-0 right-0"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResearchCard;