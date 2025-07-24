import { createContext, useContext, useState, ReactNode } from "react";
import { v4 as uuidv4 } from 'uuid';

type Toast = {
  id: string;
  type: "success" | "error";
  message: string;
};

type ToastContextType = {
  toasts: Toast[];
  addToast: (type: Toast["type"], message: string) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast["type"], message: string) => {
    const id = uuidv4();
    const newToast: Toast = { id, type, message };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};