import { useState } from 'react';
import axiosInstance from '../../utils/instance';
import { useToast } from '../useToast';

export const useCreateData = <T, R>() => {
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addToast } = useToast();

  const createData = async (
    url: string,
    data: T,
    onSuccess?: () => void
  ): Promise<{ data: R | null; errors?: Record<string, string> }> => {
    setLoading(true);
    setErrors({});

    try {
      const response = await axiosInstance.post<R>(url, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addToast("success", "Data created successfully!");
      if (onSuccess) onSuccess();
      return { data: response.data };
    } catch (error: any) {
      console.error("Failed to create data:", error);

      if (error.response && error.response.status === 422) {
        const backendErrors = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};

        Object.keys(backendErrors).forEach((key) => {
          formattedErrors[key] = backendErrors[key][0];
        });

        setErrors(formattedErrors);
        addToast("error", "Periksa kembali data yang Anda masukkan.");
        return { data: null, errors: formattedErrors };
      } else {
        addToast("error", "Gagal menyimpan data. Silakan coba lagi.");
        return { data: null };
      }
    } finally {
      setLoading(false);
    }
  };

  return { createData, loading, errors };
};