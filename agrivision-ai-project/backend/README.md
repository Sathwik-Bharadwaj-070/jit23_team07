# Smart Agriculture Project

## What's already set up (your part - IoT + Backend)
- `iot/soil_esp32.ino` — paste your working ESP32 code here (replace the placeholder)
- `iot/serial_reader.py` — reads moisture from ESP32 over Serial
- `app.py` — Flask backend with `/moisture` and `/save_soil` endpoints
- `templates/index.html`, `static/script.js`, `static/style.css` — basic frontend to show live moisture

## What YOU need to do right now
1. Copy your existing ESP32 code into `iot/soil_esp32.ino` (replace placeholder)
2. Update `SERIAL_PORT` in `iot/serial_reader.py` to match your actual COM port
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Run the app:
   ```
   python app.py
   ```
5. Test in browser: `http://127.0.0.1:5000/moisture`
6. Test soil saving with a tool like Postman or curl:
   ```
   curl -X POST http://127.0.0.1:5000/save_soil -H "Content-Type: application/json" -d "{\"soil\":\"Black\"}"
   ```

## What to send to teammates
- Zip this whole folder (or push to a shared GitHub repo) and share it with:
  - **Smitha** → she adds her image processing code inside `image_processing/`
  - **Prediction teammate** → adds their model code inside `prediction_model/`
- Also send them the **dataset** (seed images / soil-crop data) so they can start working in parallel.

## Folder structure
```
SmartAgricultureProject/
├── app.py
├── requirements.txt
├── templates/
│   └── index.html
├── static/
│   ├── script.js
│   └── style.css
├── image_processing/     (Smitha's module - empty for now)
├── iot/
│   ├── soil_esp32.ino
│   └── serial_reader.py
├── prediction_model/      (empty for now)
├── datasets/               (put your seed image dataset here)
└── models/                  (trained model files go here)
```
