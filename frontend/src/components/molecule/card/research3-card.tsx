import { Link, useNavigate } from "react-router-dom";
import { format } from 'date-fns';

import { Typography } from '../../atom/typography';
import { Button } from '../../atom/button';
import DropdownMenu from '../dropdown';

import { PenelitianProps } from "../../../entities/penelitian";

interface CardProps {
  data: PenelitianProps[];
  onDelete: (id: number, judul: string) => void;
  isDeleting: boolean;
}

const Card: React.FC<CardProps> = ({ data, onDelete, isDeleting }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-full">
      {data.map((item) => {
        const formattedDate = format(new Date(item.created_at), 'dd MMMM yyyy');

        const thumbnailDocumentation = item.documentations?.find(doc => doc.pivot?.is_thumbnail === 1);
        const firstDocumentation = thumbnailDocumentation || item.documentations?.[0];
        const firstImage = firstDocumentation?.image;
        const imagePath = firstImage ? `${baseUrl}/storage/${firstImage}` : undefined;

        return (
          <div key={item.id} className="items-center mb-4">
            <div className="md:flex">
              <div className="md:w-[180px] w-full h-[160px] mr-3 mb-2 md:mb-0 flex bg-gray-200 border border-typo-outline items-center justify-center rounded-lg">
                <img
                  className="w-full h-full object-cover rounded-lg border border-typo-outline"
                  src={imagePath || "/no-image.png"}
                  alt={item.title}
                />
              </div>
              <div className="flex flex-col w-full justify-between">
                <div className="space-y-1 md:mb-0">
                  <Link to={`/admin/penelitian/${item.judul.toLowerCase().replace(/\s+/g, '+')}`}>
                    <Typography type="paragraph" weight="semibold" className="text-typo line-clamp-2 !leading-tight">
                      {item.judul}
                    </Typography>
                  </Link>
                  <Typography type="caption1" font="dm-sans" className="text-primary">
                    {formattedDate}
                  </Typography>
                  <div className="text-typo line-clamp-3">
                    <Typography type="caption1" font="dm-sans">
                      {item.deskripsi}
                    </Typography>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button to={`/admin/penelitian/${item.judul.toLowerCase().replace(/\s+/g, '+')}`} key={item.id} variant="underline">Selengkapnya</Button>
                </div>
              </div>
              <DropdownMenu
                items={[
                  {
                    label: "Edit",
                    onClick: () => navigate(`/admin/edit-penelitian/${item.id}`),
                  },
                  { label: "Hapus", onClick: () => onDelete(item.id, item.judul), disabled: isDeleting, textClassName: "text-rose-600", },
                ]}
                variant="default"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Card;