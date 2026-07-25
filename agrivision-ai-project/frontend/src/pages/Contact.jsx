import { FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
function Contact() {
  return <section className='min-h-screen bg-gray-50 py-20'>

<div className='max-w-5xl mx-auto'>

<h1 className='text-5xl text-center font-bold text-green-700'>

Contact Us

</h1>

<div className='grid md:grid-cols-2 gap-10 mt-16 max-w-3xl mx-auto'>

<div className='bg-white p-8 rounded-2xl shadow'>

<FaEnvelope className='text-4xl text-green-600' />

<h2 className='font-bold mt-5'>

Email

</h2>

<p className='space-y-1 text-sm break-all'>

<span className='block'>1jt23cs145@jyothyit.in</span>

<span className='block'>1jt23cs147@jyothyit.in</span>

<span className='block'>1jt23cs149@jyothyit.in</span>

<span className='block'>1jt23cs156@jyothyit.in</span>

</p>

</div>

<div className='bg-white p-8 rounded-2xl shadow'>

<FaMapMarkerAlt className='text-4xl text-green-600' />

<h2 className='font-bold mt-5'>

Location

</h2>

<p>

Bengaluru, India

</p>

</div>

</div>

</div>

</section>;
}
export default Contact;
