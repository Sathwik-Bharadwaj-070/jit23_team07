import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaLeaf, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
function Navbar() {
  const navigate = useNavigate();
  const {
    user,
    logout
  } = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const navLinkStyle = ({
    isActive
  }) => isActive ? 'text-green-600 font-semibold' : 'text-gray-700 hover:text-green-600 transition duration-300';
  return <nav className='fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-md border-b border-green-100'>
      <div className='max-w-7xl mx-auto h-20 px-8 flex justify-between items-center'>
        {}
        <Link to='/' className='flex items-center gap-3'>
          <div className='bg-green-600 p-3 rounded-xl shadow-lg'>
            <FaLeaf className='text-white text-xl' />
          </div>

          <div>
            <h1 className='text-2xl font-bold text-green-700'>
              AgriVision AI
            </h1>

            <p className='text-xs text-gray-500'>
              Smart Agriculture Platform
            </p>
          </div>
        </Link>

        {}
        <div className='hidden md:flex items-center gap-8 font-medium'>
          <NavLink to='/' className={navLinkStyle}>
            Home
          </NavLink>

          <NavLink to='/predict' className={navLinkStyle}>
            Predict
          </NavLink>

          <NavLink to='/results' className={navLinkStyle}>
            Results
          </NavLink>

          <NavLink to='/about' className={navLinkStyle}>
            About
          </NavLink>

          <NavLink to='/contact' className={navLinkStyle}>
            Contact
          </NavLink>

          {user?.role === 'admin' && <NavLink to='/admin' className={navLinkStyle}>
              Admin
            </NavLink>}
        </div>

        {}
        <div className='flex items-center gap-4'>
          {user ? <>
              <div className='flex items-center gap-3 bg-green-50 px-4 py-2 rounded-xl border border-green-200'>
                <FaUserCircle className='text-4xl text-green-600' />

                <div>
                  <p className='text-xs text-gray-500'>
                    {user.role === 'admin' ? 'Signed in as' : 'Welcome Back'}
                  </p>

                  <p className='font-semibold text-green-700'>{user.name}</p>
                </div>
              </div>

              <button onClick={handleLogout} className='bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl transition'>
                Logout
              </button>
            </> : <>
              <Link to='/login' className='border border-green-600 text-green-700 px-5 py-3 rounded-xl hover:bg-green-50 transition'>
                Login
              </Link>

              <Link to='/register' className='bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow-lg transition hover:scale-105'>
                Register
              </Link>
            </>}
        </div>
      </div>
    </nav>;
}
export default Navbar;
