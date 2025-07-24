import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";

import { Typography } from "../../../../../components/atom/typography";
import { Button } from "../../../../../components/atom/button";
import Input from "../../../../../components/molecule/form/input";
import InputImage from "../../../../../components/molecule/form/image";
import Modal from "../../../../../components/molecule/modal";
import Toast from "../../../../../components/molecule/toast";

import { useCreateData } from "../../../../../hooks/crud/useCreateData";
import { useToast } from "../../../../../hooks/useToast";

interface CreateImagePenelitianProps {
  onImageCreate?: () => void;
}

const CreateImagePenelitian: React.FC<CreateImagePenelitianProps> = ({ onImageCreate }) => {
  const { id } = useParams();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { createData } = useCreateData();
  const { toasts, addToast, removeToast } = useToast();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  
  const [formValues, setFormValues] = useState({
    image: "",
    keterangan: "",
    caption: "",
  });

  const openFormModal = () => setIsFormModalOpen(true);
  const closeFormModal = () => setIsFormModalOpen(false);
  const openConfirmModal = () => setIsConfirmModalOpen(true);
  const closeConfirmModal = () => setIsConfirmModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setErrors({});

    let newErrors: Record<string, string> = {};

    if (!uploadedImage) {
      newErrors.image = "The image must be uploaded.";
    }

    if (!id) {
      newErrors.research_id = "Research ID is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("error", "Please check the information you entered.");
      return;
    }

    openConfirmModal();
  };

  useEffect(() => {
    if (!isFormModalOpen) {
      setFormValues({
        image: "",
        keterangan: "",
        caption: "",
      });
      setUploadedImage(null);
      setErrors({});
    }
  }, [isFormModalOpen]);

  const handleConfirm = async () => {
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    const data = new FormData();
    data.append("keterangan", formValues.keterangan);
    data.append("caption", formValues.caption);
    data.append("research_id", id || "");

    if (uploadedImage) {
      data.append("image", uploadedImage);
    }

    try {
      const { data: result, errors: beErrors } = await createData(
        `${baseUrl}/api/documentation/create-details`,
        data
      );

      if (result) {
        addToast("success", `Gambar berhasil diunggah!`);
        setFormValues({
          image: "",
          keterangan: "",
          caption: "",
        });
        setUploadedImage(null);
        closeFormModal();
        closeConfirmModal();
        
        // Trigger refetch di parent component
        if (onImageCreate) {
          onImageCreate();
        }
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Gagal mengunggah gambar. Silakan coba lagi.");
        closeConfirmModal();
      }
    } catch (error) {
      console.error("Error in CreateImagePenelitian:", error);
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
      closeConfirmModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Button variant="outline" iconLeft={<Plus />} onClick={openFormModal}>
        Tambah Foto
      </Button>

      <Modal 
        isOpen={isFormModalOpen} 
        onClose={closeFormModal} 
        title="Tambah Thumbnail" 
        showFooter={false} 
        sizeClass="md:w-3/5 lg:w-1/3"
      >
        <div onClick={(e) => e.stopPropagation()}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Typography type="label" font="dm-sans" className="text-typo">
              Upload Gambar
            </Typography>
            {uploadedImage ? (
              <img 
                src={URL.createObjectURL(uploadedImage)} 
                alt="Preview" 
                className="h-48 w-full object-cover rounded-xl" 
              />
            ) : (
              <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-xl">
                Tidak ada gambar
              </div>
            )}
            <InputImage onInputImage={setUploadedImage} mode="browse" />
            {errors.image && (
              <p className="text-red-500 text-sm">{errors.image}</p>
            )}
            <Input
              label="Keterangan (Bahasa Indonesia)"
              id="keterangan"
              name="keterangan"
              placeholder="Masukkan keterangan"
              value={formValues.keterangan}
              onChange={handleChange}
              error={errors.keterangan}
            />
            <Input
              label="Caption (English)"
              id="caption"
              name="caption"
              placeholder="Enter caption in English"
              value={formValues.caption}
              onChange={handleChange}
              error={errors.caption}
            />
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full"
            >
              Simpan
            </Button>
          </form>
        </div>
      </Modal>

      <Modal
        sizeClass="md:w-1/2 lg:w-1/4"
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirm}
        title="Konfirmasi Simpan Data"
        message="Apakah Anda yakin ingin menyimpan data ini? Silakan konfirmasi untuk melanjutkan."
      />

      <div>
        {toasts.map((toast) => (
          <Toast 
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}; 

export default CreateImagePenelitian;