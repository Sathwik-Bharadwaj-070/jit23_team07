import { FaSeedling, FaTint, FaChartLine, FaClock } from 'react-icons/fa';
const data = [{
  title: 'Crop Prediction',
  icon: <FaSeedling />
}, {
  title: 'Soil Moisture',
  icon: <FaTint />
}, {
  title: 'Yield Prediction',
  icon: <FaChartLine />
}, {
  title: 'Harvest Time',
  icon: <FaClock />
}];
function Features() {
  return <section className='py-24 bg-white'>

<h2 className='text-4xl font-bold text-center mb-14'>

Features

</h2>

<div className='grid md:grid-cols-4 gap-8 max-w-7xl mx-auto px-8'>

{data.map((item, index) => <div key={index} className='bg-green-50 rounded-3xl shadow-lg p-10 text-center hover:scale-105 transition duration-300'>

<div className='text-5xl text-green-600 mb-5 flex justify-center'>

{item.icon}

</div>

<h3 className='font-bold text-xl'>

{item.title}

</h3>

</div>)}

</div>

</section>;
}
export default Features;
