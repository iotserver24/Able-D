#!/usr/bin/env python3
"""
Database Cleanup Script

This script cleans up old data, expired sessions, and unused records.
Usage:
    python scripts/cleanup_database.py [--days DAYS] [--dry-run] [--aggressive]
"""

import sys
import os
import argparse
from datetime import datetime, timedelta

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.services.db import get_db


def cleanup_old_sessions(db, days=30, dry_run=False):
    """Clean up old user sessions."""
    print(f"🧹 Cleaning up sessions older than {days} days...")
    
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Find old sessions
        sessions_collection = db.sessions
        old_sessions = sessions_collection.find({
            "lastAccessed": {"$lt": cutoff_date.isoformat() + "Z"}
        })
        
        count = sessions_collection.count_documents({
            "lastAccessed": {"$lt": cutoff_date.isoformat() + "Z"}
        })
        
        if count == 0:
            print("   ✅ No old sessions found")
            return 0
        
        if dry_run:
            print(f"   🔍 Would delete {count} old sessions")
            return count
        
        # Delete old sessions
        result = sessions_collection.delete_many({
            "lastAccessed": {"$lt": cutoff_date.isoformat() + "Z"}
        })
        
        print(f"   ✅ Deleted {result.deleted_count} old sessions")
        return result.deleted_count
        
    except Exception as e:
        print(f"   ❌ Failed to cleanup sessions: {e}")
        return 0


def cleanup_orphaned_notes(db, dry_run=False):
    """Clean up notes that reference non-existent users."""
    print("🧹 Cleaning up orphaned notes...")
    
    try:
        notes_collection = db.notes
        users_collection = db.users
        
        # Find notes with invalid uploadedBy references
        all_notes = notes_collection.find({}, {"_id": 1, "uploadedBy": 1})
        
        orphaned_count = 0
        orphaned_ids = []
        
        for note in all_notes:
            uploaded_by = note.get("uploadedBy")
            if uploaded_by:
                # Check if user exists
                user_exists = users_collection.find_one({
                    "$or": [
                        {"_id": uploaded_by},
                        {"anonymousId": uploaded_by},
                        {"email": uploaded_by}
                    ]
                })
                
                if not user_exists:
                    orphaned_ids.append(note["_id"])
                    orphaned_count += 1
        
        if orphaned_count == 0:
            print("   ✅ No orphaned notes found")
            return 0
        
        if dry_run:
            print(f"   🔍 Would delete {orphaned_count} orphaned notes")
            return orphaned_count
        
        # Delete orphaned notes
        if orphaned_ids:
            result = notes_collection.delete_many({
                "_id": {"$in": orphaned_ids}
            })
            print(f"   ✅ Deleted {result.deleted_count} orphaned notes")
            return result.deleted_count
        
        return 0
        
    except Exception as e:
        print(f"   ❌ Failed to cleanup orphaned notes: {e}")
        return 0


def cleanup_duplicate_users(db, dry_run=False):
    """Clean up duplicate user accounts."""
    print("🧹 Cleaning up duplicate users...")
    
    try:
        users_collection = db.users
        
        # Find duplicate emails
        pipeline = [
            {"$match": {"email": {"$exists": True, "$ne": None}}},
            {"$group": {
                "_id": "$email",
                "count": {"$sum": 1},
                "docs": {"$push": "$_id"}
            }},
            {"$match": {"count": {"$gt": 1}}}
        ]
        
        duplicates = list(users_collection.aggregate(pipeline))
        
        if not duplicates:
            print("   ✅ No duplicate users found")
            return 0
        
        total_duplicates = sum(dup["count"] - 1 for dup in duplicates)
        
        if dry_run:
            print(f"   🔍 Would remove {total_duplicates} duplicate users")
            for dup in duplicates:
                print(f"      Email: {dup['_id']} - {dup['count']} duplicates")
            return total_duplicates
        
        # Remove duplicates (keep the oldest one)
        removed_count = 0
        for dup in duplicates:
            email = dup["_id"]
            doc_ids = dup["docs"]
            
            # Sort by creation date and keep the first one
            users_with_email = list(users_collection.find(
                {"email": email},
                {"_id": 1, "createdAt": 1}
            ).sort("createdAt", 1))
            
            if len(users_with_email) > 1:
                # Keep the first (oldest), delete the rest
                keep_id = users_with_email[0]["_id"]
                delete_ids = [doc["_id"] for doc in users_with_email[1:]]
                
                result = users_collection.delete_many({
                    "_id": {"$in": delete_ids}
                })
                removed_count += result.deleted_count
        
        print(f"   ✅ Removed {removed_count} duplicate users")
        return removed_count
        
    except Exception as e:
        print(f"   ❌ Failed to cleanup duplicate users: {e}")
        return 0


