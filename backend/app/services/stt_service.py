from typing import Optional

from stt import SimpleMicrosoftSTT

_stt_instances = {}


def get_stt_client(language: str = "en-US", api_key: Optional[str] = None, region: Optional[str] = None) -> SimpleMicrosoftSTT:
    key = (language, bool(api_key), bool(region))
    if key not in _stt_instances:
        _stt_instances[key] = SimpleMicrosoftSTT(api_key=api_key, region=region, language=language)
    return _stt_instances[key]


