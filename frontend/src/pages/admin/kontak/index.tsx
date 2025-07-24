import { useEffect, useState } from "react";
import axios from "axios";

import { Typography } from "../../../components/atom/typography";
import { Button } from "../../../components/atom/button";
import Loading from "../../../components/atom/loading";
import Input from "../../../components/molecule/form/input";
import Modal from "../../../components/molecule/modal";
import Toast from "../../../components/molecule/toast";

import { TentangProps } from "../../../entities/tentang";

import { useFetchData } from "../../../hooks/crud/useFetchData";
import { useToast } from "../../../hooks/useToast";
import { useModal } from "../../../hooks/useModal";

const ContactPage: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, loading, error, refetch } = useFetchData<{about: TentangProps}>(`${baseUrl}/api/about`);

  const [formValues, setFormValues] = useState({
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (data && data.about) {
      setFormValues({
        address: data.about.address,
        phone: data.about.phone,
        email: data.about.email,
      });
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let newErrors: Record<string, string> = {};

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("error", "Please check the information you entered.");
      return;
    }

    openModal();
  };

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
  
      const payload: any = {
        address: formValues.address,
        phone: formValues.phone,
        email: formValues.email,
      };
      
      console.log(payload);
  
      await axios.put(`${baseUrl}/api/about`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      addToast("success", "Kontak berhasil diperbarui!");
      closeModal();
      refetch();
    } catch (error) {
      addToast("error", "Gagal memperbarui kontak. Silakan coba lagi.");
    }
  }; 

  if (loading) return <Loading />
  if (error) return <div>Error loading</div>

  return (
    <div className="flex-1 px-4 md:py-24 py-20">
      <Typography type="heading6" weight="semibold">
        Kontak
      </Typography>
      <form onSubmit={handleSubmit} className="md:w-1/2 mt-4 space-y-4">
          <Input
            label="Alamat"
            id="address"
            name="address"
            placeholder="Masukkan alamat"
            autoComplete="address"
            value={formValues.address}
            onChange={handleChange}
            error={errors.address || errors.general}
          />
          <Input
            label="No. Telp"
            id="phone"
            name="phone"
            placeholder="Masukkan No. Telp"
            autoComplete="phone"
            value={formValues.phone}
            onChange={handleChange}
            error={errors.phone || errors.general}
          />
          <Input
            label="Email"
            id="email"
            name="email"
            placeholder="Masukkan email"
            autoComplete="email"
            value={formValues.email}
            onChange={handleChange}
            error={errors.email || errors.general}
          />
        <div className="flex justify-end">
          <Button variant="primary" type="submit">Simpan</Button>
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

export default ContactPage;