def cleanup_empty_collections(db, dry_run=False):
    """Clean up empty collections."""
    print("🧹 Cleaning up empty collections...")
    
    try:
        collections = db.list_collection_names()
        empty_collections = []
        
        for collection_name in collections:
            collection = db[collection_name]
            count = collection.count_documents({})
            
            if count == 0:
                empty_collections.append(collection_name)
        
        if not empty_collections:
            print("   ✅ No empty collections found")
            return 0
        
        if dry_run:
            print(f"   🔍 Would drop {len(empty_collections)} empty collections")
            for name in empty_collections:
                print(f"      {name}")
            return len(empty_collections)
        
        # Drop empty collections (except system collections)
        dropped_count = 0
        for collection_name in empty_collections:
            if not collection_name.startswith('system.'):
                db.drop_collection(collection_name)
                dropped_count += 1
                print(f"   ✅ Dropped empty collection: {collection_name}")
        
        return dropped_count
        
    except Exception as e:
        print(f"   ❌ Failed to cleanup empty collections: {e}")
        return 0


def optimize_indexes(db, dry_run=False):
    """Optimize database indexes."""
    print("🔧 Optimizing database indexes...")
    
    try:
        collections = db.list_collection_names()
        optimized_count = 0
        
        for collection_name in collections:
            collection = db[collection_name]
            
            # Get index statistics
            indexes = list(collection.list_indexes())
            
            for index in indexes:
                index_name = index.get("name", "unknown")
                
                # Skip system indexes
                if index_name.startswith("_id_"):
                    continue
                
                try:
                    # Get index statistics
                    stats = db.command("collStats", collection_name, indexDetails=True)
                    index_stats = stats.get("indexDetails", {}).get(index_name, {})
                    
                    # Check if index is unused
                    if index_stats.get("accesses", {}).get("ops", 0) == 0:
                        if dry_run:
                            print(f"   🔍 Would drop unused index: {collection_name}.{index_name}")
                        else:
                            collection.drop_index(index_name)
                            print(f"   ✅ Dropped unused index: {collection_name}.{index_name}")
                        optimized_count += 1
                
                except Exception as e:
                    # Index stats might not be available in all MongoDB versions
                    continue
        
        if optimized_count == 0:
            print("   ✅ No unused indexes found")
        
        return optimized_count
        
    except Exception as e:
        print(f"   ❌ Failed to optimize indexes: {e}")
        return 0


def cleanup_database(days=30, dry_run=False, aggressive=False):
    """Run database cleanup operations."""
    print("🧹 Database Cleanup Tool")
    print("=" * 50)
    
    if dry_run:
        print("🔍 DRY RUN MODE - No changes will be made")
        print("-" * 50)
    
    try:
        # Create Flask app context
        app = create_app()
        
        with app.app_context():
            db = get_db()
            
            total_cleaned = 0
            
            # Standard cleanup operations
            print("1. Cleaning up old sessions...")
            total_cleaned += cleanup_old_sessions(db, days, dry_run)
            
            print("2. Cleaning up orphaned notes...")
            total_cleaned += cleanup_orphaned_notes(db, dry_run)
            
            print("3. Cleaning up duplicate users...")
            total_cleaned += cleanup_duplicate_users(db, dry_run)
            
            print("4. Optimizing indexes...")
            total_cleaned += optimize_indexes(db, dry_run)
            
            # Aggressive cleanup operations
            if aggressive:
                print("5. Cleaning up empty collections...")
                total_cleaned += cleanup_empty_collections(db, dry_run)
            
            print(f"\n✅ Cleanup completed!")
            print(f"   📊 Total items cleaned: {total_cleaned}")
            
            if dry_run:
                print("   🔍 This was a dry run - no actual changes were made")
                print("   💡 Run without --dry-run to apply changes")
            
            return True
            
    except Exception as e:
        print(f"\n❌ Cleanup failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description='Database cleanup tool')
    parser.add_argument('--days', '-d', type=int, default=30,
                       help='Days threshold for cleaning old data (default: 30)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be cleaned without making changes')
    parser.add_argument('--aggressive', '-a', action='store_true',
                       help='Run aggressive cleanup (includes empty collections)')
    
    args = parser.parse_args()
    
    success = cleanup_database(
        days=args.days,
        dry_run=args.dry_run,
        aggressive=args.aggressive
    )
    
    if not success:
        print("\n💡 Troubleshooting tips:")
        print("   1. Check database connection")
        print("   2. Verify user permissions")
        print("   3. Review error messages above")
        print("   4. Try running with --dry-run first")
        
        sys.exit(1)
    else:
        print("\n🚀 Cleanup completed successfully!")
        sys.exit(0)


if __name__ == "__main__":
    main()
