import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Typography } from "../../../atom/typography";

import EditImage from "../../../../pages/admin/dokumentasi/edit/image";

import { DocumentationProps } from "../../../../entities/dokumentasi";
import { ProgressImageProps } from "../../../../entities/progres-penelitian";

interface CarouselProps {
  images: DocumentationProps[] | ProgressImageProps[];
  baseUrl: string;
  variant?: "default" | "detail";
  mode?: "admin" | "main";
  forceLang?: "id" | "en";
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({ images, baseUrl, mode = "main", variant = "default", forceLang, className }) => {
  const { i18n } = useTranslation();
  const lang = mode === "main" ? i18n.language : "id";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalIndex, setModalIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevModal = () => {
    setModalIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextModal = () => {
    setModalIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [images.length, isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen) {
        if (event.key === "Escape") setIsOpen(false);
        if (event.key === "ArrowLeft" || event.key === "<") handlePrevModal();
        if (event.key === "ArrowRight" || event.key === ">") handleNextModal();
      }
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!images || images.length === 0) {
    return <div>No images available</div>;
  }

  const getImageText = (img: { keterangan?: string; caption?: string }) => {
    const displayLang = forceLang ?? lang;
    return displayLang === "id" ? img.keterangan : img.caption;
  };

  const DetailItem = ({ label, value }: { label: string; value?: string }) => (
    <div>
      <Typography type="body" weight="semibold" className="text-primary">
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

  return (
    <>
      <div className={`relative flex justify-center items-center w-full`}>
        <div className="relative w-full overflow-hidden rounded-xl bg-gray-200 border border-typo-outline">
          <button
            onClick={() => {
              setIsOpen(true);
              setModalIndex(currentIndex);
            }}
            className="w-full"
          >
            <img
              className={`w-full ${className} object-cover`}
              src={`${baseUrl}/storage/${images[currentIndex]?.image}`}
              alt={images[currentIndex].caption || "Carousel image"}
            />
          </button>
          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent justify-center bg-opacity-70 text-typo-white p-4">
            <Typography type="caption1" font="dm-sans" weight="regular" className="line-clamp-2 mt-16">
              {getImageText(images[currentIndex])}
            </Typography>
          </div>
          <button
            className="absolute top-1/2 left-4 -translate-y-1/2 p-2 bg-primary rounded-full text-white"
            onClick={handlePrev}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className="absolute top-1/2 right-4 -translate-y-1/2 p-2 bg-primary rounded-full text-white"
            onClick={handleNext}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {isOpen && images[modalIndex] && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <button
            className="absolute top-5 right-5 text-white bg-black bg-opacity-50 p-2 rounded-full z-50"
            onClick={() => setIsOpen(false)}
          >
            <X size={32} />
          </button>

          {variant === "detail" ? (
            <div className="flex w-full h-screen">
              <div className="w-3/4 flex items-center justify-center relative">
                <button className="absolute left-4 text-white z-50" onClick={handlePrevModal}>
                  <ChevronLeft size={40} />
                </button>
                <img
                  className="max-w-full max-h-screen object-contain"
                  src={`${baseUrl}/storage/${images[modalIndex]?.image}`}
                  alt={images[modalIndex].keterangan || "Carousel image"}
                />
                <button className="absolute right-4 text-white z-50" onClick={handleNextModal}>
                  <ChevronRight size={40} />
                </button>
              </div>
              <div className="w-1/4 h-full bg-white p-6 shadow-lg overflow-y-auto">
                <div className="mt-24 space-y-2">
                  <div className="flex items-center">
                    <Typography type="title" weight="semibold">Detail Foto</Typography>
                    {mode === "admin" && (
                      <button onClick={() => handleEdit(Number(images[modalIndex].id))}>
                        <Pencil className="text-typo-secondary hover:text-primary" size={16} />
                      </button>
                    )}
                  </div>
                  {[
                    { label: "Keterangan", value: images[modalIndex]?.keterangan },
                    { label: "Caption", value: images[modalIndex]?.caption },
                    { label: "Judul Penelitian", value: images[modalIndex] && "research" in images[modalIndex] ? images[modalIndex].research?.[0]?.judul : undefined }
                  ].map((item, index) => (
                    <DetailItem key={index} label={item.label} value={item.value} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center w-full">
              <img
                className="max-w-full max-h-[90vh] object-contain"
                src={`${baseUrl}/storage/${images[modalIndex]?.image}`}
                alt={images[modalIndex].caption || "Carousel image"}
              />
              <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-full max-w-screen-md bg-black bg-opacity-70 text-white px-4 py-2 rounded-sm text-center">
                <Typography type="caption1" font="dm-sans" weight="regular">
                  {getImageText(images[modalIndex])}
                </Typography>
              </div>
            </div>
          )}
        </div>
      )}

      {isEditModalOpen && selectedImageId !== null && (
        <EditImage imageId={selectedImageId} isOpen={isEditModalOpen} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default Carousel;