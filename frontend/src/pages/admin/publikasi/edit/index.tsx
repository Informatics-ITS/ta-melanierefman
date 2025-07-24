import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";

import { Typography } from "../../../../components/atom/typography";
import { Button } from "../../../../components/atom/button";
import Loading from "../../../../components/atom/loading";
import BackButton from "../../../../components/atom/button/back";
import Input from "../../../../components/molecule/form/input";
import NumberInput from "../../../../components/molecule/form/number-input";
import Dropdown from "../../../../components/molecule/form/dropdown";
import Modal from "../../../../components/molecule/modal";
import Toast from "../../../../components/molecule/toast";
import InputImage from "../../../../components/molecule/form/image";

import { PublikasiProps } from "../../../../entities/publikasi";
import { PenelitianProps } from "../../../../entities/penelitian";

import { useFetchData } from "../../../../hooks/crud/useFetchData";
import { useToast } from "../../../../hooks/useToast";
import { useModal } from "../../../../hooks/useModal";
import { useUpdateData } from "../../../../hooks/crud/useUpdateData";

const EditPublikasi: React.FC = () => {
  const { id } = useParams();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [selectedResearch, setSelectedResearch] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, loading, refetch } = useFetchData<PublikasiProps>(`${baseUrl}/api/publication/${id}`);
  const { data: researchOptions, refetch: refetchResearch } = useFetchData<PenelitianProps[]>(`${baseUrl}/api/publication/researches/${id}`);
  const { updateData } = useUpdateData(`${baseUrl}/api/publication/${id}`);

  const [isLoading, setIsLoading] = useState(false);

  const [formValues, setFormValues] = useState({
    title: "",
    author: "",
    year: "",
    name_journal: "",
    volume: "",
    issue: "",
    page: "",
    DOI_link: "",
    article_link: "",
    research_id: "",
    image: "",
  });

  useEffect(() => {
    if (data) {
      setFormValues({
        title: data.title || "",
        author: data.author || "",
        year: data.year ? data.year.toString() : "",
        name_journal: data.name_journal || "",
        volume: data.volume ? data.volume.toString() : "",
        issue: data.issue ? data.issue.toString() : "",
        page: data.page || "",
        DOI_link: data.DOI_link || "",
        article_link: data.article_link || "",
        research_id: data.research_id ? data.research_id.toString() : "",
        image: data.image || "",
      });

      if (data.image) {
        setPreviewImage(`${baseUrl}/storage/${data.image}`);
      }
    }
  }, [data]);
  
  useEffect(() => {
    const userId = localStorage.getItem('id');
    const role = localStorage.getItem('role');
  
    if (researchOptions && data?.research_id && userId && role === 'admin') {
      const filteredResearch = researchOptions.filter(r => r.user_id === Number(userId));
  
      const selected = filteredResearch.find(r => r.id === data.research_id);
  
      setSelectedResearch(selected ? selected.id.toString() : null);
    }
  }, [researchOptions, data]);
  
  const dropdownOptions = useMemo(() => {
    if (!researchOptions) return [];
  
    const userId = localStorage.getItem('id');
    let filteredResearch = researchOptions;

    if (localStorage.getItem('role') === 'admin') {
      filteredResearch = researchOptions.filter(r => r.user_id === Number(userId));
    }
  
    const availableResearchOptions = filteredResearch.map(r => ({
      label: r.judul,
      value: r.id.toString(),
    }));
  
    if (data?.research_id && !availableResearchOptions.some(r => r.value === data.research_id?.toString())) {
      availableResearchOptions.unshift({
        label: `Penelitian ID ${data.research_id}`,
        value: data.research_id.toString(),
      });
    }
  
    return availableResearchOptions;
  }, [researchOptions, data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file: File | null) => {
    setUploadedImage(file);
    setPreviewImage(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    openModal();
  };

  const refetchAll = () => {
    refetch();
    refetchResearch();
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    const formData = new FormData();

    formData.append("title", formValues.title);
    formData.append("author", formValues.author);
    formData.append("year", formValues.year);
    formData.append("name_journal", formValues.name_journal);
    formData.append("volume", formValues.volume);
    formData.append("issue", formValues.issue);
    formData.append("page", formValues.page);
    formData.append("DOI_link", formValues.DOI_link);
    formData.append("article_link", formValues.article_link);
    formData.append("research_id", formValues.research_id || "");

    if (uploadedImage) {
      formData.append("image", uploadedImage);
    }

    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const { success, errors: beErrors } = await updateData(formData);

      if (success) {
        addToast("success", "Publikasi berhasil diperbarui!");
        closeModal();
        refetchAll();
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Periksa kembali data yang Anda masukkan.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) return <Loading />;

  return (
    <div className="flex-1 px-4 md:py-24 py-20">
      <BackButton />
      <Typography type="heading6" weight="semibold">
        Edit Publikasi
      </Typography>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <Input
          label="Judul Jurnal"
          name="title"
          id="title"
          placeholder="Masukkan Judul Jurnal"
          description="Contoh: Deep Learning for Image Recognition in Medical Diagnosis"
          value={formValues.title}
          onChange={handleChange}
          error={errors.title}
        />
        <Input
          label="Nama Penulis"
          name="author"
          id="author"
          placeholder="Masukkan Nama Penulis"
          description="Contoh: John Doe, Jane Smith, Michael Brown (Tanpa Gelar)"
          value={formValues.author}
          onChange={handleChange}
          error={errors.author}
        />
        <Input
          label="Nama Jurnal"
          name="name_journal"
          id="name_journal"
          placeholder="Masukkan Nama Jurnal"
          description="Contoh: International Journal of Artificial Intelligence"
          value={formValues.name_journal || ""}
          onChange={handleChange}
          error={errors.name_journal}
        />
        <div className="md:grid md:grid-cols-2 gap-8 md:space-y-0 space-y-4">
          <NumberInput
            label="Tahun Publikasi"
            name="year"
            id="year"
            description="Contoh: 2021"
            value={Number(formValues.year) || 0}
            onChange={(value) => setFormValues((prev) => ({ ...prev, year: value.toString() }))}
            min={0}
            error={errors.year}
          />
          <NumberInput
            label="Volume"
            name="volume"
            id="volume"
            description="Contoh: 100"
            value={Number(formValues.volume) || 0}
            onChange={(value) => setFormValues((prev) => ({ ...prev, volume: value.toString() }))}
            min={0}
          />
          <NumberInput
            label="Issue"
            name="issue"
            id="issue"
            description="Contoh: 5"
            value={Number(formValues.issue) || 0}
            onChange={(value) => setFormValues((prev) => ({ ...prev, issue: value.toString() }))}
            min={0}
          />
          <Input
            label="Page"
            name="page"
            id="page"
            placeholder="Masukkan Halaman Jurnal"
            description="Contoh: 58 atau 66-88"
            value={formValues.page || ""}
            onChange={handleChange}
          />
        </div>
        <Input
          label="DOI"
          name="DOI_link"
          id="DOI_link"
          placeholder="Masukkan Link DOI"
          description="Contoh: https://doi.org/10.1109/ACCESS.2021.3060469"
          value={formValues.DOI_link}
          onChange={handleChange}
        />
        <Input
          label="Artikel"
          name="article_link"
          id="article_link"
          placeholder="Masukkan Link Artikel"
          description="Contoh: https://ieeexplore.ieee.org/document/9416286"
          value={formValues.article_link}
          onChange={handleChange}
        />
        <Dropdown
          label="Judul Penelitian"
          options={dropdownOptions}
          selectedValue={selectedResearch ?? formValues.research_id}
          onChange={(value) => {
            setSelectedResearch(value);
            setFormValues((prev) => ({ ...prev, research_id: value }));
          }}
          placeholder="Pilih judul penelitian"
        />

        <div className="space-y-2">
          <Typography type="caption1" font="dm-sans" className="text-typo">Foto</Typography>
          <div className="md:flex md:flex-row gap-4 items-center">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="h-48 md:w-96 w-full md:mb-0 mb-2 object-cover border border-typo-outline rounded-lg" />
            ) : (
              <div className="h-48 md:w-96 w-full md:mb-0 mb-2 bg-gray-200 flex items-center justify-center text-gray-500 border border-typo-outline text-sm rounded-lg">
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
        message="Apakah Anda yakin ingin menyimpan perubahan ini? Silakan konfirmasi untuk melanjutkan."
      />

      <div>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

export default EditPublikasi;