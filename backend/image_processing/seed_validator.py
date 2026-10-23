import cv2
import numpy as np

NOT_SEED_MESSAGE = 'Please upload only an image of seeds. This picture does not look like a seed sample.'

DENSE_SCORE_THRESHOLD = 3.0
MIN_SIDE_PIXELS = 24
ANALYSIS_LONG_SIDE = 384
NOT_SEED_CLASS_NAMES = {'notseed', 'notseeds', 'notaseed', 'nonseed', 'nonseeds', 'other', 'others', 'background', 'unknown', 'negative'}


class NotASeedImageError(ValueError):
    pass


def is_not_seed_class_name(name):
    key = ''.join(ch for ch in str(name).lower() if ch.isalnum())
    return key in NOT_SEED_CLASS_NAMES


def _resize_for_analysis(img):
    h, w = img.shape[:2]
    scale = ANALYSIS_LONG_SIDE / max(h, w)
    new_w = max(32, int(round(w * scale)))
    new_h = max(32, int(round(h * scale)))
    return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)


def _tile_texture(gray, grid=8):
    blurred = cv2.GaussianBlur(gray, (3, 3), 0).astype(np.float32)
    grad_x = cv2.Sobel(blurred, cv2.CV_32F, 1, 0)
    grad_y = cv2.Sobel(blurred, cv2.CV_32F, 0, 1)
    magnitude = np.hypot(grad_x, grad_y)
    h, w = gray.shape
    tile_h = h // grid
    tile_w = w // grid
    energies = np.array([
        magnitude[i * tile_h:(i + 1) * tile_h, j * tile_w:(j + 1) * tile_w].mean()
        for i in range(grid) for j in range(grid)
    ])
    p90 = float(np.percentile(energies, 90))
    if p90 < 2:
        return 0.0, 9.0, p90
    textured = energies >= 0.35 * p90
    coverage = float(textured.mean())
    variation = float(energies[textured].std() / energies[textured].mean())
    return coverage, variation, p90


def _blob_scale_concentration(gray):
    g = gray.astype(np.float32) / 255.0
    sigmas = [1.5 * (1.35 ** i) for i in range(9)]
    layers = []
    for sigma in sigmas:
        smoothed = cv2.GaussianBlur(g, (0, 0), sigma)
        layers.append((sigma ** 2) * cv2.Laplacian(smoothed, cv2.CV_32F, ksize=3))
    stack = np.stack(layers, 0)
    kernel = np.ones((3, 3), np.uint8)
    counts = np.zeros(len(sigmas), dtype=np.int64)
    for sign in (1, -1):
        signed = sign * stack
        local_max = np.stack([cv2.dilate(layer, kernel) for layer in signed], 0)
        peaks = signed >= local_max
        above = np.zeros_like(peaks)
        below = np.zeros_like(peaks)
        above[1:] = signed[1:] >= signed[:-1]
        below[:-1] = signed[:-1] >= signed[1:]
        peaks &= above & below & (signed > 0.04)
        counts += np.bincount(np.argwhere(peaks)[:, 0], minlength=len(sigmas))
    total = int(counts.sum())
    if total < 50:
        return total, 0.0
    dominant = int(counts.argmax())
    share = counts[max(0, dominant - 1):dominant + 2].sum() / total
    return total, float(share)


def _spectral_bump(gray):
    h, w = gray.shape
    side = min(h, w)
    if side < 64:
        return 0.0
    top = (h - side) // 2
    left = (w - side) // 2
    patch = gray[top:top + side, left:left + side].astype(np.float32)
    patch = patch - patch.mean()
    window = np.outer(np.hanning(side), np.hanning(side)).astype(np.float32)
    spectrum = np.abs(np.fft.fftshift(np.fft.fft2(patch * window))) ** 2
    centre = side // 2
    yy, xx = np.indices(spectrum.shape)
    radius = np.hypot(yy - centre, xx - centre).astype(int)
    max_radius = side // 2
    sums = np.bincount(radius.ravel(), spectrum.ravel(), minlength=max_radius + 1)[:max_radius + 1]
    counts = np.maximum(np.bincount(radius.ravel(), minlength=max_radius + 1)[:max_radius + 1], 1)
    log_power = np.log10(sums / counts + 1e-9)
    log_radius = np.log10(np.arange(max_radius + 1) + 1e-9)
    low_band = np.arange(3, 6)
    high_band = np.arange(int(max_radius * 0.8), max_radius - 1)
    if len(high_band) < 2:
        return 0.0
    x1 = log_radius[low_band].mean()
    y1 = log_power[low_band].mean()
    x2 = log_radius[high_band].mean()
    y2 = log_power[high_band].mean()
    slope = (y2 - y1) / (x2 - x1)
    radii = np.arange(3, max_radius - 1)
    chord = y1 + slope * (log_radius[radii] - x1)
    residual = log_power[radii] - chord
    smoothed = np.convolve(residual, np.ones(3) / 3, mode='same')
    middle = (radii >= 6) & (radii <= int(max_radius * 0.8))
    if not middle.any():
        return 0.0
    return float(smoothed[middle].max())


