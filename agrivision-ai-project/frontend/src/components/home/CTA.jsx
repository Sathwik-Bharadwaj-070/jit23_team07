import { Link } from 'react-router-dom';
function CTA() {
  return <section className='bg-green-700 py-20 text-center text-white'>

      <h2 className='text-5xl font-bold mb-6'>
        Ready to Predict Your Crop?
      </h2>

      <p className='text-lg mb-8'>
        Upload an image and get AI-powered predictions in seconds.
      </p>

      <Link to='/predict' className='bg-white text-green-700 px-8 py-4 rounded-xl font-semibold hover:bg-green-100 transition'>
        Start Prediction
      </Link>

    </section>;
}
export default CTA;
