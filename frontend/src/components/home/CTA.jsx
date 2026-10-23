import { Link } from 'react-router-dom';
function CTA() {
  return <section className='bg-green-700 py-14 sm:py-20 px-4 text-center text-white'>

      <h2 className='text-3xl sm:text-5xl font-bold mb-6'>
        Ready to Predict Your Crop?
      </h2>

      <p className='text-base sm:text-lg mb-8'>
        Upload an image and get AI-powered predictions in seconds.
      </p>

      <Link to='/predict' className='inline-block bg-white text-green-700 px-8 py-4 rounded-xl font-semibold hover:bg-green-100 transition'>
        Start Prediction
      </Link>

    </section>;
}
export default CTA;
