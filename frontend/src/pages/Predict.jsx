import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaImage,
  FaLeaf,
  FaTint,
  FaChartLine,
  FaClock,
  FaSeedling,
  FaTrophy,
} from 'react-icons/fa';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { logPrediction } from '../utils/auth';

const SOIL_TYPES = ['Clay', 'Red', 'Black'];

function Predict() {
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [soilType, setSoilType] = useState(SOIL_TYPES[0]);
  const [moistureOverride, setMoistureOverride] = useState('');

  const [classifying, setClassifying] = useState(false);
  const [classifyError, setClassifyError] = useState(null);
  const [classification, setClassification] = useState(null);

  const [recommending, setRecommending] = useState(false);
  const [recommendError, setRecommendError] = useState(null);
  const [recommendation, setRecommendation] = useState(null);

  const navigate = useNavigate();

  function handleImage(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setClassification(null);
      setRecommendation(null);
      setClassifyError(null);
      setRecommendError(null);
    }
  }

  async function handleClassify() {
    if (!imageFile) {
      setClassifyError({
        message: 'Please upload a seed image first.',
        notSeed: false,
      });
      return;
    }

    setClassifying(true);
    setClassifyError(null);
    setClassification(null);
    setRecommendation(null);

    try {
      const formData = new FormData();
      formData.append('seed_image', imageFile);

      const res = await API.post('/classify_seed', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setClassification({
        cropType: res.data.crop_type,
        seedQuality: res.data.seed_quality,
      });
    } catch (err) {
      const data = err?.response?.data;
      const notSeed = data?.code === 'not_a_seed_image';
      setClassifyError({
        notSeed,
        message:
          data?.error ||
          'Seed classification failed. Make sure the backend server is running on http://127.0.0.1:5000.',
      });
    } finally {
      setClassifying(false);
    }
  }

  async function handleGetYield() {
    setRecommending(true);
    setRecommendError(null);

    try {
      let moisturePct;
      if (moistureOverride !== '') {
        moisturePct = parseFloat(moistureOverride);
      } else {
        const moistureRes = await API.get('/moisture');
        moisturePct = moistureRes.data.moisture;
      }

      const predictRes = await API.post('/predict', {
        crop: classification.cropType,
        seed_quality: classification.seedQuality,
        moisture_pct: moisturePct,
        current_soil: soilType,
      });
      const { crop_recommendation, yield_prediction } = predictRes.data;

      const combined = {
        cropType: classification.cropType,
        seedQuality: classification.seedQuality,
        soilMoisture: `${moisturePct}%`,
        soilUsed: yield_prediction.soil_used,
        expectedYield: `${yield_prediction.predicted_yield_kg_per_ha} kg/ha`,
        harvestTime: `${yield_prediction.harvest_days} Days`,
        recommendedSoil: crop_recommendation.recommended_soil,
        reason: crop_recommendation.reason,
        growthSimulation: yield_prediction.growth_simulation,
      };

      setRecommendation(combined);
      localStorage.setItem('predictionResult', JSON.stringify(combined));
      logPrediction({ ...combined, userEmail: user?.email });
    } catch (err) {
      const backendError = err?.response?.data?.error;
      setRecommendError(
        backendError ||
          'Prediction failed. Make sure the backend server is running on http://127.0.0.1:5000.'
      );
    } finally {
      setRecommending(false);
    }
  }

  return (
    <section className='min-h-screen bg-gradient-to-br from-green-50 to-white py-10 sm:py-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-8'>
        <div className='text-center mb-8 sm:mb-14'>
          <h1 className='text-3xl sm:text-5xl font-bold text-green-700'>
            AI Crop Prediction
          </h1>

          <p className='text-gray-600 mt-3 sm:mt-4 text-sm sm:text-base'>
            Upload your seed image for AI analysis
          </p>
        </div>

        <div className='grid lg:grid-cols-2 gap-6 sm:gap-10'>
          <div className='bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 min-w-0'>
            <h2 className='text-xl sm:text-2xl font-bold mb-4 sm:mb-6'>Upload Seed Image</h2>

            <label className='border-2 border-dashed border-green-400 rounded-2xl sm:rounded-3xl h-64 sm:h-96 flex flex-col justify-center items-center cursor-pointer hover:bg-green-50 transition px-3 overflow-hidden'>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt='Selected seed preview'
                  className='max-h-56 sm:max-h-80 max-w-full w-auto object-contain rounded-2xl shadow-lg'
                />
              ) : (
                <>
                  <FaCloudUploadAlt className='text-6xl sm:text-7xl text-green-600 mb-4 sm:mb-5' />
                  <p className='text-gray-500 text-center text-sm sm:text-base'>
                    Tap or click to upload a photo of seeds
                  </p>
                </>
              )}

              <input
                type='file'
                accept='image/*'
                hidden
                onChange={handleImage}
              />
            </label>

            {classifyError && classifyError.notSeed && (
              <div
                role='alert'
                className='mt-4 flex items-start gap-3 text-amber-900 text-sm bg-amber-50 border border-amber-300 rounded-xl p-4'
              >
                <FaExclamationTriangle className='text-amber-500 text-lg mt-0.5 shrink-0' />
                <div>
                  <p className='font-semibold'>Please upload only an image of seeds</p>
                  <p className='mt-1 text-amber-800'>
                    This picture does not look like a seed sample. Use a clear
                    photo of rice, wheat, ragi or chana dal grains.
                  </p>
                </div>
              </div>
            )}

            {classifyError && !classifyError.notSeed && (
              <p
                role='alert'
                className='mt-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3'
              >
                {classifyError.message}
              </p>
            )}

            <button
              onClick={handleClassify}
              disabled={classifying}
              className='w-full mt-5 sm:mt-6 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition'
            >
              {classifying ? 'Classifying...' : 'Classify Seed'}
            </button>

            {classification && (
              <div className='mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-100'>
                <h3 className='font-bold text-gray-800 mb-1'>
                  Step 2: Your Soil &amp; Moisture
                </h3>
                <p className='text-sm text-gray-500 mb-4'>
                  Tell us which soil you're actually growing in and its
                  moisture, and we'll predict expected yield and harvest time
                  for{' '}
                  <span className='font-semibold text-green-700'>
                    {classification.cropType}
                  </span>{' '}
                  in <span className='font-semibold'>that soil</span> - not a
                  different one.
                </p>

                <label className='text-sm font-medium text-gray-600'>
                  Which soil are you testing in?
                </label>
                <div className='mt-2 grid grid-cols-3 gap-2'>
                  {SOIL_TYPES.map((s) => (
                    <button
                      key={s}
                      type='button'
                      onClick={() => setSoilType(s)}
                      className={`py-3 sm:py-2 rounded-xl border text-sm font-semibold transition ${
                        soilType === s
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-green-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <label className='text-sm font-medium text-gray-600 mt-5 block'>
                  Soil moisture % (optional — leave blank to read live from the
                  ESP32 sensor)
                </label>
                <input
                  type='number'
                  inputMode='decimal'
                  min='0'
                  max='100'
                  value={moistureOverride}
                  onChange={(e) => setMoistureOverride(e.target.value)}
                  placeholder='e.g. 74'
                  className='mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-green-400'
                />

                {recommendError && (
                  <p
                    role='alert'
                    className='mt-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3'
                  >
                    {recommendError}
                  </p>
                )}

                <button
                  onClick={handleGetYield}
                  disabled={recommending}
                  className='w-full mt-5 sm:mt-6 bg-green-700 hover:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition'
                >
                  {recommending ? 'Predicting...' : 'Predict Yield & Harvest'}
                </button>
              </div>
            )}
          </div>

          <div className='bg-white rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 min-w-0'>
            <div className='flex flex-wrap items-center justify-between gap-2 mb-6 sm:mb-8'>
              <h2 className='text-xl sm:text-2xl font-bold'>Prediction Results</h2>

              {recommendation && (
                <button
                  onClick={() => navigate('/results')}
                  className='text-sm font-semibold text-green-700 hover:text-green-800'
                >
                  View full results →
                </button>
              )}
            </div>

            <div className='space-y-3 sm:space-y-5'>
              <ResultItem
                icon={<FaLeaf />}
                title='Crop Type'
                value={classification?.cropType ?? 'Waiting...'}
              />

              <ResultItem
                icon={<FaImage />}
                title='Seed Quality'
                value={classification?.seedQuality ?? 'Waiting...'}
              />

              <ResultItem
                icon={<FaSeedling />}
                title='Your Soil'
                value={recommendation?.soilUsed ?? 'Waiting...'}
              />

              <ResultItem
                icon={<FaTint />}
                title='Soil Moisture'
                value={recommendation?.soilMoisture ?? 'Waiting...'}
              />

              <ResultItem
                icon={<FaChartLine />}
                title='Expected Yield'
                value={recommendation?.expectedYield ?? 'Waiting...'}
              />

              <ResultItem
                icon={<FaClock />}
                title='Harvest Time'
                value={recommendation?.harvestTime ?? 'Waiting...'}
              />

              {recommendation &&
                recommendation.recommendedSoil !== recommendation.soilUsed && (
                  <div className='flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800'>
                    <FaTrophy className='text-amber-500 text-lg mt-0.5 shrink-0' />
                    <span>
                      At this moisture level,{' '}
                      <strong>{recommendation.recommendedSoil}</strong> soil
                      would give a higher yield than {recommendation.soilUsed},
                      if switching soils is an option for you.
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultItem({ icon, title, value }) {
  return (
    <div className='flex justify-between items-center gap-3 bg-green-50 rounded-xl p-4 sm:p-5'>
      <div className='flex items-center gap-3 sm:gap-4 min-w-0'>
        <div className='text-green-600 text-xl sm:text-2xl shrink-0'>{icon}</div>

        <span className='font-semibold text-sm sm:text-base'>{title}</span>
      </div>

      <span className='text-gray-600 text-sm sm:text-base text-right break-words min-w-0'>
        {value}
      </span>
    </div>
  );
}

export default Predict;
