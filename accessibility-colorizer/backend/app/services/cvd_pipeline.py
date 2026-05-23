import base64
import io
from pillow_heif import register_heif_opener
import io

import numpy as np
from PIL import Image

register_heif_opener()

def convert_to_jpeg(file_bytes: bytes, content_type: str) -> bytes:
    if content_type in ("image/heic", "image/heif"):
        img = Image.open(io.BytesIO(file_bytes))
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=90)
        return buffer.getvalue()
    return file_bytes

# Confusion matrices for CVD simulation (Viénot et al. 1999 / Brettel 1997)
# Each maps LMS → simulated LMS for full dichromacy
_SIMULATION_MATRICES: dict[str, np.ndarray] = {
    "protanopia": np.array(
        [
            [0.0, 1.05118294, -0.05116099],
            [0.0, 1.0, 0.0],
            [0.0, 0.0, 1.0],
        ]
    ),
    "deuteranopia": np.array(
        [
            [1.0, 0.0, 0.0],
            [0.9513092, 0.0, 0.04866992],
            [0.0, 0.0, 1.0],
        ]
    ),
    "tritanopia": np.array(
        [
            [1.0, 0.0, 0.0],
            [0.0, 1.0, 0.0],
            [-0.86744736, 1.86727089, 0.0],
        ]
    ),
}

# sRGB ↔ LMS conversion matrices (Hunt-Pointer-Estevez, D65)
_RGB_TO_LMS = np.array(
    [
        [0.31399022, 0.63951294, 0.04649755],
        [0.15537241, 0.75789446, 0.08670142],
        [0.01775239, 0.10944209, 0.87256922],
    ]
)
_LMS_TO_RGB = np.linalg.inv(_RGB_TO_LMS)


def _linearize(channel: np.ndarray) -> np.ndarray:
    """sRGB gamma expansion."""
    c = channel.astype(np.float64) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _delinearize(channel: np.ndarray) -> np.ndarray:
    """sRGB gamma compression back to [0, 255]."""
    c = np.clip(channel, 0.0, 1.0)
    srgb = np.where(c <= 0.0031308, c * 12.92, 1.055 * (c ** (1.0 / 2.4)) - 0.055)
    return np.clip(srgb * 255.0, 0, 255).astype(np.uint8)


def _to_lms(rgb_linear: np.ndarray) -> np.ndarray:
    h, w, _ = rgb_linear.shape
    flat = rgb_linear.reshape(-1, 3)
    lms = flat @ _RGB_TO_LMS.T
    return lms.reshape(h, w, 3)


def _from_lms(lms: np.ndarray) -> np.ndarray:
    h, w, _ = lms.shape
    flat = lms.reshape(-1, 3)
    rgb = flat @ _LMS_TO_RGB.T
    return rgb.reshape(h, w, 3)


def simulate_cvd(
    image_array: np.ndarray,
    condition: str,
    severity: float,
) -> np.ndarray:
    """Return simulated image as uint8 RGB array."""
    mat = _SIMULATION_MATRICES[condition]
    identity = np.eye(3)
    effective = (1.0 - severity) * identity + severity * mat

    r = _linearize(image_array[:, :, 0])
    g = _linearize(image_array[:, :, 1])
    b = _linearize(image_array[:, :, 2])
    rgb_lin = np.stack([r, g, b], axis=-1)

    lms = _to_lms(rgb_lin)
    h, w, _ = lms.shape
    lms_sim = (lms.reshape(-1, 3) @ effective.T).reshape(h, w, 3)
    rgb_sim = _from_lms(lms_sim)

    result = np.stack(
        [
            _delinearize(rgb_sim[:, :, 0]),
            _delinearize(rgb_sim[:, :, 1]),
            _delinearize(rgb_sim[:, :, 2]),
        ],
        axis=-1,
    )
    return result


def correct_cvd(
    image_array: np.ndarray,
    condition: str,
    severity: float,
) -> np.ndarray:
    """
    Daltonize correction: shift colors the affected channel can't distinguish
    into channels that are intact, preserving luminance.
    """
    sim = simulate_cvd(image_array, condition, severity)
    orig = image_array.astype(np.float64)
    simulated = sim.astype(np.float64)

    # Error in the simulated image vs original
    error = orig - simulated

    # Shift the error into the intact channels depending on condition
    if condition == "protanopia":
        correction = np.zeros_like(error)
        correction[:, :, 1] += 0.7 * error[:, :, 0]
        correction[:, :, 2] += 0.7 * error[:, :, 0]
    elif condition == "deuteranopia":
        correction = np.zeros_like(error)
        correction[:, :, 0] += 0.7 * error[:, :, 1]
        correction[:, :, 2] += 0.7 * error[:, :, 1]
    else:  # tritanopia
        correction = np.zeros_like(error)
        correction[:, :, 0] += 0.7 * error[:, :, 2]
        correction[:, :, 1] += 0.7 * error[:, :, 2]

    corrected = np.clip(orig + correction, 0, 255).astype(np.uint8)
    return corrected


def image_to_base64(image_array: np.ndarray) -> str:
    """Convert numpy uint8 RGB array → base64-encoded PNG string."""
    pil_img = Image.fromarray(image_array.astype(np.uint8), mode="RGB")
    buffer = io.BytesIO()
    pil_img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")
