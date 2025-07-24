import { useState, useEffect } from "react";
import { Plus, Square, CheckSquare } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

import { Typography } from "../../../../../components/atom/typography";
import { Button } from "../../../../../components/atom/button";
import Loading from "../../../../../components/atom/loading";
import BackButton from "../../../../../components/atom/button/back";
import Input from "../../../../../components/molecule/form/input";
import MultiSelectDropdown from "../../../../../components/molecule/form/multi-select";
import InputImage from "../../../../../components/molecule/form/image";
import Modal from "../../../../../components/molecule/modal";
import Toast from "../../../../../components/molecule/toast";

import { useFetchData } from "../../../../../hooks/crud/useFetchData";
import { useCreateData } from "../../../../../hooks/crud/useCreateData";
import { useToast } from "../../../../../hooks/useToast";
import { useModal } from "../../../../../hooks/useModal";

type CreateAnggotaProps = {
  type: 'peneliti' | 'postdoctoral' | 'asisten-riset';
};

type TempExpertise = {
  keahlian: string;
  expertise: string;
};

const CreatePeneliti: React.FC<CreateAnggotaProps> = ({ type }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data, loading, error } = useFetchData<{ id: number; keahlian: string; expertise: string }[]>(`${baseUrl}/api/members/expertises`);
  const { createData } = useCreateData();
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedKeahlian, setSelectedKeahlian] = useState<{ label: string; value: number }[]>([]);
  const [expertiseOptions, setExpertiseOptions] = useState<{ label: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [tempExpertises, setTempExpertises] = useState<{ label: string; value: number }[]>([]);
  const [tempExpertiseData, setTempExpertiseData] = useState<Record<number, TempExpertise>>({});

  const roleMapping: Record<CreateAnggotaProps["type"], string> = {
    peneliti: "researcher",
    postdoctoral: "postdoc",
    "asisten-riset": "research assistant"
  };
  
  const pageTitles: Record<string, string> = {
    peneliti: 'Tambah Anggota Peneliti',
    postdoctoral: 'Tambah Anggota Postdoctoral',
    'asisten-riset': 'Tambah Anggota Asisten Riset',
  };

  const [formValues, setFormValues] = useState({
    name: "",
    role: roleMapping[type],
    is_alumni: false,
    is_head: false,
    email: "",
    phone: "",
    scopus_link: "",
    scholar_link: "",
    expertise_ids: [] as number[],
    educations: [{ id: uuidv4(), degree: "", major: "", university: "" }],
    image: "",
  });

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const uniqueOptions = data.map((item) => ({
        label: `${item.keahlian} / ${item.expertise}`,
        value: item.id,
      }));
      setExpertiseOptions(uniqueOptions);
    }
  }, [data]);  

  const handleCheckboxChange = (field: 'is_head' | 'is_alumni') => {
    setFormValues((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleClearAllRoles = () => {
    setSelectedKeahlian([]);
    setFormValues(prev => ({
      ...prev,
      expertise_ids: prev.expertise_ids.filter(id => id > 0)
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleExpertiseChange = (
    selectedValues: { label: string; value: number }[], 
    newTempOptions?: { label: string; value: number }[]
  ) => {
    setSelectedKeahlian(selectedValues);
  
    const selectedIds = selectedValues.map((item) => item.value);
    setFormValues((prev) => ({
      ...prev,
      expertise_ids: selectedIds,
    }));

    if (newTempOptions) {
      setTempExpertises(newTempOptions);
      
      newTempOptions.forEach(option => {
        if (typeof option.value === 'number' && option.value < 0) {
          const [keahlian, expertise] = option.label.split(' / ');
          setTempExpertiseData(prev => ({
            ...prev,
            [option.value]: { keahlian, expertise }
          }));
        }
      });
    }
  };   

  const handleAddRiwayatPendidikan = () => {
    setFormValues((prev) => ({
      ...prev,
      educations: [...prev.educations, { id: uuidv4(), degree: "", major: "", university: "" }],
    }));
  };

  const handleRiwayatPendidikanChange = (
    index: number,
    field: keyof (typeof formValues.educations)[0],
    value: string
  ) => {
    setFormValues((prev) => {
      const updatedEducations = [...prev.educations];
      updatedEducations[index] = { ...updatedEducations[index], [field]: value };
      return { ...prev, educations: updatedEducations };
    });
  };

  const handleDeleteRiwayatPendidikan = (index: number) => {
    setFormValues((prev) => ({
      ...prev,
      educations: prev.educations.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let newErrors: Record<string, string> = {};
    if (!formValues.name) newErrors.general = "This field is required";
    if (formValues.expertise_ids.length === 0)
      newErrors.expertise_ids = "At least one research must be selected.";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("error", "Harap periksa informasi yang dimasukkan.");
      return;
    }

    openModal();
  };

  const extractIdFromResponse = (response: any): number => {
    const id = response?.data?.id || response?.data?.data?.id || response?.id;
    if (typeof id !== 'number') {
      throw new Error('Could not extract ID from response');
    }
    return id;
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    
    try {
      const createdExpertiseIds: number[] = [];
      
      for (const selectedOption of selectedKeahlian) {
        if (typeof selectedOption.value === 'number' && selectedOption.value < 0) {
          const tempData = tempExpertiseData[selectedOption.value];
          if (tempData) {
            const expertiseFormData = new FormData();
            expertiseFormData.append('keahlian', tempData.keahlian);
            expertiseFormData.append('expertise', tempData.expertise);

            const response = await createData(`${baseUrl}/api/expertises`, expertiseFormData);
            const expertiseId = extractIdFromResponse(response);
            
            createdExpertiseIds.push(expertiseId);
          }
        } else {
          createdExpertiseIds.push(selectedOption.value);
        }
      }

      // Create member
      const data = new FormData();
      data.append("name", formValues.name);
      data.append("role", formValues.role);
      data.append("is_alumni", formValues.is_alumni ? "1" : "0");
      data.append("is_head", formValues.is_head ? "1" : "0");
      data.append("email", formValues.email);
      data.append("phone", formValues.phone);
      data.append("scopus_link", formValues.scopus_link);
      data.append("scholar_link", formValues.scholar_link);

      formValues.educations.forEach((edu, index) => {
        data.append(`educations[${index}][degree]`, edu.degree);
        data.append(`educations[${index}][major]`, edu.major);
        data.append(`educations[${index}][university]`, edu.university);
      });

      createdExpertiseIds.forEach((id, index) => {
        data.append(`expertise_ids[${index}]`, id.toString());
      });

      if (uploadedImage) data.append("image", uploadedImage);

      const { data: result, errors: beErrors } = await createData(
        `${baseUrl}/api/members`,
        data
      );

      if (result) {
        addToast("success", "Member berhasil dibuat!");

        // Reset form
        setFormValues({
          name: "",
          role: roleMapping[type],
          is_alumni: false,
          is_head: false,
          email: "",
          phone: "",
          scopus_link: "",
          scholar_link: "",
          expertise_ids: [],
          educations: [{ id: uuidv4(), degree: "", major: "", university: "" }],
          image: "",
        });
        setSelectedKeahlian([]);
        setTempExpertises([]);
        setTempExpertiseData({});
        setUploadedImage(null);
        setPreviewImage(null);
        closeModal();
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Gagal membuat akun. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error in handleConfirm:", error);
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

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

  if (loading || isLoading) return <Loading />;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex-1 px-4 md:py-24 py-20">
      <BackButton />
      <Typography type="heading6" weight="semibold">
        {pageTitles[type]}
      </Typography>

      <form onSubmit={handleSubmit} className="mt-4 w-full space-y-8">
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
          {type === "peneliti" && (
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleCheckboxChange('is_head')}>
              {formValues.is_head ? (
                  <CheckSquare className="w-6 h-6 text-primary" />
              ) : (
                  <Square className="w-6 h-6 text-typo-icon" />
              )}
              <Typography type="label" weight="semibold">Ketua Kelompok Riset</Typography>
            </div>
          )}
          <MultiSelectDropdown
            label="Bidang Keahlian"
            options={expertiseOptions}
            selectedValues={selectedKeahlian}
            onChange={handleExpertiseChange}
            placeholder="Pilih bidang keahlian"
            onClearAll={handleClearAllRoles}
            tempOptions={tempExpertises}
            addNewConfig={{
              enabled: true,
              buttonText: "Tambah Keahlian Baru",
              modalTitle: "Tambah Bidang Keahlian Baru",
              modalDescription: "Tambahkan bidang keahlian baru yang belum tersedia dalam daftar",
              fields: [
                {
                  id: "keahlian",
                  name: "keahlian",
                  label: "Bidang Keahlian (Bahasa Indonesia)",
                  description: "Contoh: Geografi",
                  placeholder: "Masukkan bidang keahlian",
                  required: true,
                  maxLength: 100
                },
                {
                  id: "expertise",
                  name: "expertise",
                  label: "Expertise (English)",
                  description: "Example: Geography",
                  placeholder: "Enter expertise in English",
                  required: true,
                  maxLength: 100
                }
              ],
              submitButtonText: "Tambah Keahlian",
              cancelButtonText: "Batal"
            }}
            error={errors.expertise_ids}
            searchPlaceholder="Cari bidang keahlian..."
            noResultsText="Bidang keahlian tidak ditemukan"
          />
          <div className="space-y-2">
            <Typography type="caption1" font="dm-sans" className="text-typo">Foto</Typography>
            <div className="md:flex md:flex-row gap-4 items-center">
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="h-48 md:w-96 w-full md:mb-0 mb-2 object-cover rounded-lg" />
              ) : (
                <div className="h-48 md:w-96 md:mb-0 mb-2 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-lg">
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
              Riwayat Pendidikan
            </Typography>
          </div>
          {formValues.educations.map((item, index) => (
            <div key={index} className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Typography type="label" weight="semibold">
                    Pendidikan-{index + 1}
                  </Typography>
                  {index > 0 && (
                    <Button
                      variant="underline"
                      onClick={() => handleDeleteRiwayatPendidikan(index)}
                    >
                      Hapus
                    </Button>
                  )}
                </div>
                {errors[`educations.${index}`] && (
                  <Typography type="caption1" font="dm-sans" className="text-primary">
                    {errors[`educations.${index}`]}
                  </Typography>
                )}
              </div>

              <div className="md:grid md:grid-cols-2 gap-4 md:space-y-0 space-y-4">
                <Input
                  label="Gelar"
                  id={`degree-${index}`}
                  name={`degree-${index}`}
                  placeholder="Masukkan gelar"
                  description="Contoh: Bachelor, Master"
                  value={item.degree}
                  onChange={(e) => handleRiwayatPendidikanChange(index, "degree", e.target.value)}
                />
                <Input
                  label="Jurusan"
                  id={`major-${index}`}
                  name={`major-${index}`}
                  placeholder="Masukkan jurusan"
                  description="Contoh: Geology, Oceanography"
                  value={item.major}
                  onChange={(e) => handleRiwayatPendidikanChange(index, "major", e.target.value)}
                />
                <Input
                  label="Universitas"
                  id={`university-${index}`}
                  name={`university-${index}`}
                  placeholder="Masukkan universitas"
                  description="Contoh: Institut Teknologi Bandung"
                  value={item.university}
                  onChange={(e) => handleRiwayatPendidikanChange(index, "university", e.target.value)}
                />
              </div>
            </div>
          ))}
          <Button variant="outline" iconLeft={<Plus className="w-6 h-6" />} onClick={handleAddRiwayatPendidikan}>
            Tambah Riwayat Pendidikan
          </Button>
        </div>

        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2">
            <Typography type="paragraph" weight="semibold">
              Akun Publikasi
            </Typography>
          </div>
          <Input
            label="Scopus"
            id="scopus_link"
            name="scopus_link"
            placeholder="Masukkan link scopus"
            autoComplete="scopus_link"
            value={formValues.scopus_link}
            description="Contoh: https://www.scopus.com/authid/detail.uri?authorId=1234567890"
            onChange={handleChange}
          />
          <Input
            label="Google Scholar"
            id="scholar_link"
            name="scholar_link"
            placeholder="Masukkan link google scholar"
            autoComplete="scholar_link"
            description="Contoh: https://scholar.google.com/citations?user=1234567890"
            value={formValues.scholar_link}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2">
            <Typography type="paragraph" weight="semibold">
              Informasi Kontak
            </Typography>
          </div>
          <div className="md:grid md:grid-cols-2 gap-4 md:space-y-0 space-y-4">
            <Input
              label="No. Telp"
              id="phone"
              name="phone"
              placeholder="Masukkan No. Telp"
              autoComplete="phone"
              value={formValues.phone}
              onChange={handleChange}
            />
            <Input
              label="Email"
              id="email"
              name="email"
              placeholder="Masukkan email"
              autoComplete="email"
              value={formValues.email}
              onChange={handleChange}
              error={errors.email}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleCheckboxChange('is_alumni')}>
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
        title="Konfirmasi simpan Data"
        message="Apakah Anda yakin ingin menyimpan data ini?"
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

export default CreatePeneliti;