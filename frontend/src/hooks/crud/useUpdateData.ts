import { useState } from 'react';
import axiosInstance from '../../utils/instance';
import { useToast } from '../useToast';

export const useUpdateData = (baseUrl: string) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addToast } = useToast();

  const updateData = async (formData: FormData, id?: number): Promise<{ success: boolean, message: string, errors?: Record<string, string> }> => {
    setLoading(true);
    setErrors({});

    try {
      const finalUrl = id ? `${baseUrl}/${id}` : baseUrl;
      await axiosInstance.post(finalUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      addToast("success", "Data updated successfully!");
      return { success: true, message: "Data updated successfully!" };
    } catch (error: any) {
      console.error("Failed to update data:", error);

      if (error.response && error.response.status === 422) {
        const backendErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};

        Object.keys(backendErrors).forEach((key) => {
          formattedErrors[key] = backendErrors[key][0];
        });

        setErrors(formattedErrors);
        addToast("error", "Periksa kembali data yang Anda masukkan.");
        return { success: false, message: "Periksa kembali data yang Anda masukkan.", errors: formattedErrors };
      } else {
        addToast("error", "Gagal memperbarui data. Silakan coba lagi.");
        return { success: false, message: "Gagal memperbarui data.", errors: {} };
      }
    } finally {
      setLoading(false);
    }
  };

  return { updateData, loading, errors };
};