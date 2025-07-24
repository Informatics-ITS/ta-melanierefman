import { useState } from 'react';
import axiosInstance from '../../utils/instance';

export const useDelete = (baseUrl: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const deleteData = async (endpoint: string, onSuccess?: () => void) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await axiosInstance.delete(`${baseUrl}/${endpoint}`);
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete data.');
    } finally {
      setLoading(false);
    }
  };

  return { deleteData, loading, error, success };
};