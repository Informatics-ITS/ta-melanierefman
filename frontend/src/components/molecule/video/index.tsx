import { useState } from "react";
import { FaCirclePlay } from "react-icons/fa6";
import { Typography } from "../../atom/typography";
import DropdownMenu from "../dropdown";
import EditVideo from "../../../pages/admin/dokumentasi/edit/video";

interface YouTubeVideoProps {
  video: {
    id: number;
    youtube_link: string | null;
    judul: string;
  };
  onDelete?: (id: number, judul: string) => void;
  isDeleting: boolean;
  mode?: "main" | "admin";
  refetch?: () => void;
}

const getYouTubeId = (url: string) => {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/(?:[^\/\n\s]+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

const Video: React.FC<YouTubeVideoProps> = ({
  video,
  onDelete,
  isDeleting,
  mode = "main",
  refetch,
}) => {
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  const videoId = getYouTubeId(video.youtube_link ?? "");
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : "";

  const handleEdit = (id: number) => {
    setSelectedVideoId(id);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedVideoId(null);
  };

  return (
    <div className="card relative rounded-xl overflow-hidden">
      <div className="relative aspect-video">
        {videoId ? (
          <div>
            <a
              href={video.youtube_link ?? ""}
              target="_blank"
              rel="noopener noreferrer"
              className="relative"
            >
              <img
                className="w-full h-auto object-cover"
                src={thumbnailUrl}
                alt={`Thumbnail of ${video.judul}`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <FaCirclePlay size={48} className="text-typo-white opacity-75" />
              </div>
            </a>
            {mode === "admin" && (
              <div className="absolute top-2 right-2">
                <DropdownMenu
                  items={[
                    { label: "Edit", onClick: () => handleEdit(video.id) },
                    {
                      label: "Hapus",
                      onClick: () => onDelete?.(video.id, video.judul),
                      disabled: isDeleting,
                      textClassName: "text-rose-600",
                    },
                  ]}
                  variant="icon"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full bg-gray-200 flex items-center justify-center">
            <Typography type="body" font="dm-sans" className="text-gray-500">
              Video tidak tersedia
            </Typography>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparen justify-center text-typo-white p-4">
        <Typography type="caption1" weight="medium" font="dm-sans" className="line-clamp-2">
          {video.judul}
        </Typography>
      </div>

      {isEditModalOpen && selectedVideoId !== null && (
        <EditVideo
          videoId={selectedVideoId}
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default Video;