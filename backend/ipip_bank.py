from __future__ import annotations

import re
from functools import lru_cache
from typing import Any

import requests

IPIP_50_URL = "https://ipip.ori.org/new_ipip-50-item-scale.htm"

IPIP_FACTOR_MAP = {
    "1": "Extraversion",
    "2": "Agreeableness",
    "3": "Conscientiousness",
    "4": "Emotional_Stability",
    "5": "Openness",
}


def _decode_ipip_html(content: bytes) -> str:
    if b"\x00" in content:
        return content.decode("utf-16le", errors="ignore")
    return content.decode("cp1252", errors="ignore")


def _clean_html_text(value: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"<.*?>", "", value)).strip()


@lru_cache(maxsize=1)
def fetch_ipip_items() -> list[dict[str, Any]]:
    response = requests.get(IPIP_50_URL, timeout=30)
    response.raise_for_status()
    html = _decode_ipip_html(response.content)

    pattern = re.compile(
        r"<tr>\s*<td width=\"26\">\s*<p>(\d+)\.</p>\s*</td>\s*"
        r"<td width=\"192\">\s*<p>(.*?)</p>\s*</td>.*?"
        r"<td width=\"41\">\s*<p>\((\d)([+-])\)\s*</p>\s*</td>\s*</tr>",
        re.S,
    )
    items: list[dict[str, Any]] = []
    for number, text, factor, direction in pattern.findall(html):
        items.append(
            {
                "id": int(number),
                "text": _clean_html_text(text),
                "factor": IPIP_FACTOR_MAP[factor],
                "direction": direction,
            }
        )

    if len(items) < 40:
        raise RuntimeError("Unable to parse enough IPIP items from official source")
    return items

