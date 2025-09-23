# Audio Conversion System Guide

## Overview

The Able-D system supports automatic audio conversion for any audio format to ensure compatibility with Azure Speech Services. This guide explains how the conversion works and addresses hosting deployment considerations.

## How Audio Conversion Works

### 1. Supported Audio Formats

The system can handle **any audio format** that FFmpeg supports, including:
- **Common formats**: MP3, WAV, M4A, AAC, FLAC, OGG, WMA, OPUS
- **Video formats**: MP4, AVI, MOV (audio tracks only)
- **Other formats**: Any format supported by FFmpeg

### 2. Conversion Process

#### Input Processing
```python
# From backend/app/utils/audio.py
def ensure_wav_pcm16_mono_16k(input_path: Path) -> Tuple[Path, bool]:
    """
    Ensure the audio file is WAV PCM16 mono 16kHz.
    Returns (path_to_use, is_temporary).
    If ffmpeg is not available or conversion fails, returns original path.
    """
```

#### Conversion Parameters
- **Format**: WAV PCM16 (16-bit PCM)
- **Channels**: Mono (single channel)
- **Sample Rate**: 16kHz
- **Bit Depth**: 16-bit

#### FFmpeg Command Used
```bash
ffmpeg -y -i input_file -ac 1 -ar 16000 -c:a pcm_s16le output_file.converted.wav
```

Where:
- `-y`: Overwrite output file if exists
- `-i input_file`: Input audio file
- `-ac 1`: Convert to mono (1 channel)
- `-ar 16000`: Set sample rate to 16kHz
- `-c:a pcm_s16le`: Use PCM 16-bit little-endian codec
- `output_file.converted.wav`: Output converted file

### 3. Integration Points

#### STT (Speech-to-Text) Route
```python
# backend/app/routes/stt.py
@stt_bp.post("/stt")
def stt_route():
    # ... file validation ...
    
    with TemporaryDirectory() as tmpdir:
        tmp_path = Path(tmpdir) / audio.filename
        audio.save(str(tmp_path))
        
        # Convert if needed for SDK compatibility
        path_to_use, is_temp = ensure_wav_pcm16_mono_16k(tmp_path)
        
        success, result = stt_client.transcribe(str(path_to_use))
        # ... rest of processing ...
```

#### Teacher Upload Route
```python
# backend/app/routes/teacher_upload.py
else:  # audio upload
    original_filename = audio.filename if audio else None
    tmp_path = Path(tmpdir) / (audio.filename if audio else "audio")
    audio.save(str(tmp_path))
    path_to_use, _ = ensure_wav_pcm16_mono_16k(tmp_path)
    stt_client = get_stt_client(language=(request.form.get("language") or "en-US"))
    success, result = stt_client.transcribe(str(path_to_use))
```

## Hosting Deployment Considerations

### Current Docker Setup ✅

The system is **already configured** for hosting with audio conversion support:

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

# Install system deps (ffmpeg for audio conversion)
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*
```

### What This Means for Hosting

1. **FFmpeg is included**: The Docker image includes FFmpeg for audio conversion
2. **Universal compatibility**: Any audio format can be converted automatically
3. **No additional setup needed**: The conversion works out-of-the-box in hosted environments

### Deployment Checklist

#### ✅ Already Configured
- [x] FFmpeg installed in Docker image
- [x] Audio conversion function implemented
- [x] Integration with STT and teacher upload routes
- [x] Temporary file handling for conversions
- [x] Error handling for conversion failures

#### 🔧 Environment Variables Required
```bash
# Azure Speech Services (for STT/TTS)
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=your_region

# Optional
DEFAULT_VOICE=en-US-JennyNeural
OUTPUT_DIR=./audio_output
```

### Testing Audio Conversion

#### Local Testing
```powershell
# Test with different audio formats
curl.exe -X POST http://127.0.0.1:5000/api/stt \
  -F "audio=@sample.mp3;type=audio/mpeg" \
  -F language=en-US

curl.exe -X POST http://127.0.0.1:5000/api/stt \
  -F "audio=@Recording.m4a;type=audio/x-m4a" \
  -F language=en-US
```

#### Docker Testing
```bash
# Build and run
docker build -t able-d-backend .
docker run -p 8080:8080 \
  -e AZURE_SPEECH_KEY=YOUR_KEY \
  -e AZURE_SPEECH_REGION=centralindia \
  able-d-backend

# Test conversion
curl -X POST http://127.0.0.1:8080/api/stt \
  -F "audio=@sample.mp3" \
  -F language=en-US
```

## Error Handling

### Graceful Degradation
If FFmpeg is not available or conversion fails:
- The system returns the original file path
- Processing continues with the original format
- May result in Azure Speech Services errors for unsupported formats

### Common Issues and Solutions

#### 1. FFmpeg Not Found
```python
if shutil.which("ffmpeg") is None:
    return input_path, False  # Use original file
```
**Solution**: Ensure FFmpeg is installed (✅ already in Docker)

#### 2. Conversion Fails
```python
except Exception:
    return input_path, False  # Use original file
```
**Solution**: Check file format compatibility and FFmpeg installation

#### 3. Azure Speech Services Errors
- **Cause**: Unsupported audio format without conversion
- **Solution**: Ensure conversion is working or use supported formats

## Best Practices

### 1. File Size Limits
- Default Flask limit: 16MB (configurable via `MAX_CONTENT_LENGTH`)
- Large files may timeout during conversion

### 2. Temporary Storage
- Conversions use temporary directories
- Files are automatically cleaned up
- No persistent storage of converted files

### 3. Performance Considerations
- Conversion adds processing time
- Consider file size and format for optimal performance
- Monitor memory usage for large files

## Troubleshooting

### Debug Conversion Process
```python
# Add logging to debug conversion
import logging
logging.basicConfig(level=logging.DEBUG)

# In ensure_wav_pcm16_mono_16k function
logging.debug(f"Converting {input_path} to WAV PCM16 mono 16k")
```

### Check FFmpeg Installation
```bash
# In Docker container
docker exec -it container_name ffmpeg -version
```

### Verify Audio Format Support
```bash
# Check what formats FFmpeg supports
docker exec -it container_name ffmpeg -formats | grep -E "(mp3|wav|m4a|aac|flac)"
```

## Summary

✅ **Audio conversion is fully functional** in your system
✅ **Any audio format** can be automatically converted
✅ **Hosting deployment** already includes FFmpeg
✅ **No additional configuration** needed for audio conversion

The system automatically handles audio conversion for:
- STT (Speech-to-Text) endpoint
- Teacher upload with audio files
- Any future audio processing needs

Your hosted environment should work seamlessly with any audio format that users upload.
