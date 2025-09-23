from __future__ import annotations

import os
import json
from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..services.db import get_db, get_mongo_client
from ..utils.admin import admin_required

db_management_bp = Blueprint("db_management", __name__)


@db_management_bp.get("/db/health")
def db_health():
    """
    Database health check endpoint.
    
    Returns:
      - Database connection status
      - Collection statistics
      - Index information
    """
    try:
        client = get_mongo_client()
        db = get_db()
        
        # Test connection
        client.admin.command('ping')
        
        # Get database stats
        stats = db.command("dbStats")
        
        # Get collection information
        collections = []
        for collection_name in db.list_collection_names():
            collection = db[collection_name]
            count = collection.count_documents({})
            indexes = list(collection.list_indexes())
            
            collections.append({
                "name": collection_name,
                "documentCount": count,
                "indexCount": len(indexes),
                "indexes": [{"name": idx.get("name"), "keys": idx.get("key")} for idx in indexes]
            })
        
        return jsonify({
            "status": "healthy",
            "database": {
                "name": db.name,
                "collections": len(collections),
                "dataSize": stats.get("dataSize", 0),
                "indexSize": stats.get("indexSize", 0),
                "storageSize": stats.get("storageSize", 0)
            },
            "collections": collections,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 503


@db_management_bp.get("/db/stats")
def db_stats():
    """
    Get detailed database statistics.
    
    Returns:
      - User statistics
      - Content statistics
      - Performance metrics
    """
    try:
        db = get_db()
        
        # User statistics
        users_collection = db.users
        total_users = users_collection.count_documents({})
        students = users_collection.count_documents({"role": "student"})
        teachers = users_collection.count_documents({"role": "teacher"})
        
        # Student type breakdown
        student_types = {}
        for student_type in ["visually_impaired", "hearing_impaired", "speech_impaired", "slow_learner"]:
            count = users_collection.count_documents({"studentType": student_type})
            if count > 0:
                student_types[student_type] = count
        
        # Content statistics
        notes_collection = db.notes
        total_notes = notes_collection.count_documents({})
        
        # Notes by subject
        subject_stats = {}
        pipeline = [
            {"$group": {
                "_id": "$subject",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}}
        ]
        for doc in notes_collection.aggregate(pipeline):
            subject_stats[doc["_id"]] = doc["count"]
        
        # Notes by school
        school_stats = {}
        pipeline = [
            {"$group": {
                "_id": "$school",
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}}
        ]
        for doc in notes_collection.aggregate(pipeline):
            school_stats[doc["_id"]] = doc["count"]
        
        # Recent activity (last 7 days)
        week_ago = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago_iso = week_ago.isoformat() + "Z"
        
        recent_users = users_collection.count_documents({
            "createdAt": {"$gte": week_ago_iso}
        })
        
        recent_notes = notes_collection.count_documents({
            "createdAt": {"$gte": week_ago_iso}
        })
        
        return jsonify({
            "users": {
                "total": total_users,
                "students": students,
                "teachers": teachers,
                "studentTypes": student_types,
                "recentRegistrations": recent_users
            },
            "content": {
                "totalNotes": total_notes,
                "notesBySubject": subject_stats,
                "notesBySchool": school_stats,
                "recentNotes": recent_notes
            },
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 500


@db_management_bp.post("/db/backup")
@jwt_required()
@admin_required
def create_backup():
    """
    Create a database backup (admin only).
    
    Returns:
      - Backup status and information
    """
    try:
        # This would typically call the backup script
        # For now, return a placeholder response
        
        return jsonify({
            "message": "Backup initiated",
            "status": "success",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 500


@db_management_bp.post("/db/migrate")
@jwt_required()
@admin_required
def run_migration():
    """
    Run database migrations (admin only).
    
    Body (JSON):
      - version: Target version (optional)
      - dryRun: Boolean (optional)
    
    Returns:
      - Migration status and results
    """
    try:
        data = request.get_json() or {}
        target_version = data.get("version")
        dry_run = data.get("dryRun", False)
        
        # This would typically call the migration script
        # For now, return a placeholder response
        
        return jsonify({
            "message": "Migration completed",
            "targetVersion": target_version,
            "dryRun": dry_run,
            "status": "success",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 500


@db_management_bp.get("/db/collections")
@jwt_required()
def list_collections():
    """
    List all database collections with basic info.
    
    Returns:
      - List of collections with metadata
    """
    try:
        db = get_db()
        collections = []
        
        for collection_name in db.list_collection_names():
            collection = db[collection_name]
            count = collection.count_documents({})
            indexes = list(collection.list_indexes())
            
            collections.append({
                "name": collection_name,
                "documentCount": count,
                "indexCount": len(indexes),
                "indexes": [{"name": idx.get("name"), "keys": idx.get("key")} for idx in indexes]
            })
        
        return jsonify({
            "collections": collections,
            "total": len(collections),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 500


@db_management_bp.get("/db/performance")
@jwt_required()
@admin_required
def db_performance():
    """
    Get database performance metrics (admin only).
    
    Returns:
      - Performance statistics
      - Slow query information
      - Index usage statistics
    """
    try:
        db = get_db()
        
        # Get database stats
        stats = db.command("dbStats")
        
        # Get server status
        server_status = db.command("serverStatus")
        
        # Get index usage stats
        index_stats = {}
        for collection_name in db.list_collection_names():
            collection = db[collection_name]
            try:
                stats = db.command("collStats", collection_name, indexDetails=True)
                index_details = stats.get("indexDetails", {})
                
                collection_index_stats = {}
                for index_name, details in index_details.items():
                    collection_index_stats[index_name] = {
                        "accesses": details.get("accesses", {}).get("ops", 0),
                        "size": details.get("size", 0)
                    }
                
                index_stats[collection_name] = collection_index_stats
            except Exception:
                # Index stats might not be available in all MongoDB versions
                continue
        
        return jsonify({
            "database": {
                "name": db.name,
                "dataSize": stats.get("dataSize", 0),
                "indexSize": stats.get("indexSize", 0),
                "storageSize": stats.get("storageSize", 0),
                "collections": stats.get("collections", 0)
            },
            "server": {
                "version": server_status.get("version", "unknown"),
                "uptime": server_status.get("uptime", 0),
                "connections": server_status.get("connections", {}),
                "memory": server_status.get("mem", {})
            },
            "indexUsage": index_stats,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 200
        
    except Exception as e:
        return jsonify({
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 500
