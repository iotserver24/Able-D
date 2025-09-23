#!/usr/bin/env python3
"""Check if required AI packages are installed."""

import sys

def check_packages():
    packages_status = {}
    
    # Check google-genai
    try:
        from google import genai
        packages_status['google-genai'] = True
        print("✓ google-genai: INSTALLED")
    except ImportError as e:
        packages_status['google-genai'] = False
        print("✗ google-genai: NOT INSTALLED")
        print(f"  Error: {e}")
    
    # Check google-generativeai
    try:
        import google.generativeai
        packages_status['google-generativeai'] = True
        print("✓ google-generativeai: INSTALLED")
    except ImportError as e:
        packages_status['google-generativeai'] = False
        print("✗ google-generativeai: NOT INSTALLED")
        print(f"  Error: {e}")
    
    # Check if at least one is installed
    if not any(packages_status.values()):
        print("\n⚠ WARNING: No Gemini client packages are installed!")
        print("Please install at least one of the following:")
        print("  pip install google-genai")
        print("  pip install google-generativeai")
        return False
    
    return True

if __name__ == "__main__":
    success = check_packages()
    sys.exit(0 if success else 1)
