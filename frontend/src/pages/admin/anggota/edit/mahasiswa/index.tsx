import { useEffect, useState } from "react";
import { Square, CheckSquare } from "lucide-react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { Typography } from "../../../../../components/atom/typography";
import { Button } from "../../../../../components/atom/button";
import Loading from "../../../../../components/atom/loading";
import BackButton from "../../../../../components/atom/button/back";
import Input from "../../../../../components/molecule/form/input";
import InputImage from "../../../../../components/molecule/form/image";
import Modal from "../../../../../components/molecule/modal";
import Toast from "../../../../../components/molecule/toast";

import { AnggotaProps } from "../../../../../entities/anggota";

import { useFetchData } from "../../../../../hooks/crud/useFetchData";
import { useUpdateData } from "../../../../../hooks/crud/useUpdateData";
import { useToast } from "../../../../../hooks/useToast";
import { useModal } from "../../../../../hooks/useModal";

const EditMahasiswa: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams();
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data, loading, refetch } = useFetchData<AnggotaProps>(`${baseUrl}/api/members/${id}`);
  const { updateData } = useUpdateData(`${baseUrl}/api/members/${id}`);

  const [isLoading, setIsLoading] = useState(false);

  const [formValues, setFormValues] = useState({
    name: "",
    role: "student",
    is_alumni: false,
    educations: [{ id: uuidv4(), degree: "Undergraduate", major: "", university: "" }],
    judul_project: "",
    project_title: "",
    image: "",
  });

  useEffect(() => {
    if (data) {
      setFormValues({
        name: data.name || "",
        role: "student",
        is_alumni: data.is_alumni || false,
        educations: Array.isArray(data.members_education) && data.members_education.length > 0
          ? data.members_education.map((edu) => ({
              id: edu.id?.toString() || uuidv4(),
              degree: edu.degree || "Undergraduate",
              major: edu.major || "",
              university: edu.university || "",
            }))
          : [{ id: uuidv4(), degree: "Undergraduate", major: "", university: "" }],
        judul_project: data.judul_project || "",
        project_title: data.project_title || "",
        image: data.image || "",
      });
  
      if (data.image) {
        setPreviewImage(`${baseUrl}/storage/${data.image}`);
      }
    }
  }, [data]);  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file: File | null) => {
    setUploadedImage(file);
    setPreviewImage(file ? URL.createObjectURL(file) : null);
  };

  const handleEducationChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    setFormValues((prevValues) => {
      const newEducations = [...prevValues.educations];
      if (!newEducations[index]) return prevValues;
  
      newEducations[index] = { ...newEducations[index], [name]: value };
      return { ...prevValues, educations: newEducations };
    });
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", formValues.name);
    formData.append("role", formValues.role);
    formData.append("is_alumni", formValues.is_alumni ? "1" : "0");
    formData.append("judul_project", formValues.judul_project);
    formData.append("project_title", formValues.project_title);

    formValues.educations.forEach((edu, index) => {
      formData.append(`educations[${index}][degree]`, edu.degree);
      formData.append(`educations[${index}][major]`, edu.major);
      formData.append(`educations[${index}][university]`, edu.university);
    });

    if (uploadedImage) formData.append("image", uploadedImage);

    try {
      const response = await updateData(formData);
      if (response.success) {
        addToast("success", "Anggota berhasil diperbarui.");
        closeModal();
        refetch();
      } else {
        addToast("error", "Terjadi kesalahan saat memperbarui anggota.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    } 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openModal();
  };

  if (loading || isLoading) return <Loading />;

  const handleCheckboxChange = () => {
    setFormValues((prevState) => ({
      ...prevState,
      is_alumni: !prevState.is_alumni,
    }));
  };

  return (
    <div className="md:flex-1 space-y-4 px-4 md:py-8 py-4 mt-16">
      <BackButton />
      <Typography type="heading6" weight="semibold">
        Edit Anggota Mahasiswa
      </Typography>

      <form onSubmit={handleSubmit} className="mt-4 space-y-8">
        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2">
            <Typography type="paragraph" weight="semibold">
              Biodata
            </Typography>
          </div>
          <Input 
            label="Nama"
            id="name"
            name="name"
            placeholder="Masukkan nama"
            value={formValues.name}
            onChange={handleChange}
          />
          <div className="space-y-2">
            <Typography type="caption1" font="dm-sans" className="text-typo">Foto</Typography>
            <div className="md:flex md:flex-row gap-4 items-center">
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="h-48 md:w-96 w-full md:mb-0 mb-2 object-cover rounded-lg" />
              ) : (
                <div className="h-48 md:w-96 w-full md:mb-0 mb-2 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-lg">
                  Tidak ada gambar
                </div>
              )}
              <InputImage onInputImage={handleImageChange} mode="browse" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2">
            <Typography type="paragraph" weight="semibold">
              Pendidikan
            </Typography>
          </div>
          <div className="md:grid md:grid-cols-2 gap-4 md:space-y-0 space-y-4">
            <Input
              id={`major`}
              label="Jurusan"
              name="major"
              placeholder="Masukkan jurusan"
              description="Contoh: Oseanografi, Geologi"
              value={formValues.educations.length > 0 ? formValues.educations[0].major : ""}
              onChange={(e) => handleEducationChange(0, e)}
            />
            <Input
              id={`university`}
              label="Universitas"
              name="university"
              placeholder="Masukkan universitas"
              description="Contoh: Institut Teknologi Bandung"
              value={formValues.educations.length > 0 ? formValues.educations[0].university : ""}
              onChange={(e) => handleEducationChange(0, e)}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2">
            <Typography type="paragraph" weight="semibold">
              Proyek/Tugas Akhir
            </Typography>
          </div>
          <Input
            id="judul (Bahasa Indonesia)"
            label="Judul"
            name="judul_project"
            placeholder="Masukkan judul"
            value={formValues.judul_project}
            onChange={handleChange} />
          <Input
            id="title"
            label="Title (English)"
            name="project_title"
            placeholder="Enter title in English"
            value={formValues.project_title}
            onChange={handleChange} />
        </div>

        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleCheckboxChange()}>
          {formValues.is_alumni ? (
            <CheckSquare className="w-6 h-6 text-primary" />
          ) : (
            <Square className="w-6 h-6 text-typo-icon" />
          )}
          <Typography type="label" weight="semibold">Alumni</Typography>
        </div>

        <div className="md:flex md:justify-end">
          <Button type="submit" variant="primary" className="w-full md:w-auto">Simpan</Button>
        </div>
      </form>

      <Modal
        sizeClass="md:w-1/2 lg:w-1/4"
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title="Konfirmasi Simpan Data"
        message="Apakah Anda yakin ingin menyimpan perubahan ini? Silakan konfirmasi untuk melanjutkan."
      />

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

export default EditMahasiswa;