from __future__ import annotations

import uuid
import logging
from flask import Blueprint, jsonify, request
from functools import wraps
from time import time

from ..services.ai_service import GeminiService

# Configure logging
logger = logging.getLogger(__name__)

ai_bp = Blueprint("ai", __name__)

_ALLOWED_TYPES = {"vision", "hearing", "speech", "dyslexie", "dyslexia"}

# Initialize service as a singleton
_service_instance = None

def get_service():
    """Get or create the GeminiService singleton instance."""
    global _service_instance
    if _service_instance is None:
        _service_instance = GeminiService()
    return _service_instance


def track_request(f):
    """Decorator to track request timing and add request ID."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        request_id = str(uuid.uuid4())[:8]
        start_time = time()
        
        # Log request
        logger.info(f"[{request_id}] Processing {request.method} {request.path}")
        
        try:
            # Execute the actual function
            response = f(*args, **kwargs)
            
            # Add request metadata to successful responses
            if isinstance(response, tuple):
                data, status_code = response
                if status_code == 200 and isinstance(data.json, dict):
                    response_data = data.json
                    if "_metadata" not in response_data:
                        response_data["_metadata"] = {}
                    response_data["_metadata"]["request_id"] = request_id
                    response_data["_metadata"]["total_time"] = round(time() - start_time, 2)
            
            elapsed = time() - start_time
            logger.info(f"[{request_id}] Completed in {elapsed:.2f}s with status {response[1] if isinstance(response, tuple) else 200}")
            
            return response
            
        except Exception as e:
            elapsed = time() - start_time
            logger.error(f"[{request_id}] Failed after {elapsed:.2f}s: {str(e)}")
            raise
    
    return decorated_function


@ai_bp.post("/ai")  # POST /api/ai
@track_request
def ai_route():
    """
    AI endpoint for adaptive content generation.
    
    Body (JSON):
      - mode: "notes" | "qna"
      - studentType: "vision" | "hearing" | "speech" | "dyslexie" | "dyslexia"
      - For notes mode:
          { "mode": "notes", "studentType": "...", "text": "..." }
      - For qna mode:
          { "mode": "qna", "studentType": "...", "notes": "...", "question": "..." }
    
    Returns:
      - 200: Success with adapted content
      - 400: Invalid request parameters
      - 503: Service unavailable (API keys issue)
      - 500: Internal server error
    """
    try:
        data = request.get_json(force=True) or {}
    except Exception as e:
        logger.warning(f"Invalid JSON in request: {str(e)}")
        return jsonify({
            "error": "Invalid JSON in request body",
            "error_code": "INVALID_JSON"
        }), 400

    mode = (data.get("mode") or "").strip().lower()
    student_type = (data.get("studentType") or data.get("student_type") or "").strip().lower()

    # Validate mode
    if mode not in {"notes", "qna"}:
        return jsonify({
            "error": "Invalid 'mode'. Must be 'notes' or 'qna'.",
            "error_code": "INVALID_MODE",
            "allowed_modes": ["notes", "qna"]
        }), 400

    # Validate student type
    if not student_type:
        return jsonify({
            "error": "'studentType' is required",
            "error_code": "MISSING_STUDENT_TYPE"
        }), 400

    if student_type not in _ALLOWED_TYPES:
        return jsonify({
            "error": "Invalid 'studentType'",
            "error_code": "INVALID_STUDENT_TYPE",
            "allowed_types": ["vision", "hearing", "speech", "dyslexie", "dyslexia"]
        }), 400

    service = get_service()

    try:
        if mode == "notes":
            text = (data.get("text") or "").strip()
            if not text:
                return jsonify({
                    "error": "'text' is required for notes mode",
                    "error_code": "MISSING_TEXT"
                }), 400
            
            result = service.generate_adaptive_notes(text=text, student_type=student_type)
            return jsonify(result), 200

        # mode == "qna"
        notes = (data.get("notes") or "").strip()
        question = (data.get("question") or "").strip()
        
        if not notes:
            return jsonify({
                "error": "'notes' is required for qna mode",
                "error_code": "MISSING_NOTES"
            }), 400
        if not question:
            return jsonify({
                "error": "'question' is required for qna mode",
                "error_code": "MISSING_QUESTION"
            }), 400

        result = service.generate_adaptive_qna(
            notes=notes, 
            student_type=student_type, 
            question=question
        )
        return jsonify(result), 200

    except ValueError as ve:
        # Validation or prompt construction issues
        logger.warning(f"Validation error: {str(ve)}")
        return jsonify({
            "error": str(ve),
            "error_code": "VALIDATION_ERROR"
        }), 400
    except RuntimeError as re:
        # Likely all keys failed or client not installed
        logger.error(f"Service error: {str(re)}")
        return jsonify({
            "error": str(re),
            "error_code": "SERVICE_UNAVAILABLE"
        }), 503
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return jsonify({
            "error": f"Server error: {str(e)}",
            "error_code": "INTERNAL_ERROR"
        }), 500


@ai_bp.get("/ai/health")  # GET /api/ai/health
def health_check():
    """
    Health check endpoint for the AI service.
    
    Returns:
      - Service status
      - Available API keys count
      - Service statistics
      - Package availability
    """
    try:
        service = get_service()
        health_data = service.health_check()
        
        # Add additional system info
        health_data["endpoint"] = "/api/ai"
        health_data["supported_modes"] = ["notes", "qna"]
        health_data["supported_student_types"] = list(_ALLOWED_TYPES)
        
        status_code = 200 if health_data.get("status") == "healthy" else 503
        return jsonify(health_data), status_code
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 503


@ai_bp.get("/ai/stats")  # GET /api/ai/stats
def get_stats():
    """
    Get service statistics.
    
    Returns:
      - Total requests processed
      - Cache statistics
      - Error rates
    """
    try:
        service = get_service()
        stats = service.get_stats()
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f"Failed to get stats: {str(e)}")
        return jsonify({
            "error": "Failed to retrieve statistics",
            "error_code": "STATS_ERROR"
        }), 500
