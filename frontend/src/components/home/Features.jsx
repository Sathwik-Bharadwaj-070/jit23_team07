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
  return <section className='py-14 sm:py-24 bg-white'>

<h2 className='text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-14'>

Features

</h2>

<div className='grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-7xl mx-auto px-4 sm:px-8'>

{data.map((item, index) => <div key={index} className='bg-green-50 rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-10 text-center hover:scale-105 transition duration-300'>

<div className='text-4xl sm:text-5xl text-green-600 mb-3 sm:mb-5 flex justify-center'>

{item.icon}

</div>

<h3 className='font-bold text-base sm:text-xl'>

{item.title}

</h3>

</div>)}

</div>

</section>;
}
export default Features;
