#!/usr/bin/env python3
"""
Database Backup Script

This script creates backups of the database and exports data.
Usage:
    python scripts/backup_database.py [--output-dir BACKUP_DIR] [--format FORMAT]
"""

import sys
import os
import argparse
import json
from datetime import datetime
from pathlib import Path

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.services.db import get_db


def create_backup_directory(output_dir):
    """Create backup directory with timestamp."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = Path(output_dir) / f"abled_backup_{timestamp}"
    backup_dir.mkdir(parents=True, exist_ok=True)
    return backup_dir


def export_collection_to_json(collection, output_file):
    """Export a collection to JSON file."""
    try:
        documents = list(collection.find({}))
        
        # Convert ObjectId to string for JSON serialization
        for doc in documents:
            if '_id' in doc:
                doc['_id'] = str(doc['_id'])
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(documents, f, indent=2, ensure_ascii=False)
        
        return len(documents)
    except Exception as e:
        print(f"   ❌ Failed to export {collection.name}: {e}")
        return 0


def export_collection_to_csv(collection, output_file):
    """Export a collection to CSV file."""
    try:
        import pandas as pd
        
        documents = list(collection.find({}))
        
        if not documents:
            # Create empty CSV
            with open(output_file, 'w') as f:
                f.write("")
            return 0
        
        # Convert to DataFrame
        df = pd.DataFrame(documents)
        
        # Convert ObjectId to string
        if '_id' in df.columns:
            df['_id'] = df['_id'].astype(str)
        
        # Export to CSV
        df.to_csv(output_file, index=False, encoding='utf-8')
        
        return len(documents)
    except ImportError:
        print("   ⚠️  pandas not available, skipping CSV export")
        return 0
    except Exception as e:
        print(f"   ❌ Failed to export {collection.name} to CSV: {e}")
        return 0


def create_backup(backup_dir, format_type='json'):
    """Create database backup."""
    print(f"💾 Creating database backup in {format_type.upper()} format...")
    print("=" * 60)
    
    try:
        # Create Flask app context
        app = create_app()
        
        with app.app_context():
            db = get_db()
            
            # Get all collections
            collections = db.list_collection_names()
            
            if not collections:
                print("   ⚠️  No collections found in database")
                return False
            
            print(f"   📊 Found {len(collections)} collections")
            
            total_documents = 0
            backup_info = {
                "backup_date": datetime.utcnow().isoformat() + "Z",
                "database_name": db.name,
                "collections": {},
                "total_documents": 0
            }
            
            # Export each collection
            for collection_name in collections:
                print(f"   📁 Exporting {collection_name}...")
                
                collection = db[collection_name]
                document_count = collection.count_documents({})
                
                if document_count == 0:
                    print(f"      ⚠️  Collection is empty")
                    continue
                
                # Export based on format
                if format_type.lower() == 'json':
                    output_file = backup_dir / f"{collection_name}.json"
                    exported_count = export_collection_to_json(collection, output_file)
                elif format_type.lower() == 'csv':
                    output_file = backup_dir / f"{collection_name}.csv"
                    exported_count = export_collection_to_csv(collection, output_file)
                else:
                    print(f"      ❌ Unsupported format: {format_type}")
                    continue
                
                if exported_count > 0:
                    print(f"      ✅ Exported {exported_count} documents to {output_file.name}")
                    total_documents += exported_count
                    
                    backup_info["collections"][collection_name] = {
                        "document_count": exported_count,
                        "output_file": output_file.name,
                        "file_size": output_file.stat().st_size
                    }
            
            # Save backup metadata
            backup_info["total_documents"] = total_documents
            metadata_file = backup_dir / "backup_info.json"
            
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(backup_info, f, indent=2, ensure_ascii=False)
            
            print(f"\n✅ Backup completed successfully!")
            print(f"   📊 Total documents exported: {total_documents}")
            print(f"   📁 Backup directory: {backup_dir}")
            print(f"   📋 Metadata file: {metadata_file}")
            
            return True
            
    except Exception as e:
        print(f"\n❌ Backup failed: {e}")
        return False


def restore_from_backup(backup_dir, format_type='json'):
    """Restore database from backup."""
    print(f"🔄 Restoring database from backup...")
    print("=" * 60)
    
    try:
        # Create Flask app context
        app = create_app()
        
        with app.app_context():
            db = get_db()
            
            backup_path = Path(backup_dir)
            
            if not backup_path.exists():
                print(f"   ❌ Backup directory not found: {backup_dir}")
                return False
            
            # Load backup metadata
            metadata_file = backup_path / "backup_info.json"
            if metadata_file.exists():
                with open(metadata_file, 'r', encoding='utf-8') as f:
                    backup_info = json.load(f)
                print(f"   📋 Backup date: {backup_info.get('backup_date', 'Unknown')}")
                print(f"   📊 Total documents: {backup_info.get('total_documents', 0)}")
            
            # Find backup files
            if format_type.lower() == 'json':
                backup_files = list(backup_path.glob("*.json"))
                backup_files = [f for f in backup_files if f.name != "backup_info.json"]
            elif format_type.lower() == 'csv':
                backup_files = list(backup_path.glob("*.csv"))
            else:
                print(f"   ❌ Unsupported format: {format_type}")
                return False
            
            if not backup_files:
                print(f"   ❌ No backup files found in {backup_dir}")
                return False
            
            print(f"   📁 Found {len(backup_files)} backup files")
            
            total_restored = 0
            
            # Restore each collection
            for backup_file in backup_files:
                collection_name = backup_file.stem
                print(f"   📁 Restoring {collection_name}...")
                
                try:
                    if format_type.lower() == 'json':
                        with open(backup_file, 'r', encoding='utf-8') as f:
                            documents = json.load(f)
                    elif format_type.lower() == 'csv':
                        import pandas as pd
                        df = pd.read_csv(backup_file)
                        documents = df.to_dict('records')
                    
                    if not documents:
                        print(f"      ⚠️  No documents to restore")
                        continue
                    
                    # Clear existing collection (optional)
                    collection = db[collection_name]
                    collection.delete_many({})
                    
                    # Insert documents
                    if documents:
                        collection.insert_many(documents)
                        restored_count = len(documents)
                        print(f"      ✅ Restored {restored_count} documents")
                        total_restored += restored_count
                    
                except Exception as e:
                    print(f"      ❌ Failed to restore {collection_name}: {e}")
                    continue
            
            print(f"\n✅ Restore completed!")
            print(f"   📊 Total documents restored: {total_restored}")
            
            return True
            
    except Exception as e:
        print(f"\n❌ Restore failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description='Database backup and restore utility')
    parser.add_argument('--output-dir', '-o', default='./backups',
                       help='Output directory for backups (default: ./backups)')
    parser.add_argument('--format', '-f', choices=['json', 'csv'], default='json',
                       help='Backup format (default: json)')
    parser.add_argument('--restore', '-r', 
                       help='Restore from backup directory')
    
    args = parser.parse_args()
    
    if args.restore:
        success = restore_from_backup(args.restore, args.format)
    else:
        backup_dir = create_backup_directory(args.output_dir)
        success = create_backup(backup_dir, args.format)
    
    if not success:
        print("\n💡 Troubleshooting tips:")
        print("   1. Check database connection")
        print("   2. Verify backup directory permissions")
        print("   3. Check disk space")
        print("   4. Review error messages above")
        
        sys.exit(1)
    else:
        print("\n🚀 Operation completed successfully!")
        sys.exit(0)


if __name__ == "__main__":
    main()
