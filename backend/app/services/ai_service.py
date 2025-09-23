from __future__ import annotations

import json
import os
import re
import time
import logging
import hashlib
from typing import Dict, List, Optional, Tuple
from functools import lru_cache
from datetime import datetime, timedelta

# This service wraps Google Gemini 2.0 Flash with up to 4 API keys fallback.
# It will first try the new Google AI SDK (package: google-genai, import: google.genai),
# and if unavailable, fall back to google-generativeai.

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Add console handler if not already present
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

KEY_ENV_NAMES = ["GEMINI_API_KEY", "GEMINI_API_KEY_2", "GEMINI_API_KEY_3", "GEMINI_API_KEY_4"]

# Constants for validation
MAX_TEXT_LENGTH = 10000  # Maximum characters for input text
MAX_QUESTION_LENGTH = 500  # Maximum characters for questions
MIN_TEXT_LENGTH = 10  # Minimum meaningful text length

# Simple in-memory cache with TTL
_response_cache: Dict[str, Tuple[Dict, float]] = {}
CACHE_TTL_SECONDS = 3600  # 1 hour cache


def _load_api_keys() -> List[str]:
    keys: List[str] = []
    for name in KEY_ENV_NAMES:
        val = (os.getenv(name) or "").strip()
        if val:
            keys.append(val)
            logger.debug(f"Loaded API key from {name}")
    
    if not keys:
        logger.error("No API keys found in environment variables")
    else:
        logger.info(f"Loaded {len(keys)} API key(s)")
    
    return keys

def _get_cache_key(mode: str, **kwargs) -> str:
    """Generate a cache key based on request parameters."""
    # Create a deterministic string from parameters
    params = f"{mode}:{kwargs.get('student_type', '')}:{kwargs.get('text', '')}:{kwargs.get('notes', '')}:{kwargs.get('question', '')}"
    return hashlib.md5(params.encode()).hexdigest()

def _get_cached_response(cache_key: str) -> Optional[Dict]:
    """Get cached response if available and not expired."""
    if cache_key in _response_cache:
        response, timestamp = _response_cache[cache_key]
        if time.time() - timestamp < CACHE_TTL_SECONDS:
            logger.info(f"Cache hit for key: {cache_key[:8]}...")
            return response
        else:
            # Remove expired entry
            del _response_cache[cache_key]
            logger.debug(f"Cache expired for key: {cache_key[:8]}...")
    return None

def _set_cached_response(cache_key: str, response: Dict) -> None:
    """Store response in cache with current timestamp."""
    _response_cache[cache_key] = (response, time.time())
    logger.debug(f"Cached response for key: {cache_key[:8]}...")
    
    # Clean up old cache entries if cache gets too large
    if len(_response_cache) > 100:
        current_time = time.time()
        expired_keys = [
            k for k, (_, ts) in _response_cache.items() 
            if current_time - ts > CACHE_TTL_SECONDS
        ]
        for k in expired_keys:
            del _response_cache[k]
        logger.debug(f"Cleaned {len(expired_keys)} expired cache entries")


def _safe_json_extract(text: str, retry_count: int = 0) -> Dict:
    """
    Attempts to parse JSON from model output, even if surrounded by extra text or code fences.
    Includes retry logic for better reliability.
    """
    if not text:
        logger.error("Empty model response received")
        raise ValueError("Empty model response")

    logger.debug(f"Attempting to extract JSON (attempt {retry_count + 1})")
    
    # Remove code fences if present
    fenced = re.sub(r"^```(json)?\s*|\s*```$", "", text.strip(), flags=re.IGNORECASE | re.MULTILINE)

    # Try full parse first
    try:
        result = json.loads(fenced)
        logger.debug("Successfully parsed JSON on first attempt")
        return result
    except json.JSONDecodeError as e:
        logger.debug(f"Initial JSON parse failed: {e}")

    # Try to find first JSON object substring
    start = fenced.find("{")
    end = fenced.rfind("}")
    if start != -1 and end != -1 and end > start:
        candidate = fenced[start : end + 1]
        try:
            result = json.loads(candidate)
            logger.debug("Successfully extracted JSON from substring")
            return result
        except json.JSONDecodeError as e:
            logger.debug(f"Substring JSON parse failed: {e}")

    # Fallback: return as plain content
    logger.warning("Could not parse JSON, returning as plain content")
    return {"content": text}

