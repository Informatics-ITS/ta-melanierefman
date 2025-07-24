import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { Button } from "../../../../../components/atom/button";
import { Typography } from "../../../../../components/atom/typography";
import Input from "../../../../../components/molecule/form/input";
import InputImage from "../../../../../components/molecule/form/image";
import Modal from "../../../../../components/molecule/modal";
import Dropdown from "../../../../../components/molecule/form/dropdown";

import { useCreateData } from "../../../../../hooks/crud/useCreateData";
import { useFetchData } from "../../../../../hooks/crud/useFetchData";
import { useToast } from "../../../../../hooks/useToast";
import { useModal } from "../../../../../hooks/useModal";

const CreateImage: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { createData } = useCreateData();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const { addToast } = useToast();
  const { isModalOpen: isFormModalOpen, openModal: formModalOpen, closeModal: formModalClose } = useModal();
  const { isModalOpen: isConfirmModalOpen, openModal: confirmModalOpen, closeModal: confirmModalClose } = useModal();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [researchOption, setResearchOption] = useState<any[]>([]);
  
  const [formValues, setFormValues] = useState({
    type: "image",
    image: "",
    keterangan: "",
    caption: "",
    research_id: "",
  });

  const { data, error } = useFetchData(`${baseUrl}/api/research`);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleResearchChange = (value: string) => {
    setFormValues({ ...formValues, research_id: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let newErrors: Record<string, string> = {};

    if (!uploadedImage) {
      newErrors.image = "The image must be uploaded.";
    }

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
        type: "image",
        image: "",
        keterangan: "",
        caption: "",
        research_id: "",
      });
      setUploadedImage(null);
      setErrors({});
    }
  }, [isFormModalOpen]);

  const handleConfirm = async () => {
    const data = new FormData();
    data.append("keterangan", formValues.keterangan);
    data.append("caption", formValues.caption);
    data.append("type", "image");

    if (uploadedImage) {
      data.append("image", uploadedImage);
    }

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
        if (onSuccess) onSuccess();
        addToast("success", `Gambar berhasil diunggah!`);
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Gagal mengungah gambar. Silakan coba lagi.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    }
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
  
  if (error) return <div>The loading error.</div>;

  return (
    <div>
      <Button variant="primary" iconLeft={<Plus />} onClick={formModalOpen}>Tambah Foto</Button>

      <Modal isOpen={isFormModalOpen} onClose={formModalClose} title={`Tambah Foto Kegiatan`} showFooter={false} sizeClass="md:w-3/5 lg:w-1/3">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Typography type="caption1" font="dm-sans" className="text-typo">Upload Gambar</Typography>
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
          <Dropdown
            label="Judul Penelitian"
            options={researchOption.map((res) => ({
              value: res.id.toString(),
              label: res.judul,
            }))}
            selectedValue={formValues.research_id}
            onChange={handleResearchChange}
            placeholder="Pilih judul penelitian"
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

export default CreateImage;