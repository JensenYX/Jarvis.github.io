#!/usr/bin/env python3
"""Timestamped transcripts of the demo videos, the raw material for the English
subtitles and the chapter lists.

Speech is cut into segments with Silero VAD and each segment is transcribed
with the same Qwen3-ASR family the harness uses. The aligner that would give
word timestamps is not available locally, so timing is per segment, which is
the granularity a subtitle cue needs anyway. Run it in the jev-asr env after
`tools/build_media.py audio`:

    ENV=/apdcephfs_tj6/share_303840540/hunyuan/jensenwang/conda_env/jev-asr
    $ENV/bin/python tools/transcribe.py [slug ...]

Writes build/media/<slug>.asr.json and a readable build/media/<slug>.asr.txt.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / "build" / "media"
MODEL = Path(
    "/apdcephfs_tj6/share_303840540/hunyuan/jensenwang/git_warehouse/"
    "interactive-model-harness-jev/model/Qwen3-ASR-1.7B"
)
SLUGS = [
    "audio-daily-zh",
    "audio-daily-en",
    "audio-pvz",
    "audio-minecraft-1",
    "audio-minecraft-2",
    "omni-cs2",
    "omni-lol",
]
SR = 16000
# Segments closer than this are one utterance; longer ones are split by VAD.
MERGE_GAP_S = 0.35
MAX_SEGMENT_S = 14.0


def pick_gpu() -> None:
    if "CUDA_VISIBLE_DEVICES" in os.environ:
        return
    try:
        out = subprocess.run(
            ["nvidia-smi", "--query-gpu=index,memory.free", "--format=csv,noheader,nounits"],
            check=True,
            capture_output=True,
            text=True,
        ).stdout
    except (OSError, subprocess.CalledProcessError):
        return
    rows = [tuple(int(v) for v in line.split(",")) for line in out.strip().splitlines()]
    index, free = max(rows, key=lambda row: row[1])
    os.environ["CUDA_VISIBLE_DEVICES"] = str(index)
    print(f"using GPU {index} ({free} MiB free)", flush=True)


def segments_for(wav, vad, get_speech_timestamps):
    import torch

    spans = get_speech_timestamps(
        torch.from_numpy(wav),
        vad,
        sampling_rate=SR,
        threshold=0.5,
        min_speech_duration_ms=250,
        min_silence_duration_ms=450,
        speech_pad_ms=140,
        max_speech_duration_s=MAX_SEGMENT_S,
        return_seconds=True,
    )
    merged = []
    for span in spans:
        start, end = float(span["start"]), float(span["end"])
        if merged and start - merged[-1][1] < MERGE_GAP_S and end - merged[-1][0] <= MAX_SEGMENT_S:
            merged[-1][1] = end
        else:
            merged.append([start, end])
    return merged


def main() -> None:
    wanted = sys.argv[1:] or SLUGS
    pick_gpu()

    import soundfile as sf
    import torch
    from qwen_asr import Qwen3ASRModel
    from silero_vad import get_speech_timestamps, load_silero_vad

    vad = load_silero_vad(onnx=True)
    asr = Qwen3ASRModel.from_pretrained(
        str(MODEL),
        dtype=torch.bfloat16,
        device_map="cuda:0" if torch.cuda.is_available() else "cpu",
        max_inference_batch_size=24,
        max_new_tokens=256,
    )

    for slug in wanted:
        wav, sr = sf.read(WORK / f"{slug}.wav", dtype="float32")
        assert sr == SR, f"{slug}: expected {SR} Hz, got {sr}"
        spans = segments_for(wav, vad, get_speech_timestamps)
        clips = [(wav[int(s * SR) : int(e * SR)], SR) for s, e in spans]
        results = asr.transcribe(audio=clips) if clips else []
        rows = []
        for (start, end), result in zip(spans, results):
            text = result.text.strip()
            if not text:
                continue
            rows.append({"start": round(start, 2), "end": round(end, 2), "lang": result.language, "text": text})
        (WORK / f"{slug}.asr.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1))
        lines = [f"{r['start']:7.2f} {r['end']:7.2f}  [{r['lang']}] {r['text']}" for r in rows]
        (WORK / f"{slug}.asr.txt").write_text("\n".join(lines) + "\n")
        print(f"{slug}: {len(rows)} segments", flush=True)


if __name__ == "__main__":
    main()
