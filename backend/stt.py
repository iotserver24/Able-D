#!/usr/bin/env python3
"""
Simple Microsoft Speech-to-Text Script
Converts audio files to text using Azure Cognitive Services.
"""

import os
import sys
import time
import argparse
from pathlib import Path
from typing import Optional, Tuple
import azure.cognitiveservices.speech as speechsdk
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SimpleMicrosoftSTT:
    """Simplified Microsoft Speech-to-Text wrapper."""
    
    SUPPORTED_FORMATS = {'.wav', '.mp3', '.m4a', '.ogg', '.flac', '.aac', '.wma', '.opus'}
    
    def __init__(self, api_key: Optional[str] = None, region: Optional[str] = None, language: str = 'en-US'):
        """Initialize STT service with minimal configuration."""
        self.api_key = api_key or os.getenv('AZURE_SPEECH_KEY')
        self.region = region or os.getenv('AZURE_SPEECH_REGION')
        
        if not self.api_key or not self.region:
            raise ValueError(
                "Missing Azure credentials. Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION "
                "environment variables or pass them as parameters."
            )
        
        # Simple speech config
        self.speech_config = speechsdk.SpeechConfig(
            subscription=self.api_key,
            region=self.region
        )
        self.speech_config.speech_recognition_language = language
        
    def transcribe(self, audio_file: str, save_to: Optional[str] = None) -> Tuple[bool, str]:
        """
        Transcribe audio file to text.
        
        Args:
            audio_file: Path to audio file
            save_to: Optional output file path
            
        Returns:
            (success, transcription_text)
        """
        # Validate file
        audio_path = Path(audio_file)
        if not audio_path.exists():
            return False, f"File not found: {audio_file}"
        
        if audio_path.suffix.lower() not in self.SUPPORTED_FORMATS:
            return False, f"Unsupported format: {audio_path.suffix}"
        
        try:
            # Validate audio file before processing
            if not audio_path.exists():
                return False, f"Audio file not found: {audio_file}"
            
            if audio_path.stat().st_size == 0:
                return False, "Audio file is empty"
            
            # Setup audio input
            audio_config = speechsdk.audio.AudioConfig(filename=audio_file)
            recognizer = speechsdk.SpeechRecognizer(
                speech_config=self.speech_config,
                audio_config=audio_config
            )
            
            # Storage for results
            results = []
            done = False
            
            def handle_result(evt):
                """Store recognized text."""
                if evt.result.reason == speechsdk.ResultReason.RecognizedSpeech:
                    results.append(evt.result.text)
                    print(f".", end="", flush=True)  # Progress indicator
            
            def handle_stop(evt):
                """Mark completion."""
                nonlocal done
                done = True
            
            # Connect handlers
            recognizer.recognized.connect(handle_result)
            recognizer.session_stopped.connect(handle_stop)
            recognizer.canceled.connect(handle_stop)
            
            # Start recognition
            print(f"Transcribing {audio_path.name}", end="", flush=True)
            start_time = time.time()
            
            recognizer.start_continuous_recognition()
            
            # Wait for completion
            while not done:
                time.sleep(0.1)
            
            recognizer.stop_continuous_recognition()
            
            # Combine results
            transcription = ' '.join(results).strip()
            
            if not transcription:
                return False, "No speech detected"
            
            # Save if requested
            if save_to:
                Path(save_to).write_text(transcription, encoding='utf-8')
                print(f"\n✓ Saved to {save_to}")
            
            elapsed = time.time() - start_time
            print(f"\n✓ Completed in {elapsed:.1f}s")
            
            return True, transcription
            
        except Exception as e:
            error_msg = str(e)
            # Provide more specific error messages for common Azure Speech SDK errors
            if "SPXERR_INVALID_HEADER" in error_msg:
                return False, f"Invalid audio file format. Please ensure the audio file is not corrupted and is in a supported format (WAV, MP3, M4A, etc.)"
            elif "SPXERR_AUDIO_SYS_LIBRARY_NOT_FOUND" in error_msg:
                return False, f"Audio system library not found. Please check your system audio configuration."
            elif "SPXERR_AUDIO_DEVICE_LOST" in error_msg:
                return False, f"Audio device connection lost. Please try again."
            else:
                return False, f"STT Error: {error_msg}"


def main():
    """Command line interface."""
    parser = argparse.ArgumentParser(
        description="Simple Microsoft Speech-to-Text",
        epilog="Example: python stt.py audio.mp3 -o transcript.txt"
    )
    
    parser.add_argument('audio', help='Audio file to transcribe')
    parser.add_argument('-o', '--output', help='Save transcription to file')
    parser.add_argument('-l', '--language', default='en-US', help='Language code (default: en-US)')
    parser.add_argument('--key', help='Azure API key')
    parser.add_argument('--region', help='Azure region')
    
    args = parser.parse_args()
    
    try:
        # Initialize STT
        stt = SimpleMicrosoftSTT(
            api_key=args.key,
            region=args.region,
            language=args.language
        )
        
        # Transcribe
        success, result = stt.transcribe(args.audio, args.output)
        
        if success:
            if not args.output:
                print("\n" + "="*50)
                print("TRANSCRIPTION:")
                print("="*50)
                print(result)
                print("="*50)
        else:
            print(f"✗ {result}", file=sys.stderr)
            sys.exit(1)
            
    except ValueError as e:
        print(f"✗ Configuration error: {e}", file=sys.stderr)
        print("\nEnsure you have set:")
        print("- AZURE_SPEECH_KEY")
        print("- AZURE_SPEECH_REGION")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n✗ Cancelled")
        sys.exit(0)
    except Exception as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()