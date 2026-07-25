import sys
import os
import uuid
import tempfile
sys.path.append(os.path.join(os.path.dirname(__file__), 'prediction_model'))
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from prediction_model.predict import recommend_soil_and_predict, compare_all_soils
from image_processing.seed_classifier import classify_seed_image
app = Flask(__name__)
CORS(app)
soil_data = {}

def _read_moisture_from_sensor():
    try:
        from iot.serial_reader import get_moisture
        value = get_moisture()
        if value is None:
            return (None, 'Sensor connected but no reading received yet. Check the ESP32 is powered and wired correctly.')
        return (value, None)
    except Exception as e:
        return (None, f'Sensor not available: {str(e)}')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/moisture')
def moisture():
    value, error = _read_moisture_from_sensor()
    if error:
        return (jsonify({'error': error}), 503)
    return jsonify({'moisture': value})

@app.route('/classify_seed', methods=['POST'])
def classify_seed():
    if 'seed_image' not in request.files:
        return (jsonify({'error': 'No seed_image file uploaded'}), 400)
    file = request.files['seed_image']
    if file.filename == '':
        return (jsonify({'error': 'No file selected'}), 400)
    ext = os.path.splitext(file.filename)[1] or '.jpg'
    tmp_path = os.path.join(tempfile.gettempdir(), f'seed_{uuid.uuid4().hex}{ext}')
    try:
        file.save(tmp_path)
        result = classify_seed_image(tmp_path)
        return jsonify(result)
    except Exception as e:
        return (jsonify({'error': str(e)}), 500)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.route('/save_soil', methods=['POST'])
def save_soil():
    try:
        from iot.serial_reader import save_soil_reading
        data = request.get_json()
        soil_type = data.get('soil')
        value = save_soil_reading(soil_type)
        soil_data[soil_type] = value
        return jsonify({'soil': soil_type, 'moisture': value, 'all_readings': soil_data})
    except Exception as e:
        return (jsonify({'error': f'Sensor not available: {str(e)}'}), 503)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json() or {}
    crop = data.get('crop')
    seed_quality = data.get('seed_quality')
    current_soil = data.get('current_soil')
    moisture_pct = data.get('moisture_pct')
    if moisture_pct is None:
        moisture_pct, sensor_error = _read_moisture_from_sensor()
        if sensor_error:
            return (jsonify({'error': sensor_error}), 503)
    if not all([crop, moisture_pct is not None, seed_quality]):
        return (jsonify({'error': 'crop and seed_quality are required, and a moisture reading must be available'}), 400)
    try:
        result = recommend_soil_and_predict(crop=crop, moisture_pct=float(moisture_pct), seed_quality=seed_quality, current_soil=current_soil)
        return jsonify(result)
    except Exception as e:
        return (jsonify({'error': str(e)}), 500)

@app.route('/compare_soils', methods=['POST'])
def compare_soils_route():
    data = request.get_json() or {}
    crop = data.get('crop')
    seed_quality = data.get('seed_quality')
    moisture_pct = data.get('moisture_pct')
    if moisture_pct is None:
        moisture_pct, sensor_error = _read_moisture_from_sensor()
        if sensor_error:
            return (jsonify({'error': sensor_error}), 503)
    if not all([crop, moisture_pct is not None, seed_quality]):
        return (jsonify({'error': 'crop and seed_quality are required, and a moisture reading must be available'}), 400)
    try:
        result = compare_all_soils(crop=crop, moisture_pct=float(moisture_pct), seed_quality=seed_quality)
        return jsonify(result)
    except Exception as e:
        return (jsonify({'error': str(e)}), 500)
if __name__ == '__main__':
    app.run(debug=True)
