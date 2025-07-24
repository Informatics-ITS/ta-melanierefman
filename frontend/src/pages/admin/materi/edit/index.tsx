import { useState } from "react";
import { Pencil } from "lucide-react";

import { Typography } from "../../../../components/atom/typography";
import { Button } from "../../../../components/atom/button";
import Input from "../../../../components/molecule/form/input";
import Dropdown from "../../../../components/molecule/form/dropdown";
import InputDocument from "../../../../components/molecule/form/document";
import Modal from "../../../../components/molecule/modal";
import InputImage from "../../../../components/molecule/form/image";

import { MateriProps } from "../../../../entities/materi";

import { useUpdateData } from "../../../../hooks/crud/useUpdateData";
import { useToast } from "../../../../hooks/useToast";
import { useModal } from "../../../../hooks/useModal";

const EditMateri: React.FC<{ row: MateriProps; onSuccess?: () => void }> = ({ row, onSuccess }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<File | null>(null);
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);
  const { isModalOpen: isFormModalOpen, openModal: formModalOpen, closeModal: formModalClose } = useModal();
  const { isModalOpen: isConfirmModalOpen, openModal: confirmModalOpen, closeModal: confirmModalClose } = useModal();
  const { addToast } = useToast();

  const [editMateri, setEditMateri] = useState<MateriProps | null>(null);

  const [formValues, setFormValues] = useState({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleEditClick = () => {
    setEditMateri(row);
  
    setFormValues({
      judul: row.judul,
      title: row.title,
      type: row.type,
      doc_type: row.doc_type,
      file: row.file || "",
      youtube_link: row.youtube_link || "",
      kata_kunci: row.kata_kunci || "",
      keyword: row.keyword || "",
      thumbnail: row.thumbnail || "",
    });
  
    if (row.thumbnail) {
      setPreviewThumbnail(`${baseUrl}/storage/${row.thumbnail}`);
    } else {
      setPreviewThumbnail(null);
    }
  
    formModalOpen();
  };  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confirmModalOpen();
  };

  const { updateData } = useUpdateData(`${baseUrl}/api/lecturers/${editMateri?.id}`);

  const handleConfirm = async () => {
    const data = new FormData();
    data.append("judul", formValues.judul);
    data.append("title", formValues.title);
    data.append("type", formValues.type);

    if (formValues.type === "video") {
      data.append("youtube_link", formValues.youtube_link || "");
    }
  
    if (uploadedFile && formValues.type === "file") {
      data.append("file", uploadedFile);
    }

    if (uploadedThumbnail && formValues.type === "file") {
      data.append("thumbnail", uploadedThumbnail);
    }

    if (formValues.type === "file") {
      data.append("doc_type", formValues.doc_type);
    }

    data.append("kata_kunci", formValues.kata_kunci.trim() === "" ? "" : formValues.kata_kunci);
    data.append("keyword", formValues.keyword.trim() === "" ? "" : formValues.keyword);
  
    const response = await updateData(data);
    if (response?.success) {
      formModalClose();
      confirmModalClose();
      if (onSuccess) onSuccess();
      addToast("success", "Materi berhasil diperbarui!");
    } else {
      addToast("error","Terjadi kesalahan saat memperbarui materi.");
    }
  };  

  const handleFileChange = (file: File | null)=>{
    setUploadedFile(file);
  }

  const handleThumbnailChange = (file: File | null)=>{
    setUploadedThumbnail(file);
    setPreviewThumbnail(file ? URL.createObjectURL(file) : null);
  }

  return (
    <div>
      <button 
        className="text-typo hover:text-primary"
        aria-label={`Edit materi ${row.judul}`}
        onClick={() => handleEditClick()}
      >
        <Pencil size={20} />
      </button>

      <Modal isOpen={isFormModalOpen} onClose={formModalClose} title={`Edit Materi`} showFooter={false} sizeClass="md:w-3/5 lg:w-1/3">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Judul (Bahasa Indonesia)"
            id="judul"
            name="judul"
            value={formValues.judul}
            onChange={handleChange}
            placeholder="Masukkan judul materi"
          />
          <Input
            label="Title (English)"
            id="title"
            name="title"
            value={formValues.title}
            onChange={handleChange}
            placeholder="Enter title in English"
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
            variant="simple"
          />
          {formValues.type === "file" && (
            <div className="space-y-2 mb-4">
              <Typography type="body" font="dm-sans" weight="regular">
                Unggah Dokumen
              </Typography>
              <InputDocument onInputDocument={handleFileChange} initialFileName={row.file}/>
              <Dropdown
                label="Pilih Jenis Dokumen"
                options={[
                  { label: "Materi Pembelajaran", value: "lecturer" },
                  { label: "Petunjuk Teknis", value: "guideline" },
                ]}
                selectedValue={formValues.doc_type}
                onChange={(value) => setFormValues({ ...formValues, doc_type: value })}
                placeholder="Pilih Jenis Dokumen"
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
              />
              <Input
                label="Keywords (English)"
                id="keyword"
                name="keyword"
                value={formValues.keyword}
                onChange={handleChange}
                placeholder="Enter a maximum of 2 keywords in English"
                description="Separate with a comma. Example: Geochemistry, Proxy Data"
              />
              <Typography type="caption1" font="dm-sans" className="text-typo">Upload Thumbnail</Typography>
              {previewThumbnail ? (
                <img src={previewThumbnail} alt="Preview" className="h-48 w-full object-cover rounded-xl" />
              ) : (
                <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-xl">
                  Tidak ada gambar
                </div>
              )}
              <InputImage onInputImage={handleThumbnailChange} mode="browse" />
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
        message="Apakah Anda yakin ingin menyimpan perubahan ini? Silakan konfirmasi untuk melanjutkan."
      />
    </div>
  );
};

export default EditMateri;