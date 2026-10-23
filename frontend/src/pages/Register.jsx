import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaLeaf } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
function Register() {
  const navigate = useNavigate();
  const {
    register
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const handleRegister = e => {
    e.preventDefault();
    setError(null);
    if (!user.name || !user.email || !user.password || !user.confirmPassword) {
      setError('Please fill all fields.');
      return;
    }
    if (user.password !== user.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      register(user);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };
  return <div className='min-h-[calc(100svh-4rem)] bg-gradient-to-br from-green-50 via-white to-green-100 flex justify-center items-center px-4 py-8 sm:py-12'>
      <form onSubmit={handleRegister} className='bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-10 w-full max-w-md'>
        <div className='flex justify-center mb-5'>
          <div className='bg-green-600 p-4 rounded-full'>
            <FaLeaf className='text-white text-3xl' />
          </div>
        </div>

        <h1 className='text-3xl sm:text-4xl font-bold text-center text-green-700'>
          Create Account
        </h1>

        <p className='text-center text-gray-500 mt-2 mb-8'>
          Register to use AgriVision AI
        </p>

        {error && <p className='mb-5 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3'>
            {error}
          </p>}

        <div className='relative mb-5'>
          <FaUser className='absolute left-4 top-4 text-gray-400' />
          <input type='text' placeholder='Full Name' className='w-full border rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500' onChange={e => setUser({
          ...user,
          name: e.target.value
        })} />
        </div>

        <div className='relative mb-5'>
          <FaEnvelope className='absolute left-4 top-4 text-gray-400' />
          <input type='email' placeholder='Email Address' className='w-full border rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500' onChange={e => setUser({
          ...user,
          email: e.target.value
        })} />
        </div>

        <div className='relative mb-5'>
          <FaLock className='absolute left-4 top-4 text-gray-400' />
          <input type={showPassword ? 'text' : 'password'} placeholder='Password' className='w-full border rounded-xl pl-12 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-green-500' onChange={e => setUser({
          ...user,
          password: e.target.value
        })} />

          <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-4 top-4 text-gray-500'>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className='relative mb-8'>
          <FaLock className='absolute left-4 top-4 text-gray-400' />
          <input type={showPassword ? 'text' : 'password'} placeholder='Confirm Password' className='w-full border rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-green-500' onChange={e => setUser({
          ...user,
          confirmPassword: e.target.value
        })} />
        </div>

        <button className='w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition duration-300'>
          Register
        </button>

        <p className='text-center mt-8 text-gray-600'>
          Already have an account?
          <Link to='/login' className='text-green-700 font-semibold ml-2'>
            Login
          </Link>
        </p>
      </form>
    </div>;
}
export default Register;
