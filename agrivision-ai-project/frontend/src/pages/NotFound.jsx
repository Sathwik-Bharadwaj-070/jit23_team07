import { Link } from 'react-router-dom';
function NotFound() {
  return <div className='min-h-screen flex flex-col justify-center items-center bg-gray-100'>
      <h1 className='text-8xl font-bold text-green-700'>404</h1>

      <p className='text-xl text-gray-600 mt-4'>
        Oops! The page you're looking for doesn't exist.
      </p>

      <Link to='/' className='mt-8 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition'>
        Back to Home
      </Link>
    </div>;
}
export default NotFound;
