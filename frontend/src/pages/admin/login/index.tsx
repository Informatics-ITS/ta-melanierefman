import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { Typography } from '../../../components/atom/typography';
import { Button } from '../../../components/atom/button';
import Input from '../../../components/molecule/form/input';

const Login: React.FC = () => {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${baseUrl}/api/users/login`, {
        email: formValues.email,
        password: formValues.password,
      });

      if (response.status === 200) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('role', user.role);
        localStorage.setItem('id', user.id);

        console.log('Token disimpan:', localStorage.getItem('token'));

        // Cek jika role-nya admin, baru lakukan pengecekan member
        if (user.role === 'admin') {
          const membersResponse = await axios.get(`${baseUrl}/api/members`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const members = membersResponse.data;

          const userMember = members.find((member: any) => member.name === user.name);

          if (!userMember) {
            return navigate('/admin/profile', {
              state: {
                toast: {
                  type: 'error',
                  message: 'Profil Anda belum lengkap. Silakan lengkapi di halaman profil.',
                },
              },
            });
          }
        }

        // Jika role bukan admin atau data lengkap
        navigate('/admin');
      } else {
        alert('Login gagal. Cek email dan password anda.');
      }
    } catch (error: any) {
      if (error.response) {
        const message = error.response.data.message || 'Login gagal';

        if (message.toLowerCase().includes('email')) {
          setErrors({ email: message });
        } else if (message.toLowerCase().includes('password')) {
          setErrors({ password: message });
        } else {
          setErrors({ general: message });
        }
      }
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-typo">
      <div className="rounded-md w-full max-w-md bg-white m-4">
        <div className="md:flex p-6 gap-4 bg-typo-white2 rounded-t-md">
          <img src='/logo-brin-1.png' className="h-[40px] w-auto" alt="BRIN Logo"/>
          <Typography type="label" weight="semibold" className="md:mt-0 mt-2">
            Kelompok Riset Iklim dan Lingkungan Masa Lampau
          </Typography> 
        </div>
        <div className="p-6 space-y-4">
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
          <Input
            label="Password"
            id="password"
            name="password"
            placeholder="Masukkan password"
            autoComplete="current-password"
            isPassword
            value={formValues.password}
            onChange={handleChange}
            error={errors.password}
          />
          <Button variant="primary" onClick={handleLogin} className="w-full">Login</Button>
        </div>
      </div>
    </div>
  );
};

export default Login;