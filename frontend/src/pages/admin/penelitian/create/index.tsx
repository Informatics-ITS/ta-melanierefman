import { useState } from "react";
import { Plus } from "lucide-react";

import { Typography } from "../../../../components/atom/typography";
import { Button } from "../../../../components/atom/button";
import BackButton from "../../../../components/atom/button/back";
import Loading from "../../../../components/atom/loading";
import Input from "../../../../components/molecule/form/input";
import NumberInput from "../../../../components/molecule/form/number-input";
import InputImage from "../../../../components/molecule/form/image";
import Textarea from "../../../../components/molecule/form/textarea";
import Dropdown from "../../../../components/molecule/form/dropdown";
import MultiSelectDropdown from "../../../../components/molecule/form/multi-select";
import Modal from "../../../../components/molecule/modal";
import Toast from "../../../../components/molecule/toast";

import { useFetchData } from "../../../../hooks/crud/useFetchData";
import { useCreateData } from "../../../../hooks/crud/useCreateData";
import { useToast } from "../../../../hooks/useToast";
import { useModal } from "../../../../hooks/useModal";

const CreatePenelitian: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data: members, loading } = useFetchData<{ id: number; name: string; is_alumni: number;}[]>(`${baseUrl}/api/members`);
  const { createData } = useCreateData();
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("id", { month: "long" }),
  }));

  const currentYear = new Date().getFullYear();

  const [formValues, setFormValues] = useState({
    judul: "",
    title: "",
    deskripsi: "",
    description: "",
    map_link: "",
    latitude: "",
    longitude: "",
    zoom: "",
    start_month: "",
    end_month: "",
    start_year: currentYear,
    end_year: currentYear,
    coordinator_id: "",
    member_ids: [] as number[],
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let newErrors: Record<string, string> = {};

    if (!formValues.judul || !formValues.title || !formValues.deskripsi || !formValues.description) newErrors.general = "This field is required";
    if (!formValues.coordinator_id) newErrors.general_member = "At least one member must be selected";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("error", "Please check the information you entered.");
      return;
    }

    openModal();
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    const userId = localStorage.getItem("id");
    if (!userId) {
      addToast("error", "User ID not found.");
      return;
    }

    const formData = new FormData();

    formData.append("user_id", userId);
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
  
    uploadedImages.forEach((image, index) => {
      if (image.file) {
        formData.append(`images[${index}]`, image.file);
        formData.append(`keterangans[${index}]`, image.keterangan);
        formData.append(`captions[${index}]`, image.caption);
      }
    });
    
    try {
      const { data: result, errors: beErrors } = await createData(
        `${baseUrl}/api/research`,
        formData
      );

      if (result) {
        addToast("success", "Penelitian berhasil dibuat!");
        setFormValues({
          judul: "",
          title: "",
          deskripsi: "",
          description: "",
          map_link: "",
          latitude: "",
          longitude: "",
          zoom: "",
          start_month: "",
          end_month: "",
          start_year: 2025,
          end_year: 2025,
          coordinator_id: "",
          member_ids: [],
        });
        setUploadedImages([{ file: null, keterangan: "", caption: "" }]);
        closeModal();
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Gagal membuat penelitian. Silakan coba lagi.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };  

  const [uploadedImages, setUploadedImages] = useState<{ 
    file: File | null; 
    keterangan: string;
    caption: string; 
  }[]>([{ file: null, keterangan: "", caption: "" }]);
  
  const [uploadForm, setUploadForm] = useState({
    keterangan: "",
    caption: "",
    image: null as File | null,
  });
  
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const { isModalOpen: isUploadModalOpen, openModal: openUploadModal, closeModal: closeUploadModal } = useModal();
  
  const handleUploadConfirm = () => {
    if (!uploadForm.image) {
      addToast("error", "Pilih gambar sebelum mengupload.");
      return;
    }
  
    const updatedImages = [...uploadedImages];
    if (selectedImageIndex !== null) {
      updatedImages[selectedImageIndex] = {
        file: uploadForm.image,
        keterangan: uploadForm.keterangan,
        caption: uploadForm.caption,
      };
    } else {
      updatedImages.push({
        file: uploadForm.image,
        keterangan: uploadForm.keterangan,
        caption: uploadForm.caption,
      });
    }
    setUploadedImages(updatedImages);
  
    setUploadForm({ keterangan:"", caption: "", image: null });
    setSelectedImageIndex(null);
    closeUploadModal();
  };
  
  const handleDeleteImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };
  
  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    const selectedImage = uploadedImages[index];
    setUploadForm({ 
      keterangan: selectedImage.keterangan,
      caption: selectedImage.caption,  
      image: selectedImage.file,
    });
    openUploadModal();
  };

  if (loading || isLoading) return <Loading />;

  return (
    <div className="flex-1 px-4 md:py-24 py-20">
      <BackButton />
      <Typography type="heading6" weight="semibold">
        Tambah Penelitian
      </Typography>

      <form className="mt-4 space-y-8" noValidate>
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
            placeholder="Masukkan judul"
            value={formValues.judul}
            onChange={handleChange}
            error={errors.judul || errors.general}
          />
          <Input
            label="Title (English)"
            id="title"
            name="title"
            placeholder="Enter title in English"
            value={formValues.title}
            onChange={handleChange}
            error={errors.title || errors.general}
          />
          <Textarea
            label="Deskripsi (Bahasa Indonesia)"
            id="deskripsi"
            name="deskripsi"
            placeholder="Masukkan deskripsi"
            value={formValues.deskripsi}
            onChange={handleChange}
            error={errors.deskripsi || errors.general}
          />
          <Textarea
            label="Description (English)"
            id="description"
            name="description"
            placeholder="Enter description in English"
            value={formValues.description}
            onChange={handleChange}
            error={errors.description || errors.general}
          />
        </div>

        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2">
            <Typography type="paragraph" weight="semibold">
              Foto Penelitian
            </Typography>
          </div>
          {uploadedImages.map((image, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <Typography type="label" font="dm-sans" className="text-typo">
                  Gambar Penelitian-{index + 1}
                </Typography>
                <Button variant="underline" onClick={() => handleDeleteImage(index)}>
                  Hapus
                </Button>
              </div>
              <div className="space-y-2">
                <div className="md:flex md:flex-row gap-4 items-center">
                  {image.file ? (
                    <div className="h-48 md:w-96 w-full md:mb-0 mb-2 bg-white flex justify-center items-center overflow-hidden">
                    <img 
                      src={URL.createObjectURL(image.file)} 
                      alt="Preview" 
                      className="h-full w-full object-cover rounded-xl"
                      onError={(e) => e.currentTarget.classList.add('hidden')}
                    />
                  </div>
                  ) : (
                    <div className="h-48 md:w-96 w-full md:mb-0 mb-2 bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-xl">
                      Tidak ada gambar
                    </div>
                  )}
                  <div className="flex flex-col gap-2 w-full">
                    <InputImage
                      mode="upload"
                      onInputImage={(file) => {
                        const updatedImages = [...uploadedImages];
                        updatedImages[index] = { ...updatedImages[index], file };
                        setUploadedImages(updatedImages);
                      }}
                      selectedFile={image.file}
                      onClick={() => openImageModal(index)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button onClick={() => setUploadedImages([...uploadedImages, { file: null, keterangan:"", caption: "" }])} variant="outline" iconLeft={<Plus className="w-6 h-6" />}>
            Tambah Gambar
          </Button>
        </div>

        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2">
            <Typography type="paragraph" weight="semibold">
              Informasi Penelitian
            </Typography>
          </div>
          <div className="space-y-4">
            <Dropdown
              label="Koordinator"
              options={
                members
                  ?.filter((m) => m.is_alumni === 0)
                  .map((m) => ({ value: m.id.toString(), label: m.name })) || []
              }
              selectedValue={formValues.coordinator_id}
              onChange={handleCoordinatorChange}
              placeholder="Pilih Koordinator"
              error={errors.general_member}
            />
            <MultiSelectDropdown
              label="Anggota Tim"
              options={
                members
                  ?.filter(
                    (m) =>
                      m.is_alumni === 0 && m.id.toString() !== formValues.coordinator_id
                  )
                  .map((m) => ({ value: m.id, label: m.name })) || []
              }
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
              error={errors.month}
            />
            <NumberInput
              id="start_year"
              name="start_year"
              label="Tahun Mulai"
              value={formValues.start_year}
              onChange={(value) => setFormValues({ ...formValues, start_year: value })}
              error={errors.year}
            />
            <Dropdown
              label="Bulan Selesai"
              options={months}
              selectedValue={formValues.end_month}
              placeholder="Pilih Bulan"
              onChange={(value) => setFormValues({ ...formValues, end_month: value })}
              error={errors.month}
            />
            <NumberInput
              id="end_year"
              name="end_year"
              label="Tahun Selesai"
              value={formValues.end_year}
              onChange={(value) => setFormValues({ ...formValues, end_year: value })}
              error={errors.year}
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
            error={errors.map_link}
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
          <Button type="submit" onClick={handleSubmit} variant="primary" className="w-full md:w-auto">Simpan</Button>
        </div>
      </form>

      <Modal isOpen={isUploadModalOpen} onClose={closeUploadModal} title={selectedImageIndex !== null ? "Edit Gambar" : "Upload Gambar"} showFooter={false} sizeClass="md:w-3/5 lg:w-1/3">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUploadConfirm(); }}>
          <Typography type="label" font="dm-sans" className="text-typo">Upload Gambar</Typography>
            {uploadForm.image ? (
              <img 
                src={URL.createObjectURL(uploadForm.image)} 
                alt="Preview" 
                className="h-48 w-full object-cover rounded-xl" 
              />
            ) : (
              <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-xl">
                Tidak ada gambar
              </div>
            )}
          <InputImage 
            mode={uploadForm.image ? "selected" : "browse"} 
            onInputImage={(file) => setUploadForm({ ...uploadForm, image: file })} 
            selectedFile={uploadForm.image}
          />
          <Input
            label="Keterangan (Bahasa Indonesia)"
            id="keterangan"
            name="keterangan"
            placeholder="Masukkan keterangan"
            value={uploadForm.keterangan}
            onChange={(e) => setUploadForm({ ...uploadForm, keterangan: e.target.value })}
          />
          <Input
            label="Caption (English)"
            id="caption"
            name="caption"
            placeholder="Enter caption in English"
            value={uploadForm.caption}
            onChange={(e) => setUploadForm({ ...uploadForm, caption: e.target.value })}
          />
          <Button type="submit" onClick={handleUploadConfirm} variant="primary" className="w-full">Simpan</Button>
        </form>
      </Modal>

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

export default CreatePenelitian;