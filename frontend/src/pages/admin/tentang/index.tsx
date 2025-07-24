import { useState, useEffect } from "react";
import axios from "axios";
import { Eye } from "lucide-react";

import { Typography } from "../../../components/atom/typography";
import { ButtonSelect } from "../../../components/atom/button/select";
import { Button } from "../../../components/atom/button";
import Loading from "../../../components/atom/loading";
import Textarea from '../../../components/molecule/form/textarea';
import Modal from '../../../components/molecule/modal';
import Toast from '../../../components/molecule/toast';

import { useToast } from "../../../hooks/useToast";
import { useModal } from "../../../hooks/useModal";

import EditAboutImage from "./images/edit-images";
import CreateAboutImage from "./images/add-images";
import { useFetchData } from "../../../hooks/crud/useFetchData";

const API_URL =  `${import.meta.env.VITE_API_BASE_URL}/api/about`;

const TentangAdmin: React.FC = () => {
  const { isModalOpen, openModal, closeModal } = useModal();
  const { toasts, addToast, removeToast } = useToast();
  const [data, setData] = useState({
    tentang: "",
    about: "",
    tujuan: "",
    purpose: "",
    fokus_penelitian: "",
    research_focus: "",
  });  

  const { data: fetchedData, loading, error, refetch } = useFetchData<{ about: typeof data }>(API_URL);

  useEffect(() => {
    if (fetchedData?.about) {
      setData(fetchedData.about);
      localStorage.setItem("about_data", JSON.stringify(fetchedData.about));
    }
  }, [fetchedData]);


  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newData = {
      ...data,
      [e.target.name]: e.target.value,
    };
    setData(newData);
    localStorage.setItem("about_data", JSON.stringify(newData));
    localStorage.setItem("about_data", JSON.stringify(newData));
  };

  const handleSaveClick = () => {
    openModal();
  };  

  const handleSave = () => {
    const token = localStorage.getItem("token");

    axios.put(API_URL, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        addToast("success", "Data berhasil diperbarui!");
        localStorage.removeItem("about_data");
        closeModal();
        refetch();
      })
      .catch((error) => {
        addToast("error", "Terjadi kesalahan saat menyimpan data.");
        console.error("Error updating data:", error);
      });
  };

  const handlePreview = (lang: "id" | "en") => {
    const url = `/admin/tentang/preview/${lang}`;
    window.open(url, "_blank");
  };

  if (loading) return <Loading />;
  if (error) return <div>{error}</div>;

  return (
    <div className="px-4 py-4 lg:py-10 lg:flex justify-between mt-16">
      <div className="space-y-6 w-full">
        <div>
          <Typography type="heading5" weight="semibold" className="mt-4">
            Kelompok Riset Iklim & Lingkungan Masa Lampau
          </Typography>
          <Typography type="paragraph" font="dm-sans">
            Pusat Riset Iklim dan Atmosfer, Organisasi Riset Kebumian dan Maritim
          </Typography>
        </div>

        {/* Who We Are */}
        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2 mb-2">
            <Typography type="title" weight="semibold">Who We Are</Typography>
          </div>
          <Textarea
            label="Who We Are (Bahasa Indonesia)"
            id="tentang"
            name="tentang"
            placeholder="Masukkan tentang kelompok riset"
            value={data.tentang}
            onChange={handleChange}
          />
          <Textarea
            label="Who We Are (English)"
            id="about"
            name="about"
            placeholder="Enter about research group in English"
            value={data.about}
            onChange={handleChange}
          />
          <EditAboutImage type="section1" onSuccess={refetch}/>
          <CreateAboutImage type="section1" onSuccess={refetch}/>
        </div>

        {/* Our Mission */}
        <div className="space-y-4">
          <div className="underline decoration-primary decoration-2 mb-2">
            <Typography type="title" weight="semibold">Our Mission</Typography>
          </div>
          <Textarea
            label="Our Mission (Bahasa Indonesia)"
            id="tujuan"
            name="tujuan"
            placeholder="Masukkan tujuan dari kelompok riset"
            value={data.tujuan}
            onChange={handleChange}
          />
          <Textarea
            label="Our Mission (English)"
            id="purpose"
            name="purpose"
            placeholder="Enter the research group's mission in English"
            value={data.purpose}
            onChange={handleChange}
          />
          <div className="underline decoration-primary decoration-2 mb-2">
            <Typography type="title" weight="semibold">Research Focus Areas</Typography>
          </div>
          <Textarea
            label="Research Focus Areas (Bahasa Indonesia)"
            id="fokus_penelitian"
            name="fokus_penelitian"
            placeholder="Masukkan bidang fokus penelitian"
            value={data.fokus_penelitian}
            onChange={handleChange}
          />
          <Textarea
            label="Research Focus Areas (English)"
            id="research_focus"
            name="research_focus"
            placeholder="Enter the focus areas in English"
            value={data.research_focus}
            onChange={handleChange}
          />
          <EditAboutImage type="section2" onSuccess={refetch}/>
        </div>
      </div>
      <div className="lg:fixed lg:right-12 lg:mt-0 mt-4 space-y-2 flex flex-col">
        <Button variant="primary" className="w-full" onClick={handleSaveClick}>Simpan</Button>
        <ButtonSelect
          options={[
            { label: "Bahasa", value: "id", onClick: () => handlePreview("id") },
            { label: "English", value: "en", onClick: () => handlePreview("en") },
          ]}
          variant="outline"
          placeholder="Preview"
          iconLeft={<Eye className="w-6 h-6" />}
          className="hidden lg:block" 
        />
      </div>
      <Modal
        sizeClass="md:w-1/2 lg:w-1/4"
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleSave}
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
  export default TentangAdmin;