import { useRef, useState } from "react";
import { FileText, Pencil, FolderOpen } from "lucide-react";
import { Typography } from "../../atom/typography";
import useIsMobile from "../../../hooks/useIsMobile";

interface InputDocumentProps {
  onInputDocument: (file: File | null) => void;
  error?: string;
  initialFileName?: string;
}

const InputDocument: React.FC<InputDocumentProps> = ({ onInputDocument, error, initialFileName }) => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(initialFileName || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDokumenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      onInputDocument(file);
      console.log("File terpilih:", file);
    }
  };

  const displayedFileName = selectedFileName
  ? selectedFileName.length > (isMobile ? 8 : 20)
    ? `${selectedFileName.slice(0, isMobile ? 8 : 20)}...`
    : selectedFileName
  : null;

  return (
    <div>
      <div
        className={`rounded-lg p-4 flex items-center justify-between space-x-4
          ${selectedFileName ? "border-primary border" : "border-dashed border-2 border-typo-inline"} 
          ${error ? "border-red-500" : ""}`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-typo-white2 flex items-center justify-center rounded">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            {displayedFileName ? (
              <Typography type="label" font="dm-sans" className="text-typo-secondary">
                {displayedFileName}
              </Typography>
            ) : (
              <Typography type="caption1" font="dm-sans" className="text-typo-secondary">
                Unggah dokumen format <strong>PDF, DOC, atau DOCX</strong>.
              </Typography>
            )}
          </div>
        </div>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleDokumenChange}
          className="hidden"
          ref={fileInputRef}
        />
        <button type="button" onClick={handleButtonClick} className="md:whitespace-nowrap">
          {selectedFileName ? <Pencil /> : <FolderOpen />}
        </button>
      </div>
      {error && (
        <Typography type="caption1" font="dm-sans" weight="regular" className="text-primary mt-1">
          {error}
        </Typography>
      )}
    </div>
  );
};

export default InputDocument;