import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from predict import recommend_soil_and_predict
result = recommend_soil_and_predict(crop='Rice', moisture_pct=78.0, seed_quality='High')
sim = result['yield_prediction']['growth_simulation']
days = [point['day'] for point in sim]
growth = [point['growth_percent'] for point in sim]
plt.figure(figsize=(8, 5))
plt.plot(days, growth, marker='o', color='green', linewidth=2)
plt.title(f'Crop Growth Simulation - {result['crop_recommendation']['crop_name']}')
plt.xlabel('Days')
plt.ylabel('Growth (%)')
plt.grid(True, alpha=0.3)
plt.ylim(0, 105)
plt.tight_layout()
plt.savefig('growth_simulation.png', dpi=150)
print('Saved growth_simulation.png in the prediction_model folder')
print(f'\nRecommended Soil: {result['crop_recommendation']['recommended_soil']}')
print(f'Predicted Yield: {result['yield_prediction']['predicted_yield_kg_per_ha']} kg/ha')
print(f'Harvest Days: {result['yield_prediction']['harvest_days']}')
