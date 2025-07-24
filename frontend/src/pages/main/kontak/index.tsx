import { useState } from 'react';
import { Mail, MapPinned, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Typography } from '../../../components/atom/typography';
import { Button } from '../../../components/atom/button';
import Loading from "../../../components/atom/loading";
import Input from '../../../components/molecule/form/input';
import Textarea from '../../../components/molecule/form/textarea';
import Modal from '../../../components/molecule/modal';
import Toast from '../../../components/molecule/toast';

import { AboutResponse, TentangProps } from "../../../entities/tentang";

import { useFetchData } from "../../../hooks/crud/useFetchData";
import { useCreateData } from "../../../hooks/crud/useCreateData";
import { useToast } from "../../../hooks/useToast";
import { useModal } from "../../../hooks/useModal";

const Kontak: React.FC = () => {
  const { t } = useTranslation();
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data, loading } = useFetchData<AboutResponse>(`${baseUrl}/api/about`);
  const { createData } = useCreateData();
  const item = data?.about as TentangProps;
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen, openModal, closeModal } = useModal();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let newErrors: Record<string, string> = {};

    if (!formValues.name || !formValues.email || !formValues.subject || !formValues.message) newErrors.general = 'This field is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('error', 'Please check the information you entered.');
      return;
    }

    openModal();
  };

  const handleConfirm = () => {
    closeModal();
    setIsLoading(true);
    
    const data = {
      ...formValues,
    };
  
    createData(`${baseUrl}/api/about/contact`, data, () => {
      addToast('success', 'Message sent successfully!');
      setFormValues({ name: '', email: '', subject: '', message: '' });
      setIsLoading(false);
    });
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div>
      {/* Hero */}
      <div className="pt-16">
        <div className="relative w-full h-[200px] md:h-[300px] overflow-hidden">
          {/* Image Background */}
          <img
            src="/view5.png"
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradient Overlay & Content */}
          <div className="absolute bottom-0  h-[6rem] md:h-[8rem] bg-gradient-to-t from-black to-transparent flex flex-col justify-center text-white w-full">
            <Typography type="heading1" weight="semibold" className="px-4 lg:px-[140px]">
              {t('kontak')}
            </Typography>
          </div>
        </div>
      </div>
      <div className="space-y-4 pt-8 px-4 lg:px-[140px] pb-8 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-[2fr,3fr] gap-12">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex space-x-2 items-start">
                <MapPinned size={20} className="text-primary flex-shrink-0 mt-1" />
                <Typography type="body" font="dm-sans" weight="regular">
                  {item?.address || "No address available"}
                </Typography>
              </div>
              <div className="flex space-x-2 items-center">
                <Phone size={20} className="text-primary flex-shrink-0" />
                <Typography type="body" font="dm-sans" weight="regular">
                  {item?.phone || "No phone available"}
                </Typography>
              </div>
              <div className="flex space-x-2 items-center">
                <Mail size={20} className="text-primary flex-shrink-0" />
                <Typography type="body" font="dm-sans" weight="regular">
                  {item?.email || "No email available"}
                </Typography>
              </div>
            </div>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label={t('fields.nama')}
              id="name"
              name="name"
              placeholder={t('placeholder.common', { field: t('fields.nama') })}
              autoComplete="name"
              value={formValues.name}
              onChange={handleChange}
              error={errors.name || errors.general}
            />
            <Input
              label={t('fields.email')}
              id="email"
              name="email"
              placeholder={t('placeholder.common', { field: t('fields.email') })}
              autoComplete="email"
              value={formValues.email}
              onChange={handleChange}
              error={errors.email || errors.general}
            />
            <Input
              label="Subject"
              id="subject"
              name="subject"
              placeholder={t('placeholder.common', { field: 'Subject' })}
              autoComplete="subject"
              value={formValues.subject}
              onChange={handleChange}
              error={errors.subject || errors.general}
            />
            <Textarea
              label={t('fields.msg')}
              id="message"
              name="message"
              placeholder={t('placeholder.common', { field: t('fields.msg') })}
              rows={5}
              value={formValues.message}
              onChange={handleChange}
              error={errors.message || errors.general}
            />
            <Button type="submit" variant="primary" className="w-full">
              {t('button.kirim')}
            </Button>
          </form>
        </div>

        <Modal
          sizeClass="md:w-1/2 lg:w-1/4"
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={handleConfirm  }
          title={t('modal_title.contact')}
          message={t('modal_msg.contact')}
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
    </div>
  );
};

export default Kontak;