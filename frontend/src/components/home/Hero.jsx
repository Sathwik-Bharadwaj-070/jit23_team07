import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaLeaf, FaArrowRight, FaSeedling, FaRobot, FaTint, FaChartLine } from 'react-icons/fa';
function Hero() {
  const navigate = useNavigate();
  const handleStartPrediction = () => {
    navigate('/register');
  };
  return <section className='relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-100 lg:min-h-screen flex items-center'>

      <div className='absolute w-96 h-96 bg-green-300 rounded-full blur-[140px] opacity-30 -top-20 -left-20'></div>

      <div className='absolute w-80 h-80 bg-lime-200 rounded-full blur-[120px] opacity-30 bottom-0 right-0'></div>

      <div className='w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 lg:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center'>

        <motion.div initial={{
        opacity: 0,
        x: -80
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 1
      }}>

          <div className='inline-flex items-center gap-2 bg-green-100 text-green-700 px-5 py-2 rounded-full shadow mb-6'>
            <FaRobot />
            <span>AI Powered Agriculture</span>
          </div>

          <h1 className='text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight text-gray-900'>
            Smart Crop
            <span className='block text-green-600'>
              Prediction System
            </span>
          </h1>

          <p className='mt-5 sm:mt-8 text-base sm:text-lg text-gray-600 leading-7 sm:leading-8 max-w-xl'>
            Upload your crop image and let Artificial Intelligence
            predict crop type, seed quality, soil moisture,
            expected yield, recommended soil and harvest time.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 sm:gap-5 mt-8 sm:mt-10'>

            <button onClick={handleStartPrediction} className='group bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl shadow-xl transition duration-300 hover:scale-105 flex items-center justify-center gap-3'>
              Start Prediction
              <FaArrowRight className='group-hover:translate-x-2 transition' />
            </button>

            <button onClick={() => navigate('/about')} className='border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white px-8 py-4 rounded-xl transition duration-300'>
              Learn More
            </button>

          </div>


          <div className='grid grid-cols-3 gap-3 sm:gap-8 mt-10 sm:mt-16'>

            <div className='text-center'>
              <h2 className='text-2xl sm:text-4xl font-bold text-green-600'>
                98%
              </h2>

              <p className='text-xs sm:text-base text-gray-500 mt-1 sm:mt-2'>
                Prediction Accuracy
              </p>
            </div>

            <div className='text-center'>
              <h2 className='text-2xl sm:text-4xl font-bold text-green-600'>
                AI
              </h2>

              <p className='text-xs sm:text-base text-gray-500 mt-1 sm:mt-2'>
                Smart Analysis
              </p>
            </div>

            <div className='text-center'>
              <h2 className='text-2xl sm:text-4xl font-bold text-green-600'>
                24/7
              </h2>

              <p className='text-xs sm:text-base text-gray-500 mt-1 sm:mt-2'>
                Instant Results
              </p>
            </div>

          </div>

        </motion.div>


        <motion.div initial={{
        opacity: 0,
        x: 80
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 1
      }} className='relative flex justify-center w-full'>


          <motion.div animate={{
          y: [-10, 10, -10]
        }} transition={{
          repeat: Infinity,
          duration: 4
        }} className='absolute -top-4 sm:-top-6 left-0 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-3 sm:p-5 flex items-center gap-3 sm:gap-4 z-10'>

            <FaSeedling className='text-green-600 text-3xl' />

            <div>
              <h3 className='font-bold'>
                AI Analysis
              </h3>

              <p className='text-sm text-gray-500'>
                Crop Detected Successfully
              </p>
            </div>

          </motion.div>


          <div className='w-full max-w-[470px] min-h-[420px] sm:h-[520px] py-10 sm:py-0 bg-white/70 backdrop-blur-xl rounded-[28px] sm:rounded-[40px] shadow-2xl border border-white/60 flex flex-col justify-center items-center'>

            <FaLeaf className='text-green-600 text-6xl sm:text-8xl animate-pulse mb-6 sm:mb-8' />

            <h2 className='text-3xl sm:text-4xl font-bold text-green-700'>
              AgriVision AI
            </h2>

            <p className='text-gray-500 text-center mt-4 px-6 sm:px-10 text-sm sm:text-base'>
              Intelligent Crop Prediction &
              Smart Agriculture Assistant
            </p>

            <div className='grid grid-cols-2 gap-3 sm:gap-4 mt-8 sm:mt-10 px-4 sm:px-8 w-full'>

              <div className='bg-green-50 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 text-sm sm:text-base'>
                <FaSeedling className='text-green-600 text-2xl' />
                <span>Crop Type</span>
              </div>

              <div className='bg-green-50 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 text-sm sm:text-base'>
                <FaTint className='text-blue-500 text-2xl' />
                <span>Soil Moisture</span>
              </div>

              <div className='bg-green-50 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 text-sm sm:text-base'>
                <FaChartLine className='text-green-600 text-2xl' />
                <span>Expected Yield</span>
              </div>

              <div className='bg-green-50 rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 text-sm sm:text-base'>
                <FaRobot className='text-purple-600 text-2xl' />
                <span>AI Prediction</span>
              </div>

            </div>

          </div>


          <motion.div animate={{
          rotate: [0, 20, 0],
          y: [-10, 10, -10]
        }} transition={{
          repeat: Infinity,
          duration: 5
        }} className='absolute bottom-2 sm:bottom-6 right-0 bg-green-600 text-white p-3 sm:p-5 rounded-full shadow-xl'>
            <FaLeaf className='text-3xl' />
          </motion.div>

        </motion.div>

      </div>

    </section>;
}
export default Hero;
