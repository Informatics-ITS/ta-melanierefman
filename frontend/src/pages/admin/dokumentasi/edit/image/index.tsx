import { useState, useEffect } from "react";

import { Button } from "../../../../../components/atom/button";
import { Typography } from "../../../../../components/atom/typography";
import Loading from "../../../../../components/atom/loading";
import Input from "../../../../../components/molecule/form/input";
import InputImage from "../../../../../components/molecule/form/image";
import Modal from "../../../../../components/molecule/modal";
import Dropdown from "../../../../../components/molecule/form/dropdown";

import { DocumentationProps } from "../../../../../entities/dokumentasi";

import { useFetchData } from "../../../../../hooks/crud/useFetchData";
import { useUpdateData } from "../../../../../hooks/crud/useUpdateData";
import { useToast } from "../../../../../hooks/useToast";
import { useModal } from "../../../../../hooks/useModal";

interface EditImageProps {
  imageId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditImage: React.FC<EditImageProps> = ({ imageId, isOpen, onClose, onSuccess }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const { addToast } = useToast();
  const { isModalOpen: isConfirmModalOpen, openModal: confirmModalOpen, closeModal: confirmModalClose } = useModal();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [fetchUrl, setFetchUrl] = useState<string | null>(null);
  const [researchOptions, setResearchOptions] = useState<any[]>([]);

  const [formValues, setFormValues] = useState({
    type: "image",
    image: "",
    keterangan: "",
    caption: "",
    research_id: ""
  });

  useEffect(() => {
    if (imageId) {
      setFetchUrl(`${baseUrl}/api/documentation/${imageId}`);
    }
  }, [imageId, baseUrl]);

  const { data, loading } = useFetchData<DocumentationProps>(fetchUrl || "");
  const { updateData } = useUpdateData(`${baseUrl}/api/documentation/${imageId}`);

  const { data: researchData, loading: researchLoading } = useFetchData(`${baseUrl}/api/research`);

  useEffect(() => {
    if (data) {
      setFormValues((prev) => ({
        ...prev,
        image: data.image || "",
        keterangan: data.keterangan || "",
        caption: data.caption || "",
        research_id: data.research?.length > 0 ? data.research[0].id.toString() : "",
      }));

      if (data.image) {
        setPreviewImage(`${baseUrl}/storage/${data.image}`);
      }
    }
  }, [data, baseUrl]);

  useEffect(() => {
    const userId = localStorage.getItem("id");
    const role = localStorage.getItem("role");

    if (researchData && Array.isArray(researchData) && userId) {
      let filtered = researchData;

      if (role === 'admin') {
        filtered = researchData.filter(item => item.user_id === Number(userId));
      }

      setResearchOptions(filtered);
    } else {
      setResearchOptions([]);
    }
  }, [researchData]);

  useEffect(() => {
    if (researchOptions.length > 0 && formValues.research_id) {
      const selectedResearch = researchOptions.find(
        (res) => res.id.toString() === formValues.research_id
      );
      if (selectedResearch) {
        setFormValues((prev) => ({
          ...prev,
          research_id: selectedResearch.id.toString(),
        }));
      }
    }
  }, [researchOptions, formValues.research_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleResearchChange = (selectedValue: string) => {
    setFormValues({ ...formValues, research_id: selectedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confirmModalOpen();
  };

  const handleConfirm = async () => {
    const formData = new FormData();
    formData.append("type", formValues.type);
    formData.append("keterangan", formValues.keterangan);
    formData.append("caption", formValues.caption);
    formData.append("research_id", formValues.research_id);

    if (uploadedImage) {
      formData.append("image", uploadedImage);
    }

    const response = await updateData(formData);
    if (response.success) {
      onClose();
      confirmModalClose();
      if (onSuccess) onSuccess();
      addToast("success", "Foto berhasil diperbarui.");
    } else {
      addToast("error", "Terjadi kesalahan saat memperbarui foto.");
    }
  };

  const handleImageChange = (file: File | null) => {
    setUploadedImage(file);
    setPreviewImage(file ? URL.createObjectURL(file) : null);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Foto Kegiatan" showFooter={false} sizeClass="md:w-3/5 lg:w-1/3">
        {loading || researchLoading ? (
          <Loading />
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Typography type="label" font="dm-sans" className="text-typo">
              Upload Gambar
            </Typography>
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="h-48 w-full object-cover rounded-xl" />
            ) : (
              <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-xl">
                Tidak ada gambar
              </div>
            )}
            <InputImage onInputImage={handleImageChange} mode="browse" />
            <Input
              label="Keterangan (Bahasa Indonesia)"
              id="keterangan"
              name="keterangan"
              placeholder="Masukkan keterangan"
              value={formValues.keterangan}
              onChange={handleChange}
            />
            <Input
              label="Caption (English)"
              id="caption"
              name="caption"
              placeholder="Enter caption in English"
              value={formValues.caption}
              onChange={handleChange}
            />
            <Dropdown
              label="Judul Penelitian"
              options={researchOptions.map((res) => ({
                value: res.id.toString(),
                label: res.judul
              }))}
              selectedValue={formValues.research_id}
              onChange={handleResearchChange}
              placeholder="Pilih judul penelitian"
            />
            <Button type="submit" variant="primary" className="w-full">
              Simpan
            </Button>
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
    </>
  );
};

export default EditImage;