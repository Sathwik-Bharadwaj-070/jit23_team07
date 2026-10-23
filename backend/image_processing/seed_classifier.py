import os
import cv2
import numpy as np

try:
    from image_processing.cnn_classifier import CNN_AVAILABLE, classify_crop_type_cnn
except ImportError:
    from cnn_classifier import CNN_AVAILABLE, classify_crop_type_cnn

try:
    from image_processing.seed_validator import NotASeedImageError, assert_seed_image, is_not_seed_class_name
except ImportError:
    from seed_validator import NotASeedImageError, assert_seed_image, is_not_seed_class_name

def _watershed_grain_masks(gray_eq, thresh_img):
    kernel = np.ones((3, 3), np.uint8)
    closed = cv2.morphologyEx(thresh_img, cv2.MORPH_CLOSE, kernel, iterations=1)
    opening = cv2.morphologyEx(closed, cv2.MORPH_OPEN, kernel, iterations=1)
    dist = cv2.distanceTransform(opening, cv2.DIST_L2, 5)
    if dist.max() <= 0:
        return []
    peak_kernel = np.ones((21, 21), np.uint8)
    dilated = cv2.dilate(dist, peak_kernel)
    local_max = ((dist == dilated) & (dist > 3)).astype(np.uint8) * 255
    num_peaks, peak_labels = cv2.connectedComponents(local_max)
    if num_peaks <= 1:
        return []
    markers = np.zeros(gray_eq.shape, dtype=np.int32)
    markers[opening == 0] = 1
    for i in range(1, num_peaks):
        markers[peak_labels == i] = i + 1
    color_for_ws = cv2.cvtColor(gray_eq, cv2.COLOR_GRAY2BGR)
    markers = cv2.watershed(color_for_ws, markers)
    masks = []
    for label in range(2, markers.max() + 1):
        mask = markers == label
        if mask.sum() >= 15:
            masks.append(mask)
    return masks

