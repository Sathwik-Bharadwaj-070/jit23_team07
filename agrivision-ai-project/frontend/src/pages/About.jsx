import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLeaf, FaBrain, FaSeedling, FaChevronDown } from 'react-icons/fa';
const featureDetails = [{
  title: 'AI Prediction',
  icon: <FaLeaf />,
  summary: 'Upload a crop or seed image and let AI analyze it instantly.',
  details: 'Our AI Prediction engine uses image analysis to instantly identify crop type and evaluate seed quality from a simple photo upload, giving farmers fast, reliable insights without any manual data entry.'
}, {
  title: 'ML Models',
  icon: <FaBrain />,
  summary: 'Trained Machine Learning models power every prediction.',
  details: 'Behind every result is a trained Machine Learning model (built with scikit-learn and OpenCV) that has learned from real agricultural data to predict soil moisture, expected yield, and harvest time with high accuracy.'
}, {
  title: 'Smart Farming',
  icon: <FaSeedling />,
  summary: 'Turn predictions into practical farming decisions.',
  details: 'AgriVision AI translates raw predictions into actionable guidance, recommending suitable soil types, estimating harvest timelines, and helping farmers plan ahead for a better yield.'
}];
function About() {
  const [openIndex, setOpenIndex] = useState(null);
  function toggleCard(index) {
    setOpenIndex(prev => prev === index ? null : index);
  }
  return <section className='min-h-screen py-20 bg-white'>
      <div className='max-w-5xl mx-auto px-8'>
        <h1 className='text-5xl font-bold text-center text-green-700'>
          About AgriVision AI
        </h1>

        <p className='mt-10 text-lg text-gray-700 leading-9'>
          AgriVision AI is an Artificial Intelligence based crop prediction
          system developed using Machine Learning and Deep Learning. It helps
          farmers predict crop type, evaluate seed quality, estimate soil
          moisture, recommend suitable soil, predict expected yield and
          calculate harvest time.
        </p>

        <div className='grid md:grid-cols-3 gap-8 mt-16 items-start'>
          {featureDetails.map((feature, index) => {
          const isOpen = openIndex === index;
          return <button key={feature.title} type='button' onClick={() => toggleCard(index)} aria-expanded={isOpen} className={`text-left bg-green-50 p-8 rounded-2xl shadow cursor-pointer transition hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-400 ${isOpen ? 'ring-2 ring-green-500 shadow-lg' : ''}`}>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <span className='text-2xl text-green-600'>
                      {feature.icon}
                    </span>
                    <h2 className='font-bold text-xl'>{feature.title}</h2>
                  </div>

                  <motion.span animate={{
                rotate: isOpen ? 180 : 0
              }} transition={{
                duration: 0.2
              }} className='text-green-600'>
                    <FaChevronDown />
                  </motion.span>
                </div>

                <p className='mt-3 text-sm text-gray-600'>
                  {feature.summary}
                </p>

                <AnimatePresence initial={false}>
                  {isOpen && <motion.div initial={{
                height: 0,
                opacity: 0
              }} animate={{
                height: 'auto',
                opacity: 1
              }} exit={{
                height: 0,
                opacity: 0
              }} transition={{
                duration: 0.25
              }} className='overflow-hidden'>
                      <p className='mt-4 pt-4 border-t border-green-200 text-gray-700 leading-7'>
                        {feature.details}
                      </p>
                    </motion.div>}
                </AnimatePresence>
              </button>;
        })}
        </div>
      </div>
    </section>;
}
export default About;
