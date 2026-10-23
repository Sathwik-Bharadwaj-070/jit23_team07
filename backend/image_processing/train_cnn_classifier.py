import os
import json
import tensorflow as tf
from tensorflow.keras import layers, models
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, '..', 'datasets', 'seed_images')
MODELS_DIR = os.path.join(BASE_DIR, '..', 'models')
IMG_SIZE = (160, 160)
BATCH_SIZE = 16
EPOCHS_HEAD = 15
EPOCHS_FINE_TUNE = 10

def build_datasets():
    if not os.path.isdir(DATA_DIR):
        raise FileNotFoundError(f'No dataset found at {DATA_DIR}. Create it and organize your labeled photos into one subfolder per crop type first - see the docstring at the top of this file for the exact layout.')
    train_ds = tf.keras.utils.image_dataset_from_directory(DATA_DIR, validation_split=0.2, subset='training', seed=42, image_size=IMG_SIZE, batch_size=BATCH_SIZE)
    val_ds = tf.keras.utils.image_dataset_from_directory(DATA_DIR, validation_split=0.2, subset='validation', seed=42, image_size=IMG_SIZE, batch_size=BATCH_SIZE)
    class_names = train_ds.class_names
    train_ds = train_ds.cache().shuffle(200).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.cache().prefetch(tf.data.AUTOTUNE)
    return (train_ds, val_ds, class_names)

def build_model(num_classes):
    data_augmentation = models.Sequential([layers.RandomFlip('horizontal_and_vertical'), layers.RandomRotation(0.3), layers.RandomZoom(0.2), layers.RandomContrast(0.2), layers.RandomBrightness(0.2)])
    base_model = tf.keras.applications.MobileNetV2(input_shape=IMG_SIZE + (3,), include_top=False, weights='imagenet')
    base_model.trainable = False
    inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
    x = data_augmentation(inputs)
    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)
    model = tf.keras.Model(inputs, outputs)
    return (model, base_model)

def main():
    print('Loading dataset...')
    train_ds, val_ds, class_names = build_datasets()
    print(f'Classes found: {class_names}')
    model, base_model = build_model(num_classes=len(class_names))
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001), loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    print('\n=== Stage 1: training classification head only ===')
    model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS_HEAD)
    print('\n=== Stage 2: fine-tuning top layers of MobileNetV2 ===')
    base_model.trainable = True
    for layer in base_model.layers[:-30]:
        layer.trainable = False
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-05), loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS_FINE_TUNE)
    print('\n=== Final evaluation ===')
    loss, accuracy = model.evaluate(val_ds)
    print(f'Validation accuracy: {accuracy:.3f}')
    if accuracy < 0.6:
        print('NOTE: validation accuracy is low. This usually means too few training photos, or too little variety (lighting/angle/pile density) in what you collected. More/varied photos per class will help more than any parameter tuning here.')
    os.makedirs(MODELS_DIR, exist_ok=True)
    model.save(os.path.join(MODELS_DIR, 'cnn_crop_classifier.keras'))
    with open(os.path.join(MODELS_DIR, 'cnn_class_names.json'), 'w') as f:
        json.dump(class_names, f)
    print(f'\nSaved model to {MODELS_DIR}/cnn_crop_classifier.keras')
    print(f'Saved class names to {MODELS_DIR}/cnn_class_names.json')
    print('\nThe Flask app will automatically use this trained CNN for crop-type classification from now on (checked at server startup) - the older rule-based heuristic remains as an automatic fallback if this file is ever missing or fails to load.')
if __name__ == '__main__':
    main()
