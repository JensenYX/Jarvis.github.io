#!/usr/bin/env python3
"""Build the web-ready media for the project page.

Needs ffmpeg with libx264 and an interpreter with Pillow and numpy, which the
jev-harness env provides:

    ENV=/apdcephfs_tj6/share_303840540/hunyuan/jensenwang/conda_env/jev-harness
    $ENV/bin/python tools/build_media.py [step ...]

Steps, all of them by default and always in this order:

  videos   demo_video/* -> assets/videos/<slug>.mp4 with the index up front.
           MP4 sources are remuxed without re-encoding; the webm is transcoded.
  sheets   build/media/<slug>-sheet.jpg, a timestamped grid of frames used to
           pick the poster frames in POSTER_AT.
  posters  assets/posters/<slug>.jpg (1280 px) and <slug>-thumb.jpg (480 px).
  audio    build/media/<slug>.wav, 16 kHz mono, the input of tools/transcribe.py.
  brand    assets/brand/jarvis-penguin.{png,webp}, the report's project icon
           cut out of its white background.
  probe    build/media/media.json with duration, size and resolution.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "demo_video"
VIDEOS = ROOT / "assets" / "videos"
POSTERS = ROOT / "assets" / "posters"
BRAND = ROOT / "assets" / "brand"
WORK = ROOT / "build" / "media"

ENV_BIN = Path("/apdcephfs_tj6/share_303840540/hunyuan/jensenwang/conda_env/jev-harness/bin")
FFMPEG = os.environ.get("FFMPEG", str(ENV_BIN / "ffmpeg"))
FFPROBE = os.environ.get("FFPROBE", str(ENV_BIN / "ffprobe"))

PENGUIN_SRC = Path(
    "/apdcephfs_tj6/share_303840540/hunyuan/jensenwang/git_warehouse/"
    "interactive-model-harness-jev/technical_report/figures/icons/log4.png"
)

# Page order: the five Jarvis-Audio sessions, then the two Jarvis-Omni ones.
DEMOS = [
    ("audio-daily-zh", "jarvis-chat-chinese.MP4"),
    ("audio-daily-en", "jarvis-chat-english.mp4"),
    ("audio-pvz", "Audio-paz.webm"),
    ("audio-minecraft-1", "Audio-Minecraft1.mp4"),
    ("audio-minecraft-2", "Audio-Minecraft2.mp4"),
    ("omni-cs2", "Omni-CS2.mp4"),
    ("omni-lol", "Omni-LoL.mp4"),
]

# Poster frame per video, in seconds, chosen from the contact sheets.
POSTER_AT: dict[str, float] = {
    "audio-daily-zh": 186.4,  # v5 of the mini-game in the workspace, the timer cancelled
    "audio-daily-en": 267.9,  # "Cancel just the welcome sign", next to the finished game
    "audio-pvz": 166.3,  # the lawn under pressure, with the companion panel
    "audio-minecraft-1": 106.2,  # the brick house across the water
    "audio-minecraft-2": 34.5,  # a husk at the gate
    "omni-cs2": 30.2,  # three headshots in fifteen seconds
    "omni-lol": 142.9,  # the first turret falls
}

SHEET_FRAMES = 24
SHEET_COLUMNS = 6


def run(cmd: list[str]) -> None:
    print("  $", " ".join(cmd[:4]), "...", flush=True)
    subprocess.run(cmd, check=True)


def probe(path: Path) -> dict:
    out = subprocess.run(
        [FFPROBE, "-v", "error", "-print_format", "json", "-show_format", "-show_streams", str(path)],
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    return json.loads(out)


def duration_of(path: Path) -> float:
    return float(probe(path)["format"]["duration"])


# ----------------------------------------------------------------- videos


def build_videos() -> None:
    VIDEOS.mkdir(parents=True, exist_ok=True)
    for slug, name in DEMOS:
        src = RAW / name
        dst = VIDEOS / f"{slug}.mp4"
        if dst.exists() and dst.stat().st_mtime > src.stat().st_mtime:
            print(f"videos: {slug} up to date")
            continue
        print(f"videos: {name} -> {dst.relative_to(ROOT)}")
        common = ["-map", "0:v:0", "-map", "0:a:0?", "-map_metadata", "-1", "-map_chapters", "-1", "-dn"]
        if src.suffix.lower() == ".webm":
            # A browser screen recording: VP8 at retina size with a variable
            # frame rate and no duration in its header. Constant 30 fps keeps
            # seeking predictable, and 1920 px is plenty for a 1152 px stage.
            cmd = [
                FFMPEG, "-y", "-v", "error", "-stats", "-i", str(src), *common,
                "-vf", "scale=1920:-2:flags=lanczos,fps=30,format=yuv420p",
                "-c:v", "libx264", "-preset", "slow", "-crf", "21",
                "-profile:v", "high", "-level:v", "4.1",
                "-c:a", "aac", "-b:a", "160k", "-ar", "48000",
                "-movflags", "+faststart", str(dst),
            ]
        else:
            # Remux only: the streams are already H.264 and AAC, and putting
            # the index first is what lets playback start before the download
            # finishes.
            cmd = [
                FFMPEG, "-y", "-v", "error", "-i", str(src), *common,
                "-c", "copy", "-movflags", "+faststart", str(dst),
            ]
        run(cmd)


# ----------------------------------------------------------------- sheets


def build_sheets() -> None:
    from PIL import Image, ImageDraw, ImageFont

    frames_dir = WORK / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    font = ImageFont.load_default(size=22)
    for slug, _ in DEMOS:
        video = VIDEOS / f"{slug}.mp4"
        total = duration_of(video)
        stamps = [total * (i + 0.5) / SHEET_FRAMES for i in range(SHEET_FRAMES)]
        tiles = []
        for t in stamps:
            out = frames_dir / f"{slug}-{t:07.2f}.jpg"
            if not out.exists():
                subprocess.run(
                    [FFMPEG, "-y", "-v", "error", "-ss", f"{t:.2f}", "-i", str(video),
                     "-frames:v", "1", "-vf", "scale=480:-2", "-q:v", "4", str(out)],
                    check=True,
                )
            tiles.append((t, Image.open(out).convert("RGB")))
        tw, th = tiles[0][1].size
        rows = (len(tiles) + SHEET_COLUMNS - 1) // SHEET_COLUMNS
        sheet = Image.new("RGB", (SHEET_COLUMNS * tw, rows * th), "white")
        draw = ImageDraw.Draw(sheet)
        for index, (t, tile) in enumerate(tiles):
            x, y = (index % SHEET_COLUMNS) * tw, (index // SHEET_COLUMNS) * th
            sheet.paste(tile, (x, y))
            label = f"{int(t // 60)}:{t % 60:04.1f}"
            draw.rectangle([x, y, x + 96, y + 30], fill="black")
            draw.text((x + 6, y + 3), label, fill="yellow", font=font)
        out = WORK / f"{slug}-sheet.jpg"
        sheet.save(out, quality=82)
        print(f"sheets: {out.relative_to(ROOT)} ({total:.1f} s)")


# ----------------------------------------------------------------- posters


def build_posters() -> None:
    POSTERS.mkdir(parents=True, exist_ok=True)
    for slug, _ in DEMOS:
        if slug not in POSTER_AT:
            print(f"posters: no frame chosen for {slug}, skipped")
            continue
        video = VIDEOS / f"{slug}.mp4"
        t = f"{POSTER_AT[slug]:.2f}"
        for suffix, width, quality in (("", 1280, "3"), ("-thumb", 480, "4")):
            out = POSTERS / f"{slug}{suffix}.jpg"
            run([FFMPEG, "-y", "-v", "error", "-ss", t, "-i", str(video), "-frames:v", "1",
                 "-vf", f"scale={width}:-2:flags=lanczos", "-q:v", quality, str(out)])


# ----------------------------------------------------------------- audio


def build_audio() -> None:
    WORK.mkdir(parents=True, exist_ok=True)
    for slug, _ in DEMOS:
        out = WORK / f"{slug}.wav"
        video = VIDEOS / f"{slug}.mp4"
        if out.exists() and out.stat().st_mtime > video.stat().st_mtime:
            continue
        run([FFMPEG, "-y", "-v", "error", "-i", str(video), "-vn", "-ac", "1", "-ar", "16000",
             "-c:a", "pcm_s16le", str(out)])


# ----------------------------------------------------------------- brand


def build_brand() -> None:
    import numpy as np
    from PIL import Image, ImageDraw, ImageFilter

    img = Image.open(PENGUIN_SRC).convert("RGB")
    w, h = img.size
    # Flood the white page from the border so white inside the artwork (the
    # eyes, the desk highlight) is kept.
    probe_img = img.copy()
    sentinel = (255, 0, 255)
    seeds = [(x, 0) for x in range(0, w, 16)] + [(x, h - 1) for x in range(0, w, 16)]
    seeds += [(0, y) for y in range(0, h, 16)] + [(w - 1, y) for y in range(0, h, 16)]
    for xy in seeds:
        pixel = probe_img.getpixel(xy)
        if pixel != sentinel and min(pixel) > 225:
            ImageDraw.floodfill(probe_img, xy, sentinel, thresh=28)

    rgb = np.asarray(img).astype(np.float32)
    background = np.all(np.asarray(probe_img) == np.array(sentinel), axis=-1)
    alpha = np.ones((h, w), np.float32)
    alpha[background] = 0.0
    # A thin band around the cut follows distance from white, and the colour is
    # un-premultiplied against white so no pale fringe survives on dark pages.
    grown = Image.fromarray((background * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    band = (np.asarray(grown) > 0) & ~background
    soft = np.clip((255.0 - rgb.min(axis=-1)) / 60.0, 0.0, 1.0)
    alpha[band] = soft[band]
    a = alpha[..., None]
    rgb = np.clip(np.where(a > 0, (rgb - (1 - a) * 255.0) / np.maximum(a, 1e-3), 0), 0, 255)
    cut = Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")
    cut = cut.crop(cut.getbbox())

    BRAND.mkdir(parents=True, exist_ok=True)
    width = 560
    small = cut.resize((width, round(cut.size[1] * width / cut.size[0])), Image.LANCZOS)
    small.save(BRAND / "jarvis-penguin.png", optimize=True)
    small.save(BRAND / "jarvis-penguin.webp", quality=88, method=6)
    icon = cut.resize((192, round(cut.size[1] * 192 / cut.size[0])), Image.LANCZOS)
    icon.save(BRAND / "jarvis-penguin-192.png", optimize=True)
    for name in ("jarvis-penguin.png", "jarvis-penguin.webp", "jarvis-penguin-192.png"):
        print(f"brand: assets/brand/{name} {os.path.getsize(BRAND / name) // 1024} KB")


# ----------------------------------------------------------------- probe


def build_probe() -> None:
    WORK.mkdir(parents=True, exist_ok=True)
    summary = {}
    for slug, name in DEMOS:
        video = VIDEOS / f"{slug}.mp4"
        info = probe(video)
        v = next(s for s in info["streams"] if s["codec_type"] == "video")
        a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
        summary[slug] = {
            "source": name,
            "duration_sec": round(float(info["format"]["duration"]), 2),
            "size_mb": round(int(info["format"]["size"]) / 1e6, 1),
            "width": v["width"],
            "height": v["height"],
            "fps": v.get("avg_frame_rate"),
            "audio_channels": a["channels"] if a else 0,
        }
    out = WORK / "media.json"
    out.write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))


STEPS = {
    "videos": build_videos,
    "sheets": build_sheets,
    "posters": build_posters,
    "audio": build_audio,
    "brand": build_brand,
    "probe": build_probe,
}


def main() -> None:
    wanted = sys.argv[1:] or list(STEPS)
    unknown = [step for step in wanted if step not in STEPS]
    if unknown:
        sys.exit(f"unknown step(s): {', '.join(unknown)}; choose from {', '.join(STEPS)}")
    for step in STEPS:
        if step in wanted:
            STEPS[step]()


if __name__ == "__main__":
    main()
