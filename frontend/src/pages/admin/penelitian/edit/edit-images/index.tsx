import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Typography } from "../../../../../components/atom/typography";
import { Button } from "../../../../../components/atom/button";
import Input from "../../../../../components/molecule/form/input";
import InputImage from "../../../../../components/molecule/form/image";
import Modal from "../../../../../components/molecule/modal";
import Toast from "../../../../../components/molecule/toast";

import { PenelitianProps } from "../../../../../entities/penelitian";

import { useFetchData } from "../../../../../hooks/crud/useFetchData";
import { useUpdateData } from "../../../../../hooks/crud/useUpdateData";
import { useDelete } from "../../../../../hooks/crud/useDelete";
import { useToast } from "../../../../../hooks/useToast";
import { useModal } from "../../../../../hooks/useModal";

interface EditImagesPenelitianProps {
  onImageUpdate?: () => void; // Callback untuk trigger refetch
}

const EditImagesPenelitian: React.FC<EditImagesPenelitianProps> = ({ onImageUpdate }) => {
  const { id } = useParams();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data, error } = useFetchData<PenelitianProps>(`${baseUrl}/api/research/${id}`);
  const { updateData } = useUpdateData(`${baseUrl}/api/documentation/update-details`);
  const { deleteData } = useDelete(baseUrl);
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const { isModalOpen: isConfirmModalOpen, openModal: confirmModalOpen, closeModal: confirmModalClose } = useModal();
  const [previewImages, setPreviewImages] = useState<{ 
    id?: number;
    file: File | null; 
    url?: string; 
    keterangan: string;
    caption: string;
  }[]>([]);
  
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (data?.documentations) {
      const thumbnails = data.documentations
        .filter((doc) => doc.pivot.is_thumbnail === 1)
        .map((doc) => ({
          id: doc.id,
          file: null,
          keterangan: doc.keterangan || "",
          caption: doc.caption || "",
          url: `${baseUrl}/storage/${doc.image}`,
        }));
      setPreviewImages(thumbnails);
    }
  }, [data]);

  const handleImageUpload = (file: File | null, index?: number) => {
    if (index === undefined) return;
  
    setSelectedImageIndex(index);
    openModal();
  
    if (!file) return;
  
    const newImage = { 
      file, 
      url: URL.createObjectURL(file), 
      keterangan: previewImages[index]?.keterangan || "",
      caption: previewImages[index]?.caption || ""
    };
  
    setPreviewImages((prev) => 
      prev.map((img, i) => (i === index ? { ...img, ...newImage } : img))
    );
  };

  const handleModalInputChange = (field: "file" | "keterangan" | "caption", value: any) => {
    if (selectedImageIndex === null) return;
    setPreviewImages((prev) =>
      prev.map((img, i) => (i === selectedImageIndex ? { ...img, [field]: value } : img))
    );
  };

  const handleConfirm = async () => {
    if (selectedImageIndex === null) return;
  
    const image = previewImages[selectedImageIndex];
  
    if (!image.id) {
      addToast("error", "Gagal menyimpan: ID gambar tidak ditemukan.");
      return;
    }
  
    const formData = new FormData();
  
    if (image.file) {
      formData.append("image", image.file);
    }
    if (image.keterangan !== "") {
      formData.append("keterangan", image.keterangan);
    }
    if (image.caption !== "") {
      formData.append("caption", image.caption);
    }
  
    const response = await updateData(formData, Number(image.id));
  
    if (response.success) {
      addToast("success", "Gambar berhasil diperbarui");
      confirmModalClose();
      
      // Trigger refetch di parent component
      if (onImageUpdate) {
        onImageUpdate();
      }
    } else {
      addToast("error", "Terjadi kesalahan saat memperbarui gambar.");
    }
  
    closeModal();
  };  

  const handleSubmitEdit = () => {
    confirmModalOpen();
  };  

  const [selectedImage, setSelectedImage] = useState<{ id: number; title: string } | null>(null);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  const openModalDelete = () => setIsModalDeleteOpen(true);
  const closeModalDelete = () => setIsModalDeleteOpen(false);

  const handleDeleteClick = (id: number, title: string) => {
    setSelectedImage({ id, title });
    openModalDelete();
  }

  const confirmDelete = async () => {
    if (!selectedImage) return;
    try {
      await deleteData(`api/documentation/delete-details/${selectedImage.id}`, () => {
        setPreviewImages((prev) => prev.filter((img) => img.id !== selectedImage.id));
        addToast("success", `Gambar ${selectedImage.title} berhasil dihapus.`);
        
        // Trigger refetch di parent component
        if (onImageUpdate) {
          onImageUpdate();
        }
      });
    } catch (error) {
      addToast("error", "Gagal menghapus gambar.");
    } finally {
      closeModalDelete();
      setSelectedImage(null);
    }
  };  
  
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="space-y-4">
        <div className="underline decoration-primary decoration-2">
          <Typography type="paragraph" weight="semibold">
            Foto Penelitian
          </Typography>
        </div>
        {previewImages.map((image, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <Typography type="label" font="dm-sans" className="text-typo">
                Gambar Penelitian-{index + 1}
              </Typography>
              <Button
                variant="underline"
                onClick={() => handleDeleteClick(image.id!, `Gambar Penelitian-${index + 1}`)}
              >
                Hapus
              </Button>
            </div>
            <div className="md:flex md:flex-row gap-4 items-center">
              <div className="h-48 md:w-96 w-full md:mb-0 mb-2 overflow-hidden flex items-center justify-center bg-gray-100 rounded-xl">
                {image.url || image.file ? (
                  <img 
                    src={image.file ? URL.createObjectURL(image.file) : image.url} 
                    alt={`Preview ${index}`} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">Tidak ada gambar</span>
                )}
              </div>
              <InputImage
                mode="detail"
                onInputImage={(file) => handleImageUpload(file, index)}
                selectedFile={image.file}
                onClick={() => handleImageUpload(null, index)}
              />
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Edit Thumbnail" showFooter={false} sizeClass="md:w-3/5 lg:w-1/3">
        {selectedImageIndex !== null && (
          <form className="space-y-4">
            <Typography type="body" font="dm-sans" className="text-typo">
              Upload Gambar
            </Typography>
            {selectedImageIndex !== null && (previewImages[selectedImageIndex]?.file || previewImages[selectedImageIndex]?.url) ? (
              <img 
                src={previewImages[selectedImageIndex]?.file ? URL.createObjectURL(previewImages[selectedImageIndex]?.file) : previewImages[selectedImageIndex]?.url} 
                alt="Preview" 
                className="h-48 w-full object-cover rounded-xl" 
              />
            ) : (
              <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-xl">
                Tidak ada gambar
              </div>
            )}
            <InputImage
              mode="browse"
              onInputImage={(file) => handleImageUpload(file, selectedImageIndex)}
              selectedFile={previewImages[selectedImageIndex]?.file || null}
            />
            <Input 
              id="keterangan" 
              name="keterangan" 
              label="Keterangan (Bahasa Indonesia)"
              placeholder="Masukkan keterangan"
              value={previewImages[selectedImageIndex]?.keterangan || ""} 
              onChange={(e) => handleModalInputChange("keterangan", e.target.value)} 
            />
            <Input 
              id="caption" 
              name="caption" 
              label="Caption (English)"
              placeholder="Enter caption in English" 
              value={previewImages[selectedImageIndex]?.caption || ""} 
              onChange={(e) => handleModalInputChange("caption", e.target.value)} 
            />
            <Button type="button" onClick={handleSubmitEdit} variant="primary" className="w-full">Simpan</Button>
          </form>
        )}
      </Modal>

      <Modal 
        sizeClass="md:w-1/2 lg:w-1/4"
        isOpen={isConfirmModalOpen}
        onClose={confirmModalClose}
        onConfirm={handleConfirm}
        title="Konfirmasi Simpan Data"
        message="Apakah Anda yakin ingin menyimpan perubahan ini? Silakan konfirmasi untuk melanjutkan."
      />

      <Modal
        sizeClass="md:w-1/2 lg:w-1/4"
        isOpen={isModalDeleteOpen}
        onClose={closeModalDelete}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus Gambar"
        message={`Apakah Anda yakin ingin menghapus ${selectedImage?.title}?`}
      />

      <div>
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

export default EditImagesPenelitian;