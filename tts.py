#!/usr/bin/env python3
"""
Microsoft Text-to-Speech (TTS) Script - Optimized Version
Uses Azure Cognitive Services Speech SDK to convert text to speech.
Optimizations: Lazy loading, caching, async operations, memory efficiency
"""

import os
import sys
import argparse
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
from functools import lru_cache
from contextlib import contextmanager
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Lazy imports for heavy libraries
_speech_sdk = None
_dotenv_loaded = False

def _lazy_import_speech_sdk():
    """Lazy import Azure Speech SDK to reduce startup time."""
    global _speech_sdk
    if _speech_sdk is None:
        import azure.cognitiveservices.speech as speechsdk
        _speech_sdk = speechsdk
    return _speech_sdk

def _ensure_dotenv():
    """Load environment variables only once."""
    global _dotenv_loaded
    if not _dotenv_loaded:
        try:
            from dotenv import load_dotenv
            load_dotenv()
            _dotenv_loaded = True
        except ImportError:
            pass  # dotenv is optional

# Try to import colorama for colored output
try:
    from colorama import init, Fore, Style
    init(autoreset=True)  # Auto-reset colors after each print
    COLORS_AVAILABLE = True
except ImportError:
    COLORS_AVAILABLE = False
    # Define dummy classes for compatibility
    class Fore:
        GREEN = RED = YELLOW = CYAN = ''
    class Style:
        RESET_ALL = ''

# Configure logging with lazy formatter
class LazyLogFormatter(logging.Formatter):
    """Lazy log formatter to avoid unnecessary string formatting."""
    def format(self, record):
        # Only format if the message will actually be logged
        if record.levelno >= logging.getLogger().getEffectiveLevel():
            return super().format(record)
        return ''

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logging.getLogger().handlers[0].setFormatter(
    LazyLogFormatter('%(asctime)s - %(levelname)s - %(message)s')
)
logger = logging.getLogger(__name__)


class ColorPrinter:
    """Centralized color printing utility."""
    
    @staticmethod
    def success(message: str):
        """Print success message with color if available."""
        print(f"{Fore.GREEN}✓ {message}{Style.RESET_ALL}")
    
    @staticmethod
    def error(message: str):
        """Print error message with color if available."""
        print(f"{Fore.RED}✗ {message}{Style.RESET_ALL}")
        logger.error(message)
    
    @staticmethod
    def info(message: str):
        """Print info message with color if available."""
        print(f"{Fore.CYAN}ℹ {message}{Style.RESET_ALL}")
    
    @staticmethod
    def warning(message: str):
        """Print warning message with color if available."""
        print(f"{Fore.YELLOW}⚠ {message}{Style.RESET_ALL}")


