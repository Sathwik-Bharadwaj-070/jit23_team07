# AgriVision AI — Combined Project

This project combines two previously separate pieces into one repo:

- **`frontend/`** — the AgriVision AI website (React 19 + Vite + Tailwind).
- **`backend/`** — the Smart Agriculture Flask API (ESP32 soil moisture,
  OpenCV seed classification, ML yield/harvest prediction).

The frontend's **Predict** page now calls the real backend instead of
showing fake data:

1. Uploads the seed image to `POST /classify_seed` → gets `crop_type` and
   `seed_quality` from the OpenCV pipeline.
2. Reads soil moisture from `GET /moisture` (the ESP32 sensor), or uses the
   manual override field if you type a value (handy when no sensor is
   plugged in).
3. Sends everything to `POST /predict` → gets the recommended soil, expected
   yield, and harvest time from the trained ML models.
4. Saves the combined result so the **Results** page can display it.

## Running it

You need **two terminals** — one for the backend, one for the frontend.

### 1. Backend (Flask API) — runs on port 5000

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python app.py
```

Leave this running. It should print something like
`Running on http://127.0.0.1:5000`.

> The ESP32 sensor is optional for testing — if it's not connected, just
> type a value into the "Soil moisture %" field on the Predict page instead
> of leaving it blank.

### 2. Frontend (React site) — runs on port 5173

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`) in your
browser. Go to the **Predict** page, upload a seed image, and click
**Predict Crop** — it'll call the Flask backend and show real results, which
also carry over to the **Results** page.

## Notes

- CORS is enabled on the Flask app so the Vite dev server (port 5173) is
  allowed to call the API (port 5000).
- If you see "Prediction failed... make sure the backend server is
  running", double check the Flask terminal is still running and didn't
  error out.

## Login, Register & Admin Panel

`/predict`, `/results`, and `/admin` now require being logged in — visiting
them while logged out redirects to `/login`.

**Admin login** (built-in, not a registered account):
- Email: `admin@agrivision.ai`
- Password: `Admin@123`

Logging in with this account goes straight to `/admin`, which lists every
registered user and every prediction that's been run, with an option to
remove a user.

Regular users just use **Register** to create an account, then **Login**.

⚠️ **Important limitation:** there is no backend user database yet. Accounts,
sessions, and the admin password above all live in this browser's
`localStorage` — nothing is enforced by the Flask server, and passwords are
stored in plain text client-side. This is fine for a college project demo,
but it is **not real security** — don't reuse a real password when
registering, and don't treat this as production-ready auth. A proper next
step would be moving accounts to the Flask backend with a real database and
hashed passwords.