def validate_input(text: str, field_name: str, max_length: int, min_length: int = 1) -> str:
    """Validate and sanitize input text."""
    if not text or len(text.strip()) < min_length:
        raise ValueError(f"{field_name} must be at least {min_length} characters long")
    
    text = text.strip()
    
    if len(text) > max_length:
        logger.warning(f"{field_name} truncated from {len(text)} to {max_length} characters")
        text = text[:max_length]
    
    # Basic sanitization - remove any potential control characters
    text = re.sub(r'[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]', '', text)
    
    return text


ADAPTATION_GUIDELINES: Dict[str, str] = {
    "vision": (
        "Write with screen-reader friendly structure. Use clear headings and bullet points. "
        "Describe any visuals textually. Keep paragraphs short and clear. Avoid complex tables."
    ),
    "hearing": (
        "Provide rich textual explanations. Avoid referring to audio cues. "
        "Include clear step-by-step instructions and caption-like clarity."
    ),
    "speech": (
        "Use simple, short sentences that are easy to read aloud. "
        "Avoid tongue-twisters. Present steps sequentially and clearly."
    ),
    "dyslexie": (
        "Use short sentences, simple vocabulary, and bullet points. "
        "Prefer high-level summaries first, then key points. Avoid complex formatting."
    ),
}


def _normalize_student_type(student_type: str) -> str:
    st = (student_type or "").strip().lower()
    # Accept common alias
    if st == "dyslexia":
        st = "dyslexie"
    return st


class _GoogleGenAIProvider:
    """
    Provider using the Google AI Python SDK: google-genai (import google.genai).
    Supports Gemini 2.0 Flash.
    """

    def __init__(self, api_key: str, model: str, temperature: float = 0.4, max_tokens: int = 2048):
        from google import genai  # type: ignore

        self._genai = genai
        self._client = genai.Client(api_key=api_key)
        self._model = model
        self._temperature = temperature
        self._max_tokens = max_tokens

    def generate(self, prompt: str) -> str:
        # Use config parameter for google-genai SDK
        resp = self._client.models.generate_content(
            model=self._model,
            contents=prompt,
            config={"temperature": self._temperature, "max_output_tokens": self._max_tokens},
        )
        # Try various shapes
        text = getattr(resp, "text", None)
        if text:
            return text

        # candidates/parts shape fallback
        cand = getattr(resp, "candidates", [])
        if cand and getattr(cand[0], "content", None) and getattr(cand[0].content, "parts", None):
            parts = cand[0].content.parts
            # concatenate all text parts
            out = []
            for p in parts:
                t = getattr(p, "text", None)
                if t:
                    out.append(t)
            if out:
                return "\n".join(out)

        # Last resort
        return str(resp)


class _GoogleGenerativeAIProvider:
    """
    Provider using the legacy google-generativeai package.
    """

    def __init__(self, api_key: str, model: str, temperature: float = 0.4, max_tokens: int = 2048):
        import google.generativeai as genai  # type: ignore

        self._genai = genai
        genai.configure(api_key=api_key)
        self._model_name = model
        self._model = genai.GenerativeModel(model)
        self._temperature = temperature
        self._max_tokens = max_tokens

    def generate(self, prompt: str) -> str:
        resp = self._model.generate_content(
            prompt,
            generation_config={"temperature": self._temperature, "max_output_tokens": self._max_tokens},
        )
        text = getattr(resp, "text", None)
        if text:
            return text
        return str(resp)


