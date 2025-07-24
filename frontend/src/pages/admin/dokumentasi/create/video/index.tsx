import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { Button } from "../../../../../components/atom/button";
import Input from "../../../../../components/molecule/form/input";
import Modal from "../../../../../components/molecule/modal";
import Dropdown from "../../../../../components/molecule/form/dropdown";

import { useCreateData } from "../../../../../hooks/crud/useCreateData";
import { useFetchData } from "../../../../../hooks/crud/useFetchData";
import { useToast } from "../../../../../hooks/useToast";
import { useModal } from "../../../../../hooks/useModal";

const CreateVideo: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { createData } = useCreateData();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const { addToast } = useToast();
  const { isModalOpen: isFormModalOpen, openModal: formModalOpen, closeModal: formModalClose } = useModal();
  const { isModalOpen: isConfirmModalOpen, openModal: confirmModalOpen, closeModal: confirmModalClose } = useModal();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [researchOption, setResearchOption] = useState<any[]>([]);

  const [formValues, setFormValues] = useState({
    judul: "",
    title: "",
    type: "video",
    youtube_link: "",
    research_id: "",
  });

  const { data } = useFetchData(`${baseUrl}/api/research`);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  }; 

  const handleResearchChange = (value: string) => {
    setFormValues({ ...formValues, research_id: value });
  };

  useEffect(() => {
    const userId = localStorage.getItem("id");
    const role = localStorage.getItem("role");
  
    if (data && Array.isArray(data) && userId) {
      let filteredData;
  
      if (role === "admin") {
        filteredData = data.filter((item) => item.user_id === Number(userId));
      } else {
        filteredData = data;
      }
  
      setResearchOption(filteredData);
    } else {
      setResearchOption([]);
    }
  }, [data]); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
  
    let newErrors: Record<string, string> = {};

    if (!formValues.research_id) {
      newErrors.research_id = "Research is required.";
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
        judul: "",
        title: "",
        type: "video",
        youtube_link: "",
        research_id: "",
      });
      setErrors({});
    }
  }, [isFormModalOpen]);    
  
  const handleConfirm = async () => {
    const data = new FormData();
    data.append("judul", formValues.judul);
    data.append("title", formValues.title);
    data.append("youtube_link", formValues.youtube_link);
    data.append("type", "video");

    if (Array.isArray(formValues.research_id)) {
      formValues.research_id.forEach((id, index) => {
        data.append(`research_id[${index}]`, id);
      });
    } else {
      data.append("research_id", formValues.research_id);
    }

    try {
      const { data: result, errors: beErrors } = await createData(
        `${baseUrl}/api/documentation`,
        data
      );

      if (result) {
        formModalClose();
        confirmModalClose();
        if(onSuccess) onSuccess();
        addToast("success", `Video berhasil diunggah!`);
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Gagal mengungah video. Silakan coba lagi.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  return (
    <div>
      <Button variant="primary" iconLeft={<Plus />} onClick={formModalOpen}>Tambah Video</Button>

      <Modal isOpen={isFormModalOpen} onClose={formModalClose} title={`Tambah Video Kegiatan`} showFooter={false} sizeClass="md:w-3/5 lg:w-1/3">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Judul (Bahasa Indonesia)"
            id="judul"
            name="judul"
            placeholder="Masukkan judul"
            value={formValues.judul}
            onChange={handleChange}
            error={errors.judul}
          />
          <Input
            label="Title (English)"
            id="title"
            name="title"
            placeholder="Enter title in English"
            value={formValues.title}
            onChange={handleChange}
            error={errors.title}
          />
          <Input
            label="YouTube Link"
            id="youtube_link"
            name="youtube_link"
            placeholder="Masukkan link video youtube"
            value={formValues.youtube_link}
            onChange={handleChange}
            error={errors.youtube_link}
          />
          <Dropdown
            label="Judul Penelitian"
            options={researchOption.map((res) => ({
              value: res.id.toString(),
              label: res.judul,
            }))}
            selectedValue={formValues.research_id}
            onChange={handleResearchChange}
            placeholder="Pilih Judul Penelitian"
            error={errors.research_id}
          />
          <Button type="submit" variant="primary" className="w-full">Simpan</Button>
        </form>
      </Modal>

      <Modal 
        sizeClass="md:w-1/2 lg:w-1/4"
        isOpen={isConfirmModalOpen}
        onClose={confirmModalClose}
        onConfirm={handleConfirm}
        title="Konfirmasi Simpan Data"
        message="Apakah Anda yakin ingin menyimpan data ini? Silakan konfirmasi untuk melanjutkan."
      />
    </div>
  );
};

export default CreateVideo;