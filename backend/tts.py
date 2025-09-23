#!/usr/bin/env python3
"""
Microsoft Text-to-Speech (TTS) Script - Optimized for Education
Uses Azure Cognitive Services Speech SDK with the best voice for educational content.
Optimized for efficiency and clarity.
"""

import os
import sys
import argparse
import logging
from pathlib import Path
from typing import Optional, Dict, Any
import asyncio
from concurrent.futures import ThreadPoolExecutor
import time

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

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MicrosoftTTS:
    """Microsoft Text-to-Speech service optimized for educational content."""
    
    # Best voice for educational content - clear, professional, and engaging
    EDUCATION_VOICE = "en-US-AriaNeural"
    
    # Optimal settings for educational content
    EDUCATION_SETTINGS = {
        "rate": "0.95",  # Slightly slower for clarity
        "pitch": "default",
        "volume": "default",
        "style": "narration-professional"  # Professional narration style
    }
    
    def __init__(self, api_key: Optional[str] = None, region: Optional[str] = None):
        """
        Initialize the TTS service optimized for educational use.
        
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
        self._synthesizer = None
        self._executor = ThreadPoolExecutor(max_workers=1)  # Single thread for efficiency
        
        logger.info(f"Initialized Microsoft TTS for education with region: {self.region}")
    
    @property
    def speech_config(self):
        """Lazy load speech configuration."""
        if self._speech_config is None:
            speechsdk = _lazy_import_speech_sdk()
            self._speech_config = speechsdk.SpeechConfig(
                subscription=self.api_key,
                region=self.region
            )
            self._speech_config.speech_synthesis_voice_name = self.EDUCATION_VOICE
            
            # Set high quality output format
            self._speech_config.set_speech_synthesis_output_format(
                speechsdk.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3
            )
            
            # Optimize for low latency
            self._speech_config.set_property(
                speechsdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "3000"
            )
            self._speech_config.set_property(
                speechsdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "500"
            )
        return self._speech_config
    
    @property
    def synthesizer(self):
        """Reuse synthesizer for efficiency."""
        if self._synthesizer is None:
            speechsdk = _lazy_import_speech_sdk()
            self._synthesizer = speechsdk.SpeechSynthesizer(speech_config=self.speech_config)
        return self._synthesizer
    
    def _build_ssml(self, text: str) -> str:
        """Build SSML optimized for educational content."""
        # Escape XML special characters
        text = text.replace('&', '&amp;')
        text = text.replace('<', '&lt;')
        text = text.replace('>', '&gt;')
        text = text.replace('"', '&quot;')
        text = text.replace("'", '&apos;')
        
        # Build SSML with educational settings
        ssml = f'''<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" 
                   xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-US">
            <voice name="{self.EDUCATION_VOICE}">
                <mstts:express-as style="{self.EDUCATION_SETTINGS['style']}">
                    <prosody rate="{self.EDUCATION_SETTINGS['rate']}">
                        {text}
                    </prosody>
                </mstts:express-as>
            </voice>
        </speak>'''
        
        return ssml
    
    async def text_to_speech_async(
        self,
        text: str,
        output_file: Optional[str] = None,
        play_audio: bool = False
    ) -> bool:
        """Async version of text to speech conversion."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self._executor,
            self.text_to_speech,
            text, output_file, play_audio
        )
    
    def text_to_speech(
        self,
        text: str,
        output_file: Optional[str] = None,
        play_audio: bool = False
    ) -> bool:
        """
        Convert text to speech optimized for educational content.
        
        Args:
            text: Text to convert to speech
            output_file: Path to save audio file (optional)
            play_audio: Whether to play audio directly (optional)
        
        Returns:
            True if successful, False otherwise
        """
        speechsdk = _lazy_import_speech_sdk()
        
        try:
            start_time = time.time()
            
            # Build SSML for educational content
            ssml_text = self._build_ssml(text)
            
            # Configure output
            if output_file:
                # Fix: Ensure proper path handling with absolute paths
                output_path = Path(output_file).resolve()
                output_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Convert to absolute path string for Azure SDK
                output_file_str = str(output_path.absolute())
                logger.info(f"Saving audio to: {output_file_str}")
                
                audio_config = speechsdk.audio.AudioOutputConfig(filename=output_file_str)
                synthesizer = speechsdk.SpeechSynthesizer(
                    speech_config=self.speech_config,
                    audio_config=audio_config
                )
            elif play_audio:
                synthesizer = self.synthesizer
            else:
                audio_config = speechsdk.audio.AudioOutputConfig(use_default_speaker=False)
                synthesizer = speechsdk.SpeechSynthesizer(
                    speech_config=self.speech_config,
                    audio_config=audio_config
                )
            
            # Perform synthesis
            logger.info("Starting speech synthesis...")
            result = synthesizer.speak_ssml_async(ssml_text).get()
            
            # Check result
            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                elapsed_time = time.time() - start_time
                logger.info(f"Speech synthesis completed in {elapsed_time:.2f} seconds")
                
                if output_file:
                    # Verify file was created
                    if Path(output_file_str).exists():
                        file_size = Path(output_file_str).stat().st_size
                        print(f"✓ Audio saved to: {output_file_str} ({file_size:,} bytes)")
                    else:
                        logger.error(f"File was not created at: {output_file_str}")
                        return False
                if play_audio:
                    print("✓ Audio played successfully")
                return True
            elif result.reason == speechsdk.ResultReason.Canceled:
                cancellation_details = result.cancellation_details
                logger.error(f"Speech synthesis canceled: {cancellation_details.reason}")
                if cancellation_details.error_details:
                    logger.error(f"Error details: {cancellation_details.error_details}")
                return False
            else:
                logger.error(f"Speech synthesis failed: {result.reason}")
                return False
                
        except Exception as e:
            logger.error(f"Error during text-to-speech conversion: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def process_batch(
        self,
        texts: list[str],
        output_dir: str,
        prefix: str = "audio"
    ) -> bool:
        """Process multiple texts efficiently in batch."""
        try:
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            
            success_count = 0
            total_count = len(texts)
            
            for i, text in enumerate(texts, 1):
                output_file = output_path / f"{prefix}_{i:04d}.mp3"
                print(f"Processing {i}/{total_count}...")
                
                if self.text_to_speech(text, str(output_file)):
                    success_count += 1
                else:
                    logger.warning(f"Failed to process text {i}")
            
            print(f"\n✓ Processed {success_count}/{total_count} texts successfully")
            return success_count == total_count
            
        except Exception as e:
            logger.error(f"Error processing batch: {e}")
            return False
    
    def __del__(self):
        """Cleanup resources on deletion."""
        if hasattr(self, '_executor'):
            self._executor.shutdown(wait=False)
        if hasattr(self, '_synthesizer') and self._synthesizer:
            del self._synthesizer


