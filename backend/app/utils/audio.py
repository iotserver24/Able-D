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
            print("Warning: ffmpeg not found, using original audio file")
            return input_path, False

        # Convert to temp wav next to input
        output_path = input_path.with_suffix(".converted.wav")
        cmd = [
            "ffmpeg", "-y",
            "-i", str(input_path),
            "-ac", "1",            # mono
            "-ar", "16000",        # 16 kHz
            "-c:a", "pcm_s16le",   # PCM 16-bit
            "-f", "wav",           # Force WAV format
            str(output_path),
        ]
        
        print(f"Converting {input_path.name} to Azure-compatible WAV...")
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        
        if output_path.exists() and output_path.stat().st_size > 0:
            print(f"Successfully converted {input_path.name} to Azure-compatible WAV")
            return output_path, True
        else:
            print("Warning: Conversion failed, using original file")
            return input_path, False
            
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg conversion failed: {e.stderr}")
        return input_path, False
    except (OSError, IOError) as e:
        print(f"Audio conversion error: {e}")
        return input_path, False