def _extract_grain_contours(gray_eq, thresh_img):
    grain_contours = []
    ws_masks = _watershed_grain_masks(gray_eq, thresh_img)
    for mask in ws_masks:
        mask_u8 = mask.astype(np.uint8) * 255
        contours, _ = cv2.findContours(mask_u8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            grain_contours.append(max(contours, key=cv2.contourArea))
    if not grain_contours:
        contours, _ = cv2.findContours(thresh_img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        grain_contours = list(contours)
    if not grain_contours:
        return []
    areas = [cv2.contourArea(c) for c in grain_contours]
    max_area = max(areas)
    noise_floor = max(max_area * 0.02, 15)
    candidates = [c for c, a in zip(grain_contours, areas) if a >= noise_floor]
    if not candidates:
        return []
    cand_areas = [cv2.contourArea(c) for c in candidates]
    median_area = float(np.median(cand_areas))
    single_grains = [c for c, a in zip(candidates, cand_areas) if a <= median_area * 2.5]
    return single_grains if single_grains else candidates

def extract_features(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError('Could not read image file (unsupported format or corrupt file).')
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    gray_eq = clahe.apply(gray)
    blurred = cv2.GaussianBlur(gray_eq, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    grain_contours = _extract_grain_contours(gray_eq, thresh)
    if not grain_contours:
        raise ValueError('No seed detected in image. Try a clearer photo with a plain background.')
    per_grain = []
    mask = np.zeros(gray.shape, dtype=np.uint8)
    for contour in grain_contours:
        area = cv2.contourArea(contour)
        perimeter = cv2.arcLength(contour, True)
        (_, _), (rw, rh), _ = cv2.minAreaRect(contour)
        long_side, short_side = (max(rw, rh), min(rw, rh))
        aspect_ratio = long_side / short_side if short_side > 0 else 0
        bbox_area = rw * rh
        extent = area / bbox_area if bbox_area > 0 else 0
        hull = cv2.convexHull(contour)
        hull_area = cv2.contourArea(hull)
        solidity = area / hull_area if hull_area > 0 else 0
        circularity = 4 * np.pi * area / perimeter ** 2 if perimeter > 0 else 0
        per_grain.append({'area': area, 'perimeter': perimeter, 'aspect_ratio': aspect_ratio, 'extent': extent, 'solidity': solidity, 'circularity': circularity})
        cv2.drawContours(mask, [contour], -1, 255, -1)

    def _median(key):
        return float(np.median([g[key] for g in per_grain]))
    area = _median('area')
    perimeter = _median('perimeter')
    aspect_ratio = float(np.percentile([g['aspect_ratio'] for g in per_grain], 75))
    extent = _median('extent')
    solidity = _median('solidity')
    circularity = _median('circularity')
    texture_std = float(np.std(gray[mask == 255])) if np.any(mask == 255) else 0.0
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    if np.any(mask == 255):
        avg_hue = float(np.mean(hsv[:, :, 0][mask == 255]))
        avg_saturation = float(np.mean(hsv[:, :, 1][mask == 255]))
        avg_value = float(np.mean(hsv[:, :, 2][mask == 255]))
    else:
        avg_hue = avg_saturation = avg_value = 0.0
    return {'area': round(float(area), 2), 'perimeter': round(float(perimeter), 2), 'aspect_ratio': round(float(aspect_ratio), 3), 'extent': round(float(extent), 3), 'solidity': round(float(solidity), 3), 'circularity': round(float(circularity), 3), 'texture_std': round(texture_std, 2), 'avg_hue': round(avg_hue, 1), 'avg_saturation': round(avg_saturation, 1), 'avg_value': round(avg_value, 1)}
_CROP_PROFILES = {'Rice': {'aspect_ratio': 2.2, 'area_norm': 0.2, 'avg_hue': 25, 'avg_value': 170}, 'Wheat': {'aspect_ratio': 1.5, 'area_norm': 0.45, 'avg_hue': 20, 'avg_value': 160}, 'Ragi': {'aspect_ratio': 1.3, 'area_norm': 0.05, 'avg_hue': 15, 'avg_value': 85}, 'Chana Dal': {'aspect_ratio': 1.2, 'area_norm': 0.65, 'avg_hue': 28, 'avg_value': 190}}
_AREA_REFERENCE = 8000.0

def classify_crop_type(features):
    area_norm = min(features['area'] / _AREA_REFERENCE, 1.0)
    best_crop = None
    best_dist = None
    distances = {}
    for crop, profile in _CROP_PROFILES.items():
        d_aspect = (features['aspect_ratio'] - profile['aspect_ratio']) / 2.0
        d_area = (area_norm - profile['area_norm']) / 1.5
        d_hue = (features['avg_hue'] - profile['avg_hue']) / 30.0
        d_value = (features['avg_value'] - profile['avg_value']) / 150.0
        dist = (d_aspect ** 2 + d_area ** 2 + d_hue ** 2 + d_value ** 2) ** 0.5
        distances[crop] = dist
        if best_dist is None or dist < best_dist:
            best_dist = dist
            best_crop = crop
    sorted_dists = sorted(distances.values())
    if len(sorted_dists) > 1 and sorted_dists[1] > 0:
        margin = (sorted_dists[1] - sorted_dists[0]) / sorted_dists[1]
        confidence = round(min(max(50 + margin * 50, 40), 95), 1)
    else:
        confidence = 60.0
    return (best_crop, confidence)

def _score_to_quality(features):

    def _norm(value, lo, hi):
        if hi == lo:
            return 0.5
        return min(max((value - lo) / (hi - lo), 0.0), 1.0)
    score = 0.0
    score += _norm(features['solidity'], 0.4, 0.75) * 35
    score += _norm(features['extent'], 0.25, 0.6) * 20
    score += _norm(features['circularity'], 0.15, 0.5) * 25
    score += (1 - _norm(features['texture_std'], 8, 40)) * 20
    score = round(min(max(score, 0), 100), 1)
    if score >= 65:
        quality = 'High'
    elif score >= 40:
        quality = 'Medium'
    else:
        quality = 'Low'
    return (quality, score)

def classify_seed_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError('Could not read image file (unsupported format or corrupt file).')
    assert_seed_image(image)
    features = extract_features(image_path)
    if CNN_AVAILABLE:
        try:
            crop_type, crop_confidence = classify_crop_type_cnn(image_path)
        except Exception as e:
            print(f'[seed_classifier] CNN inference failed, falling back to heuristic: {e}')
            crop_type, crop_confidence = classify_crop_type(features)
    else:
        crop_type, crop_confidence = classify_crop_type(features)
    if is_not_seed_class_name(crop_type):
        raise NotASeedImageError('Please upload only an image of seeds. This picture does not look like a seed sample.')

    quality, score = _score_to_quality(features)
    return {'crop_type': crop_type, 'crop_confidence': crop_confidence, 'seed_quality': quality, 'quality_score': score, 'features': features}
if __name__ == '__main__':
    import sys
    if len(sys.argv) != 2:
        print('Usage: python seed_classifier.py <path_to_seed_image>')
    else:
        result = classify_seed_image(sys.argv[1])
        print(result)
