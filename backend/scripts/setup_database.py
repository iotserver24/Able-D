#!/usr/bin/env python3
"""
Database Setup Script

This script provides a one-stop setup for the entire database system.
Usage:
    python scripts/setup_database.py [--sample-data] [--test]
"""

import sys
import os
import argparse
import subprocess

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def run_script(script_name, args=None):
    """Run a Python script and return success status."""
    try:
        script_path = os.path.join(os.path.dirname(__file__), script_name)
        cmd = [sys.executable, script_path]
        if args:
            cmd.extend(args)
        
        print(f"🔧 Running {script_name}...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ {script_name} completed successfully")
            if result.stdout:
                print(result.stdout)
            return True
        else:
            print(f"❌ {script_name} failed")
            if result.stderr:
                print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Failed to run {script_name}: {e}")
        return False

def setup_database(sample_data=False, test=False):
    """Complete database setup process."""
    print("🚀 Setting up Able-D Database System")
    print("=" * 50)
    
    success_count = 0
    total_steps = 0
    
    # Step 1: Test database connection
    print("\n1. Testing database connection...")
    total_steps += 1
    if run_script("test_db_connection.py", ["--verbose"]):
        success_count += 1
    else:
        print("❌ Database connection test failed. Please check your configuration.")
        return False
    
    # Step 2: Initialize database
    print("\n2. Initializing database...")
    total_steps += 1
    init_args = []
    if sample_data:
        init_args.append("--sample-data")
    
    if run_script("init_database.py", init_args):
        success_count += 1
    else:
        print("❌ Database initialization failed.")
        return False
    
    # Step 3: Run migrations (if any)
    print("\n3. Running database migrations...")
    total_steps += 1
    if run_script("migrate_database.py"):
        success_count += 1
    else:
        print("⚠️  Database migrations failed or no migrations to run.")
        # This is not critical, so we continue
    
    # Step 4: Run complete system test (if requested)
    if test:
        print("\n4. Running complete system test...")
        total_steps += 1
        if run_script("test_complete_system.py", ["--verbose"]):
            success_count += 1
        else:
            print("❌ System test failed.")
            return False
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 SETUP SUMMARY")
    
    if success_count == total_steps:
        print("🎉 Database setup completed successfully!")
        print("✅ All systems are ready for use")
        
        print("\n📋 Next Steps:")
        print("   1. Start the Flask application: python run.py")
        print("   2. Test the API endpoints: python scripts/test_complete_system.py")
        print("   3. Access the frontend and begin using the system")
        
        print("\n📚 Documentation:")
        print("   - Database Guide: backend/docs/DATABASE_GUIDE.md")
        print("   - Frontend Integration: backend/docs/FRONTEND_DATABASE_SERVICE.md")
        print("   - API Documentation: backend/docs/FRONTEND_API_GUIDE.md")
        
        return True
    else:
        print(f"⚠️  Setup completed with {total_steps - success_count} failure(s)")
        print("Please review the errors above and try again")
        return False

def main():
    parser = argparse.ArgumentParser(description='Complete database setup for Able-D')
    parser.add_argument('--sample-data', action='store_true',
                       help='Include sample data in the setup')
    parser.add_argument('--test', action='store_true',
                       help='Run complete system test after setup')
    
    args = parser.parse_args()
    
    try:
        success = setup_database(
            sample_data=args.sample_data,
            test=args.test
        )
        
        if not success:
            print("\n💡 Troubleshooting tips:")
            print("   1. Check your MONGO_URI in backend/.env")
            print("   2. Ensure MongoDB server is running")
            print("   3. Verify network connectivity")
            print("   4. Check user permissions")
            print("   5. Review error messages above")
            
            sys.exit(1)
        else:
            print("\n🚀 Database setup completed successfully!")
            sys.exit(0)
            
    except KeyboardInterrupt:
        print("\n⚠️  Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
