import { useEffect, useState } from "react";
import { Plus, Square, CheckSquare } from "lucide-react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { Typography } from "../../../../../components/atom/typography";
import { Button } from "../../../../../components/atom/button";
import Loading from "../../../../../components/atom/loading";
import BackButton from "../../../../../components/atom/button/back";
import Input from "../../../../../components/molecule/form/input";
import MultiSelectDropdown from "../../../../../components/molecule/form/multi-select";
import InputImage from "../../../../../components/molecule/form/image";
import Modal from "../../../../../components/molecule/modal";
import Toast from "../../../../../components/molecule/toast";

import { AnggotaProps } from "../../../../../entities/anggota";

import { useFetchData } from "../../../../../hooks/crud/useFetchData";
import { useUpdateData } from "../../../../../hooks/crud/useUpdateData";
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

const EditPeneliti: React.FC<CreateAnggotaProps> = ({ type }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams();
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedKeahlian, setSelectedKeahlian] = useState<{ label: string; value: number }[]>([]);
  const [expertiseOptions, setExpertiseOptions] = useState<{ label: string; value: number; }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [tempExpertises, setTempExpertises] = useState<{ label: string; value: number }[]>([]);
  const [tempExpertiseData, setTempExpertiseData] = useState<Record<number, TempExpertise>>({});

  const { data: expertisesData, loading: expertiseLoading, refetch: refetchExpertises } = useFetchData<{ id: number; keahlian: string; expertise: string }[]>(`${baseUrl}/api/members/expertises`);
  const { data: memberData, loading: memberLoading, refetch: refetchMember } = useFetchData<AnggotaProps>(`${baseUrl}/api/members/${id}`);
  const { updateData } = useUpdateData(`${baseUrl}/api/members/${id}`);
  const { createData } = useCreateData();

  const roleMapping: Record<CreateAnggotaProps["type"], string> = {
    peneliti: "researcher",
    postdoctoral: "postdoc",
    "asisten-riset": "research assistant"
  };

  const pageTitles: Record<string, string> = {
    peneliti: 'Edit Anggota Peneliti',
    postdoctoral: 'Edit Anggota Postdoctoral',
    'asisten-riset': 'Edit Anggota Asisten Riset',
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
    educations: [{ id: uuidv4(), degree: "", major: "", university: "" }],
    expertise_ids: [] as number[],
    image: "",
  });

  useEffect(() => {
    if (memberData) {
      setFormValues({
        ...memberData,
        role: roleMapping[type],
        is_alumni: memberData.is_alumni ?? false,
        is_head: memberData.is_head ?? false,
        email: memberData.email ?? "",
        phone: memberData.phone ?? "",
        scopus_link: memberData.scopus_link ?? "",
        scholar_link: memberData.scholar_link ?? "",
        educations: memberData.members_education?.map((edu) => ({
          id: edu.id?.toString() || uuidv4(),
          degree: edu.degree || "",
          major: edu.major || "",
          university: edu.university || "",
        })) || [{ id: uuidv4(), degree: "", major: "", university: "" }],
        expertise_ids: memberData.members_expertise?.map((exp) => exp.id) || [],
        image: memberData.image ?? "",
      });
  
      if (memberData.image) {
        setPreviewImage(`${baseUrl}/storage/${memberData.image}`);
      }
    }
  }, [memberData]);    
  
  useEffect(() => {
    if (expertisesData && Array.isArray(expertisesData)) {
      const options = expertisesData.map((item) => ({
        label: `${item.keahlian} / ${item.expertise}`,
        value: item.id,
      }));
      setExpertiseOptions(options);
    }
  }, [expertisesData]);     

  useEffect(() => {
    if (memberData && memberData.members_expertise && expertisesData) {
      const selected = memberData.members_expertise.map((exp) => {
        const matchedOption = expertisesData.find((opt) => opt.id === exp.id);
        return matchedOption
          ? { label: `${matchedOption.keahlian} / ${matchedOption.expertise}`, value: exp.id }
          : { label: `Unknown (${exp.id})`, value: exp.id };
      });
      setSelectedKeahlian(selected);
    }
  }, [memberData, expertisesData]);  

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

  const handleClearAllRoles = () => {
    setSelectedKeahlian([]);
    setFormValues(prev => ({
      ...prev,
      expertise_ids: prev.expertise_ids.filter(id => id > 0)
    }));
  };

  const handleAddRiwayatPendidikan = () => {
    setFormValues((prev) => ({
    ...prev,
    educations: [...prev.educations, { id: uuidv4(), degree: "", major: "", university: "" }],
    }));
  };

  const handleRiwayatPendidikanChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    setFormValues((prevValues) => {
      const newEducations = [...prevValues.educations];
      if (!newEducations[index]) return prevValues;
  
      newEducations[index] = { ...newEducations[index], [name]: value };
      return { ...prevValues, educations: newEducations };
    });
  };

  const handleDeleteRiwayatPendidikan = (index: number) => {
    setFormValues((prev) => ({
    ...prev,
    educations: prev.educations.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file: File | null) => {
    setUploadedImage(file);
    setPreviewImage(file ? URL.createObjectURL(file) : null);
  };

  const handleCheckboxChange = (field: 'is_head' | 'is_alumni') => {
    setFormValues((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };  

  const refetchAll = () => {
    refetchExpertises();
    refetchMember();
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

      const formData = new FormData();
      formData.append("name", formValues.name);
      formData.append("role", formValues.role);
      formData.append("is_alumni", formValues.is_alumni ? "1" : "0");
      formData.append("is_head", formValues.is_head ? "1" : "0");
      formData.append("email", formValues.email);
      formData.append("phone", formValues.phone);
      formData.append("scopus_link", formValues.scopus_link);
      formData.append("scholar_link", formValues.scholar_link);

      formValues.educations.forEach((edu, index) => {
        formData.append(`educations[${index}][degree]`, edu.degree);
        formData.append(`educations[${index}][major]`, edu.major);
        formData.append(`educations[${index}][university]`, edu.university);
      });

      createdExpertiseIds.forEach((id, index) => {
        formData.append(`expertise_ids[${index}]`, id.toString());
      });

      if (uploadedImage) formData.append("image", uploadedImage);

      const { success, errors: beErrors } = await updateData(formData);

      if (success) {
        addToast("success", "Anggota berhasil diperbarui!");

        setTempExpertises([]);
        setTempExpertiseData({});
        
        closeModal();
        refetchAll();
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Periksa kembali data yang Anda masukkan.");
      }
    } catch (error) {
      console.error("Error in handleConfirm:", error);
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
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

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  if (memberLoading || expertiseLoading || isLoading) return <Loading />;

  return (
    <div className="md:flex-1 space-y-4 px-4 md:py-8 py-4 mt-16">
      <BackButton />
      <Typography type="heading6" weight="semibold">
        {pageTitles[type]}
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
                  placeholder: "Contoh: Geografi",
                  required: true,
                  maxLength: 100
                },
                {
                  id: "expertise",
                  name: "expertise",
                  label: "Expertise (English)",
                  placeholder: "Example: Geography",
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
              Riwayat Pendidikan
            </Typography>
          </div>
          {formValues.educations.map((item, index) => (
            <div key={item.id} className="space-y-4">
                <div>
                <div className="flex items-center justify-between">
                    <Typography type="label" weight="semibold">
                    Pendidikan-{index + 1}
                    </Typography>
                    {index > 0 && (
                    <Button variant="underline" onClick={() => handleDeleteRiwayatPendidikan(index)}>
                        Hapus
                    </Button>
                    )}
                </div>
                </div>
                <div className="md:grid md:grid-cols-2 gap-4 md:space-y-0 space-y-4">
                <Input
                    id={`degree-${index}`}
                    label="Gelar"
                    name="degree"
                    placeholder="Masukkan gelar"
                    description="Contoh: Bachelor, Master"
                    value={item.degree}
                    onChange={(e) => handleRiwayatPendidikanChange(index, e)}
                />
                <Input
                    id={`major-${index}`}
                    label="Jurusan"
                    name="major"
                    placeholder="Masukkan jurusan"
                    description="Contoh: Geology, Oceanography"
                    value={item.major}
                    onChange={(e) => handleRiwayatPendidikanChange(index, e)}
                />
                <Input
                    id={`university-${index}`}
                    label="Universitas"
                    name="university"
                    placeholder="Masukkan universitas"
                    description="Contoh: Institut Teknologi Bandung"
                    value={item.university}
                    onChange={(e) => handleRiwayatPendidikanChange(index, e)}
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
            value={formValues.scopus_link}
            description="Contoh: https://www.scopus.com/authid/detail.uri?authorId=1234567890"
            onChange={handleChange}
          />
          <Input
            label="Google Scholar"
            id="scholar_link"
            name="scholar_link"
            placeholder="Masukkan link google scholar"
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
              value={formValues.phone}
              onChange={handleChange}
            />
            <Input
              label="Email"
              id="email"
              name="email"
              placeholder="Masukkan email"
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
        title="Konfirmasi Simpan Data"
        message="Apakah Anda yakin ingin menyimpan perubahan ini? Silakan konfirmasi untuk melanjutkan."
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

export default EditPeneliti;