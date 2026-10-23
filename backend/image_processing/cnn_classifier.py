import os
import json
CNN_AVAILABLE = False
_model = None
_class_names = None
_img_size = (160, 160)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, '..', 'models')
MODEL_PATH = os.path.join(MODELS_DIR, 'cnn_crop_classifier.keras')
CLASS_NAMES_PATH = os.path.join(MODELS_DIR, 'cnn_class_names.json')
try:
    if os.path.exists(MODEL_PATH) and os.path.exists(CLASS_NAMES_PATH):
        import tensorflow as tf
        _model = tf.keras.models.load_model(MODEL_PATH)
        with open(CLASS_NAMES_PATH) as f:
            _class_names = json.load(f)
        CNN_AVAILABLE = True
        print(f'[cnn_classifier] Loaded trained CNN model, classes: {_class_names}')
    else:
        print(f'[cnn_classifier] No trained CNN model found at {MODEL_PATH} - falling back to the rule-based heuristic classifier. Run image_processing/train_cnn_classifier.py with a labeled dataset to enable the CNN.')
except Exception as e:
    print(f'[cnn_classifier] Could not load CNN model, falling back to heuristic: {e}')
    CNN_AVAILABLE = False

def classify_crop_type_cnn(image_path):
    if not CNN_AVAILABLE:
        raise RuntimeError('No trained CNN model is loaded.')
    import tensorflow as tf
    import numpy as np
    img = tf.keras.utils.load_img(image_path, target_size=_img_size)
    arr = tf.keras.utils.img_to_array(img)
    arr = np.expand_dims(arr, axis=0)
    predictions = _model.predict(arr, verbose=0)[0]
    best_idx = int(np.argmax(predictions))
    crop_type = _class_names[best_idx]
    confidence = round(float(predictions[best_idx]) * 100, 1)
    return (crop_type, confidence)
