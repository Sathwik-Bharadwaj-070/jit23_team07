import { motion } from 'framer-motion';
function FloatingBackground() {
  return <>
      <motion.div animate={{
      x: [0, 80, 0],
      y: [0, 60, 0]
    }} transition={{
      duration: 18,
      repeat: Infinity
    }} className='fixed top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-green-300 rounded-full blur-[140px] opacity-30 -z-10' />

      <motion.div animate={{
      x: [0, -80, 0],
      y: [0, -60, 0]
    }} transition={{
      duration: 20,
      repeat: Infinity
    }} className='fixed bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-lime-300 rounded-full blur-[160px] opacity-30 -z-10' />
    </>;
}
export default FloatingBackground;
