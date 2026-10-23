import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBars, FaLeaf, FaTimes, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const links = [
    { to: '/', label: 'Home' },
    { to: '/predict', label: 'Predict' },
    { to: '/results', label: 'Results' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];
  if (user?.role === 'admin') {
    links.push({ to: '/admin', label: 'Admin' });
  }

  const desktopLinkStyle = ({ isActive }) =>
    isActive
      ? 'text-green-600 font-semibold'
      : 'text-gray-700 hover:text-green-600 transition duration-300';

  const mobileLinkStyle = ({ isActive }) =>
    `block rounded-xl px-4 py-3 text-base font-medium transition ${
      isActive ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
    }`;

  const userChip = (
    <div className='flex items-center gap-3 bg-green-50 px-3 py-2 rounded-xl border border-green-200 min-w-0'>
      <FaUserCircle className='text-3xl sm:text-4xl text-green-600 shrink-0' />
      <div className='min-w-0'>
        <p className='text-xs text-gray-500'>
          {user?.role === 'admin' ? 'Signed in as' : 'Welcome Back'}
        </p>
        <p className='font-semibold text-green-700 truncate max-w-[10rem]'>{user?.name}</p>
      </div>
    </div>
  );

  return (
    <nav className='fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-md border-b border-green-100'>
      <div className='max-w-7xl mx-auto h-16 md:h-20 px-4 sm:px-8 flex justify-between items-center gap-3'>
        <Link to='/' className='flex items-center gap-2 sm:gap-3 min-w-0'>
          <div className='bg-green-600 p-2 sm:p-3 rounded-xl shadow-lg shrink-0'>
            <FaLeaf className='text-white text-lg sm:text-xl' />
          </div>

          <div className='min-w-0'>
            <p className='text-xl sm:text-2xl font-bold text-green-700 leading-tight whitespace-nowrap'>
              AgriVision AI
            </p>

            <p className='hidden sm:block text-xs text-gray-500'>
              Smart Agriculture Platform
            </p>
          </div>
        </Link>

        <div className='hidden xl:flex items-center gap-8 font-medium'>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={desktopLinkStyle}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className='hidden xl:flex items-center gap-4'>
          {user ? (
            <>
              {userChip}

              <button
                onClick={handleLogout}
                className='bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl transition'
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to='/login'
                className='border border-green-600 text-green-700 px-5 py-3 rounded-xl hover:bg-green-50 transition'
              >
                Login
              </Link>

              <Link
                to='/register'
                className='bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow-lg transition hover:scale-105'
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type='button'
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls='mobile-menu'
          className='xl:hidden shrink-0 p-3 rounded-xl text-green-700 hover:bg-green-50 transition text-xl'
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id='mobile-menu'
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className='xl:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-green-100 max-h-[calc(100svh-4rem)] overflow-y-auto'
          >
            <div className='max-w-7xl mx-auto px-4 sm:px-8 py-4 space-y-1'>
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={mobileLinkStyle}
                >
                  {link.label}
                </NavLink>
              ))}

              <div className='pt-4 mt-3 border-t border-gray-100'>
                {user ? (
                  <div className='space-y-3'>
                    {userChip}

                    <button
                      onClick={handleLogout}
                      className='w-full bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl transition font-medium'
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className='grid grid-cols-2 gap-3'>
                    <Link
                      to='/login'
                      className='text-center border border-green-600 text-green-700 px-5 py-3 rounded-xl hover:bg-green-50 transition font-medium'
                    >
                      Login
                    </Link>

                    <Link
                      to='/register'
                      className='text-center bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl shadow transition font-medium'
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
