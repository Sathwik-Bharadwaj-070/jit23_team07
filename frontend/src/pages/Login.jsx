import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaLeaf, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const handleLogin = e => {
    e.preventDefault();
    setError(null);
    const session = login(email, password);
    if (!session) {
      setError('Invalid email or password.');
      return;
    }
    if (session.role === 'admin') {
      navigate('/admin');
      return;
    }
    const redirectTo = location.state?.from || '/predict';
    navigate(redirectTo);
  };
  return <div className='min-h-[calc(100svh-4rem)] bg-gradient-to-br from-green-50 via-white to-green-100 flex justify-center items-center px-4 py-8 sm:py-12'>
      <form onSubmit={handleLogin} className='bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-10 w-full max-w-md'>
        <div className='flex justify-center mb-5'>
          <div className='bg-green-600 p-4 rounded-full'>
            <FaLeaf className='text-white text-3xl' />
          </div>
        </div>

        <h1 className='text-3xl sm:text-4xl font-bold text-center text-green-700'>
          Welcome Back
        </h1>

        <p className='text-center text-gray-500 mt-2 mb-8'>
          Login to continue
        </p>

        {error && <p className='mb-5 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3'>
            {error}
          </p>}

        <div className='relative mb-5'>
          <FaEnvelope className='absolute left-4 top-4 text-gray-400' />
          <input type='email' placeholder='Email Address' className='w-full border rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500' value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className='relative mb-8'>
          <FaLock className='absolute left-4 top-4 text-gray-400' />
          <input type={showPassword ? 'text' : 'password'} placeholder='Password' className='w-full border rounded-xl pl-12 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-green-500' value={password} onChange={e => setPassword(e.target.value)} />

          <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-4 top-4 text-gray-500'>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button type='submit' className='w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition duration-300'>
          Login
        </button>

        <p className='text-center mt-8 text-gray-600'>
          Don't have an account?
          <Link to='/register' className='text-green-700 font-semibold ml-2'>
            Register
          </Link>
        </p>
      </form>
    </div>;
}
export default Login;
