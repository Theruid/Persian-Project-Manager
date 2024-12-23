import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      toast.error('ورود ناموفق بود. لطفا دوباره تلاش کنید.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-soft w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-100 p-4 rounded-full mb-4">
            <LogIn className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">ورود به حساب کاربری</h2>
          <p className="mt-2 text-gray-600">به سیستم مدیریت پروژه خوش آمدید</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input py-3 px-4 w-full text-base"
                placeholder="example@email.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رمز عبور</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input py-3 px-4 w-full text-base"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3 text-base font-medium"
          >
            ورود به حساب
          </button>
        </form>

        <p className="mt-8 text-center text-base text-gray-600">
          حساب کاربری ندارید؟{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            ثبت نام کنید
          </Link>
        </p>
      </div>
    </div>
  );
}