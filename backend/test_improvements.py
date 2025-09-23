import requests
import json

BASE_URL = "http://127.0.0.1:5000/api/ai"

print("Testing AI Service Improvements")
print("=" * 50)

# Test 1: Invalid mode error
print("\n1. Testing invalid mode error:")
resp = requests.post(BASE_URL, json={"mode": "invalid", "studentType": "vision", "text": "test"})
print(f"Status: {resp.status_code}")
print(json.dumps(resp.json(), indent=2))

# Test 2: Text too short
print("\n2. Testing text validation (too short):")
resp = requests.post(BASE_URL, json={"mode": "notes", "studentType": "vision", "text": "Hi"})
print(f"Status: {resp.status_code}")
print(json.dumps(resp.json(), indent=2))

# Test 3: Missing student type
print("\n3. Testing missing student type:")
resp = requests.post(BASE_URL, json={"mode": "notes", "text": "This is a test"})
print(f"Status: {resp.status_code}")
print(json.dumps(resp.json(), indent=2))

# Test 4: Invalid JSON
print("\n4. Testing invalid JSON:")
resp = requests.post(BASE_URL, data="not json", headers={"Content-Type": "application/json"})
print(f"Status: {resp.status_code}")
print(json.dumps(resp.json(), indent=2))

# Test 5: Cache test
print("\n5. Testing cache (making same request twice):")
test_data = {"mode": "notes", "studentType": "dyslexia", "text": "This is a test for caching mechanism"}

import time
start = time.time()
resp1 = requests.post(BASE_URL, json=test_data)
time1 = time.time() - start
print(f"First request took: {time1:.2f}s")

start = time.time()
resp2 = requests.post(BASE_URL, json=test_data)
time2 = time.time() - start
print(f"Second request took: {time2:.2f}s (should be much faster due to cache)")

if time2 < time1 / 2:
    print("✓ Cache is working effectively!")
else:
    print("⚠ Cache might not be working as expected")

# Test 6: Check stats after all tests
print("\n6. Service Statistics:")
resp = requests.get("http://127.0.0.1:5000/api/ai/stats")
print(json.dumps(resp.json(), indent=2))

print("\n" + "=" * 50)
print("All tests completed!")
