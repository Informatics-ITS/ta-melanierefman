import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import { Typography } from "../../../../components/atom/typography";
import { Button } from "../../../../components/atom/button";
import Loading from "../../../../components/atom/loading";
import BackButton from "../../../../components/atom/button/back";
import Input from "../../../../components/molecule/form/input";
import Dropdown from "../../../../components/molecule/form/dropdown";
import Modal from "../../../../components/molecule/modal";
import Toast from "../../../../components/molecule/toast";

import { useFetchData } from "../../../../hooks/crud/useFetchData";
import { useToast } from "../../../../hooks/useToast";
import { useModal } from "../../../../hooks/useModal";
import { UserProps } from "../../../../entities/user";

const EditAkun: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams<{ id: string }>();
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { data, loading, error, refetch } = useFetchData<UserProps>(`${baseUrl}/api/users/${id}`);

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "",
  });

  useEffect(() => {
    if (data) {
      setFormValues({
        name: data.name || "",
        email: data.email || "",
        password: "",
        password_confirmation: "",
        role: data.role || "",
      })
      setSelectedRole(data.role);
    }
  }, [data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    setFormValues((prev) => ({ ...prev, role }));
    setErrors((prev) => ({ ...prev, role: "" }));
  };
  
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password minimal 8 karakter.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password harus mengandung huruf besar.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password harus mengandung angka.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password harus mengandung simbol.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let newErrors: Record<string, string> = {};

    if (!formValues.name) newErrors.name = "Nama wajib diisi.";
    if (!formValues.email) newErrors.email = "Email wajib diisi.";
    if (!selectedRole) newErrors.role = "Role harus dipilih.";

    if (formValues.password || formValues.password_confirmation) {
      const passwordError = validatePassword(formValues.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
  
      if (formValues.password && formValues.password_confirmation && formValues.password !== formValues.password_confirmation) {
        newErrors.password_confirmation = "Password dan konfirmasi tidak cocok.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    openModal();
  };

  const handleConfirm = async () => {
    closeModal();
    setIsLoading(true);

    const data = {
      name: formValues.name,
      email: formValues.email,
      role: formValues.role,
      password: formValues.password,
      password_confirmation: formValues.password_confirmation,
    };

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        addToast("error", "Token tidak ditemukan. Harap login kembali.");
        return;
      }

      await axios.put(`${baseUrl}/api/users/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      addToast("success", "Akun berhasil diperbarui!");
      refetch();
      setIsLoading(false);

    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const beErrors = error.response.data.errors;

        if (beErrors.email) {
          setErrors((prev) => ({ ...prev, email: beErrors.email[0] }));
        }

        Object.keys(beErrors).forEach((key) => {
          console.log(`${key}: ${beErrors[key][0]}`);
        });
        
        addToast("error", "Periksa kembali data yang Anda masukkan.");
      } else {
        addToast("error", "Gagal memperbarui akun. Silakan coba lagi.");
      }
    }
  };

  if (loading) return <Loading/>; 
  if (error) return <div>Error loading</div>

  return (
    <div className="flex-1 px-4 md:py-24 py-20">
      <BackButton />
      <Typography type="heading6" weight="semibold">
        Edit Akun
      </Typography>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="md:grid md:grid-cols-2 gap-4 md:space-y-0 space-y-4">
          <Input
            label="Nama"
            id="name"
            name="name"
            placeholder="Masukkan nama"
            autoComplete="name"
            value={formValues.name}
            onChange={handleChange}
            error={errors.name || errors.general}
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
          <Dropdown
            label="Pilih Role"
            options={[
              { label: "Superadmin", value: "superadmin" }, 
              { label: "Admin", value: "admin" }
            ]}
            selectedValue={selectedRole}
            onChange={handleRoleChange}
            placeholder="Pilih Role"
            error={errors.role}
            variant="simple"
          />
        </div>
        <div className="underline decoration-primary decoration-2">
          <Typography type="paragraph" weight="semibold">
            Pengaturan Password
          </Typography>
        </div>
        <div className="md:grid md:grid-cols-2 gap-4 md:space-y-0 space-y-4">
          <Input
            label="Password"
            id="password"
            name="password"
            description="Minimal 8 karakter, termasuk huruf besar, angka, dan simbol."
            placeholder="Masukkan password"
            autoComplete="new-password"
            isPassword
            value={formValues.password}
            onChange={handleChange}
            error={errors.password || errors.general}
          />
          <Input
            label="Konfirmasi Password"
            id="password_confirmation"
            name="password_confirmation"
            description="Minimal 8 karakter, termasuk huruf besar, angka, dan simbol."
            placeholder="Masukkan konfirmasi password"
            autoComplete="new-password"
            isPassword
            value={formValues.password_confirmation}
            onChange={handleChange}
            error={errors.password_confirmation || errors.general}
          />
        </div>
        <div className="md:flex md:justify-end">
          <Button variant="primary" type="submit" className="w-full md:w-auto">Simpan</Button>
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

      {isLoading && (<div className="w-full flex justify-center"><Loading variant="centered"/></div> )}

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

export default EditAkun;