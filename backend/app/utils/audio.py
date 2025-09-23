import shutil
import subprocess
from pathlib import Path
from typing import Tuple


def ensure_wav_pcm16_mono_16k(input_path: Path) -> Tuple[Path, bool]:
    """
    Ensure the audio file is WAV PCM16 mono 16kHz.
    Returns (path_to_use, is_temporary).
    If ffmpeg is not available or conversion fails, returns original path.
    """
    try:
        if shutil.which("ffmpeg") is None:
            return input_path, False

        # Convert to temp wav next to input
        output_path = input_path.with_suffix(".converted.wav")
        cmd = [
            "ffmpeg", "-y",
            "-i", str(input_path),
            "-ac", "1",            # mono
            "-ar", "16000",        # 16 kHz
            "-c:a", "pcm_s16le",   # PCM 16-bit
            str(output_path),
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return output_path, True
    except Exception:
        return input_path, False


