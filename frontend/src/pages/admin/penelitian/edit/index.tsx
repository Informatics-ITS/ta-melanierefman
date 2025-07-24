import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Typography } from "../../../../components/atom/typography";
import { Button } from "../../../../components/atom/button";
import BackButton from "../../../../components/atom/button/back";
import Loading from "../../../../components/atom/loading";
import Input from "../../../../components/molecule/form/input";
import NumberInput from "../../../../components/molecule/form/number-input";
import Textarea from "../../../../components/molecule/form/textarea";
import Dropdown from "../../../../components/molecule/form/dropdown";
import MultiSelectDropdown from "../../../../components/molecule/form/multi-select";
import Modal from "../../../../components/molecule/modal";
import Toast from "../../../../components/molecule/toast";

import { PenelitianProps } from "../../../../entities/penelitian";

import { useFetchData } from "../../../../hooks/crud/useFetchData";
import { useUpdateData } from "../../../../hooks/crud/useUpdateData";
import { useToast } from "../../../../hooks/useToast";
import { useModal } from "../../../../hooks/useModal";

import EditImagesPenelitian from "./edit-images";
import CreateImagesPenelitian from "./create-image";

const EditPenelitian: React.FC = () => {
  const { id } = useParams();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data, loading, error, refetch } = useFetchData<PenelitianProps>(`${baseUrl}/api/research/${id}`);
  const { data: members, loading: membersLoading, error: membersError } = useFetchData<{ id: number; name: string; pivot?: { is_coor: number }}[]>(`${baseUrl}/api/members`);
  const { updateData } = useUpdateData(`${baseUrl}/api/research/${id}`);
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("id", { month: "long" }),
  }));

  const [formValues, setFormValues] = useState({
    judul: "",
    title: "",
    deskripsi: "",
    description: "",
    map_link: "",
    latitude: "",
    longitude: "",
    zoom: "" ,
    start_month: "",
    end_month: "",
    start_year: 2025,
    end_year: 2025,
    coordinator_id: "",
    member_ids: [] as number[],
  });

  // Handler untuk auto refetch dari child components
  const handleImageUpdate = () => {
    refetch();
  };

  useEffect(() => {
    if (data) {
      const coordinator = data.members?.find((m) => m.pivot.is_coor === 1);
      const members = data.members?.filter((m) => m.pivot.is_coor === 0).map((m) => m.id) || [];
  
      const startDate = data.start_date ? new Date(data.start_date) : new Date();
      const endDate = data.end_date ? new Date(data.end_date) : new Date();
  
      setFormValues({
        judul: data.judul || "",
        title: data.title || "",
        deskripsi: data.deskripsi || "",
        description: data.description || "",
        map_link: data.map_link || "",
        latitude: data.latitude || "",
        longitude: data.longitude || "",
        zoom: data.zoom || "",
        start_month: (startDate.getMonth() + 1).toString(),
        end_month: (endDate.getMonth() + 1).toString(),
        start_year: startDate.getFullYear(),
        end_year: endDate.getFullYear(),
        coordinator_id: coordinator?.id?.toString() || "",
        member_ids: members,
      });
    }
  }, [data]);  

  const extractMapData = (url: string) => {
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+),(\d+(?:\.\d+)?)z/;
    const match = url.match(regex);
    if (match) {
      return {
        latitude: match[1],
        longitude: match[2],
        zoom: Math.floor(parseFloat(match[3])).toString(),
      };
    }
    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
  
    if (name === "map_link") {
      const mapData = extractMapData(value);
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value,
        latitude: mapData?.latitude || "",
        longitude: mapData?.longitude || "",
        zoom: mapData?.zoom || "",
      }));
    } else {
      setFormValues((prevValues) => ({
        ...prevValues,
        [name]: value,
      }));
    }
  };   

  const handleCoordinatorChange = (selectedValue: string) => {
    setFormValues({ ...formValues, coordinator_id: selectedValue });
  };

  const handleMemberChange = (selectedOptions: { value: number; label: string }[]) => {
    const selectedIds = selectedOptions.map(option => option.value);
    setFormValues(prev => ({ ...prev, member_ids: selectedIds }));
  };  

  const handleConfirm = async () => {
    setIsLoading(true);
    const formData = new FormData();    
    formData.append("judul", formValues.judul);
    formData.append("title", formValues.title);
    formData.append("deskripsi", formValues.deskripsi);
    formData.append("description", formValues.description);
    formData.append("latitude", formValues.latitude);
    formData.append("longitude", formValues.longitude);
    formData.append("zoom", formValues.zoom);
    formData.append("start_month", formValues.start_month);
    formData.append("end_month", formValues.end_month);
    formData.append("start_year", formValues.start_year.toString());
    formData.append("end_year", formValues.end_year.toString());
    formData.append("coordinator_id", formValues.coordinator_id);

    formValues.member_ids.forEach((id, index) => {
      formData.append(`member_ids[${index}]`, id.toString());
    });
  
    try {
      const { success, errors: beErrors } = await updateData(formData);

      if (success) {
        addToast("success", "Penelitian berhasil diperbarui.");
        closeModal();
        refetch();
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Periksa kembali data yang Anda masukkan.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan. Silahkan coba lagi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    openModal();
  };

  if (loading || membersLoading || isLoading) return <Loading />;
  if (error || membersError) return <div>{error}</div>;

  return (
    <div className="flex-1 px-4 md:py-24 py-20">
      <BackButton />
      <Typography type="heading6" weight="semibold">
        Edit Penelitian
      </Typography>

      <form onSubmit={handleSubmit} className="mt-4 space-y-8" noValidate>
        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2">
            <Typography type="paragraph" weight="semibold">
              Tentang Penelitian
            </Typography>
          </div>
          <Input
            label="Judul (Bahasa Indonesia)"
            id="judul"
            name="judul"
            placeholder="Masukkan Judul"
            value={formValues.judul}
            onChange={handleChange}
            error={errors.judul}
          />
          <Input
            label="Title (English)"
            id="title"
            name="title"
            placeholder="Enter title in English"
            value={formValues.title}
            onChange={handleChange}
            error={errors.title}
          />
          <Textarea
            label="Deskripsi (Bahasa Indonesia)"
            id="deskripsi"
            name="deskripsi"
            placeholder="Masukkan deskripsi"
            value={formValues.deskripsi}
            onChange={handleChange}
            error={errors.deskripsi}
          />
          <Textarea
            label="Description (English)"
            id="description"
            name="description"
            placeholder="Enter description in English"
            value={formValues.description}
            onChange={handleChange}
            error={errors.description}
          />
        </div>

        <EditImagesPenelitian onImageUpdate={handleImageUpdate} />
        <CreateImagesPenelitian onImageCreate={handleImageUpdate} />

        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2">
            <Typography type="paragraph" weight="semibold">
              Informasi Penelitian
            </Typography>
          </div>
          <div className="space-y-4">
            <Dropdown
              label="Koordinator"
              options={members?.map((m) => ({ value: m.id.toString(), label: m.name })) || []}
              selectedValue={formValues.coordinator_id}
              onChange={handleCoordinatorChange}
              placeholder="Pilih Koordinator"
            />
            <MultiSelectDropdown
              label="Anggota Tim"
              options={members
                ?.filter(m => m.id.toString() !== formValues.coordinator_id)
                .map(m => ({ value: m.id, label: m.name })) || []}
              selectedValues={formValues.member_ids.map(id => ({
                value: id,
                label: members?.find(m => m.id === id)?.name || "",
              }))}
              onChange={handleMemberChange}
              onClearAll={() => setFormValues((prev) => ({ ...prev, member_ids: [] }))} 
              placeholder="Pilih Anggota"
            />
          </div>
          <div className="md:grid md:grid-cols-4 gap-8 md:space-y-0 space-y-4">
            <Dropdown
              label="Bulan Mulai"
              options={months}
              selectedValue={formValues.start_month}
              placeholder="Pilih Bulan"
              onChange={(value) => setFormValues({ ...formValues, start_month: value })}
            />
            <NumberInput
              id="start_year"
              name="start_year"
              label="Tahun Mulai"
              value={formValues.start_year}
              onChange={(value) => setFormValues({ ...formValues, start_year: value })}
            />
            <Dropdown
              label="Bulan Selesai"
              options={months}
              selectedValue={formValues.end_month}
              placeholder="Pilih Bulan"
              onChange={(value) => setFormValues({ ...formValues, end_month: value })}
            />
            <NumberInput
              id="end_year"
              name="end_year"
              label="Tahun Selesai"
              value={formValues.end_year}
              onChange={(value) => setFormValues({ ...formValues, end_year: value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2">
            <Typography type="paragraph" weight="semibold">
              Lokasi Penelitian
            </Typography>
          </div>
          <Input
            label="Google Maps URL"
            id="map_link"
            name="map_link"
            description="Masukkan URL Google Maps dengan koordinat dan zoom level. Contoh: https://www.google.com/maps/@-6.20876,106.84513,12z"
            placeholder="Enter Google Maps URL"
            value={formValues.map_link}
            onChange={handleChange}
          />
          <div className="mt-8">
            <Typography type="label" font="dm-sans" className="mb-2">Preview Lokasi di Peta</Typography>
            <div className="lg:w-3/4 md:h-[450px] h-[200px] rounded-xl overflow-hidden border">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&center=${formValues.latitude || '-6.20876'},${formValues.longitude || '106.84513'}&zoom=${formValues.zoom || 12}`}
                loading="lazy"
                style={{ border: 0 }}
                allowFullScreen
              ></iframe>
            </div>
          </div>
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

export default EditPenelitian;