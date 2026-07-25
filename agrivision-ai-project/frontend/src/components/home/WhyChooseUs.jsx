import { FaLeaf, FaBrain, FaChartLine } from 'react-icons/fa';
function WhyChooseUs() {
  const data = [{
    icon: <FaBrain />,
    title: 'AI Analysis',
    desc: 'Uses Machine Learning for accurate crop prediction.'
  }, {
    icon: <FaLeaf />,
    title: 'Smart Farming',
    desc: 'Helps farmers improve productivity and crop quality.'
  }, {
    icon: <FaChartLine />,
    title: 'High Accuracy',
    desc: 'Provides reliable recommendations for better yield.'
  }];
  return <section className='py-20 bg-white'>
      <div className='max-w-7xl mx-auto px-8'>

        <h2 className='text-4xl font-bold text-center mb-14'>
          Why Choose AgriVision AI?
        </h2>

        <div className='grid md:grid-cols-3 gap-8'>

          {data.map((item, index) => <div key={index} className='bg-green-50 rounded-2xl shadow-lg p-8 hover:-translate-y-2 transition duration-300'>
              <div className='text-5xl text-green-600 mb-5'>
                {item.icon}
              </div>

              <h3 className='text-2xl font-semibold mb-3'>
                {item.title}
              </h3>

              <p className='text-gray-600'>
                {item.desc}
              </p>
            </div>)}

        </div>

      </div>
    </section>;
}
export default WhyChooseUs;
