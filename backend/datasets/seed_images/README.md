Put your labeled seed photos here, organized like this (folder names become
the crop labels the CNN learns):

    seed_images/
        Rice/
            photo1.jpg
            photo2.jpg
            ...
        Wheat/
            ...
        Ragi/
            ...
        Chana Dal/
            ...

Aim for at least ~30-50 photos per class if you can. Vary lighting, angle,
and how packed/spread the grains are - the more variety the CNN sees during
training, the better it'll handle new photos later.

Once this folder is populated, run from the backend/ folder:

    python image_processing/train_cnn_classifier.py

This saves the trained model to backend/models/cnn_crop_classifier.keras -
the Flask app automatically detects and uses it after that (no code changes
needed). Delete this README.md line and the folders once you've added real
photos, it's just here so the empty folder isn't lost from git.

Optional but recommended: add a Not_Seed/ folder with photos of things that
are NOT seeds (people, pets, objects, scenery, screenshots, documents).
The CNN then learns to reject them, and the app answers "Please upload only
an image of seeds" when it predicts that class.
