import { useState, useEffect } from "react";

import { Typography } from "../../../../components/atom/typography";
import { Button } from "../../../../components/atom/button";
import BackButton from "../../../../components/atom/button/back";
import Loading from "../../../../components/atom/loading";
import Input from "../../../../components/molecule/form/input";
import NumberInput from "../../../../components/molecule/form/number-input";
import Dropdown from "../../../../components/molecule/form/dropdown";
import Modal from "../../../../components/molecule/modal";
import Toast from "../../../../components/molecule/toast";
import InputImage from "../../../../components/molecule/form/image";

import { PenelitianProps } from "../../../../entities/penelitian";

import { useFetchData } from "../../../../hooks/crud/useFetchData";
import { useCreateData } from "../../../../hooks/crud/useCreateData";
import { useToast } from "../../../../hooks/useToast";
import { useModal } from "../../../../hooks/useModal";

const CreatePublikasi: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data } = useFetchData<PenelitianProps[]>(`${baseUrl}/api/publication/available-research`);
  const { createData } = useCreateData();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [researchOptions, setResearchOptions] = useState<{ id: number, judul: string }[]>([]);
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formValues, setFormValues] = useState({
    judul: '',
    penulis: '',
    jurnal: '',
    page: '',
    link_doi: "",
    link_artikel: "",
    tahun: 0,
    volume: 0,
    issue: 0,
    image: "",
  });
  
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
  
  const handleImageChange = (image: File | null) => {
    if (image) {
      const imageUrl = URL.createObjectURL(image);
      setPreviewImage(imageUrl);
      setUploadedImage(image);
    }
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRole(role);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
  
    let newErrors: Record<string, string> = {};
  
    if (!formValues.judul || !formValues.penulis || !formValues.jurnal) newErrors.general = "This field is required";
    if (!formValues.tahun || formValues.tahun < 1000 || formValues.tahun > 9999) newErrors.tahun = "The year must consist of 4 digits.";
    
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
    formData.append("research_id", selectedRole ?? "");
    formData.append("title", formValues.judul);
    formData.append("author", formValues.penulis);
    formData.append("year", formValues.tahun ? formValues.tahun.toString() : "");
    formData.append("name_journal", formValues.jurnal);
    formData.append("volume", formValues.volume ? formValues.volume.toString() : "");
    formData.append("issue", formValues.issue ? formValues.volume.toString() : "");
    formData.append("page", formValues.page);
    formData.append("DOI_link", formValues.link_doi);
    formData.append("article_link", formValues.link_artikel);
    
    if (uploadedImage) {
      formData.append("image", uploadedImage);
    }

    console.log("user_id:", userId);
    console.log("formData:", [...formData.entries()]);

    try {
      const { data: result, errors: beErrors } = await createData(
        `${baseUrl}/api/publication`,
        formData
      );

      if (result) {
        addToast('success', 'Publikasi berhasil dibuat!');
        setFormValues({judul: '', penulis: '', jurnal: '', page: '', link_doi: '', link_artikel: '', tahun: 0, volume: 0, issue: 0, image: "" });
        setUploadedImage(null);
        setPreviewImage(null);
        closeModal();
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Gagal membuat publikasi. Silakan coba lagi.");
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
      <Typography type="heading6" weight="semibold">Tambah Publikasi</Typography>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          label="Judul Jurnal"
          id="judul"
          name="judul"
          placeholder="Masukkan Judul Jurnal"
          description="Contoh: Deep Learning for Image Recognition in Medical Diagnosis"
          autoComplete="judul"
          value={formValues.judul}
          onChange={handleChange}
          error={errors.judul || errors.general}
        />
        <Input
          label="Nama Penulis"
          id="penulis"
          name="penulis"
          placeholder="Masukkan Nama Penulis"
          description="Contoh: John Doe, Jane Smith, Michael Brown (Tanpa Gelar)"
          autoComplete="penulis"
          value={formValues.penulis}
          onChange={handleChange}
          error={errors.author || errors.general}
        />
        <Input
          label="Nama Jurnal"
          id="jurnal"
          name="jurnal"
          placeholder="Masukkan Nama Jurnal"
          description="Contoh: International Journal of Artificial Intelligence"
          autoComplete="jurnal"
          value={formValues.jurnal}
          onChange={handleChange}
          error={errors.name_journal || errors.general}
        />
        <div className="md:grid md:grid-cols-2 gap-8 md:space-y-0 space-y-4">
          <NumberInput
            label="Tahun Publikasi"
            id="tahun"
            name="tahun"
            description="Contoh: 2021"
            value={formValues.tahun}
            onChange={(value) => setFormValues(prev => ({ ...prev, tahun: value }))}
            min={0}
            error={errors.tahun}
          />
          <NumberInput
            label="Volume"
            id="volume"
            name="volume"
            description="Contoh: 100"
            value={formValues.volume}
            onChange={(value) => setFormValues(prev => ({ ...prev, volume: value }))}
            min={0}
          />
          <NumberInput
            label="Issue"
            id="issue"
            name="issue"
            description="Contoh: 5"
            value={formValues.issue}
            onChange={(value) => setFormValues(prev => ({ ...prev, issue: value }))}
            min={0}
          />
          <Input
            label="Page"
            id="page"
            name="page"
            placeholder="Masukkan Halaman Jurnal"
            description="Contoh: 58 atau 66-88"
            autoComplete="page"
            value={formValues.page}
            onChange={handleChange}
          />
        </div>
        <Input
          label="DOI"
          id="link_doi"
          name="link_doi"
          placeholder="Masukkan Link DOI"
          description="Contoh: https://doi.org/10.1109/ACCESS.2021.3060469"
          autoComplete="doi"
          value={formValues.link_doi}
          onChange={handleChange}
        />
        <Input
          label="Artikel"
          id="link_artikel"
          name="link_artikel"
          placeholder="Masukkan Link Artikel"
          description="Contoh: https://ieeexplore.ieee.org/document/9416286"
          autoComplete="artikel"
          value={formValues.link_artikel}
          onChange={handleChange}
        />
        <Dropdown
          label="Judul Penelitian"
          options={researchOptions.map(r => ({ label: r.judul, value: r.id.toString() }))}
          selectedValue={selectedRole}
          onChange={handleRoleToggle}
          placeholder="Pilih judul penelitian"
        />

        <div className="space-y-2">
          <Typography type="caption1" font="dm-sans" className="text-typo">Thumbnail</Typography>
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

export default CreatePublikasi;