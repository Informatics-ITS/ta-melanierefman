import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

import { Typography } from "../../../../components/atom/typography";
import { Button } from "../../../../components/atom/button";
import BackButton from "../../../../components/atom/button/back";
import Loading from "../../../../components/atom/loading";
import Input from "../../../../components/molecule/form/input";
import Dropdown from "../../../../components/molecule/form/dropdown";
import Modal from "../../../../components/molecule/modal";
import Toast from "../../../../components/molecule/toast";

import { PenelitianProps } from "../../../../entities/penelitian";

import { useFetchData } from "../../../../hooks/crud/useFetchData";
import { useCreateData } from "../../../../hooks/crud/useCreateData";
import { useToast } from "../../../../hooks/useToast";
import { useModal } from "../../../../hooks/useModal";

const CreateMitra: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { createData } = useCreateData();
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [researchOptions, setResearchOptions] = useState<{ id: number, judul: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { data} = useFetchData<PenelitianProps[]>(`${baseUrl}/api/research`);

  useEffect(() => {
    if (data) {
      const userId = localStorage.getItem('id');
      const role = localStorage.getItem('role');
  
      if (userId) {
        let filteredData = data;

        if (role === 'admin') {
          filteredData = data.filter((item) => item.user_id === Number(userId));
        }
  
        setResearchOptions(filteredData);
      }
    }
  }, [data]);
  
  const [formValues, setFormValues] = useState({
    name: "",
    research_ids: [] as number[],
    members: [{ id: uuidv4(), name: "" }],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleResearchChange = (selectedString: string) => {
    const selectedIds = selectedString ? selectedString.split(",").map(Number) : [];
    setFormValues({ ...formValues, research_ids: selectedIds });
  };

  const handleAddMember = () => {
    setFormValues((prev) => ({
      ...prev,
      members: [...prev.members, { id: uuidv4(), name: "" }],
    }));
  };

  const handleMemberChange = (index: number, value: string) => {
    const updatedMembers = [...formValues.members];
    updatedMembers[index].name = value;
    setFormValues({ ...formValues, members: updatedMembers });
  };

  const handleDeleteMember = (index: number) => {
    setFormValues((prev) => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let newErrors: Record<string, string> = {};

    if (!formValues.name) newErrors.name = "This field is required.";
    if (formValues.research_ids.length === 0)
      newErrors.research_ids = "At least one research must be selected.";
    if (formValues.members.length === 0)
      newErrors.members = "At least one member must be added.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("error", "Please check the information you entered.");
      return;
    }

    openModal();
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    const data = {
      name: formValues.name,
      research_id: formValues.research_ids[0],
      members: formValues.members.map(member => ({ name: member.name })),
    };

    try {
      const { data: result, errors: beErrors } = await createData(
        `${baseUrl}/api/partners`,
        data
      );

      if (result) {
        addToast("success", "Kolaborator berhasil dibuat!");
        setFormValues({ name: "", research_ids: [], members: [{ id: uuidv4(), name: "" }] });
        closeModal();
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Gagal membuat kolaborator. Silakan coba lagi.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }; 
  
  if (isLoading) return <Loading />;

  return (
    <div className="flex-1 px-4 md:py-24 py-20">
      <BackButton />
      <Typography type="heading6" weight="semibold">
        Tambah Kolaborator
      </Typography>
      <form onSubmit={handleSubmit} className="mt-4 md:w-1/2 space-y-4">
        <Input
          label="Nama Institusi"
          id="name"
          name="name"
          placeholder="Masukkan nama institusi"
          value={formValues.name}
          onChange={handleChange}
          error={errors.name}
        />

        <Dropdown
          label="Judul Penelitian"
          options={researchOptions?.map((res) => ({
            value: res.id.toString(),
            label: res.judul,
          })) || []}
          selectedValue={formValues.research_ids.length > 0 ? formValues.research_ids.join(",") : null}
          onChange={handleResearchChange}
          placeholder="Pilih Judul Penelitian"
          error={errors.research_ids}
        />

        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2">
            <Typography type="paragraph" weight="semibold">
              Anggota
            </Typography>
          </div>
          {formValues.members.map((member, index) => (
            <div key={member.id} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <Typography type="label" weight="semibold">
                  Anggota-{index + 1}
                </Typography>
                {index > 0 && (
                  <Button variant="underline" onClick={() => handleDeleteMember(index)}>
                    Hapus
                  </Button>
                )}
              </div>
              <Input
                label="Nama"
                id={`member-${index}`}
                name={`member-${index}`}
                placeholder="Masukkan nama anggota"
                value={member.name}
                onChange={(e) => handleMemberChange(index, e.target.value)}
                error={errors.members}
              />
            </div>
          ))}
          <Button variant="outline" iconLeft={<Plus className="w-6 h-6" />} onClick={handleAddMember}>
            Tambah Anggota
          </Button>
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

export default CreateMitra;