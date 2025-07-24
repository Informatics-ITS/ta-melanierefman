import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Typography } from "../../../components/atom/typography";
import { Button } from "../../../components/atom/button";
import BackButton from "../../../components/atom/button/back";
import Input from "../../../components/molecule/form/input";
import Modal from "../../../components/molecule/modal";
import Toast from "../../../components/molecule/toast";
import Loading from "../../../components/atom/loading";

import { useToast } from "../../../hooks/useToast";
import { useModal } from "../../../hooks/useModal";

import EditProfileAkun from "./edit";

const Profile: React.FC = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [members, setMembers] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true); 

  const [formValues, setFormValues] = useState({
    email: user.email || "",
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
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

    if (formValues.password) {
      const passwordError = validatePassword(formValues.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }

      if (!formValues.current_password) {
        newErrors.current_password = "Password lama harus diisi.";
      }

      if (!formValues.password_confirmation) {
        newErrors.password_confirmation = "Konfirmasi password harus diisi.";
      } else if (formValues.password !== formValues.password_confirmation) {
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
    try {
      const token = localStorage.getItem('token');
  
      const payload: any = {};
  
      if (formValues.password) {
        payload.current_password = formValues.current_password;
        payload.password = formValues.password;
        payload.password_confirmation = formValues.password_confirmation;
      }
  
      await axios.put(`${baseUrl}/api/users/${user.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      addToast("success", "Akun berhasil diperbarui!");
      closeModal();
    } catch (error) {
      console.error("Error updating account:", error);
      addToast("error", "Gagal memperbarui akun. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const queryTab = searchParams.get("tab")?.replace(/\+/g, " ") || "Profil";
  const [activeBagian, setActiveBagian] = useState<string>(queryTab);

  useEffect(() => {
    if (activeBagian !== queryTab) {
      navigate(
        {
          pathname: window.location.pathname,
          search: `?tab=${activeBagian.replace(/\s+/g, "+")}`
        },
        { replace: true }
      );
    }
  }, [activeBagian, navigate, queryTab]);

  useEffect(() => {
    setActiveBagian(queryTab);
  }, [queryTab]);

  useEffect(() => {
    const fetchMembersData = async () => {
      try {
        const { data } = await axios.get(`${baseUrl}/api/members`);
        setMembers(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching member data:", error);
        setLoading(false);
      }
    };

    fetchMembersData();
  }, [baseUrl]);

  useEffect(() => {
    if (!loading && user.role === 'admin') {
      const userMember = members.find(member => member.name === user.name);
      
      if (!userMember) {
        const toastMessage = "Profil Anda belum lengkap. Silakan lengkapi di halaman profil.";
        addToast("error", toastMessage);
        navigate('/admin/profile', { state: { toast: { type: 'error', message: toastMessage } } });
      }
    }
  }, [loading, members, user.name, user.role, navigate]);

  return (
    <div className="flex-1 px-4 md:py-24 py-20">
      <BackButton />
      <Typography type="heading6" weight="semibold" className="mb-4">
        Profil
      </Typography>
      <div className="flex overflow-x-auto whitespace-nowrap space-x-4 mb-4 border-b-2 border-typo-outline pb-1">
        {["Profil", "Pengaturan Akun"].map(
          (bagian) => (
            <button
              key={bagian}
              onClick={() => setActiveBagian(bagian)}
              className={`${
                activeBagian === bagian
                  ? "text-primary font-semibold"
                  : "text-typo-secondary hover:text-primary font-medium"
              }`}
            >
              <Typography
                type="button"
              
                weight={activeBagian === bagian ? "semibold" : "regular"}
              >
                {bagian}
              </Typography>
            </button>
          )
        )}
      </div>

      {activeBagian === "Profil" && (
        <div className="mt-4">
          <EditProfileAkun />
        </div>
      )}

      {activeBagian === "Pengaturan Akun" && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="md:w-1/2">
            <div className="flex items-center">
              <Typography type="body" font="dm-sans" weight="semibold" className="mr-2 text-primary">
                Email:
              </Typography>
              <Typography type="body" font="dm-sans" weight="regular">
                {formValues.email}
              </Typography>
            </div>
          </div>
          <div className="underline decoration-primary decoration-2">
            <Typography type="paragraph" weight="semibold">
              Pengaturan Password
            </Typography>
          </div>
          <div className="md:w-1/2 space-y-4">
            <Input
              label="Password Lama"
              id="current_password"
              name="current_password"
              placeholder="Masukkan password"
              description="Minimal 8 karakter, termasuk huruf besar, angka, dan simbol."
              autoComplete="current_password"
              isPassword
              value={formValues.current_password}
              onChange={handleChange}
              error={errors.current_password || errors.general}
            />
            <Input
              label="Password Baru"
              id="password"
              name="password"
              placeholder="Masukkan password"
              description="Minimal 8 karakter, termasuk huruf besar, angka, dan simbol."
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
              placeholder="Masukkan konfirmasi password"
              description="Minimal 8 karakter, termasuk huruf besar, angka, dan simbol."
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
      )}

      <Modal
        sizeClass="md:w-1/2 lg:w-1/4"
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title="Konfirmasi Simpan Data"
        message="Apakah Anda yakin ingin menyimpan perubahan ini? Silakan konfirmasi untuk melanjutkan."
      />

      {isLoading && <Loading variant="centered" />}

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

export default Profile;