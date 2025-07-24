import { useEffect, useState, useRef } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { Typography } from "../../../../components/atom/typography";
import { Button } from "../../../../components/atom/button";
import Loading from "../../../../components/atom/loading";
import Input from "../../../../components/molecule/form/input";
import Dropdown from "../../../../components/molecule/form/dropdown";
import MultiSelectDropdown from "../../../../components/molecule/form/multi-select";
import InputImage from "../../../../components/molecule/form/image";
import Modal from "../../../../components/molecule/modal";
import Toast from "../../../../components/molecule/toast";

import { AnggotaProps } from "../../../../entities/anggota";

import { useFetchData } from "../../../../hooks/crud/useFetchData";
import { useCreateData } from "../../../../hooks/crud/useCreateData";
import { useToast } from "../../../../hooks/useToast";
import { useModal } from "../../../../hooks/useModal";

type TempExpertise = {
  keahlian: string;
  expertise: string;
};

const EditProfileAkun: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name;

  useEffect(() => {
    localStorage.setItem("profile_editing", "true");
    
    return () => {
      localStorage.removeItem("profile_editing");
    };
  }, []);
  
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedKeahlian, setSelectedKeahlian] = useState<{ label: string; value: number }[]>([]);
  const [expertiseOptions, setExpertiseOptions] = useState<{ label: string; value: number; }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [tempExpertises, setTempExpertises] = useState<{ label: string; value: number }[]>([]);
  const [tempExpertiseData, setTempExpertiseData] = useState<Record<number, TempExpertise>>({});

  const updateInProgressRef = useRef(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: expertisesData, loading: expertiseLoading, refetch: refetchExpertises } = useFetchData<{ id: number; keahlian: string; expertise: string }[]>(`${baseUrl}/api/members/expertises`);
  const { data: allMembers, loading: memberLoading, refetch: refetchMember } = useFetchData<AnggotaProps[]>(`${baseUrl}/api/members`);
  const { createData } = useCreateData();

  const [memberData, setMemberData] = useState<AnggotaProps | null>(null);

  useEffect(() => {
    if (allMembers && userName && !updateInProgressRef.current) {
      const foundMember = allMembers.find((member) => member.name === userName);
      if (foundMember) {
        setMemberData(foundMember);
      }
    }
  }, [allMembers, userName]);

  const [formValues, setFormValues] = useState({
    name: user.name || "",
    role: "",
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
    if (memberData && !updateInProgressRef.current) {
      setFormValues({
        ...memberData,
        role: memberData.role || "",
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
  }, [memberData, baseUrl]);    

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
    if (memberData && memberData.members_expertise && expertisesData && !updateInProgressRef.current) {
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

  const roleOptions = [
    { label: 'Asisten Riset', value: 'research assistant' },
    { label: 'Peneliti', value: 'researcher' },
  ];  

  const extractIdFromResponse = (response: any): number => {
    const id = response?.data?.id || response?.data?.data?.id || response?.id;
    if (typeof id !== 'number') {
      throw new Error('Could not extract ID from response');
    }
    return id;
  };
  
  const handleConfirm = async () => {
    setIsLoading(true);
    setIsUpdating(true);
    updateInProgressRef.current = true;

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
    }
    
    const token = localStorage.getItem("token");
  
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
  
      if (uploadedImage) {
        formData.append("image", uploadedImage);
      }     

      if (memberData?.id) {
        await axios.post(`${baseUrl}/api/members/${memberData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${baseUrl}/api/members`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const userUpdatePayload = {
        name: formValues.name,
      };

      await axios.put(`${baseUrl}/api/users/${user.id}`, userUpdatePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const completeUserData = {
        ...user,
        name: formValues.name,
        role: formValues.role,
        email: formValues.email,
        expertise_ids: createdExpertiseIds,
        profile_complete: true
      };
      
      localStorage.setItem("user", JSON.stringify(completeUserData));
  
      setTempExpertises([]);
      setTempExpertiseData({});

      closeModal();

      addToast("success", "Profil berhasil disimpan!");
      
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: { userUpdated: completeUserData } 
      }));

      refetchTimeoutRef.current = setTimeout(async () => {
        try {
          await Promise.all([
            refetchExpertises(),
            refetchMember()
          ]);
        } catch (error) {
          console.error("Error during background refetch:", error);
        } finally {
          setIsUpdating(false);
          updateInProgressRef.current = false;
        }
      }, 2000);
      
    } catch (err) {
      console.error("Error in handleConfirm:", err);
      addToast("error", "Terjadi kesalahan saat menyimpan data.");

      setIsUpdating(false);
      updateInProgressRef.current = false;
    } finally {
      setIsLoading(false);
    }
  };  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openModal();
  };

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith('blob:')) {
        URL.revokeObjectURL(previewImage);
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
    };
  }, [previewImage]);

  useEffect(() => {
    return () => {
      updateInProgressRef.current = false;
      setIsUpdating(false);
    };
  }, []);

  if ((memberLoading || expertiseLoading) && !updateInProgressRef.current) {
    return <div className="mt-56"><Loading variant="centered" /></div>;
  }

  if (isLoading) {
    return <div className="mt-56"><Loading variant="centered" /></div>;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mt-4 space-y-8">
        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2">
            <Typography type="paragraph" weight="semibold">
              Biodata
            </Typography>
          </div>
          <div className="md:grid md:grid-cols-2 gap-4 md:space-y-0 space-y-4">
            <Input
              label="Nama"
              id="name"
              name="name"
              placeholder="Masukkan nama"
              autoComplete="name"
              value={formValues.name}
              onChange={handleChange}
              disabled={isUpdating}
            />
            <Dropdown
              label="Pilih Bagian"
              options={roleOptions}
              placeholder="Pilih Bagian"
              selectedValue={formValues.role}
              onChange={(value) => setFormValues({ ...formValues, role: value })}
              variant="simple"
            />
          </div>
          
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
                  description: "Contoh: Geography",
                  placeholder: "Enter expertise in English",
                  required: true,
                  maxLength: 100
                }
              ],
              submitButtonText: "Tambah Keahlian",
              cancelButtonText: "Batal"
            }}
            searchPlaceholder="Cari bidang keahlian..."
            noResultsText="Bidang keahlian tidak ditemukan"
          />

          <div className="space-y-2">
            <Typography type="body" font="dm-sans" className="text-typo">Foto</Typography>
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
          <div className="space-y-4">
            <Input
                label="Scopus"
                id="scopus_link"
                name="scopus_link"
                placeholder="Masukkan link scopus"
                autoComplete="scopus_link"
                value={formValues.scopus_link}
                onChange={handleChange}
            />
            <Input
                label="Google Scholar"
                id="scholar_link"
                name="scholar_link"
                placeholder="Masukkan link google scholar"
                autoComplete="scholar_link"
                value={formValues.scholar_link}
                onChange={handleChange}
            />
          </div>
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
            />
          </div>
        </div>

        <div className="md:flex md:justify-end">
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full md:w-auto"
          >
            Simpan
          </Button>
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

export default EditProfileAkun;