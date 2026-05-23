import numpy as np
from skimage import color as skcolor
from sklearn.cluster import MiniBatchKMeans


def _srgb_to_linear(c: float) -> float:
    if c <= 0.04045:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


def _relative_luminance(hex_color: str) -> float:
    hex_color = hex_color.lstrip("#")
    r, g, b = (int(hex_color[i : i + 2], 16) / 255.0 for i in (0, 2, 4))
    rl = _srgb_to_linear(r)
    gl = _srgb_to_linear(g)
    bl = _srgb_to_linear(b)
    return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl


def _contrast_ratio(hex1: str, hex2: str) -> float:
    l1 = _relative_luminance(hex1)
    l2 = _relative_luminance(hex2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def extract_dominant_colors(
    image_array: np.ndarray, n: int = 8
) -> list[dict]:
    """K-means clustering in LAB colorspace → list of dominant color dicts."""
    h, w, _ = image_array.shape
    pixels_rgb = image_array.reshape(-1, 3).astype(np.float32) / 255.0

    # Convert to LAB for perceptually uniform clustering
    pixels_lab = skcolor.rgb2lab(pixels_rgb.reshape(1, -1, 3)).reshape(-1, 3)

    n_clusters = min(n, len(pixels_lab))
    kmeans = MiniBatchKMeans(n_clusters=n_clusters, n_init=3, random_state=42)
    labels = kmeans.fit_predict(pixels_lab)
    centers_lab = kmeans.cluster_centers_

    # Convert cluster centers back to sRGB
    centers_rgb = skcolor.lab2rgb(centers_lab.reshape(1, -1, 3)).reshape(-1, 3)
    centers_rgb = np.clip(centers_rgb, 0.0, 1.0)

    total_pixels = len(labels)
    result = []
    for i in range(n_clusters):
        count = int(np.sum(labels == i))
        r, g, b = (int(round(c * 255)) for c in centers_rgb[i])
        hex_color = f"#{r:02x}{g:02x}{b:02x}"
        lab = centers_lab[i].tolist()
        result.append(
            {
                "hex": hex_color,
                "percentage": round(count / total_pixels * 100, 2),
                "lab": [round(v, 2) for v in lab],
            }
        )

    result.sort(key=lambda x: x["percentage"], reverse=True)
    return result


def compute_contrast_pairs(colors: list[dict]) -> list[dict]:
    """All pairs of dominant colors sorted by contrast ratio ascending."""
    pairs = []
    for i in range(len(colors)):
        for j in range(i + 1, len(colors)):
            h1 = colors[i]["hex"]
            h2 = colors[j]["hex"]
            ratio = _contrast_ratio(h1, h2)
            pairs.append(
                {
                    "color1_hex": h1,
                    "color2_hex": h2,
                    "contrast_ratio": round(ratio, 2),
                    "passes_aa": ratio >= 4.5,
                    "passes_aaa": ratio >= 7.0,
                }
            )
    pairs.sort(key=lambda x: x["contrast_ratio"])
    return pairs


def get_problematic_pairs(image_array: np.ndarray) -> dict:
    """High-level helper used as context input for the Claude prompt."""
    dominant = extract_dominant_colors(image_array, n=8)
    pairs = compute_contrast_pairs(dominant)
    return {
        "dominant_colors": dominant,
        "contrast_pairs": pairs,
    }
