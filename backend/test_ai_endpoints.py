import requests
import json

BASE_URL = "http://127.0.0.1:5000/api/ai"

# Test cases
test_cases = [
    {
        "name": "Valid notes request",
        "data": {
            "mode": "notes",
            "studentType": "vision",
            "text": "Photosynthesis is the process by which plants convert light energy into chemical energy."
        },
        "expected_status": 200
    },
    {
        "name": "Valid QnA request",
        "data": {
            "mode": "qna",
            "studentType": "hearing",
            "notes": "Photosynthesis is the process by which plants convert light energy into chemical energy.",
            "question": "What is photosynthesis?"
        },
        "expected_status": 200
    },
    {
        "name": "Invalid mode",
        "data": {
            "mode": "invalid",
            "studentType": "vision",
            "text": "test"
        },
        "expected_status": 400
    },
    {
        "name": "Missing studentType",
        "data": {
            "mode": "notes",
            "text": "test"
        },
        "expected_status": 400
    },
    {
        "name": "Invalid studentType",
        "data": {
            "mode": "notes",
            "studentType": "invalid",
            "text": "test"
        },
        "expected_status": 400
    },
    {
        "name": "Empty text in notes mode",
        "data": {
            "mode": "notes",
            "studentType": "vision",
            "text": ""
        },
        "expected_status": 400
    },
    {
        "name": "Missing question in QnA mode",
        "data": {
            "mode": "qna",
            "studentType": "vision",
            "notes": "test notes"
        },
        "expected_status": 400
    },
    {
        "name": "Missing notes in QnA mode",
        "data": {
            "mode": "qna",
            "studentType": "vision",
            "question": "What is this?"
        },
        "expected_status": 400
    },
    {
        "name": "Test dyslexia alias",
        "data": {
            "mode": "notes",
            "studentType": "dyslexia",  # Should be normalized to dyslexie
            "text": "Complex scientific terminology and explanations"
        },
        "expected_status": 200
    },
    {
        "name": "Test speech adaptation",
        "data": {
            "mode": "notes",
            "studentType": "speech",
            "text": "The quick brown fox jumps over the lazy dog"
        },
        "expected_status": 200
    }
]

def run_tests():
    print("Testing AI Endpoints...")
    print("=" * 50)
    
    passed = 0
    failed = 0
    
    for test in test_cases:
        try:
            response = requests.post(BASE_URL, json=test["data"])
            
            if response.status_code == test["expected_status"]:
                print(f"✓ {test['name']}: PASSED (Status: {response.status_code})")
                if response.status_code == 200:
                    data = response.json()
                    # Check for required fields in successful responses
                    if test["data"]["mode"] == "notes":
                        assert "content" in data, "Missing 'content' field"
                        assert "studentType" in data, "Missing 'studentType' field"
                        assert "tips" in data, "Missing 'tips' field"
                    elif test["data"]["mode"] == "qna":
                        assert "answer" in data, "Missing 'answer' field"
                        assert "studentType" in data, "Missing 'studentType' field"
                        assert "tips" in data, "Missing 'tips' field"
                        assert "steps" in data, "Missing 'steps' field"
                passed += 1
            else:
                print(f"✗ {test['name']}: FAILED")
                print(f"  Expected status: {test['expected_status']}, Got: {response.status_code}")
                print(f"  Response: {response.text[:200]}")
                failed += 1
                
        except Exception as e:
            print(f"✗ {test['name']}: ERROR - {str(e)}")
            failed += 1
    
    print("=" * 50)
    print(f"Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("✓ All tests passed!")
    else:
        print(f"⚠ {failed} test(s) failed")

if __name__ == "__main__":
    run_tests()
