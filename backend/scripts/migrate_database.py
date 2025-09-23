#!/usr/bin/env python3
"""
Database Migration Script

This script handles database schema migrations and updates.
Usage:
    python scripts/migrate_database.py [--version VERSION] [--dry-run]
"""

import sys
import os
import argparse
from datetime import datetime
from typing import Dict, List, Callable

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.services.db import get_db


class DatabaseMigration:
    """Database migration manager."""
    
    def __init__(self):
        self.migrations: Dict[str, Callable] = {}
        self.current_version = "0.0.0"
        self.target_version = "1.0.0"
        
        # Register migrations
        self._register_migrations()
    
    def _register_migrations(self):
        """Register all available migrations."""
        
        # Migration 1.0.0: Initial schema setup
        self.migrations["1.0.0"] = self._migration_1_0_0
        
        # Migration 1.1.0: Add user preferences
        self.migrations["1.1.0"] = self._migration_1_1_0
        
        # Migration 1.2.0: Add audit logs
        self.migrations["1.2.0"] = self._migration_1_2_0
    
    def _migration_1_0_0(self, db):
        """Initial schema setup migration."""
        print("   🔧 Running migration 1.0.0: Initial schema setup...")
        
        # Ensure all required indexes exist
        from app.services.auth_service import ensure_indexes as ensure_user_indexes
        from app.services.subject_service import ensure_indexes as ensure_subject_indexes
        from app.services.notes_service import ensure_indexes as ensure_notes_indexes
        
        ensure_user_indexes()
        ensure_subject_indexes()
        ensure_notes_indexes()
        
        print("   ✅ Initial schema setup completed")
    
    def _migration_1_1_0(self, db):
        """Add user preferences migration."""
        print("   🔧 Running migration 1.1.0: Add user preferences...")
        
        # Add preferences field to users collection
        users_collection = db.users
        
        # Add preferences field to existing users
        users_collection.update_many(
            {"preferences": {"$exists": False}},
            {"$set": {"preferences": {
                "theme": "light",
                "fontSize": "medium",
                "language": "en",
                "accessibility": {
                    "highContrast": False,
                    "screenReader": False,
                    "keyboardNavigation": False
                }
            }}}
        )
        
        # Create index on preferences
        users_collection.create_index("preferences.theme")
        
        print("   ✅ User preferences added")
    
    def _migration_1_2_0(self, db):
        """Add audit logs migration."""
        print("   🔧 Running migration 1.2.0: Add audit logs...")
        
        # Create audit_logs collection
        audit_logs = db.audit_logs
        
        # Create indexes for audit logs
        audit_logs.create_index([("userId", 1), ("action", 1), ("timestamp", -1)])
        audit_logs.create_index("timestamp", expireAfterSeconds=31536000)  # 1 year TTL
        
        # Add audit fields to existing collections
        collections_to_audit = ['users', 'subjects', 'notes']
        
        for collection_name in collections_to_audit:
            collection = db[collection_name]
            
            # Add audit fields to existing documents
            collection.update_many(
                {"createdBy": {"$exists": False}},
                {"$set": {
                    "createdBy": "system",
                    "lastModifiedBy": "system",
                    "lastModifiedAt": datetime.utcnow().isoformat() + "Z"
                }}
            )
        
        print("   ✅ Audit logs setup completed")
    
    def get_current_version(self, db):
        """Get current database version."""
        try:
            version_collection = db.migrations
            version_doc = version_collection.find_one({"type": "schema_version"})
            
            if version_doc:
                return version_doc.get("version", "0.0.0")
            else:
                return "0.0.0"
        except Exception:
            return "0.0.0"
    
    def set_version(self, db, version):
        """Set database version."""
        try:
            version_collection = db.migrations
            version_collection.update_one(
                {"type": "schema_version"},
                {"$set": {
                    "version": version,
                    "updatedAt": datetime.utcnow().isoformat() + "Z"
                }},
                upsert=True
            )
        except Exception as e:
            print(f"   ⚠️  Failed to update version: {e}")
    
    def get_migration_plan(self, current_version, target_version):
        """Get migration plan from current to target version."""
        versions = sorted(self.migrations.keys())
        
        current_index = versions.index(current_version) if current_version in versions else -1
        target_index = versions.index(target_version) if target_version in versions else len(versions)
        
        if current_index >= target_index:
            return []
        
        return versions[current_index + 1:target_index + 1]
    
    def run_migrations(self, db, target_version=None, dry_run=False):
        """Run database migrations."""
        current_version = self.get_current_version(db)
        
        if target_version is None:
            target_version = self.target_version
        
        print(f"📊 Current database version: {current_version}")
        print(f"🎯 Target version: {target_version}")
        
        if current_version == target_version:
            print("✅ Database is already up to date")
            return True
        
        migration_plan = self.get_migration_plan(current_version, target_version)
        
        if not migration_plan:
            print("❌ No migrations to run")
            return False
        
        print(f"📋 Migration plan: {', '.join(migration_plan)}")
        
        if dry_run:
            print("🔍 Dry run mode - no changes will be made")
            return True
        
        print("🚀 Starting migrations...")
        print("=" * 50)
        
        try:
            for version in migration_plan:
                print(f"🔄 Migrating to version {version}...")
                
                if version in self.migrations:
                    migration_func = self.migrations[version]
                    migration_func(db)
                    
                    # Update version
                    self.set_version(db, version)
                    print(f"   ✅ Migration {version} completed")
                else:
                    print(f"   ❌ Migration {version} not found")
                    return False
            
            print(f"\n🎉 All migrations completed successfully!")
            print(f"✅ Database version: {target_version}")
            
            return True
            
        except Exception as e:
            print(f"\n❌ Migration failed: {e}")
            return False


def run_migrations(target_version=None, dry_run=False):
    """Run database migrations."""
    print("🔄 Database Migration Tool")
    print("=" * 50)
    
    try:
        # Create Flask app context
        app = create_app()
        
        with app.app_context():
            db = get_db()
            
            migration_manager = DatabaseMigration()
            success = migration_manager.run_migrations(db, target_version, dry_run)
            
            return success
            
    except Exception as e:
        print(f"\n❌ Migration tool failed: {e}")
        return False


def list_available_migrations():
    """List all available migrations."""
    print("📋 Available Migrations")
    print("=" * 50)
    
    migration_manager = DatabaseMigration()
    
    for version, migration_func in migration_manager.migrations.items():
        print(f"   {version}: {migration_func.__name__}")
    
    print(f"\n🎯 Latest version: {migration_manager.target_version}")


def main():
    parser = argparse.ArgumentParser(description='Database migration tool')
    parser.add_argument('--version', '-v', 
                       help='Target version to migrate to')
    parser.add_argument('--dry-run', '-d', action='store_true',
                       help='Show what would be migrated without making changes')
    parser.add_argument('--list', '-l', action='store_true',
                       help='List available migrations')
    
    args = parser.parse_args()
    
    if args.list:
        list_available_migrations()
        return
    
    success = run_migrations(
        target_version=args.version,
        dry_run=args.dry_run
    )
    
    if not success:
        print("\n💡 Troubleshooting tips:")
        print("   1. Check database connection")
        print("   2. Verify user permissions")
        print("   3. Review error messages above")
        print("   4. Consider running with --dry-run first")
        
        sys.exit(1)
    else:
        print("\n🚀 Migration completed successfully!")
        sys.exit(0)


if __name__ == "__main__":
    main()