class MicrosoftTTS:
    """Optimized Microsoft Text-to-Speech service wrapper."""
    
    # Class-level cache for voices
    _voices_cache: Optional[List[Dict[str, Any]]] = None
    _cache_region: Optional[str] = None
    
    def __init__(self, api_key: Optional[str] = None, region: Optional[str] = None):
        """
        Initialize the TTS service with lazy loading.
        
        Args:
            api_key: Azure Speech Service API key
            region: Azure region (e.g., 'eastus', 'westus2')
        """
        _ensure_dotenv()
        
        self.api_key = api_key or os.getenv('AZURE_SPEECH_KEY')
        self.region = region or os.getenv('AZURE_SPEECH_REGION')
        
        if not self.api_key or not self.region:
            raise ValueError(
                "Azure Speech Service credentials not found. "
                "Please set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION environment variables "
                "or pass them as parameters."
            )
        
        # Lazy initialization of speech config
        self._speech_config = None
        self._default_voice = os.getenv('DEFAULT_VOICE', 'en-US-AriaNeural')
        self._executor = ThreadPoolExecutor(max_workers=2)
        
        logger.info(f"Initialized Microsoft TTS with region: {self.region}")
    
    @property
    def speech_config(self):
        """Lazy load speech configuration."""
        if self._speech_config is None:
            speechsdk = _lazy_import_speech_sdk()
            self._speech_config = speechsdk.SpeechConfig(
                subscription=self.api_key,
                region=self.region
            )
            self._speech_config.speech_synthesis_voice_name = self._default_voice
            
            # Optimize speech config for performance
            self._speech_config.set_property(
                speechsdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "5000"
            )
            self._speech_config.set_property(
                speechsdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "1000"
            )
        return self._speech_config
    
    @lru_cache(maxsize=1)
    def get_available_voices(self) -> List[Dict[str, Any]]:
        """
        Get list of available voices with caching.
        
        Returns:
            List of voice information dictionaries
        """
        # Check class-level cache first
        if self._voices_cache is not None and self._cache_region == self.region:
            logger.debug("Returning cached voices list")
            return self._voices_cache
        
        try:
            speechsdk = _lazy_import_speech_sdk()
            synthesizer = speechsdk.SpeechSynthesizer(speech_config=self.speech_config)
            
            # Use async operation for better performance
            result = synthesizer.get_voices_async().get()
            
            if result.reason == speechsdk.ResultReason.VoicesListRetrieved:
                voices = []
                for voice in result.voices:
                    voice_info = {
                        'name': voice.name,
                        'locale': voice.locale,
                        'gender': getattr(voice.gender, 'name', 'Unknown'),
                        'display_name': getattr(voice, 'display_name', voice.name),
                        'local_name': getattr(voice, 'local_name', voice.name),
                        'voice_type': getattr(voice.voice_type, 'name', 'Neural') if hasattr(voice, 'voice_type') else 'Neural'
                    }
                    voices.append(voice_info)
                
                # Update class-level cache
                MicrosoftTTS._voices_cache = voices
                MicrosoftTTS._cache_region = self.region
                
                return voices
            else:
                logger.error(f"Failed to retrieve voices: {result.reason}")
                return []
        except Exception as e:
            logger.error(f"Error getting available voices: {e}")
            return []
    
    @contextmanager
    def _get_synthesizer(self, output_file: Optional[str] = None, play_audio: bool = False):
        """Context manager for speech synthesizer with proper resource cleanup."""
        speechsdk = _lazy_import_speech_sdk()
        synthesizer = None
        
        try:
            if output_file:
                # Ensure output directory exists
                output_path = Path(output_file)
                output_path.parent.mkdir(parents=True, exist_ok=True)
                
                audio_config = speechsdk.audio.AudioOutputConfig(filename=str(output_path))
                synthesizer = speechsdk.SpeechSynthesizer(
                    speech_config=self.speech_config,
                    audio_config=audio_config
                )
            elif play_audio:
                synthesizer = speechsdk.SpeechSynthesizer(speech_config=self.speech_config)
            else:
                audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=False)
                synthesizer = speechsdk.SpeechSynthesizer(
                    speech_config=self.speech_config,
                    audio_config=audio_config
                )
            
            yield synthesizer
            
        finally:
            # Cleanup resources
            if synthesizer:
                del synthesizer
    
    async def text_to_speech_async(
        self,
        text: str,
        output_file: Optional[str] = None,
        voice_name: Optional[str] = None,
        play_audio: bool = False
    ) -> bool:
        """
        Async version of text to speech conversion for better performance.
        
        Args:
            text: Text to convert to speech
            output_file: Path to save audio file (optional)
            voice_name: Voice to use (optional, uses default if not specified)
            play_audio: Whether to play audio directly (optional)
        
        Returns:
            True if successful, False otherwise
        """
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self._executor,
            self.text_to_speech,
            text, output_file, voice_name, play_audio
        )
    
    def text_to_speech(
        self,
        text: str,
        output_file: Optional[str] = None,
        voice_name: Optional[str] = None,
        play_audio: bool = False
    ) -> bool:
        """
        Convert text to speech with optimized resource handling.
        
        Args:
            text: Text to convert to speech
            output_file: Path to save audio file (optional)
            voice_name: Voice to use (optional, uses default if not specified)
            play_audio: Whether to play audio directly (optional)
        
        Returns:
            True if successful, False otherwise
        """
        speechsdk = _lazy_import_speech_sdk()
        
        try:
            # Set voice if specified
            if voice_name:
                self.speech_config.speech_synthesis_voice_name = voice_name
            
            # Use context manager for proper resource cleanup
            with self._get_synthesizer(output_file, play_audio) as synthesizer:
                # Truncate log message for performance
                log_text = text[:50] + ('...' if len(text) > 50 else '')
                logger.info(f"Converting text to speech: '{log_text}'")
                
                # Perform synthesis
                result = synthesizer.speak_text_async(text).get()
                
                # Check result
                if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                    if output_file:
                        ColorPrinter.success(f"Audio saved to: {output_file}")
                    if play_audio:
                        ColorPrinter.success("Audio played successfully")
                    return True
                elif result.reason == speechsdk.ResultReason.Canceled:
                    cancellation_details = result.cancellation_details
                    ColorPrinter.error(f"Speech synthesis canceled: {cancellation_details.reason}")
                    if cancellation_details.error_details:
                        ColorPrinter.error(f"Error details: {cancellation_details.error_details}")
                    return False
                else:
                    ColorPrinter.error(f"Speech synthesis failed: {result.reason}")
                    return False
                    
        except Exception as e:
            ColorPrinter.error(f"Error during text-to-speech conversion: {e}")
            return False
    
    def process_large_text(
        self,
        text_file: str,
        output_dir: str,
        chunk_size: int = 5000,
        voice_name: Optional[str] = None
    ) -> bool:
        """
        Process large text files by splitting into chunks.
        
        Args:
            text_file: Path to input text file
            output_dir: Directory to save audio chunks
            chunk_size: Maximum characters per chunk
            voice_name: Voice to use
        
        Returns:
            True if all chunks processed successfully
        """
        try:
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            
            # Stream file for memory efficiency
            with open(text_file, 'r', encoding='utf-8') as f:
                chunk_num = 0
                buffer = ""
                
                for line in f:
                    buffer += line
                    
                    # Process chunk when it reaches the size limit
                    if len(buffer) >= chunk_size:
                        chunk_num += 1
                        output_file = output_path / f"chunk_{chunk_num:04d}.wav"
                        
                        # Find last sentence boundary
                        last_period = buffer.rfind('.')
                        if last_period > 0:
                            chunk_text = buffer[:last_period + 1]
                            buffer = buffer[last_period + 1:]
                        else:
                            chunk_text = buffer
                            buffer = ""
                        
                        ColorPrinter.info(f"Processing chunk {chunk_num}...")
                        if not self.text_to_speech(chunk_text, str(output_file), voice_name):
                            return False
                
                # Process remaining text
                if buffer.strip():
                    chunk_num += 1
                    output_file = output_path / f"chunk_{chunk_num:04d}.wav"
                    ColorPrinter.info(f"Processing final chunk {chunk_num}...")
                    if not self.text_to_speech(buffer, str(output_file), voice_name):
                        return False
            
            ColorPrinter.success(f"Processed {chunk_num} chunks successfully")
            return True
            
        except Exception as e:
            ColorPrinter.error(f"Error processing large text file: {e}")
            return False
    
    def __del__(self):
        """Cleanup resources on deletion."""
        if hasattr(self, '_executor'):
            self._executor.shutdown(wait=False)


