import { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { X, Image } from "lucide-react";

import { Button } from "../../../atom/button";
import { Typography } from "../../../atom/typography";

interface ImageData {
  id: number;
  about_type: string;
  image: string;
  caption: string;
  keterangan: string;
}

interface InputImageProps {
  aboutType: string;
  className?: string;
}

const InputImage: React.FC<InputImageProps> = ({ aboutType, className }) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/about/image")
      .then((response) => {
        const data = response.data.data;
        const filteredImages = data.filter((img: ImageData) => img.about_type === aboutType);
        setImages(filteredImages);
      })
      .catch((error) => {
        console.error("Error fetching image data:", error);
      });
  }, [aboutType]);

  const openModal = (img: ImageData) => {
    setSelectedImage(img);
    setIsModalOpen(true);
  };

  return (
    <div className={`${className || ""}`}>
      <div className="space-y-2">
        {images.length > 0 ? (
          images.map((img) => (
            <div
              key={img.id}
              className="border rounded-lg p-4 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded overflow-hidden">
                  {img.image ? (
                    <img
                      src={`http://127.0.0.1:8000/storage/${img.image}`}
                      alt={img.caption || "Gambar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <div>
                  <Typography type="caption1" font="dm-sans" className="text-typo-secondary line-clamp-1">
                    {img.keterangan}
                  </Typography>
                </div>
              </div>
              <Button onClick={() => openModal(img)}>Detail</Button>
            </div>
          ))
        ) : (
          <Typography type="caption1" font="dm-sans" className="text-gray-500">
            Tidak ada gambar untuk kategori ini.
          </Typography>
        )}
      </div>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black bg-opacity-50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="relative w-full max-w-lg bg-white rounded-md shadow-lg">
            <div className="flex justify-between items-center border-b px-6 py-3">
              <Typography type="paragraph" weight="semibold">
                Detail Gambar
              </Typography>
              <button onClick={() => setIsModalOpen(false)} className="text-typo-icon hover:text-typo focus:outline-none">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4">
              {selectedImage && (
                <>
                  <img
                    src={`http://127.0.0.1:8000/storage/${selectedImage.image}`}
                    alt={selectedImage.caption}
                    className="w-full h-auto rounded-md mb-4"
                  />
                  <Typography type="caption1" font="dm-sans" className="text-typo-secondary">
                    <strong>Keterangan:</strong> {selectedImage.keterangan}
                  </Typography>
                  <Typography type="caption1" font="dm-sans" className="text-typo-secondary mt-2">
                    <strong>Caption:</strong> {selectedImage.caption}
                  </Typography>
                </>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default InputImage;