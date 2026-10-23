import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import FloatingBackground from './components/common/FloatingBackground';
import ScrollToTop from './components/common/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Predict from './pages/Predict';
import Results from './pages/Results';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
function AppRoutes() {
  const location = useLocation();
  return <div className='relative min-h-screen overflow-x-hidden bg-gradient-to-br from-green-50 via-white to-green-100'>
      <FloatingBackground />

      <ScrollToTop />

      <Navbar />

      <main className='pt-16 md:pt-20 flex-grow'>
        <AnimatePresence mode='wait'>
          <Routes location={location} key={location.pathname}>
            <Route path='/' element={<Home />} />

            <Route path='/register' element={<Register />} />
            <Route path='/login' element={<Login />} />

            <Route path='/predict' element={<ProtectedRoute>
                  <Predict />
                </ProtectedRoute>} />
            <Route path='/results' element={<ProtectedRoute>
                  <Results />
                </ProtectedRoute>} />

            <Route path='/admin' element={<AdminRoute>
                  <Admin />
                </AdminRoute>} />

            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />

            <Route path='*' element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>;
}
function App() {
  return <AuthProvider>
      <AppRoutes />
    </AuthProvider>;
}
export default App;
