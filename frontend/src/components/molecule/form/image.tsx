import { useRef, useState,useEffect } from "react";
import { FolderOpen, Image, Pencil, Trash2 } from "lucide-react";

import { Typography } from "../../atom/typography";
import useIsMobile from "../../../hooks/useIsMobile";
import { Button } from "../../atom/button";

interface InputImageProps {
  onInputImage: (image: File | null) => void;
  className?: string;
  mode?: "browse" | "upload" | "selected" | "detail";
  onClick?: () => void;
  selectedFile?: File | null;
}

const InputImage: React.FC<InputImageProps> = ({ onInputImage, className, mode, onClick, selectedFile }) => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(selectedFile ? selectedFile.name : null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (selectedFile) {
      setSelectedFileName(selectedFile.name);
    }
  }, [selectedFile]);
  

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      onInputImage(file);
    }
  };

  const displayedFileName = selectedFileName
  ? selectedFileName.length > (isMobile ? 10 : 20)
    ? `${selectedFileName.slice(0, isMobile ? 10 : 20)}...`
    : selectedFileName
  : null;

  const handleRemoveFile = () => {
    setSelectedFileName(null);
    onInputImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`w-full bg-white border ${selectedFileName ? "border-primary" : "border-dashed border-2 border-typo-inline"} rounded-lg p-4 flex items-center justify-between ${className || ""}`}>
      <div className="flex items-center gap-4 w-full">
        <div className="w-12 h-12 bg-typo-white2 flex items-center justify-center">
          <Image className="h-6 w-6" />
        </div>
        <div>
          {displayedFileName ? (
            <div className="flex items-center gap-2">
              <Typography type="body" font="dm-sans" className="text-typo-secondary">
                {displayedFileName}
              </Typography>
            </div>
          ) : (
            <Typography type="body" font="dm-sans" className="text-typo-secondary">
              Unggah gambar (JPG, PNG, SVG, GIF) maksimal 10 MB.
            </Typography>
          )}
        </div>
      </div>

      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />

      { mode === "upload" ? (
        <Button onClick={() => onClick && onClick()} className="whitespace-nowrap">
          {selectedFile ? "Lihat Detail" : "Upload"}
        </Button>
      ) : mode === "detail" ? (
        <button type="button" onClick={() => onClick && onClick()} className="text-typo text-sm hover:underline">
          <Pencil />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleFileSelect} className="text-typo text-sm hover:underline">
            <FolderOpen />
          </button>
          {selectedFileName && (
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-primary text-sm hover:underline"
            >
              <Trash2 />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InputImage;