def list_voices(tts_service: MicrosoftTTS, filter_locale: Optional[str] = None):
    """
    List available voices with optional filtering.
    
    Args:
        tts_service: TTS service instance
        filter_locale: Optional locale filter (e.g., 'en-US')
    """
    print("\nFetching available voices...")
    voices = tts_service.get_available_voices()
    
    if not voices:
        ColorPrinter.error("Failed to retrieve voices")
        return
    
    # Apply filter if specified
    if filter_locale:
        voices = [v for v in voices if v['locale'].startswith(filter_locale)]
        print(f"\nFound {len(voices)} voices for locale '{filter_locale}':\n")
    else:
        print(f"\nFound {len(voices)} available voices:\n")
    
    if not voices:
        ColorPrinter.warning(f"No voices found for locale '{filter_locale}'")
        return
    
    # Group voices by locale
    voices_by_locale = {}
    for voice in voices:
        locale = voice['locale']
        if locale not in voices_by_locale:
            voices_by_locale[locale] = []
        voices_by_locale[locale].append(voice)
    
    # Display voices grouped by locale
    for locale in sorted(voices_by_locale.keys()):
        print(f"{Fore.YELLOW}{locale}:{Style.RESET_ALL}")
        
        for voice in sorted(voices_by_locale[locale], key=lambda x: x['name']):
            gender_icon = "♀" if voice['gender'] == 'Female' else "♂"
            voice_type_indicator = "🔊" if 'Neural' in voice['voice_type'] else "📢"
            print(f"  {gender_icon} {voice_type_indicator} {voice['name']} - {voice['display_name']}")
        print()


def read_text_efficiently(file_path: str, max_size: int = 10 * 1024 * 1024) -> Optional[str]:
    """
    Read text from file with size limit and encoding detection.
    
    Args:
        file_path: Path to text file
        max_size: Maximum file size in bytes (default 10MB)
    
    Returns:
        Text content or None if error
    """
    try:
        file_size = os.path.getsize(file_path)
        if file_size > max_size:
            ColorPrinter.warning(f"File size ({file_size / 1024 / 1024:.2f}MB) exceeds limit. Consider using --large-file mode.")
            return None
        
        # Try different encodings
        encodings = ['utf-8', 'utf-16', 'latin-1', 'cp1252']
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    text = f.read().strip()
                    ColorPrinter.info(f"Read text from file: {file_path} (encoding: {encoding})")
                    return text
            except UnicodeDecodeError:
                continue
        
        ColorPrinter.error(f"Unable to decode file with any supported encoding")
        return None
        
    except FileNotFoundError:
        ColorPrinter.error(f"File not found: {file_path}")
        return None
    except Exception as e:
        ColorPrinter.error(f"Error reading file: {e}")
        return None


