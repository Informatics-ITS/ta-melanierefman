import { useState } from "react";

import { Typography } from "../../../../components/atom/typography";
import { Button } from "../../../../components/atom/button";
import Loading from "../../../../components/atom/loading";
import BackButton from "../../../../components/atom/button/back";
import Input from "../../../../components/molecule/form/input";
import Dropdown from "../../../../components/molecule/form/dropdown";
import Modal from "../../../../components/molecule/modal";
import Toast from "../../../../components/molecule/toast";

import { useCreateData } from "../../../../hooks/crud/useCreateData";
import { useToast } from "../../../../hooks/useToast";
import { useModal } from "../../../../hooks/useModal";

const CreateAkun: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { createData } = useCreateData();
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "",
  });

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
    if (!formValues.password) newErrors.password = "Password wajib diisi.";
    if (!formValues.password_confirmation) newErrors.password_confirmation = "Konfirmasi password wajib diisi.";
    if (!selectedRole) newErrors.role = "Role harus dipilih.";

    const passwordError = validatePassword(formValues.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (formValues.password && formValues.password_confirmation && formValues.password !== formValues.password_confirmation) {
      newErrors.password_confirmation = "Password dan konfirmasi tidak cocok.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    openModal();
  };

  const handleConfirm = async () => {
    const data = {
      name: formValues.name,
      email: formValues.email,
      password: formValues.password,
      password_confirmation: formValues.password_confirmation,
      role: selectedRole,
    };

    setIsLoading(true);
    closeModal();

    try {
      const { data: result, errors: beErrors } = await createData(
        `${baseUrl}/api/users`,
        data
      );

      if (result) {
        addToast("success", "Akun berhasil dibuat!");
        setFormValues({
          name: "",
          email: "",
          password: "",
          password_confirmation: "",
          role: "",
        });
        setSelectedRole(null);
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Gagal membuat akun. Silakan coba lagi.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 px-4 md:py-24 py-20">
      <BackButton />
      <Typography type="heading6" weight="semibold">
        Buat Akun
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
            error={errors.name}
          />
          <Input
            label="Email"
            id="email"
            name="email"
            placeholder="Masukkan email"
            autoComplete="email"
            value={formValues.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Dropdown
            label="Pilih Role"
            options={[
              { label: "Superadmin", value: "superadmin" },
              { label: "Admin", value: "admin" },
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
            error={errors.password}
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
            error={errors.password_confirmation}
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
        message="Apakah Anda yakin ingin menyimpan data ini? Silakan konfirmasi untuk melanjutkan."
      />

      {isLoading && (<Loading variant="centered" />)}

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

export default CreateAkun;