def read_text_file(file_path: str) -> Optional[str]:
    """Read text from file efficiently."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            text = f.read().strip()
            logger.info(f"Read {len(text)} characters from file: {file_path}")
            return text
    except FileNotFoundError:
        logger.error(f"File not found: {file_path}")
        return None
    except Exception as e:
        logger.error(f"Error reading file: {e}")
        return None


async def main_async():
    """Async main function for better performance."""
    parser = argparse.ArgumentParser(
        description="Microsoft Text-to-Speech optimized for Educational Content",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python tts.py "Welcome to today's lesson"              # Convert text
  python tts.py "Hello, students!" -o lesson1.mp3        # Save to file
  python tts.py -f lesson.txt -o lesson_audio.mp3        # Convert file
  python tts.py --batch lessons/ -o audio/               # Batch process
        """
    )
    
    parser.add_argument('text', nargs='?', help='Text to convert to speech')
    parser.add_argument('-f', '--file', help='Read text from file')
    parser.add_argument('-o', '--output', help='Output audio file path')
    parser.add_argument('-p', '--play', action='store_true', help='Play audio directly')
    parser.add_argument('--api-key', help='Azure Speech Service API key')
    parser.add_argument('--region', help='Azure region')
    parser.add_argument('--batch', help='Directory containing text files for batch processing')
    parser.add_argument('--output-dir', help='Output directory for batch processing')
    
    args = parser.parse_args()
    
    try:
        # Initialize TTS service
        tts_service = MicrosoftTTS(api_key=args.api_key, region=args.region)
        
        # Handle batch processing
        if args.batch:
            output_dir = args.output_dir or './audio_output'
            text_files = list(Path(args.batch).glob('*.txt'))
            
            if not text_files:
                print("No text files found in the specified directory")
                sys.exit(1)
            
            texts = []
            for file_path in text_files:
                text = read_text_file(str(file_path))
                if text:
                    texts.append(text)
            
            success = tts_service.process_batch(texts, output_dir)
            sys.exit(0 if success else 1)
        
        # Get text input
        text = None
        if args.file:
            text = read_text_file(args.file)
            if text is None:
                sys.exit(1)
        elif args.text:
            text = args.text
        else:
            parser.print_help()
            sys.exit(1)
        
        if not text:
            print("Error: No text provided")
            sys.exit(1)
        
        # Set default output file if not specified
        output_file = args.output
        if not output_file and not args.play:
            # Default to audio_output directory
            Path('./audio_output').mkdir(parents=True, exist_ok=True)
            output_file = './audio_output/output.mp3'
        
        # Convert text to speech
        success = await tts_service.text_to_speech_async(
            text=text,
            output_file=output_file,
            play_audio=args.play
        )
        
        if not success:
            sys.exit(1)
            
    except ValueError as e:
        print(f"Configuration error: {e}")
        print("\nPlease ensure you have:")
        print("1. Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION environment variables")
        print("2. Or pass credentials via --api-key and --region arguments")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)


def main():
    """Main entry point."""
    asyncio.run(main_async())


if __name__ == "__main__":
    main()