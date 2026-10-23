import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaSeedling, FaTint, FaChartLine, FaClock, FaCloudUploadAlt, FaLayerGroup } from 'react-icons/fa';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
function Results() {
  const [result, setResult] = useState(null);
  useEffect(() => {
    const saved = localStorage.getItem('predictionResult');
    if (saved) {
      try {
        setResult(JSON.parse(saved));
      } catch {
        setResult(null);
      }
    }
  }, []);
  const data = result ? [{
    title: 'Crop Type',
    value: result.cropType,
    icon: <FaLeaf />
  }, {
    title: 'Seed Quality',
    value: result.seedQuality,
    icon: <FaSeedling />
  }, {
    title: 'Soil Moisture',
    value: result.soilMoisture,
    icon: <FaTint />
  }, {
    title: 'Your Soil',
    value: result.soilUsed,
    icon: <FaLayerGroup />
  }, {
    title: 'Expected Yield',
    value: result.expectedYield,
    icon: <FaChartLine />
  }, {
    title: 'Harvest Time',
    value: result.harvestTime,
    icon: <FaClock />
  }] : [];
  return <section className='min-h-screen bg-green-50 py-10 sm:py-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-8'>
        <h1 className='text-3xl sm:text-5xl text-center font-bold text-green-700 mb-8 sm:mb-14'>
          Prediction Results
        </h1>

        {data.length > 0 ? <>
            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8'>
              {data.map((item, index) => <div key={index} className='bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-10 sm:hover:scale-105 transition'>
                  <div className='text-4xl sm:text-5xl text-green-600 mb-4 sm:mb-6'>
                    {item.icon}
                  </div>

                  <h2 className='text-xl font-bold'>{item.title}</h2>

                  <p className='text-2xl sm:text-3xl mt-3 sm:mt-4 text-gray-700 break-words'>{item.value}</p>
                </div>)}
            </div>

            {result.growthSimulation && result.growthSimulation.length > 0 && <div className='bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-10 mt-6 sm:mt-8'>
                <h2 className='text-xl font-bold mb-6'>
                  Crop Growth Simulation
                </h2>

                <div className='h-64 sm:h-80 w-full'><ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={result.growthSimulation} margin={{ top: 8, right: 12, left: 0, bottom: 18 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#e5f5e9' />

                    <XAxis dataKey='day' label={{
                value: 'Day',
                position: 'insideBottom',
                offset: -12
              }} />

                    <YAxis label={{
                value: 'Growth %',
                angle: -90,
                position: 'insideLeft'
              }} domain={[0, 100]} />

                    <Tooltip formatter={value => [`${value}%`, 'Growth']} labelFormatter={day => `Day ${day}`} />

                    <Line type='monotone' dataKey='growth_percent' stroke='#16a34a' strokeWidth={3} dot={{
                r: 4
              }} />
                  </LineChart>
                </ResponsiveContainer></div>

                {result.reason && <p className='mt-6 text-gray-600 text-sm leading-6'>
                    {result.reason}
                  </p>}
              </div>}
          </> : <div className='flex flex-col items-center justify-center text-center bg-white rounded-2xl sm:rounded-3xl shadow-xl p-8 sm:p-16 max-w-xl mx-auto'>
            <FaCloudUploadAlt className='text-6xl text-green-400 mb-6' />

            <h2 className='text-2xl font-bold text-gray-800'>
              No Predictions Yet
            </h2>

            <p className='text-gray-500 mt-3'>
              Upload a crop or seed image on the Predict page to see your
              results here.
            </p>

            <Link to='/predict' className='mt-8 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition'>
              Go to Predict
            </Link>
          </div>}
      </div>
    </section>;
}
export default Results;
