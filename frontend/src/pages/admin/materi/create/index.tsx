import { useState, useEffect } from "react";

import { Typography } from "../../../../components/atom/typography";
import { Button } from "../../../../components/atom/button";
import Input from "../../../../components/molecule/form/input";
import Dropdown from "../../../../components/molecule/form/dropdown";
import InputDocument from "../../../../components/molecule/form/document";
import Modal from "../../../../components/molecule/modal";
import InputImage from "../../../../components/molecule/form/image";

import { useCreateData } from "../../../../hooks/crud/useCreateData";
import { useToast } from "../../../../hooks/useToast";
import { useModal } from "../../../../hooks/useModal";

const CreateMateri: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { createData } = useCreateData();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<File | null>(null);
  const { isModalOpen: isFormModalOpen, openModal: formModalOpen, closeModal: formModalClose } = useModal();
  const { isModalOpen: isConfirmModalOpen, openModal: confirmModalOpen, closeModal: confirmModalClose } = useModal();
  const { addToast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formValues, setFormValues] = useState({
    judul: "",
    title: "",
    type: "file",
    file: "",
    doc_type: "",
    youtube_link: "",
    kata_kunci: "",
    keyword: "",
    thumbnail: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    setFormValues((prev) => ({ ...prev, [name]: value }));
  
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (value.trim() !== "") {
        delete newErrors[name];
      }
      return newErrors;
    });
  };  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
  
    let newErrors: Record<string, string> = {};
  
    if (!formValues.judul) newErrors.judul = "This field is required.";
    if (!formValues.title) newErrors.title = "This field is required.";
  
    if (formValues.type === "video" && !formValues.youtube_link) {
      newErrors.youtube_link = "This field is required.";
    }
  
    if (formValues.type === "file" && !uploadedFile) {
      newErrors.file = "The document must be uploaded.";
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
      setFormValues({ judul: "", title: "", type: "file", file: "", doc_type: "", youtube_link: "", kata_kunci: "", keyword: "", thumbnail: "" });
      setUploadedFile(null);
      setErrors({});
    }
  }, [isFormModalOpen]);  

  const handleAddMateri = () => {
    setFormValues({
      judul: "",
      title: "",
      type: "file",
      doc_type: "lecturer",
      file: "",
      youtube_link: "",
      kata_kunci: "",
      keyword: "",
      thumbnail: "",
    });
    setUploadedFile(null);
    setUploadedThumbnail(null);
    setErrors({});
    formModalOpen();
  };  

  const handleConfirm = async () => {
    const userId = localStorage.getItem("id");
    if (!userId) {
      addToast("error", "User ID not found.");
      return;
    }

    const data = new FormData();
    data.append("user_id", userId);
    data.append("judul", formValues.judul);
    data.append("title", formValues.title);
    data.append("type", formValues.type);
  
    if (formValues.type === "video") {
      data.append("youtube_link", formValues.youtube_link);
    } else if (uploadedFile) {
      data.append("file", uploadedFile);
    }

    if (uploadedThumbnail) {
      data.append("thumbnail", uploadedThumbnail);
    }
    
    data.append("doc_type", formValues.doc_type);
    data.append("kata_kunci", formValues.kata_kunci);
    data.append("keyword", formValues.keyword);

    try {
      const { data: result, errors: beErrors } = await createData(
        `${baseUrl}/api/lecturers`,
        data
      );

      if (result) {
        formModalClose();
        confirmModalClose();
        if (onSuccess) onSuccess();
        addToast("success", "Materi berhasil ditambahkan!");
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Gagal membuat materi. Silakan coba lagi.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  return (
    <div>
      <Button variant="primary" onClick={handleAddMateri}>
        Tambah Materi
      </Button>
      <Modal isOpen={isFormModalOpen} onClose={formModalClose} title={`Tambah Materi`} showFooter={false} sizeClass="md:w-3/5 lg:w-1/3">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Judul (Bahasa Indonesia)"
            id="judul"
            name="judul"
            value={formValues.judul}
            onChange={handleChange}
            placeholder="Masukkan judul materi"
            error={errors.judul}
          />
          <Input
            label="Title (English)"
            id="title"
            name="title"
            value={formValues.title}
            onChange={handleChange}
            placeholder="Enter title in English"
            error={errors.title}
          />
          <Dropdown
            label="Pilih Jenis Materi"
            options={[
              { label: "Dokumen", value: "file" },
              { label: "Video", value: "video" },
            ]}
            selectedValue={formValues.type}
            onChange={(value) => setFormValues({ ...formValues, type: value })}
            placeholder="Pilih Jenis Materi"
            error={errors.type}
            variant="simple"
          />
          {formValues.type === "file" && (
            <div className="space-y-2 mb-4">
              <Typography type="body" font="dm-sans" weight="regular">
                Unggah Dokumen
              </Typography>
              <InputDocument onInputDocument={setUploadedFile} error={errors.file} />
              <Dropdown
                label="Pilih Jenis Dokumen"
                options={[
                  { label: "Materi Pembelajaran", value: "lecturer" },
                  { label: "Petunjuk Teknis", value: "guideline" },
                ]}
                selectedValue={formValues.doc_type}
                onChange={(value) => setFormValues({ ...formValues, doc_type: value })}
                placeholder="Pilih Jenis Dokumen"
                error={errors.doc_type}
                variant="simple"
              />
              <Input
                label="Kata Kunci (Bahasa Indonesia)"
                id="kata_kunci"
                name="kata_kunci"
                value={formValues.kata_kunci}
                onChange={handleChange}
                placeholder="Masukkan maksimal 2 kata kunci"
                description="Pisahkan dengan koma. Contoh: Geokimia, Data Proxy"
                error={errors.kata_kunci}
              />
              <Input
                label="Keywords (English)"
                id="keyword"
                name="keyword"
                value={formValues.keyword}
                onChange={handleChange}
                placeholder="Enter a maximum of 2 keywords in English"
                description="Separate with a comma. Example: Geochemistry, Proxy Data"
                error={errors.keyword}
              />
              <Typography type="caption1" font="dm-sans" className="text-typo">Upload Thumbnail</Typography>
              {uploadedThumbnail ? (
                <img 
                  src={URL.createObjectURL(uploadedThumbnail)} 
                  alt="Preview" 
                  className="h-48 w-full object-cover rounded-xl" 
                />
              ) : (
                <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-xl">
                  Tidak ada gambar
                </div>
              )}
              <InputImage onInputImage={setUploadedThumbnail} mode="browse" />
            </div>
          )}
          {formValues.type === "video" && (
            <Input
              label="Link Video"
              id="youtube_link"
              name="youtube_link"
              value={formValues.youtube_link}
              onChange={handleChange}
              placeholder="Masukkan link video youtube"
              error={errors.youtube_link || errors.general}
            />
          )}
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

export default CreateMateri;