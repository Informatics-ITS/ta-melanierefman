import { useState, useEffect } from "react";
import { CheckSquare, Square } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

import { Typography } from "../../../../../components/atom/typography";
import { Button } from "../../../../../components/atom/button";
import BackButton from "../../../../../components/atom/button/back";
import Loading from "../../../../../components/atom/loading";
import Input from "../../../../../components/molecule/form/input";
import InputImage from "../../../../../components/molecule/form/image";
import Modal from "../../../../../components/molecule/modal";
import Toast from "../../../../../components/molecule/toast";

import { useCreateData } from "../../../../../hooks/crud/useCreateData";
import { useToast } from "../../../../../hooks/useToast";
import { useModal } from "../../../../../hooks/useModal";

const CreateMahasiswa: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { createData } = useCreateData();
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ 
    general?: string;
    name?: string;
    educations?: { degree?: String; major?: string; university?: string }[];
    judul_project?: string;
    project_title?: string;
    image?: string;
  }>({});  

  const handleImageChange = (image: File | null) => {
    if (image) {
      const imageUrl = URL.createObjectURL(image);
      setPreviewImage(imageUrl);
      setUploadedImage(image);
    }
  };

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const [formValues, setFormValues] = useState({
    name: "",
    role: "student",
    is_alumni: false,
    educations: [{ id: uuidv4(), degree:"Undergraduate", major: "", university: ""}],
    judul_project: "",
    project_title: "",
    image: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
  
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };  

  const handleEducationChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    setFormValues((prevValues) => ({
      ...prevValues,
      educations: prevValues.educations.map((edu, i) =>
        i === index ? { ...edu, [name]: value } : edu
      ),
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let newErrors: { 
      general?: string;
      name?: string;
      educations?: { major?: string; university?: string }[];
      judul_project?: string;
      project_title?: string;
    } = { educations: [{}] };
    if (!formValues.name || !formValues.educations[0]?.major || !formValues.educations[0]?.university || !formValues.judul_project || !formValues.project_title) newErrors.general = "This field is required"

    if (Object.keys(newErrors).length > 1 || Object.keys(newErrors.educations![0]).length > 0) {
      setErrors(newErrors);
      addToast("error", "Harap periksa informasi yang dimasukkan.");
      return;
    }

    openModal();
  }

  const handleConfirm = async () => {
    setIsLoading(true);
    const data = new FormData();
    data.append("name", formValues.name);
    data.append("role", formValues.role);
    data.append("is_alumni", formValues.is_alumni ? "1" : "0");
    data.append("judul_project", formValues.judul_project);
    data.append("project_title", formValues.project_title);
    formValues.educations.forEach((edu, index) => {
      data.append(`educations[${index}][degree]`, edu.degree);
      data.append(`educations[${index}][major]`, edu.major);
      data.append(`educations[${index}][university]`, edu.university);
    });

    if (uploadedImage) data.append("image", uploadedImage);

    try {
      const { data: result, errors: beErrors } = await createData(
        `${baseUrl}/api/members`,
        data
      );

      if (result) {
        addToast("success", "Anggota berhasil dibuat!");
        setFormValues({
          name: "",
          role: "student",
          is_alumni: false,
          educations: [{ id: uuidv4(), degree: "Undergraduate", major: "", university: ""}],
          judul_project: "",
          project_title: "",
          image: "",
        });
        setUploadedImage(null);
        setPreviewImage(null);
        closeModal();
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Gagal membuat anggota. Silakan coba lagi.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = () => {
    setFormValues((prevState) => ({
      ...prevState,
      is_alumni: !prevState.is_alumni,
    }));
  };

  if (isLoading) return <Loading />;

  return (
    <div className="flex-1 px-4 md:py-24 py-20">
      <BackButton />
      <Typography type="heading6" weight="semibold">
        Tambah Anggota Mahasiswa
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
            autoComplete="name"
            value={formValues.name}
            onChange={handleChange}
            error={errors.name || errors.general}
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
          <div className="md:grid md:grid-cols-2 mb:space-y-0 gap-4 md:space-y-0 space-y-4">
            <Input
              label="Jurusan"
              id="major"
              name="major"
              placeholder="Masukkan jurusan"
              description="Contoh: Oseanografi, Geologi"
              autoComplete="major"
              value={formValues.educations[0]?.major || ""}
              onChange={(e) => handleEducationChange(0, e)}
              error={errors.educations?.[0]?.major || errors.general}
            />
            <Input
              label="Universitas"
              id="university"
              name="university"
              placeholder="Masukkan universitas"
              description="Contoh: Institut Teknologi Bandung"
              autoComplete="university"
              value={formValues.educations[0]?.university || ""}
              onChange={(e) => handleEducationChange(0, e)}
              error={errors.educations?.[0]?.university || errors.general}
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
            label="Judul (Bahasa Indonesia)"
            id="judul_project"
            name="judul_project"
            placeholder="Masukkan judul"
            autoComplete="judul_project"
            value={formValues.judul_project}
            onChange={handleChange}
            error={errors.judul_project || errors.general}
          />
          <Input
            label="Title (English)"
            id="project_title"
            name="project_title"
            placeholder="Enter title in English"
            autoComplete="project_title"
            value={formValues.project_title}
            onChange={handleChange}
            error={errors.project_title || errors.general}
          />
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

export default CreateMahasiswa;