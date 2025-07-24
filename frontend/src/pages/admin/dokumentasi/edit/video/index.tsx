import { useState, useEffect } from "react";

import { Button } from "../../../../../components/atom/button";
import Loading from "../../../../../components/atom/loading";
import Input from "../../../../../components/molecule/form/input";
import Modal from "../../../../../components/molecule/modal";
import Dropdown from "../../../../../components/molecule/form/dropdown";

import { DocumentationProps } from "../../../../../entities/dokumentasi";

import { useFetchData } from "../../../../../hooks/crud/useFetchData";
import { useUpdateData } from "../../../../../hooks/crud/useUpdateData";
import { useToast } from "../../../../../hooks/useToast";
import { useModal } from "../../../../../hooks/useModal";

interface EditVideoProps {
  videoId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: ()=> void;
}

const EditVideo: React.FC<EditVideoProps> = ({ videoId, isOpen, onClose, onSuccess }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const { addToast } = useToast();
  const { isModalOpen: isConfirmModalOpen, openModal: confirmModalOpen, closeModal: confirmModalClose } = useModal();

  const [fetchUrl, setFetchUrl] = useState<string | null>(null);
  const [researchOptions, setResearchOptions] = useState<any[]>([]);

  const { data: researchData, loading: researchLoading } = useFetchData(`${baseUrl}/api/research`);

  useEffect(() => {
    if (videoId) {
      setFetchUrl(`${baseUrl}/api/documentation/${videoId}`);
    }
  }, [videoId, baseUrl]);

  const { data, loading } = useFetchData<DocumentationProps>(fetchUrl || "");
  const { updateData } = useUpdateData(`${baseUrl}/api/documentation/${videoId}`);

  const [formValues, setFormValues] = useState({
    judul: "",
    title: "",
    type: "video",
    youtube_link: "",
    research_id: "",
  });

  useEffect(() => {
    if (data) {
      setFormValues({
        judul: data.judul || "",
        title: data.title || "",
        type: "video",
        youtube_link: data.youtube_link || "",
        research_id: data.research?.length > 0 ? data.research[0].id.toString() : "",
      });
    }
  }, [data]);

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
    formData.append("judul", formValues.judul);
    formData.append("title", formValues.title);
    formData.append("type", formValues.type);
    formData.append("youtube_link", formValues.youtube_link);
    formData.append("research_id", formValues.research_id);

    const response = await updateData(formData);
    if (response.success) {
      onClose();
      confirmModalClose();
      if(onSuccess) onSuccess();
      addToast("success", "Video berhasil diperbarui.");
    } else {
      addToast("error", "Terjadi kesalahan saat memperbarui video.");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Video Kegiatan" showFooter={false} sizeClass="md:w-3/5 lg:w-1/3">
        {loading || researchLoading ? (
            <Loading />
          ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Judul (Bahasa Indonesia)"
              id="judul"
              name="judul"
              placeholder="Masukkan judul"
              value={formValues.judul}
              onChange={handleChange}
            />
            <Input
              label="Title (English)"
              id="title"
              name="title"
              placeholder="Enter title in English"
              value={formValues.title}
              onChange={handleChange}
            />
            <Input
              label="YouTube Link"
              id="youtube_link"
              name="youtube_link"
               placeholder="Masukkan link video youtube"
              value={formValues.youtube_link}
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
              placeholder="Pilih Judul Penelitian"
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

export default EditVideo;