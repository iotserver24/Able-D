import os
from pathlib import Path
from typing import Optional, Tuple

import azure.cognitiveservices.speech as speechsdk


def synthesize_text_to_mp3(
    text: str,
    out_path: Path,
    api_key: Optional[str] = None,
    region: Optional[str] = None,
    voice: Optional[str] = None,
) -> Tuple[bool, str]:
    """Synthesize plain text to an MP3 file using Azure Speech.

    Returns (success, message). On success, MP3 is written to out_path.
    """
    api_key = api_key or os.getenv("AZURE_SPEECH_KEY")
    region = region or os.getenv("AZURE_SPEECH_REGION")
    if not api_key or not region:
        return False, "Missing Azure credentials"

    voice = voice or os.getenv("DEFAULT_VOICE", "en-US-JennyNeural")

    try:
        speech_config = speechsdk.SpeechConfig(subscription=api_key, region=region)
        # MP3 output (16 kHz mono 32 kbps is a good default)
        speech_config.set_speech_synthesis_output_format(
            speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
        )
        speech_config.speech_synthesis_voice_name = voice

        audio_config = speechsdk.audio.AudioOutputConfig(filename=str(out_path))
        synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)

        result = synthesizer.speak_text_async(text).get()
        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            return True, "OK"
        elif result.reason == speechsdk.ResultReason.Canceled:
            details = speechsdk.CancellationDetails(result)
            return False, f"Canceled: {details.reason} - {details.error_details}"
        return False, "Unknown synthesis error"
    except Exception as e:
        return False, f"Error: {e}"


