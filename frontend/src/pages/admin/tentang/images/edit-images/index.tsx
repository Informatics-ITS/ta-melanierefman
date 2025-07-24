import { useEffect, useState } from "react";

import { Typography } from "../../../../../components/atom/typography";
import { Button } from "../../../../../components/atom/button";
import Input from "../../../../../components/molecule/form/input";
import InputImage from "../../../../../components/molecule/form/image";
import Modal from "../../../../../components/molecule/modal";

import { DocumentationProps } from "../../../../../entities/dokumentasi";

import { useFetchData } from "../../../../../hooks/crud/useFetchData";
import { useUpdateData } from "../../../../../hooks/crud/useUpdateData";
import { useDelete } from "../../../../../hooks/crud/useDelete";
import { useToast } from "../../../../../hooks/useToast";
import { useModal } from "../../../../../hooks/useModal";

type EditAboutImageProps = {
  type: "section1" | "section2";
  onSuccess?: () => void;
};

const EditAboutImage: React.FC<EditAboutImageProps> = ({ type, onSuccess }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data, error, refetch } = useFetchData<DocumentationProps[]>(`${baseUrl}/api/documentation/about/images?type=${type}`);
  const { deleteData } = useDelete(baseUrl);
  const { updateData } = useUpdateData(`${baseUrl}/api/documentation/about/images`);
  const { addToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const { isModalOpen: isConfirmModalOpen, openModal: confirmModalOpen, closeModal: confirmModalClose } = useModal();
  const [previewImages, setPreviewImages] = useState<
    { id: number; file: File | null; url: string; keterangan: string; caption: string }[]
  >([]);

  useEffect(() => {
    if (data) {
      const images = data.filter((img) => img.about_type === type);
      setPreviewImages(
        images.map((img) => ({
          id: img.id,
          file: null,
          url: `${baseUrl}/storage/${img.image}`,
          keterangan: img.keterangan || "",
          caption: img.caption || "",
        }))
      );
    }
  }, [data, type]);  

  const handleImageUpload = (id: number, file: File | null) => {
    openModal();
    const selectedImage = previewImages.find((img) => img.id === id);
    if (selectedImage) {
      setSelectedImageForModal({
        ...selectedImage,
        file,
        url: file ? URL.createObjectURL(file) : selectedImage.url,
      });
    }
  };

  const handleModalInputChange = (field: "keterangan" | "caption", value: string) => {
    setSelectedImageForModal((prev) =>
      prev ? { ...prev, [field]: value } : null
    );
  };

  const handleConfirm = async () => {
    console.log("handleConfirm is called");
    if (!selectedImageForModal) return;
  
    const { id, file, keterangan, caption } = selectedImageForModal;
    const formData = new FormData();
  
    if (file) {
      formData.append("image", file);
    }
    formData.append("keterangan", keterangan);
    formData.append("caption", caption);
    formData.append("type", type);
  
    const response = await updateData(formData, id);
  
    if (response.success) {
      confirmModalClose();
      closeModal();
      refetch();
      if (onSuccess) onSuccess();
      addToast("success", `Gambar berhasil diperbarui`);
    } else {
      addToast("error", "Terjadi kesalahan saat memperbarui gambar.");
    }
  };  
  
  const [selectedImage, setSelectedImage] = useState<{ id: number; title: string } | null>(null);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  const [selectedImageForModal, setSelectedImageForModal] = useState<{
    id: number;
    file: File | null;
    url: string;
    keterangan: string;
    caption: string;
  } | null>(null);

  const openModalDelete = () => setIsModalDeleteOpen(true);
  const closeModalDelete = () => setIsModalDeleteOpen(false);


  const handleDeleteClick = (id: number, title: string) => {
    setSelectedImage({ id, title });
    openModalDelete();
  }

  const confirmDelete = async () => {
    if (!selectedImage) return;
    try {
      await deleteData(`api/documentation/${selectedImage.id}`, () => {
        setPreviewImages((prev) => prev.filter((img) => img.id !== selectedImage.id));
        if (onSuccess) onSuccess();
        addToast("success", `Gambar ${selectedImage.title} berhasil dihapus.`);
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
      <Typography type="label" font="dm-sans" className="text-typo mb-4">
        Gambar {type === "section1" ? "Section 1" : "Section 2"}
      </Typography>

      {previewImages.map((img, index) => (
        <div key={img.id} className="mb-4">
          <div className="flex items-center justify-between">
            {(type === "section1" || type === "section2") && (
              <Typography type="label" font="dm-sans" className="text-typo">
                Gambar - {index + 1}
              </Typography>
            )}
            {(type === "section1" || type === "section2") && (
              <Button
                variant="underline"
                onClick={() => handleDeleteClick(img.id, `Gambar - ${index + 1}`)}
              >
                Hapus
              </Button>
            )}
          </div>
          <div className="md:flex flex-row gap-4 items-center">
            <div className="h-48 md:w-96 w-full md:mb-0 mb-2 overflow-hidden flex items-center justify-center">
              <img src={img.url} alt="Preview" className="h-full w-full object-cover rounded-lg" />
            </div>
            <InputImage
              mode="detail"
              onInputImage={(file) => handleImageUpload(img.id, file)}
              selectedFile={img.file}
              onClick={() => handleImageUpload(img.id, null)}
            />
          </div>
        </div>
      ))}

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Edit Thumbnail" showFooter={false}>
        {selectedImageForModal && (
          <form className="space-y-4">
            <img 
              src={selectedImageForModal.file ? URL.createObjectURL(selectedImageForModal.file) : selectedImageForModal.url} 
              alt="Preview" 
              className="h-48 w-full object-cover rounded" 
            />
            <InputImage
              mode="browse"
              onInputImage={(file) => handleImageUpload(selectedImageForModal.id, file)}
              selectedFile={selectedImageForModal.file || null}
            />
            <Input
              id={`keterangan-${selectedImageForModal.id}`}
              name="keterangan"
              label="Keterangan (Bahasa Indonesia)"
              placeholder="Masukkan keterangan"
              value={selectedImageForModal.keterangan}
              onChange={(e) => handleModalInputChange("keterangan", e.target.value)}
            />
            <Input
              id={`caption-${selectedImageForModal.id}`}
              name="caption"
              label="Caption (English)"
              placeholder="Enter caption in English"
              value={selectedImageForModal.caption}
              onChange={(e) => handleModalInputChange("caption", e.target.value)}
            />
            <Button type="button" onClick={() => confirmModalOpen()} variant="primary" className="w-full">
              Simpan
            </Button>
          </form>
        )}
      </Modal>

      <Modal
        sizeClass="md:w-1/4"
        isOpen={isConfirmModalOpen}
        onClose={confirmModalClose}
        onConfirm={handleConfirm}
        title="Konfirmasi Simpan Data"
        message="Apakah Anda yakin ingin menyimpan perubahan ini? Silakan konfirmasi untuk melanjutkan."
      />

      <Modal
        sizeClass="md:w-1/4"
        isOpen={isModalDeleteOpen}
        onClose={closeModalDelete}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus Gambar"
        message={`Apakah Anda yakin ingin menghapus gambar ini?`}
      />
    </div>
  );
};

export default EditAboutImage;