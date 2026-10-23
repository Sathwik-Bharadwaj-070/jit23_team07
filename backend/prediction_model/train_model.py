import os
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASETS_DIR = os.path.join(BASE_DIR, '..', 'datasets')
MODELS_DIR = os.path.join(BASE_DIR, '..', 'models')
df = pd.read_csv(os.path.join(DATASETS_DIR, 'final_training_dataset.csv'))
FEATURES = ['Crop', 'Soil_Type', 'Moisture_Pct', 'Seed_Quality']
TARGETS = ['Yield_kg_per_ha', 'Harvest_Days']
encoders = {}
X = df[FEATURES].copy()
for col in ['Crop', 'Soil_Type', 'Seed_Quality']:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col])
    encoders[col] = le
y_yield = df['Yield_kg_per_ha']
y_harvest = df['Harvest_Days']
X_train, X_test, y_yield_train, y_yield_test = train_test_split(X, y_yield, test_size=0.2, random_state=42)
_, _, y_harvest_train, y_harvest_test = train_test_split(X, y_harvest, test_size=0.2, random_state=42)
yield_model = RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42)
yield_model.fit(X_train, y_yield_train)
yield_pred = yield_model.predict(X_test)
print('=== Yield Prediction Model ===')
print(f'MAE: {mean_absolute_error(y_yield_test, yield_pred):.2f} kg/ha')
print(f'R^2 Score: {r2_score(y_yield_test, yield_pred):.3f}')
harvest_model = RandomForestRegressor(n_estimators=200, max_depth=12, random_state=42)
harvest_model.fit(X_train, y_harvest_train)
harvest_pred = harvest_model.predict(X_test)
print('\n=== Harvest Days Prediction Model ===')
print(f'MAE: {mean_absolute_error(y_harvest_test, harvest_pred):.2f} days')
print(f'R^2 Score: {r2_score(y_harvest_test, harvest_pred):.3f}')
print('\n=== Feature importance (Yield model) ===')
for feat, imp in sorted(zip(FEATURES, yield_model.feature_importances_), key=lambda x: -x[1]):
    print(f'{feat}: {imp:.3f}')
joblib.dump(yield_model, os.path.join(MODELS_DIR, 'yield_model.pkl'))
joblib.dump(harvest_model, os.path.join(MODELS_DIR, 'harvest_model.pkl'))
joblib.dump(encoders, os.path.join(MODELS_DIR, 'encoders.pkl'))
print('\nModels saved to models/yield_model.pkl, models/harvest_model.pkl, models/encoders.pkl')
