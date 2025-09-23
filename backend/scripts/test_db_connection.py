#!/usr/bin/env python3
"""
Database Connection Test Script

This script tests the database connectivity and basic operations.
Usage:
    python scripts/test_db_connection.py [--verbose]
"""

import sys
import os
import argparse
from datetime import datetime

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.services.db import get_mongo_client, get_db
from app.services.auth_service import ensure_indexes as ensure_user_indexes
from app.services.subject_service import ensure_indexes as ensure_subject_indexes
from app.services.notes_service import ensure_indexes as ensure_notes_indexes


def test_connection(verbose=False):
    """Test database connection and basic operations."""
    print("🔍 Testing Database Connection...")
    print("=" * 50)
    
    try:
        # Create Flask app context
        app = create_app()
        
        with app.app_context():
            # Test 1: Basic Connection
            print("1. Testing basic MongoDB connection...")
            try:
                client = get_mongo_client()
                # Test connection by pinging
                client.admin.command('ping')
                print("   ✅ MongoDB connection successful")
                
                if verbose:
                    server_info = client.server_info()
                    print(f"   📊 MongoDB version: {server_info.get('version', 'Unknown')}")
                    print(f"   🏷️  Server type: {server_info.get('gitVersion', 'Unknown')}")
                
            except Exception as e:
                print(f"   ❌ MongoDB connection failed: {e}")
                return False
            
            # Test 2: Database Access
            print("2. Testing database access...")
            try:
                db = get_db()
                db_name = db.name
                print(f"   ✅ Database access successful: {db_name}")
                
                if verbose:
                    stats = db.command("dbStats")
                    print(f"   📊 Collections: {stats.get('collections', 0)}")
                    print(f"   💾 Data size: {stats.get('dataSize', 0)} bytes")
                    print(f"   📈 Index size: {stats.get('indexSize', 0)} bytes")
                
            except Exception as e:
                print(f"   ❌ Database access failed: {e}")
                return False
            
            # Test 3: Collection Operations
            print("3. Testing collection operations...")
            try:
                # Test users collection
                users_collection = db.users
                user_count = users_collection.count_documents({})
                print(f"   ✅ Users collection: {user_count} documents")
                
                # Test subjects collection
                subjects_collection = db.subjects
                subject_count = subjects_collection.count_documents({})
                print(f"   ✅ Subjects collection: {subject_count} documents")
                
                # Test notes collection
                notes_collection = db.notes
                notes_count = notes_collection.count_documents({})
                print(f"   ✅ Notes collection: {notes_count} documents")
                
            except Exception as e:
                print(f"   ❌ Collection operations failed: {e}")
                return False
            
            # Test 4: Index Creation
            print("4. Testing index creation...")
            try:
                ensure_user_indexes()
                ensure_subject_indexes()
                ensure_notes_indexes()
                print("   ✅ Indexes created/verified successfully")
                
                if verbose:
                    # List indexes for each collection
                    for collection_name in ['users', 'subjects', 'notes']:
                        collection = db[collection_name]
                        indexes = list(collection.list_indexes())
                        print(f"   📋 {collection_name} indexes: {len(indexes)}")
                        
            except Exception as e:
                print(f"   ❌ Index creation failed: {e}")
                return False
            
            # Test 5: Write/Read Operations
            print("5. Testing write/read operations...")
            try:
                test_doc = {
                    "test": True,
                    "timestamp": datetime.utcnow().isoformat(),
                    "message": "Database test document"
                }
                
                # Insert test document
                test_collection = db.test_connection
                result = test_collection.insert_one(test_doc)
                doc_id = result.inserted_id
                
                # Read test document
                retrieved_doc = test_collection.find_one({"_id": doc_id})
                
                if retrieved_doc and retrieved_doc["test"]:
                    print("   ✅ Write/read operations successful")
                    
                    # Clean up test document
                    test_collection.delete_one({"_id": doc_id})
                    print("   🧹 Test document cleaned up")
                else:
                    print("   ❌ Write/read operations failed")
                    return False
                    
            except Exception as e:
                print(f"   ❌ Write/read operations failed: {e}")
                return False
            
            # Test 6: Performance Check
            print("6. Testing performance...")
            try:
                import time
                
                start_time = time.time()
                
                # Test query performance
                for _ in range(10):
                    list(db.users.find().limit(1))
                    list(db.subjects.find().limit(1))
                    list(db.notes.find().limit(1))
                
                end_time = time.time()
                duration = end_time - start_time
                
                if duration < 5.0:  # Should complete within 5 seconds
                    print(f"   ✅ Performance test passed ({duration:.2f}s)")
                else:
                    print(f"   ⚠️  Performance test slow ({duration:.2f}s)")
                
            except Exception as e:
                print(f"   ❌ Performance test failed: {e}")
                return False
            
            print("\n🎉 All database tests passed successfully!")
            print("✅ Database is ready for use")
            
            return True
            
    except Exception as e:
        print(f"\n❌ Database test failed with error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description='Test database connection and operations')
    parser.add_argument('--verbose', '-v', action='store_true', 
                       help='Enable verbose output')
    
    args = parser.parse_args()
    
    success = test_connection(verbose=args.verbose)
    
    if not success:
        print("\n💡 Troubleshooting tips:")
        print("   1. Check your MONGO_URI in backend/.env")
        print("   2. Verify MongoDB server is running")
        print("   3. Check network connectivity")
        print("   4. Verify authentication credentials")
        print("   5. Check firewall settings")
        
        sys.exit(1)
    else:
        print("\n🚀 Database is ready to use!")
        sys.exit(0)


if __name__ == "__main__":
    main()