async def main_async():
    """Async main function for better performance."""
    parser = argparse.ArgumentParser(
        description="Microsoft Text-to-Speech (TTS) - Optimized Version",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python tts.py "Hello, world!"
  python tts.py "Hello, world!" -o output.wav
  python tts.py "Hello, world!" -v en-US-JennyNeural -p
  python tts.py --list-voices
  python tts.py --list-voices --filter en-US
  python tts.py -f input.txt -o output.wav
  python tts.py --large-file book.txt --output-dir audio_chunks/
        """
    )
    
    parser.add_argument(
        'text',
        nargs='?',
        help='Text to convert to speech'
    )
    
    parser.add_argument(
        '-f', '--file',
        help='Read text from file instead of command line'
    )
    
    parser.add_argument(
        '-o', '--output',
        help='Output audio file path (default: no file output)'
    )
    
    parser.add_argument(
        '-v', '--voice',
        help='Voice name to use (e.g., en-US-AriaNeural)'
    )
    
    parser.add_argument(
        '-p', '--play',
        action='store_true',
        help='Play audio directly (requires speakers)'
    )
    
    parser.add_argument(
        '--list-voices',
        action='store_true',
        help='List all available voices'
    )
    
    parser.add_argument(
        '--filter',
        help='Filter voices by locale (e.g., en-US, fr-FR)'
    )
    
    parser.add_argument(
        '--api-key',
        help='Azure Speech Service API key (overrides environment variable)'
    )
    
    parser.add_argument(
        '--region',
        help='Azure region (overrides environment variable)'
    )
    
    parser.add_argument(
        '--large-file',
        help='Process large text file in chunks'
    )
    
    parser.add_argument(
        '--output-dir',
        help='Output directory for audio chunks (used with --large-file)'
    )
    
    parser.add_argument(
        '--chunk-size',
        type=int,
        default=5000,
        help='Characters per chunk for large files (default: 5000)'
    )
    
    args = parser.parse_args()
    
    try:
        # Initialize TTS service
        tts_service = MicrosoftTTS(api_key=args.api_key, region=args.region)
        
        # Handle list voices command
        if args.list_voices:
            list_voices(tts_service, args.filter)
            return
        
        # Handle large file processing
        if args.large_file:
            output_dir = args.output_dir or './audio_chunks'
            success = tts_service.process_large_text(
                args.large_file,
                output_dir,
                args.chunk_size,
                args.voice
            )
            sys.exit(0 if success else 1)
        
        # Get text input
        text = None
        if args.file:
            text = read_text_efficiently(args.file)
            if text is None:
                sys.exit(1)
        elif args.text:
            text = args.text
        else:
            parser.print_help()
            sys.exit(1)
        
        if not text:
            ColorPrinter.error("No text provided")
            sys.exit(1)
        
        # Set default output file if not specified but output directory exists
        output_file = args.output
        if not output_file and not args.play:
            output_dir = os.getenv('OUTPUT_DIR', './audio_output')
            if output_dir:
                Path(output_dir).mkdir(parents=True, exist_ok=True)
                output_file = os.path.join(output_dir, 'output.wav')
        
        # Convert text to speech (use async version for better performance)
        success = await tts_service.text_to_speech_async(
            text=text,
            output_file=output_file,
            voice_name=args.voice,
            play_audio=args.play
        )
        
        if not success:
            sys.exit(1)
            
    except ValueError as e:
        ColorPrinter.error(f"Configuration error: {e}")
        print("\nPlease ensure you have:")
        print("1. Created a .env file with your Azure credentials")
        print("2. Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION")
        print("3. Or pass credentials via --api-key and --region arguments")
        sys.exit(1)
    except KeyboardInterrupt:
        ColorPrinter.warning("\nOperation cancelled by user")
        sys.exit(0)
    except Exception as e:
        ColorPrinter.error(f"Unexpected error: {e}")
        logger.exception("Unexpected error occurred")
        sys.exit(1)


def main():
    """Main entry point with async support."""
    # Check if event loop is already running (e.g., in Jupyter)
    try:
        loop = asyncio.get_running_loop()
        # If we're here, loop is running, use create_task
        loop.create_task(main_async())
    except RuntimeError:
        # No loop running, use asyncio.run
        asyncio.run(main_async())


if __name__ == "__main__":
    main()
