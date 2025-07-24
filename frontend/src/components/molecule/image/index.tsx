import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pencil, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DocumentationProps } from "../../../entities/dokumentasi";
import DropdownMenu from "../dropdown";
import { Typography } from "../../atom/typography";
import EditImage from "../../../pages/admin/dokumentasi/edit/image";

interface ImageWithModalProps {
  image: DocumentationProps;
  index: number;
  images: DocumentationProps[];
  baseUrl: string;
  variant?: "default" | "detail";
  mode?: "admin" | "main";
  showOptions?: boolean;
  onDelete?: (id: number, judul: string) => void;
  isDeleting?: boolean;
  onClick?: () => void;
  refetch?: () => void;
}

const Image: React.FC<ImageWithModalProps> = ({
  image,
  index,
  images,
  baseUrl,
  variant = "default",
  mode = "main",
  onDelete,
  isDeleting,
  onClick,
  refetch,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(index);

  const openModal = () => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const nextImage = useCallback(() => {
    if (images.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  }, [images.length]);

  const prevImage = useCallback(() => {
    if (images.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    }
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") nextImage();
      else if (event.key === "ArrowLeft") prevImage();
      else if (event.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, nextImage, prevImage]);

  const DetailItem = ({ label, value }: { label: string; value?: string }) => (
    <div>
      <Typography type="body" font="dm-sans" weight="semibold" className="text-primary">
        {label}:
      </Typography>
      <Typography type="body" font="dm-sans">
        {value || "Tidak tersedia"}
      </Typography>
    </div>
  );

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  const handleEdit = (id: number) => {
    setSelectedImageId(id);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedImageId(null);
  };

  const {i18n} = useTranslation();
  const lang = i18n.language;

  const getImageText = (img: { keterangan?: string; caption?: string }) => {
    if (mode === "main") {
      return lang === "id" ? img.keterangan : img.caption;
    }
    return img.keterangan;
  };
  
  return (
    <div className="relative w-full">
      <button onClick={onClick ? onClick : openModal} className="focus:outline-none w-full">
        <img
          className="w-full aspect-[16/9] object-cover rounded-xl"
          src={`${baseUrl}/storage/${image.image}`}
          alt={image.judul}
        />
      </button>
      {mode === "admin" && (
        <div className="absolute top-2 right-2">
          <DropdownMenu
            items={[
              { label: "Edit", onClick: () => handleEdit(image.id) },
              { label: "Hapus", onClick: () => onDelete?.(image.id, image.judul), disabled: isDeleting, textClassName: "text-rose-600" },
            ]}
            variant="icon"
          />
        </div>
      )}

      {isOpen && images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <button
            className="absolute top-5 right-5 text-white bg-black bg-opacity-50 p-2 rounded-full z-50"
            onClick={closeModal}
          >
            <X size={32} />
          </button>

          {variant === "detail" ? (
            <div className="flex flex-col lg:flex-row w-full h-screen">
              <div className="flex-1 flex items-center justify-center mt-16 md:mt-0 relative">
                <button className="absolute left-5 text-white z-50" onClick={prevImage}>
                  <ChevronLeft size={40} />
                </button>
                <img
                  className="md:max-w-full md:max-h-screen md:object-contain h-[280px] w-full md:w-auto md:h-auto object-cover"
                  src={`${baseUrl}/storage/${images[currentIndex]?.image}`}
                  alt={images[currentIndex]?.judul || "Image"}
                />
                <button className="absolute right-5 text-white z-50" onClick={nextImage}>
                  <ChevronRight size={40} />
                </button>
              </div>
              <div className="w-full h-[240px] lg:w-[300px] lg:h-full bg-white p-6 shadow-lg overflow-y-auto">
                <div className="md:mt-24 space-y-2">
                  <div className="flex items-center">
                    <Typography type="title" font="dm-sans" weight="semibold">Detail Foto</Typography>
                    <button>
                      <Pencil className="text-typo-secondary hover:text-primary" size={16} onClick={() => handleEdit(images[currentIndex].id)} />
                    </button>
                  </div>
                  
                  {[ 
                    { label: "Keterangan", value: images[currentIndex]?.keterangan },
                    { label: "Caption", value: images[currentIndex]?.caption },
                    { label: "Judul Penelitian", value: images[currentIndex]?.research?.[0]?.judul }
                  ].map((item, index) => (
                    <DetailItem key={index} label={item.label} value={item.value} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center">
              <button className="fixed left-5 top-1/2 transform -translate-y-1/2 text-white z-50" onClick={prevImage}>
                <ChevronLeft size={40} />
              </button>

              <img
                className="max-w-full max-h-screen object-contain"
                src={`${baseUrl}/storage/${images[currentIndex]?.image}`}
                alt={images[currentIndex]?.judul || "Image"}
              />

              {images[currentIndex]?.keterangan && (
                <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-full max-w-screen-md bg-black bg-opacity-70 text-white px-4 py-2 rounded-sm text-center">
                  <Typography type="caption1" font="dm-sans" weight="regular">
                    {getImageText(images[currentIndex])}
                  </Typography>
                </div>
              )}

              <button className="fixed right-5 top-1/2 transform -translate-y-1/2 text-white z-50" onClick={nextImage}>
                <ChevronRight size={40} />
              </button>
            </div>
          )}
        </div>
      )}

      {isEditModalOpen && selectedImageId !== null && (
        <EditImage
          imageId={selectedImageId}
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default Image;