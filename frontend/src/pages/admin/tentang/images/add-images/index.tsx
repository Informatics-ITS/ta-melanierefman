import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Typography } from "../../../../../components/atom/typography";
import { Button } from "../../../../../components/atom/button";
import Input from "../../../../../components/molecule/form/input";
import InputImage from "../../../../../components/molecule/form/image";
import Modal from "../../../../../components/molecule/modal";
import Toast from "../../../../../components/molecule/toast";

import { useCreateData } from "../../../../../hooks/crud/useCreateData";
import { useToast } from "../../../../../hooks/useToast";
import { useModal } from "../../../../../hooks/useModal";

type CreateAboutImageProps = {
  type: "section1" | "section2";
  onSuccess?: () => void;
};

const CreateAboutImage: React.FC<CreateAboutImageProps> = ({ type, onSuccess }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { createData } = useCreateData();
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen: isFormModalOpen, openModal: formModalOpen, closeModal: formModalClose } = useModal();
  const { isModalOpen: isConfirmModalOpen, openModal: confirmModalOpen, closeModal: confirmModalClose } = useModal();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  
  const [formValues, setFormValues] = useState({
    keterangan: "",
    caption: "",
    about_type: type,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    let newErrors: Record<string, string> = {};

    if (!uploadedImage) {
      newErrors.image = "The image must be uploaded.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("error", "Please check the information you entered.");
      return;
    }

    confirmModalOpen();
  };

  useEffect(() => {
    if (!isFormModalOpen) {
      setFormValues({
        keterangan: "",
        caption: "",
        about_type: type,
      });
      setUploadedImage(null);
      setErrors({});
    }
  }, [isFormModalOpen, type]);

  const handleConfirm = async () => {
    const data = new FormData();
    data.append("keterangan", formValues.keterangan);
    data.append("caption", formValues.caption);
    data.append("about_type", type);

    if (uploadedImage) {
      data.append("image", uploadedImage);
    }
    
    try {
      const { data: result, errors: beErrors } = await createData(
        `${baseUrl}/api/documentation/about/images`,
        data
      );

      if (result) {
        formModalClose();
        confirmModalClose();
        if(onSuccess) onSuccess();
        addToast("success", `Gambar berhasil diunggah!`);
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Gagal mengunggah gambar. Silakan coba lagi.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  return (
    <div>
      <Button variant="outline" iconLeft={<Plus />} onClick={formModalOpen}>Tambah Foto</Button>

      <Modal isOpen={isFormModalOpen} onClose={formModalClose} title="Tambah Thumbnail" showFooter={false}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Typography type="body" font="dm-sans" className="text-typo">Upload Gambar</Typography>
          {uploadedImage ? (
            <img 
              src={URL.createObjectURL(uploadedImage)} 
              alt="Preview" 
              className="h-48 w-full object-cover rounded-lg" 
            />
          ) : (
            <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-lg">
              Tidak ada gambar
            </div>
          )}
          <InputImage onInputImage={setUploadedImage} mode="browse" />
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
          <Button type="submit" variant="primary" className="w-full">Simpan</Button>
        </form>
      </Modal>

      <Modal
        sizeClass="md:w-1/4"
        isOpen={isConfirmModalOpen}
        onClose={confirmModalClose}
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

export default CreateAboutImage;