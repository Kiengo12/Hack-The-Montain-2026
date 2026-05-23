import base64
import json
import os

import anthropic

from PIL import Image
import io

def resize_image_b64(image_b64: str, max_size: int = 1568) -> str:
    img_bytes = base64.b64decode(image_b64)
    img = Image.open(io.BytesIO(img_bytes))
    
    if max(img.size) > max_size:
        img.thumbnail((max_size, max_size), Image.LANCZOS)
    
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=85)
    return base64.b64encode(buffer.getvalue()).decode()

_SYSTEM_PROMPT = (
    "You are an expert accessibility consultant specializing in visual art and "
    "color vision deficiency (CVD). You analyze paintings and artworks to identify "
    "color accessibility issues. You always respond in valid JSON only — no preamble, "
    "no markdown."
)

_USER_PROMPT_TEMPLATE = """Analyze this painting for color accessibility issues. Here is the automated color analysis:

Dominant colors: {dominant_colors_json}
Problematic contrast pairs: {contrast_pairs_json}

For each of the three main types of color vision deficiency (deuteranopia, protanopia, tritanopia), identify:
1. Which color pairs in this painting would be hard or impossible to distinguish
2. How severely this impacts the artwork's meaning or aesthetic
3. Specific alternative hex colors the artist could use to fix each issue

Respond ONLY with this JSON structure:
{{
  "overall_score": <integer 0-100, 100 = fully accessible>,
  "affected_population_pct": <float, estimated % of viewers affected by at least one issue>,
  "conditions": {{
    "deuteranopia": {{
      "severity": "none|mild|moderate|severe",
      "issues": [
        {{
          "description": "<short description>",
          "affected_colors": ["#hex1", "#hex2"],
          "recommendation": "<what to change>",
          "suggested_colors": ["#hexA", "#hexB"]
        }}
      ]
    }},
    "protanopia": {{ }},
    "tritanopia": {{ }}
  }},
  "top_issues": ["<issue 1>", "<issue 2>", "<issue 3>"],
  "summary": "<2-3 sentence plain-language summary for the artist>"
}}"""


async def analyze_with_claude(
    image_array_base64: str,
    dominant_colors: list[dict],
    contrast_pairs: list[dict],
) -> dict:
    """Call Claude Vision API and return parsed accessibility analysis."""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable not set")

    client = anthropic.AsyncAnthropic(api_key=api_key)

    user_prompt = _USER_PROMPT_TEMPLATE.format(
        dominant_colors_json=json.dumps(dominant_colors, indent=2),
        contrast_pairs_json=json.dumps(contrast_pairs[:10], indent=2),
    )

    image_array_base64 = resize_image_b64(image_array_base64)
    print(f"Image b64 size after resize: {len(image_array_base64) / 1024:.1f} KB")


    message = await client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2048,
        system=_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": image_array_base64,
                        },
                    },
                    {
                        "type": "text",
                        "text": user_prompt,
                    },
                ],
            }
        ],
    )

    raw_text = message.content[0].text.strip()

    # Strip markdown code fences if present
    if raw_text.startswith("```"):
        lines = raw_text.split("\n")
        raw_text = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Claude returned malformed JSON: {exc}") from exc
