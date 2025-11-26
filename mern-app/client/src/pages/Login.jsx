import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { useLoginMutation } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await login(formData).unwrap();
      dispatch(setCredentials(response.data));
      navigate('/');
    } catch (error) {
      alert(error.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="card-body">
            <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              স্মার্ট ইভ্যালুয়েটর
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              লগইন করুন
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">ইমেইল</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">পাসওয়ার্ড</label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? 'লগইন হচ্ছে...' : 'লগইন'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Test: admin@test.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