class GeminiService:
    """
    High-level service for adaptive notes and Q&A using Gemini 2.0 Flash with API key fallback.
    Includes caching, logging, and improved error handling.
    """

    def __init__(self, model: str = "gemini-2.0-flash", temperature: float = 0.3, max_tokens: int = 2048):
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self._import_probe_done = False
        self._has_google_genai = False
        self._has_google_generativeai = False
        self._request_count = 0
        self._error_count = 0
        self._cache_hits = 0
        logger.info(f"GeminiService initialized with model: {model}")

    def _probe_imports(self) -> None:
        if self._import_probe_done:
            return
        try:
            from google import genai  # noqa: F401
            self._has_google_genai = True
        except Exception:
            self._has_google_genai = False
        try:
            import google.generativeai as _  # noqa: F401
            self._has_google_generativeai = True
        except Exception:
            self._has_google_generativeai = False
        self._import_probe_done = True

    def _mk_provider(self, api_key: str):
        self._probe_imports()
        if self._has_google_genai:
            return _GoogleGenAIProvider(api_key, self.model, self.temperature, self.max_tokens)
        if self._has_google_generativeai:
            return _GoogleGenerativeAIProvider(api_key, self.model, self.temperature, self.max_tokens)
        raise RuntimeError(
            "No Gemini client available. Please install 'google-genai' or 'google-generativeai'."
        )

    def _generate_with_fallback(self, prompt: str, retry_attempts: int = 2) -> str:
        keys = _load_api_keys()
        if not keys:
            error_msg = "No Gemini API keys configured. Set GEMINI_API_KEY (and optionally *_2..*_4) in backend/.env"
            logger.error(error_msg)
            raise RuntimeError(error_msg)

        last_err: Optional[Exception] = None
        start_time = time.time()
        
        for attempt in range(retry_attempts):
            for key_index, key in enumerate(keys):
                try:
                    logger.info(f"Attempting generation with key {key_index + 1}, attempt {attempt + 1}")
                    provider = self._mk_provider(key)
                    result = provider.generate(prompt)
                    
                    elapsed_time = time.time() - start_time
                    logger.info(f"Generation successful in {elapsed_time:.2f}s using key {key_index + 1}")
                    return result
                    
                except Exception as e:
                    last_err = e
                    logger.warning(f"Key {key_index + 1} failed on attempt {attempt + 1}: {str(e)}")
                    
                    # Add small delay before trying next key
                    if key_index < len(keys) - 1:
                        time.sleep(0.5)
                    continue
            
            # Add delay before retry attempt
            if attempt < retry_attempts - 1:
                logger.info(f"All keys failed on attempt {attempt + 1}, retrying in 1 second...")
                time.sleep(1)
        
        # If all attempts failed
        self._error_count += 1
        error_msg = f"All Gemini API keys failed after {retry_attempts} attempts"
        if last_err:
            error_msg += f": {str(last_err)}"
        logger.error(error_msg)
        raise RuntimeError(error_msg)

    def _notes_prompt(self, text: str, student_type: str) -> str:
        st = _normalize_student_type(student_type)
        if st not in ADAPTATION_GUIDELINES:
            raise ValueError(f"Invalid studentType '{student_type}'. Allowed: vision, hearing, speech, dyslexie")
        guidelines = ADAPTATION_GUIDELINES[st]
        # Force strict JSON response
        return (
            "You are an educational assistant for special needs students. "
            "Adapt the following notes for the specific student type.\n\n"
            f"Student type: {st}\n"
            f"Guidelines: {guidelines}\n\n"
            "Task: Rewrite and present the material so it is maximally accessible for the given student type. "
            "Use clear structure and include any practical tips for studying.\n\n"
            f"Original notes:\n{text}\n\n"
            "Output STRICT JSON with keys exactly: "
            '{"content": string, "tips": string, "studentType": string}. '
            "Do not include any text outside of JSON. No markdown, no code fences."
        )

    def _qna_prompt(self, notes: str, student_type: str, question: str) -> str:
        st = _normalize_student_type(student_type)
        if st not in ADAPTATION_GUIDELINES:
            raise ValueError(f"Invalid studentType '{student_type}'. Allowed: vision, hearing, speech, dyslexie")
        guidelines = ADAPTATION_GUIDELINES[st]
        return (
            "You are an educational assistant for special needs students. "
            "Use the provided notes to answer the question, tailoring the style to the student type.\n\n"
            f"Student type: {st}\n"
            f"Guidelines: {guidelines}\n\n"
            f"Notes:\n{notes}\n\n"
            f"Question: {question}\n\n"
            "Answer based only on the notes. Be concise, clear, and helpful, following the adaptation guidelines. "
            "Output STRICT JSON with keys exactly: "
            '{"answer": string, "steps": string, "tips": string, "studentType": string}. '
            "Do not include any text outside of JSON. No markdown, no code fences."
        )

    def generate_adaptive_notes(self, text: str, student_type: str) -> Dict:
        """Generate adaptive notes with caching and validation."""
        start_time = time.time()
        self._request_count += 1
        
        try:
            # Validate inputs
            text = validate_input(text, "'text'", MAX_TEXT_LENGTH, MIN_TEXT_LENGTH)
            student_type = _normalize_student_type(student_type)
            
            # Check cache first
            cache_key = _get_cache_key("notes", student_type=student_type, text=text)
            cached_response = _get_cached_response(cache_key)
            if cached_response:
                self._cache_hits += 1
                logger.info(f"Returning cached response for notes request")
                return cached_response
            
            # Generate new response
            prompt = self._notes_prompt(text, student_type)
            raw = self._generate_with_fallback(prompt)
            data = _safe_json_extract(raw)
            
            # Ensure standard fields
            data.setdefault("studentType", student_type)
            data.setdefault("tips", "")
            if "content" not in data:
                # fallback if model didn't comply
                data["content"] = raw
            
            # Add metadata
            data["_metadata"] = {
                "generated_at": datetime.utcnow().isoformat(),
                "processing_time": round(time.time() - start_time, 2),
                "model": self.model
            }
            
            # Cache the response
            _set_cached_response(cache_key, data)
            
            elapsed_time = time.time() - start_time
            logger.info(f"Notes generated successfully in {elapsed_time:.2f}s for student type: {student_type}")
            
            return data
            
        except Exception as e:
            self._error_count += 1
            logger.error(f"Error generating adaptive notes: {str(e)}")
            raise

    def generate_adaptive_qna(self, notes: str, student_type: str, question: str) -> Dict:
        """Generate Q&A response with caching and validation."""
        start_time = time.time()
        self._request_count += 1
        
        try:
            # Validate inputs
            notes = validate_input(notes, "'notes'", MAX_TEXT_LENGTH, MIN_TEXT_LENGTH)
            question = validate_input(question, "'question'", MAX_QUESTION_LENGTH, MIN_TEXT_LENGTH)
            student_type = _normalize_student_type(student_type)
            
            # Check cache first
            cache_key = _get_cache_key("qna", student_type=student_type, notes=notes, question=question)
            cached_response = _get_cached_response(cache_key)
            if cached_response:
                self._cache_hits += 1
                logger.info(f"Returning cached response for Q&A request")
                return cached_response
            
            # Generate new response
            prompt = self._qna_prompt(notes, student_type, question)
            raw = self._generate_with_fallback(prompt)
            data = _safe_json_extract(raw)
            
            # Ensure standard fields
            data.setdefault("studentType", student_type)
            data.setdefault("tips", "")
            data.setdefault("steps", "")
            if "answer" not in data:
                data["answer"] = raw
            
            # Add metadata
            data["_metadata"] = {
                "generated_at": datetime.utcnow().isoformat(),
                "processing_time": round(time.time() - start_time, 2),
                "model": self.model
            }
            
            # Cache the response
            _set_cached_response(cache_key, data)
            
            elapsed_time = time.time() - start_time
            logger.info(f"Q&A generated successfully in {elapsed_time:.2f}s for student type: {student_type}")
            
            return data
            
        except Exception as e:
            self._error_count += 1
            logger.error(f"Error generating Q&A response: {str(e)}")
            raise
    
    def get_stats(self) -> Dict:
        """Get service statistics."""
        return {
            "total_requests": self._request_count,
            "total_errors": self._error_count,
            "cache_hits": self._cache_hits,
            "cache_size": len(_response_cache),
            "error_rate": round(self._error_count / max(1, self._request_count), 3)
        }
    
    def health_check(self) -> Dict:
        """Check if the service is healthy and API keys are valid."""
        try:
            keys = _load_api_keys()
            if not keys:
                return {
                    "status": "unhealthy",
                    "error": "No API keys configured",
                    "available_keys": 0
                }
            
            # Try to probe imports
            self._probe_imports()
            
            return {
                "status": "healthy",
                "available_keys": len(keys),
                "has_google_genai": self._has_google_genai,
                "has_google_generativeai": self._has_google_generativeai,
                "stats": self.get_stats()
            }
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {
                "status": "unhealthy",
                "error": str(e)
            }
