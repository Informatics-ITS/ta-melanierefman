import { useState } from 'react';
import { X } from "lucide-react";
import { useTranslation } from 'react-i18next';

import { Typography } from '../../../atom/typography';

interface ImageProps {
  imageUrl?: string;
  keterangan?: string;
  caption?: string;
}

interface SingleImageProps {
  image?: ImageProps;
  forceLang?: "id" | "en";
  variant?: "default" | "rounded";
  className?: string;
}

const SingleImage: React.FC<SingleImageProps> = ({ image, forceLang, variant = "default", className }) => {
  const { i18n } = useTranslation();
  const lang = forceLang ?? i18n.language;
  const [isOpen, setIsOpen] = useState(false);

  if (!image || !image.imageUrl) {
    return <div>No image available</div>;
  }

  const roundedClass = variant === "rounded" ? "rounded-xl" : "";

  return (
    <>
      <div className={`relative overflow-hidden ${roundedClass} bg-gray-200 border border-typo-outline`}>
        <button onClick={() => setIsOpen(true)} className="w-full">
          <img className={`w-full ${className} object-cover ${roundedClass}`} src={image.imageUrl} alt={image.caption || 'Image'} />
        </button>
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent justify-center bg-opacity-70 text-typo-white p-4">
          <Typography type="caption1" font="dm-sans" weight="regular" className="line-clamp-2 mt-16">
            {lang === "id" ? image.keterangan : image.caption}
          </Typography>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center">
          <div className="absolute top-5 right-5 z-[10000]">
            <button
              onClick={() => setIsOpen(false)}
              className="text-white bg-black bg-opacity-50 hover:bg-opacity-70 p-2 rounded-full transition"
              aria-label="Close image"
            >
              <X size={32} />
            </button>
          </div>

          <div className="relative flex flex-col items-center w-full">
            <img
              className={`max-w-full max-h-[90vh] object-contain ${roundedClass}`}
              src={image.imageUrl}
              alt={image.caption || "Image"}
            />
            <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-full max-w-screen-md bg-black bg-opacity-70 text-white px-4 py-2 rounded-sm text-center">
              <Typography type="caption1" font="dm-sans" weight="regular">
                {lang === "id" ? image.keterangan : image.caption}
              </Typography>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SingleImage;