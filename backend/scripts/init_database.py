#!/usr/bin/env python3
"""
Database Initialization Script

This script initializes the database with required indexes and default data.
Usage:
    python scripts/init_database.py [--sample-data] [--force]
"""

import sys
import os
import argparse
from datetime import datetime

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.services.db import get_db
from app.services.auth_service import ensure_indexes as ensure_user_indexes
from app.services.subject_service import ensure_indexes as ensure_subject_indexes, default_subjects
from app.services.notes_service import ensure_indexes as ensure_notes_indexes


def create_default_data(force=False):
    """Create default data in the database."""
    print("📝 Creating default data...")
    
    db = get_db()
    
    # Create default subjects
    subjects_collection = db.subjects
    existing_subjects = subjects_collection.count_documents({})
    
    if existing_subjects > 0 and not force:
        print(f"   ⚠️  Subjects collection already has {existing_subjects} documents")
        print("   💡 Use --force to recreate default subjects")
        return
    
    # Insert default subjects
    default_subjects_data = default_subjects()
    for subject in default_subjects_data:
        subject["createdAt"] = datetime.utcnow().isoformat() + "Z"
        subject["addedBy"] = "system"
    
    try:
        subjects_collection.insert_many(default_subjects_data)
        print(f"   ✅ Created {len(default_subjects_data)} default subjects")
    except Exception as e:
        print(f"   ❌ Failed to create default subjects: {e}")


def create_sample_data():
    """Create sample data for testing."""
    print("🎭 Creating sample data...")
    
    db = get_db()
    
    # Sample users
    sample_users = [
        {
            "role": "student",
            "studentType": "visually_impaired",
            "name": "John Doe",
            "email": "john.doe@example.com",
            "class": "Grade 10",
            "subject": "Science",
            "school": "Sample High School",
            "anonymousId": "sample_student_001",
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.utcnow().isoformat() + "Z"
        },
        {
            "role": "teacher",
            "name": "Jane Smith",
            "email": "jane.smith@example.com",
            "school": "Sample High School",
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.utcnow().isoformat() + "Z"
        }
    ]
    
    # Sample notes
    sample_notes = [
        {
            "school": "Sample High School",
            "class": "Grade 10",
            "subject": "Science",
            "topic": "Photosynthesis",
            "text": "Photosynthesis is the process by which plants convert light energy into chemical energy. This process occurs in the chloroplasts of plant cells and involves several key steps...",
            "uploadedBy": "sample_teacher_001",
            "sourceType": "manual",
            "originalFilename": "photosynthesis_notes.txt",
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.utcnow().isoformat() + "Z"
        },
        {
            "school": "Sample High School",
            "class": "Grade 10",
            "subject": "English",
            "topic": "Grammar Rules",
            "text": "Basic grammar rules for effective communication: 1. Subject-verb agreement 2. Proper punctuation 3. Sentence structure...",
            "uploadedBy": "sample_teacher_001",
            "sourceType": "manual",
            "originalFilename": "grammar_rules.txt",
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.utcnow().isoformat() + "Z"
        }
    ]
    
    try:
        # Insert sample users (only if collection is empty)
        users_collection = db.users
        if users_collection.count_documents({}) == 0:
            users_collection.insert_many(sample_users)
            print(f"   ✅ Created {len(sample_users)} sample users")
        else:
            print("   ⚠️  Users collection not empty, skipping sample users")
        
        # Insert sample notes
        notes_collection = db.notes
        notes_collection.insert_many(sample_notes)
        print(f"   ✅ Created {len(sample_notes)} sample notes")
        
    except Exception as e:
        print(f"   ❌ Failed to create sample data: {e}")


def initialize_database(sample_data=False, force=False):
    """Initialize the database with indexes and default data."""
    print("🚀 Initializing Database...")
    print("=" * 50)
    
    try:
        # Create Flask app context
        app = create_app()
        
        with app.app_context():
            # Step 1: Create indexes
            print("1. Creating database indexes...")
            try:
                ensure_user_indexes()
                print("   ✅ User indexes created")
                
                ensure_subject_indexes()
                print("   ✅ Subject indexes created")
                
                ensure_notes_indexes()
                print("   ✅ Notes indexes created")
                
            except Exception as e:
                print(f"   ❌ Index creation failed: {e}")
                return False
            
            # Step 2: Create default data
            print("2. Creating default data...")
            try:
                create_default_data(force=force)
            except Exception as e:
                print(f"   ❌ Default data creation failed: {e}")
                return False
            
            # Step 3: Create sample data (if requested)
            if sample_data:
                print("3. Creating sample data...")
                try:
                    create_sample_data()
                except Exception as e:
                    print(f"   ❌ Sample data creation failed: {e}")
                    return False
            
            # Step 4: Verify initialization
            print("4. Verifying initialization...")
            try:
                db = get_db()
                
                # Check collections exist
                collections = db.list_collection_names()
                required_collections = ['users', 'subjects', 'notes']
                
                for collection_name in required_collections:
                    if collection_name in collections:
                        count = db[collection_name].count_documents({})
                        print(f"   ✅ {collection_name}: {count} documents")
                    else:
                        print(f"   ❌ {collection_name}: collection not found")
                        return False
                
                # Check indexes
                for collection_name in required_collections:
                    collection = db[collection_name]
                    indexes = list(collection.list_indexes())
                    print(f"   📋 {collection_name}: {len(indexes)} indexes")
                
            except Exception as e:
                print(f"   ❌ Verification failed: {e}")
                return False
            
            print("\n🎉 Database initialization completed successfully!")
            print("✅ Database is ready for use")
            
            return True
            
    except Exception as e:
        print(f"\n❌ Database initialization failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description='Initialize database with indexes and default data')
    parser.add_argument('--sample-data', action='store_true', 
                       help='Create sample data for testing')
    parser.add_argument('--force', action='store_true', 
                       help='Force recreation of default data')
    
    args = parser.parse_args()
    
    success = initialize_database(
        sample_data=args.sample_data,
        force=args.force
    )
    
    if not success:
        print("\n💡 Troubleshooting tips:")
        print("   1. Check your MONGO_URI in backend/.env")
        print("   2. Verify MongoDB server is running")
        print("   3. Check user permissions")
        print("   4. Review error messages above")
        
        sys.exit(1)
    else:
        print("\n🚀 Database initialization complete!")
        print("💡 You can now start using the database")
        sys.exit(0)


if __name__ == "__main__":
    main()
