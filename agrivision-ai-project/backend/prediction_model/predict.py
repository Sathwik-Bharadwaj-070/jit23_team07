import os
import uuid
from datetime import datetime
import joblib
import numpy as np
import pandas as pd
FEATURES = ['Crop', 'Soil_Type', 'Moisture_Pct', 'Seed_Quality']
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, '..', 'models')
yield_model = joblib.load(os.path.join(MODELS_DIR, 'yield_model.pkl'))
harvest_model = joblib.load(os.path.join(MODELS_DIR, 'harvest_model.pkl'))
encoders = joblib.load(os.path.join(MODELS_DIR, 'encoders.pkl'))
SOIL_TYPES = ['Black', 'Red', 'Clay']

def _encode_input(crop, soil_type, moisture_pct, seed_quality):
    crop_enc = encoders['Crop'].transform([crop])[0]
    soil_enc = encoders['Soil_Type'].transform([soil_type])[0]
    quality_enc = encoders['Seed_Quality'].transform([seed_quality])[0]
    return pd.DataFrame([[crop_enc, soil_enc, moisture_pct, quality_enc]], columns=FEATURES)

def _predict_yield(crop, soil_type, moisture_pct, seed_quality):
    X = _encode_input(crop, soil_type, moisture_pct, seed_quality)
    return float(yield_model.predict(X)[0])

def _predict_harvest_days(crop, soil_type, moisture_pct, seed_quality):
    X = _encode_input(crop, soil_type, moisture_pct, seed_quality)
    return float(harvest_model.predict(X)[0])

def _growth_simulation(harvest_days, num_points=10):
    days = np.linspace(0, harvest_days, num_points)
    midpoint = harvest_days / 2
    steepness = 8 / harvest_days
    growth_pct = 100 / (1 + np.exp(-steepness * (days - midpoint)))
    return [{'day': round(float(d), 1), 'growth_percent': round(float(g), 1)} for d, g in zip(days, growth_pct)]

def compare_all_soils(crop, moisture_pct, seed_quality):
    comparison = {}
    for soil in SOIL_TYPES:
        predicted_yield = _predict_yield(crop, soil, moisture_pct, seed_quality)
        harvest_days = _predict_harvest_days(crop, soil, moisture_pct, seed_quality)
        comparison[soil] = {'predicted_yield_kg_per_ha': round(predicted_yield, 1), 'harvest_days': round(harvest_days), 'growth_simulation': _growth_simulation(harvest_days)}
    return comparison

def recommend_soil_and_predict(crop, moisture_pct, seed_quality, current_soil=None):
    soil_yields = {soil: _predict_yield(crop, soil, moisture_pct, seed_quality) for soil in SOIL_TYPES}
    best_soil = max(soil_yields, key=soil_yields.get)
    best_yield = soil_yields[best_soil]
    min_yield, max_yield = (min(soil_yields.values()), max(soil_yields.values()))
    spread = max_yield - min_yield if max_yield != min_yield else 1
    suitability_score = round(80 + 20 * ((best_yield - min_yield) / spread), 1)
    suitability_score = min(suitability_score, 100.0)
    reason = f'{best_soil} soil gives the highest predicted yield ({best_yield:.0f} kg/ha) for {crop} at {moisture_pct}% moisture with {seed_quality} quality seeds, compared to {', '.join((f'{s}: {y:.0f}' for s, y in soil_yields.items() if s != best_soil))} kg/ha.'
    final_soil = current_soil if current_soil else best_soil
    final_yield = soil_yields.get(final_soil, best_yield)
    harvest_days = _predict_harvest_days(crop, final_soil, moisture_pct, seed_quality)
    confidence_level = 0.65
    result = {'crop_recommendation': {'recommendation_id': str(uuid.uuid4()), 'crop_name': crop, 'recommended_soil': best_soil, 'suitability_score': suitability_score, 'reason': reason, 'date_time': datetime.now().isoformat()}, 'yield_prediction': {'prediction_id': str(uuid.uuid4()), 'soil_used': final_soil, 'predicted_yield_kg_per_ha': round(final_yield, 1), 'confidence_level': confidence_level, 'harvest_days': round(harvest_days), 'growth_simulation': _growth_simulation(harvest_days), 'date_time': datetime.now().isoformat()}}
    return result
if __name__ == '__main__':
    import json
    output = recommend_soil_and_predict(crop='Rice', moisture_pct=78.0, seed_quality='High')
    print(json.dumps(output, indent=2))
