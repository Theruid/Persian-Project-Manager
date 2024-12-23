import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { validatePassword } from '../utils/validation';
import toast from 'react-hot-toast';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      return;
    }
    
    try {
      await signUp(email, password);
      toast.success('ثبت نام با موفقیت انجام شد.');
      navigate('/');
    } catch (error) {
      toast.error('ثبت نام ناموفق بود. لطفا دوباره تلاش کنید.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-soft w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary-100 p-4 rounded-full mb-4">
            <UserPlus className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">ثبت نام در سیستم</h2>
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors([]);
                }}
                className="input py-3 px-4 w-full text-base"
                placeholder="••••••••"
                required
              />
              {errors.length > 0 && (
                <ul className="mt-2 text-sm text-red-600">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3 text-base font-medium"
          >
            ایجاد حساب
          </button>
        </form>

        <p className="mt-8 text-center text-base text-gray-600">
          قبلاً ثبت نام کرده‌اید؟{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            وارد شوید
          </Link>
        </p>
      </div>
    </div>
  );
}