COOL_MIN_SATURATION = 120


def _cool_fraction(hsv):
    hue = hsv[:, :, 0]
    sat = hsv[:, :, 1]
    val = hsv[:, :, 2]
    cool = (sat >= COOL_MIN_SATURATION) & (val >= 40) & (hue >= 38) & (hue <= 160)
    return float(cool.mean())


def _dense_score(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    coverage, variation, p90 = _tile_texture(gray)
    blob_count, blob_share = _blob_scale_concentration(gray)
    bump = _spectral_bump(gray)
    cool = _cool_fraction(hsv)
    details = {
        'texture_coverage': round(coverage, 3),
        'texture_variation': round(variation, 3),
        'blob_count': blob_count,
        'blob_scale_share': round(blob_share, 3),
        'spectral_bump': round(bump, 3),
        'cool_color_fraction': round(cool, 3),
    }
    if p90 < 2 or blob_count < 300:
        return -99.0, details
    score = (0.34 - variation) / 0.05 + (blob_share - 0.63) / 0.05 + (bump - 0.45) / 0.3
    score -= max(0.0, cool - 0.003) * 100
    return float(score), details


def _sparse_seeds_check(img):
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    if (binary > 0).mean() > 0.5:
        binary = 255 - binary
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    min_area = max(40.0, 0.0005 * h * w)
    total = 0
    grain_areas = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < min_area:
            continue
        total += 1
        hull_area = cv2.contourArea(cv2.convexHull(contour))
        if hull_area <= 0:
            continue
        solidity = area / hull_area
        (_, _), (rect_w, rect_h), _ = cv2.minAreaRect(contour)
        short_side = min(rect_w, rect_h)
        if short_side < 3:
            continue
        aspect = max(rect_w, rect_h) / short_side
        if solidity < 0.9 or aspect > 5.0:
            continue
        mask = np.zeros((h, w), np.uint8)
        cv2.drawContours(mask, [contour], -1, 255, -1)
        pixels = hsv[mask > 0]
        cool = ((pixels[:, 1] >= COOL_MIN_SATURATION) & (pixels[:, 2] >= 40) & (pixels[:, 0] >= 38) & (pixels[:, 0] <= 160)).mean()
        if cool > 0.25:
            continue
        grain_areas.append(area)
    details = {'sparse_components': total, 'sparse_grain_like': len(grain_areas)}
    if len(grain_areas) < 3 or total == 0 or len(grain_areas) / total < 0.6:
        return False, details
    areas = np.array(grain_areas)
    variation = float(areas.std() / areas.mean())
    coverage = float(areas.sum() / (h * w))
    details['sparse_size_variation'] = round(variation, 3)
    details['sparse_coverage'] = round(coverage, 3)
    return variation <= 0.6 and 0.015 <= coverage <= 0.55, details


def check_seed_image(img):
    if img is None or img.ndim < 2:
        return {'is_seed': False, 'path': 'unreadable', 'score': None, 'details': {}}
    if img.ndim == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    if img.shape[2] == 4:
        img = img[:, :, :3]
    if min(img.shape[:2]) < MIN_SIDE_PIXELS:
        return {'is_seed': False, 'path': 'too_small', 'score': None, 'details': {}}
    small = _resize_for_analysis(img)
    score, details = _dense_score(small)
    if score >= DENSE_SCORE_THRESHOLD:
        return {'is_seed': True, 'path': 'dense', 'score': round(score, 2), 'details': details}
    sparse_ok, sparse_details = _sparse_seeds_check(small)
    details.update(sparse_details)
    if sparse_ok:
        return {'is_seed': True, 'path': 'sparse', 'score': round(score, 2), 'details': details}
    return {'is_seed': False, 'path': 'rejected', 'score': round(score, 2), 'details': details}


def assert_seed_image(img):
    result = check_seed_image(img)
    if not result['is_seed']:
        raise NotASeedImageError(NOT_SEED_MESSAGE)
    return result
