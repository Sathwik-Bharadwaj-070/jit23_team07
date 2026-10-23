# AgriVision AI — Combined Project

This project combines two previously separate pieces into one repo:

- **`frontend/`** — the AgriVision AI website (React 19 + Vite + Tailwind).
- **`backend/`** — the Smart Agriculture Flask API (ESP32 soil moisture,
  OpenCV seed classification, ML yield/harvest prediction).

The frontend's **Predict** page now calls the real backend instead of
showing fake data, as a two-step flow:

1. Upload a seed image → **Classify Seed** → calls `POST /classify_seed` →
   gets `crop_type` and `seed_quality` back.
2. Pick which soil you're actually using and enter/sense its moisture →
   **Predict Yield & Harvest** → calls `POST /predict` → gets expected
   yield and harvest time for *that* soil (plus, for comparison only, which
   soil would theoretically yield best at that moisture level).
3. Saves the combined result so the **Results** page can display it.

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

## Only seed images are accepted

Before any crop is predicted, `POST /classify_seed` first checks that the
uploaded picture actually looks like a seed sample
(`backend/image_processing/seed_validator.py`). If it does not (a person, pet,
object, scenery, screenshot, document, ...), the API answers with HTTP 422 and
`{"error": "Please upload only an image of seeds. ...", "code": "not_a_seed_image"}`
and the Predict page shows that message instead of a crop name.

How it decides (classical OpenCV/NumPy, no extra dependencies):

- **Dense piles** (grains filling most of the frame): looks for the very
  uniform, repeated fine texture a pile of grains produces - consistent
  texture across the frame, many blobs of one dominant size, a band-limited
  frequency peak - and penalises strongly saturated blue/green content.
- **A few seeds on a plain background**: finds separate compact, grain-shaped
  objects of similar size that are not blue/green.

Checked against the real seed photos from this project (plus blurred,
compressed, darkened, resized, rotated and colour-cast variants) and a set of
non-seed images (portraits, pets, objects, rocket, documents, screenshots,
scenery, solid/noise images). All the seed photos were accepted and every
ordinary non-seed photo was rejected.

Known limits of a rule-based check: images that are *only* a repeating texture
(gravel, brick wall, grass close-up) or round objects of equal size on a plain
background (coins) can still slip through, because they genuinely look like a
pile of grains. If you train the CNN (see above), add a `Not_Seed` folder
(also recognised: `Other`, `Background`, `Negative`) under
`backend/datasets/seed_images/` with photos of things that are *not* seeds -
the trained model then learns to reject them too, and the app returns the same
"upload only an image of seeds" message when it predicts that class.

## Responsive interface

The whole interface adapts to phones, tablets and desktops:

- Navbar collapses into a hamburger menu below 1280px (links, user card,
  login/register/logout all inside it; closes on navigation or Escape).
- Every page (Home, Predict, Results, About, Contact, Login, Register, Admin,
  404) uses fluid spacing, type sizes and grids; the admin tables scroll
  sideways inside their cards on narrow screens.
- Checked with a headless browser at 320, 360, 390, 768, 1024 and 1440px wide
  on every page: no horizontal page overflow.

## Crop-Type Classifier: heuristic vs. CNN

Seed-quality scoring is always the rule-based heuristic (in
`image_processing/seed_classifier.py`) - there's no labeled quality dataset
to train on. Crop-type detection (Rice/Wheat/Ragi/Chana Dal) works in two
tiers:

- **By default**, it uses the same rule-based heuristic (shape/color
  features compared against rough reference profiles). No setup needed,
  works out of the box, but accuracy has a ceiling since it's hand-tuned
  rules, not learned from data.
- **If you train a CNN**, the app automatically switches to using it
  instead - no code changes required, it's detected at server startup.

### Training the CNN

⚠️ **Check your Python version first:** run `python --version`. TensorFlow
does not yet officially support Python 3.14 - if that's what you're on
(common if you installed Python recently), `pip install tensorflow` will
likely fail with "No matching distribution found". You'll need a second
Python install (3.10-3.12 is a safe bet) specifically for this feature:

```bash
# install Python 3.12 from python.org first, then, from backend/:
py -3.12 -m venv venv-cnn
venv-cnn\Scripts\activate
pip install -r requirements.txt -r requirements-cnn.txt
```

This is a separate venv from your main one (which stays on whatever Python
version you already have working for the rest of the app) - both `python app.py`
and CNN training/inference need to run from this same TensorFlow-compatible
venv for the CNN to actually be picked up, though. If you're not ready to
deal with this yet, that's fine - skip it for now and revisit once you've
actually collected training photos, since the app works fully without it
in the meantime (heuristic fallback).

Once you're in a working venv (`pip install tensorflow` succeeds):

1. Collect labeled seed photos and organize them into
   `backend/datasets/seed_images/<CropName>/*.jpg` - one folder per crop
   (see the README inside that folder for the exact layout expected).
   Aim for at least ~30-50 photos per class, with varied lighting, angle,
   and how packed/spread the grains are.
2. From the `backend/` folder, with that venv active:
   ```bash
   python image_processing/train_cnn_classifier.py
   ```
   This uses transfer learning on MobileNetV2 (pretrained on ImageNet),
   which works far better than training a CNN from scratch on a small
   custom dataset. It trains in two stages (new classification head first,
   then fine-tunes the top layers of MobileNetV2) and prints validation
   accuracy at the end.
3. That's it - `backend/models/cnn_crop_classifier.keras` is picked up
   automatically the next time you start `python app.py` **from that same
   venv**. If that file is missing, or fails to load for any reason
   (including "tensorflow isn't installed here"), the app falls back to
   the heuristic classifier automatically rather than crashing.

Check the Flask server's startup log to see which one is active:
`[cnn_classifier] Loaded trained CNN model...` means the CNN is in use;
`[cnn_classifier] No trained CNN model found...` means it's using the
heuristic fallback.


