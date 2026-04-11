from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ReliefItem:
    id: str
    title: str
    provider: str  # "youtube"
    video_id: str
    clip_start_sec: int
    clip_end_sec: int
    tags: tuple[str, ...]


def build_youtube_embed_url(*, video_id: str, start: int, end: int) -> str:
    # Keep autoplay reliable: mute=1. Keep the clip short via start/end.
    # Note: end is supported by YouTube embed for trimming playback in most cases.
    return (
        f"https://www.youtube-nocookie.com/embed/{video_id}"
        f"?autoplay=1&mute=1&rel=0&modestbranding=1&start={start}&end={end}"
    )


# Curated, embeddable sources. We always play a short clip (1–4 minutes).
RELIEF_LIBRARY: list[ReliefItem] = [
    ReliefItem(
        id="asmr_rain",
        title="ASMR rain + soft ambience",
        provider="youtube",
        video_id="ERNFgz6TcE0",
        clip_start_sec=10,
        clip_end_sec=130,
        tags=("asmr", "audio", "soothing", "high"),
    ),
    ReliefItem(
        id="asmr_brush",
        title="Gentle ASMR brushing sounds",
        provider="youtube",
        video_id="0M7rAQZozBk",
        clip_start_sec=15,
        clip_end_sec=165,
        tags=("asmr", "audio", "focus", "high"),
    ),
    ReliefItem(
        id="cooking_cozy",
        title="Cozy cooking comfort clip",
        provider="youtube",
        video_id="XcFOfm5oNVw",
        clip_start_sec=20,
        clip_end_sec=200,
        tags=("cooking", "comfort", "visual", "high"),
    ),
    ReliefItem(
        id="satisfying_loop",
        title="Satisfying loop (visual reset)",
        provider="youtube",
        video_id="xV7_GN900sg",
        clip_start_sec=5,
        clip_end_sec=95,
        tags=("visual", "satisfying", "medium", "high"),
    ),
    ReliefItem(
        id="light_humor",
        title="Light humor micro-break",
        provider="youtube",
        video_id="g0XUdGXP_q8",
        clip_start_sec=5,
        clip_end_sec=95,
        tags=("humor", "uplift", "high"),
    ),
    ReliefItem(
        id="breath_box",
        title="Box breathing (quick guide)",
        provider="youtube",
        video_id="SclZwqr5xpE",
        clip_start_sec=0,
        clip_end_sec=90,
        tags=("breathing", "grounding", "high", "medium"),
    ),
]

