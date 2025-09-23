#!/usr/bin/env python3
"""
Complete System Test Script

This script tests the entire database system including all endpoints, scripts, and functionality.
Usage:
    python scripts/test_complete_system.py [--verbose] [--skip-cleanup]
"""

import sys
import os
import argparse
import requests
import json
import time
from datetime import datetime

# Add the parent directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.services.db import get_db


class SystemTester:
    def __init__(self, base_url="http://localhost:5000/api", verbose=False):
        self.base_url = base_url
        self.verbose = verbose
        self.test_results = []
        self.auth_token = None
        
    def log(self, message, level="INFO"):
        """Log message with timestamp."""
        timestamp = datetime.now().strftime("%H:%M:%S")
        if level == "ERROR":
            print(f"❌ [{timestamp}] {message}")
        elif level == "SUCCESS":
            print(f"✅ [{timestamp}] {message}")
        elif level == "WARNING":
            print(f"⚠️  [{timestamp}] {message}")
        else:
            print(f"ℹ️  [{timestamp}] {message}")
    
    def test_result(self, test_name, success, message=""):
        """Record test result."""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        if success:
            self.log(f"PASS: {test_name} - {message}", "SUCCESS")
        else:
            self.log(f"FAIL: {test_name} - {message}", "ERROR")
    
    def make_request(self, method, endpoint, data=None, headers=None, expected_status=200):
        """Make HTTP request and return response."""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=headers)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            if response.status_code == expected_status:
                return response.json() if response.content else {}
            else:
                raise Exception(f"Expected status {expected_status}, got {response.status_code}: {response.text}")
                
        except Exception as e:
            if self.verbose:
                self.log(f"Request failed: {str(e)}", "ERROR")
            raise e
    
    def test_database_connection(self):
        """Test database connection and basic operations."""
        self.log("Testing database connection...")
        
        try:
            app = create_app()
            with app.app_context():
                db = get_db()
                
                # Test basic connection
                db.admin.command('ping')
                self.test_result("Database Connection", True, "Successfully connected to MongoDB")
                
                # Test collections
                collections = db.list_collection_names()
                self.test_result("Database Collections", True, f"Found {len(collections)} collections")
                
                # Test write/read
                test_collection = db.test_system
                test_doc = {"test": True, "timestamp": datetime.utcnow().isoformat()}
                result = test_collection.insert_one(test_doc)
                
                retrieved_doc = test_collection.find_one({"_id": result.inserted_id})
                if retrieved_doc and retrieved_doc["test"]:
                    self.test_result("Database Write/Read", True, "Successfully wrote and read document")
                    test_collection.delete_one({"_id": result.inserted_id})
                else:
                    self.test_result("Database Write/Read", False, "Failed to retrieve written document")
                
        except Exception as e:
            self.test_result("Database Connection", False, str(e))
    
    def test_health_endpoints(self):
        """Test health check endpoints."""
        self.log("Testing health endpoints...")
        
        try:
            # Test main health endpoint
            response = self.make_request("GET", "/health")
            self.test_result("Main Health Check", True, "Health endpoint responding")
            
            # Test database health
            response = self.make_request("GET", "/db/health")
            self.test_result("Database Health Check", True, f"Database status: {response.get('status')}")
            
            # Test AI health
            response = self.make_request("GET", "/ai/health")
            self.test_result("AI Health Check", True, f"AI service status: {response.get('status')}")
            
        except Exception as e:
            self.test_result("Health Endpoints", False, str(e))
    
    def test_authentication(self):
        """Test authentication endpoints."""
        self.log("Testing authentication...")
        
        try:
            # Test student registration
            student_data = {
                "studentType": "visually_impaired",
                "name": "Test Student",
                "class": "Test Class",
                "subject": "Test Subject",
                "school": "Test School",
                "email": "test.student@example.com",
                "password": "testpass123"
            }
            
            response = self.make_request("POST", "/auth/student/register", student_data, expected_status=201)
            self.test_result("Student Registration", True, "Student registered successfully")
            
            # Test student login
            login_data = {
                "email": "test.student@example.com",
                "password": "testpass123"
            }
            
            response = self.make_request("POST", "/auth/student/login", login_data)
            if "accessToken" in response:
                self.auth_token = response["accessToken"]
                self.test_result("Student Login", True, "Student logged in successfully")
            else:
                self.test_result("Student Login", False, "No access token received")
            
            # Test teacher registration
            teacher_data = {
                "name": "Test Teacher",
                "email": "test.teacher@example.com",
                "password": "testpass123",
                "school": "Test School"
            }
            
            response = self.make_request("POST", "/auth/teacher/register", teacher_data, expected_status=201)
            self.test_result("Teacher Registration", True, "Teacher registered successfully")
            
        except Exception as e:
            self.test_result("Authentication", False, str(e))
    
    def test_data_operations(self):
        """Test data CRUD operations."""
        self.log("Testing data operations...")
        
        if not self.auth_token:
            self.test_result("Data Operations", False, "No authentication token available")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Test subjects endpoint
            response = self.make_request("GET", "/subjects?school=Test School&class=Test Class", headers=headers)
            self.test_result("Get Subjects", True, f"Retrieved {len(response)} subjects")
            
            # Test notes operations
            note_data = {
                "school": "Test School",
                "class": "Test Class",
                "subject": "Test Subject",
                "topic": "Test Topic",
                "text": "This is a test note for system testing.",
                "uploadedBy": "test_teacher",
                "sourceType": "manual"
            }
            
            response = self.make_request("POST", "/notes", note_data, headers=headers)
            if "_id" in response:
                note_id = response["_id"]
                self.test_result("Create Note", True, f"Note created with ID: {note_id}")
                
                # Test get notes
                response = self.make_request("GET", "/notes", headers=headers)
                self.test_result("Get Notes", True, f"Retrieved {len(response)} notes")
                
                # Test update note
                update_data = {"text": "Updated test note content"}
                response = self.make_request("PUT", f"/notes/{note_id}", update_data, headers=headers)
                self.test_result("Update Note", True, "Note updated successfully")
                
                # Test delete note
                response = self.make_request("DELETE", f"/notes/{note_id}", headers=headers, expected_status=200)
                self.test_result("Delete Note", True, "Note deleted successfully")
            else:
                self.test_result("Create Note", False, "No note ID returned")
                
        except Exception as e:
            self.test_result("Data Operations", False, str(e))
    
    def test_ai_services(self):
        """Test AI service endpoints."""
        self.log("Testing AI services...")
        
        try:
            # Test AI notes generation
            ai_data = {
                "mode": "notes",
                "studentType": "visually_impaired",
                "text": "Photosynthesis is the process by which plants convert light energy into chemical energy."
            }
            
            response = self.make_request("POST", "/ai", ai_data)
            if "content" in response:
                self.test_result("AI Notes Generation", True, "AI notes generated successfully")
            else:
                self.test_result("AI Notes Generation", False, "No content in AI response")
            
            # Test AI Q&A
            qna_data = {
                "mode": "qna",
                "studentType": "visually_impaired",
                "notes": "Photosynthesis is the process by which plants convert light energy into chemical energy.",
                "question": "What is photosynthesis?"
            }
            
            response = self.make_request("POST", "/ai", qna_data)
            if "answer" in response:
                self.test_result("AI Q&A Generation", True, "AI Q&A generated successfully")
            else:
                self.test_result("AI Q&A Generation", False, "No answer in AI response")
            
            # Test AI stats
            response = self.make_request("GET", "/ai/stats")
            self.test_result("AI Statistics", True, f"AI stats retrieved: {response.get('total_requests', 0)} requests")
            
        except Exception as e:
            self.test_result("AI Services", False, str(e))
    
    def test_database_management(self):
        """Test database management endpoints."""
        self.log("Testing database management...")
        
        if not self.auth_token:
            self.test_result("Database Management", False, "No authentication token available")
            return
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        try:
            # Test database stats
            response = self.make_request("GET", "/db/stats", headers=headers)
            self.test_result("Database Statistics", True, f"Database stats retrieved: {response.get('users', {}).get('total', 0)} users")
            
            # Test collections list
            response = self.make_request("GET", "/db/collections", headers=headers)
            self.test_result("Database Collections List", True, f"Collections listed: {response.get('total', 0)} collections")
            
        except Exception as e:
            self.test_result("Database Management", False, str(e))
    
    def test_document_processing(self):
        """Test document processing endpoints."""
        self.log("Testing document processing...")
        
        try:
            # Create a test text file
            test_content = "This is a test document for system testing. It contains some sample text to verify document processing functionality."
            test_file_path = "/tmp/test_document.txt"
            
            with open(test_file_path, "w") as f:
                f.write(test_content)
            
            # Test document extraction
            with open(test_file_path, "rb") as f:
                files = {"file": f}
                response = requests.post(f"{self.base_url}/extract-text", files=files)
            
            if response.status_code == 200:
                data = response.json()
                if "text" in data:
                    self.test_result("Document Text Extraction", True, "Document text extracted successfully")
                else:
                    self.test_result("Document Text Extraction", False, "No text in extraction response")
            else:
                self.test_result("Document Text Extraction", False, f"HTTP {response.status_code}: {response.text}")
            
            # Clean up test file
            os.remove(test_file_path)
            
        except Exception as e:
            self.test_result("Document Processing", False, str(e))
    
    def run_all_tests(self):
        """Run all system tests."""
        self.log("🚀 Starting Complete System Test", "SUCCESS")
        self.log("=" * 60)
        
        start_time = time.time()
        
        # Run all test suites
        self.test_database_connection()
        self.test_health_endpoints()
        self.test_authentication()
        self.test_data_operations()
        self.test_ai_services()
        self.test_database_management()
        self.test_document_processing()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Print summary
        self.log("=" * 60)
        self.log("📊 TEST SUMMARY", "SUCCESS")
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        self.log(f"Total Tests: {total_tests}")
        self.log(f"Passed: {passed_tests}", "SUCCESS")
        self.log(f"Failed: {failed_tests}", "ERROR" if failed_tests > 0 else "SUCCESS")
        self.log(f"Duration: {duration:.2f} seconds")
        
        if failed_tests == 0:
            self.log("🎉 ALL TESTS PASSED! System is ready for use.", "SUCCESS")
        else:
            self.log(f"⚠️  {failed_tests} test(s) failed. Please review the errors above.", "WARNING")
        
        # Save detailed results
        results_file = f"test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(results_file, "w") as f:
            json.dump({
                "summary": {
                    "total_tests": total_tests,
                    "passed_tests": passed_tests,
                    "failed_tests": failed_tests,
                    "duration_seconds": duration,
                    "timestamp": datetime.now().isoformat()
                },
                "results": self.test_results
            }, f, indent=2)
        
        self.log(f"Detailed results saved to: {results_file}")
        
        return failed_tests == 0


def main():
    parser = argparse.ArgumentParser(description='Complete system test for Able-D backend')
    parser.add_argument('--base-url', default='http://localhost:5000/api',
                       help='Base URL for API endpoints (default: http://localhost:5000/api)')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Enable verbose output')
    parser.add_argument('--skip-cleanup', action='store_true',
                       help='Skip cleanup of test data')
    
    args = parser.parse_args()
    
    tester = SystemTester(base_url=args.base_url, verbose=args.verbose)
    
    try:
        success = tester.run_all_tests()
        
        if not success:
            print("\n💡 Troubleshooting tips:")
            print("   1. Ensure the Flask app is running: python run.py")
            print("   2. Check database connection in backend/.env")
            print("   3. Verify all required environment variables are set")
            print("   4. Check API endpoints are accessible")
            print("   5. Review error messages above")
            
            sys.exit(1)
        else:
            print("\n🚀 System test completed successfully!")
            print("✅ Backend is ready for production use")
            sys.exit(0)
            
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test suite failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
