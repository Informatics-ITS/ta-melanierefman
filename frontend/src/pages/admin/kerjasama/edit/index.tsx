import { useState, useEffect } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { Typography } from "../../../../components/atom/typography";
import { Button } from "../../../../components/atom/button";
import Loading from "../../../../components/atom/loading";
import BackButton from "../../../../components/atom/button/back";
import Input from "../../../../components/molecule/form/input";
import Dropdown from "../../../../components/molecule/form/dropdown";
import Modal from "../../../../components/molecule/modal";
import Toast from "../../../../components/molecule/toast";

import { PenelitianProps } from "../../../../entities/penelitian";

import { useFetchData } from "../../../../hooks/crud/useFetchData";
import { useToast } from "../../../../hooks/useToast";
import { useModal } from "../../../../hooks/useModal";
import { MitraProps } from "../../../../entities/kerjasama";

const EditKerjasama: React.FC = () => {
  const { id } = useParams();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();

  const { data, loading, refetch } = useFetchData<MitraProps>(`${baseUrl}/api/partners/${id}`);
  const { data: research, loading: researchLoading, refetch: refetchResearch } = useFetchData<PenelitianProps[]>(`${baseUrl}/api/research`);
  const [researchData, setResearchData] = useState<PenelitianProps[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  const [formValues, setFormValues] = useState({
    name: "",
    research_id: null as number | null,
    partners_member: [{ id: uuidv4(), name: "" }],
  });

  useEffect(() => {
    if (research) {
      const userId = localStorage.getItem('id');
      const role = localStorage.getItem('role');
  
      if (userId) {
        let filteredResearch = research;

        if (role === 'admin') {
          filteredResearch = research.filter(r => r.user_id === Number(userId));
        }
  
        setResearchData(filteredResearch);
      }
    }
  }, [research]);  
  
  useEffect(() => {
    if (data) {
      setFormValues({
        name: data.name || "",
        research_id: data.research?.[0]?.id || null,
        partners_member: data.partners_member
          ? data.partners_member.map((member) => ({
              id: member.id.toString(),
              name: member.name,
            }))
          : [{ id: uuidv4(), name: "" }],
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleResearchChange = (selectedString: string) => {
    const selectedId = selectedString ? Number(selectedString) : null;
    setFormValues({
      ...formValues,
      research_id: selectedId,
    });
  };    

  const handleAddMember = () => {
    setFormValues((prev) => ({
      ...prev,
      partners_member: [...prev.partners_member, { id: uuidv4(), name: "" }],
    }));
  };

  const handleMemberChange = (index: number, value: string) => {
    const updatedMembers = [...formValues.partners_member];
    updatedMembers[index].name = value;
    setFormValues({ ...formValues, partners_member: updatedMembers });
  };

  const handleDeleteMember = (index: number) => {
    if (formValues.partners_member.length > 1) {
      const updatedMembers = formValues.partners_member.filter((_, i) => i !== index);
      setFormValues({
        ...formValues,
        partners_member: updatedMembers,
      });
    }
  };  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openModal();
  };

  const refetchAll = () => {
    refetch();
    refetchResearch();
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
  
      const payload = {
        ...formValues,
        partners_member: formValues.partners_member.map((member) => ({
          id: member.id.includes("-") ? undefined : Number(member.id),
          name: member.name,
        })),
      };
  
      await axios.put(`${baseUrl}/api/partners/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      addToast("success", "Kolaborator berhasil diperbarui!");
      closeModal();
      refetchAll();
    } catch (error) {
      addToast("error", "Terjadi kesalahan saat memperbarui kolaborator.");
    } finally{
      setIsLoading(false);
    }
  };    

  if (loading || researchLoading || isLoading) return <Loading />;

  return (
    <div className="flex-1 px-4 md:py-24 py-20">
      <BackButton />
      <Typography type="heading6" weight="semibold">
        Edit Kolaborator
      </Typography>
      <form onSubmit={handleSubmit} className="mt-4 md:w-1/2 space-y-4">
        <Input
          label="Nama Institusi"
          id="name"
          name="name"
          placeholder="Masukkan nama institusi"
          value={formValues.name}
          onChange={handleChange}
        />

        <Dropdown
          label="Judul Penelitian"
          options={researchData?.map((res) => ({
            value: res.id.toString(),
            label: res.judul,
          })) || []}
          selectedValue={formValues.research_id?.toString() || ""}
          onChange={handleResearchChange}
          placeholder="Pilih Judul Penelitian"
        />

        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2">
            <Typography type="paragraph" weight="semibold">
              Anggota
            </Typography>
          </div>
          {formValues.partners_member.map((member, index) => (
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
        message="Apakah Anda yakin ingin menyimpan perubahan ini? Silakan konfirmasi untuk melanjutkan."
      />

      <div>
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

export default EditKerjasama;