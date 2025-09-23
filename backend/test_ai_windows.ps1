# AI Service Test Script for Windows PowerShell
# Run this script: .\test_ai_windows.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "AI Service Test Suite for Windows" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://127.0.0.1:5000/api"

# Function to display results nicely
function Show-Result {
    param($Title, $Result)
    Write-Host "`n--- $Title ---" -ForegroundColor Green
    $Result | ConvertTo-Json -Depth 10 | Write-Host
}

# Test 1: Health Check
Write-Host "Test 1: Checking Service Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/ai/health" -Method Get
    if ($health.status -eq "healthy") {
        Write-Host "✓ Service is healthy" -ForegroundColor Green
        Write-Host "  Available Keys: $($health.available_keys)"
    } else {
        Write-Host "✗ Service unhealthy" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
}

# Test 2: Generate Notes for Vision
Write-Host "`nTest 2: Generating Notes (Vision)..." -ForegroundColor Yellow
try {
    $visionBody = @{
        mode = "notes"
        studentType = "vision"
        text = "The solar system consists of the Sun and eight planets. Mercury is closest to the Sun."
    } | ConvertTo-Json
    
    $visionResult = Invoke-RestMethod -Uri "$baseUrl/ai" `
        -Method Post `
        -Body $visionBody `
        -ContentType "application/json"
    
    Write-Host "✓ Notes generated for vision students" -ForegroundColor Green
    Write-Host "  Content preview: $($visionResult.content.Substring(0, [Math]::Min(100, $visionResult.content.Length)))..."
} catch {
    Write-Host "✗ Vision notes failed: $_" -ForegroundColor Red
}

# Test 3: Generate Notes for Hearing
Write-Host "`nTest 3: Generating Notes (Hearing)..." -ForegroundColor Yellow
try {
    $hearingBody = @{
        mode = "notes"
        studentType = "hearing"
        text = "Sound waves travel through different mediums at different speeds."
    } | ConvertTo-Json
    
    $hearingResult = Invoke-RestMethod -Uri "$baseUrl/ai" `
        -Method Post `
        -Body $hearingBody `
        -ContentType "application/json"
    
    Write-Host "✓ Notes generated for hearing students" -ForegroundColor Green
} catch {
    Write-Host "✗ Hearing notes failed: $_" -ForegroundColor Red
}

# Test 4: Q&A Mode
Write-Host "`nTest 4: Testing Q&A Mode..." -ForegroundColor Yellow
try {
    $qnaBody = @{
        mode = "qna"
        studentType = "dyslexie"
        notes = "Plants need water, sunlight, and carbon dioxide for photosynthesis. They produce oxygen and glucose."
        question = "What do plants produce?"
    } | ConvertTo-Json
    
    $qnaResult = Invoke-RestMethod -Uri "$baseUrl/ai" `
        -Method Post `
        -Body $qnaBody `
        -ContentType "application/json"
    
    Write-Host "✓ Q&A response generated" -ForegroundColor Green
    Write-Host "  Answer: $($qnaResult.answer)"
} catch {
    Write-Host "✗ Q&A mode failed: $_" -ForegroundColor Red
}

# Test 5: Statistics
Write-Host "`nTest 5: Getting Statistics..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/ai/stats" -Method Get
    Write-Host "✓ Statistics retrieved" -ForegroundColor Green
    Write-Host "  Total Requests: $($stats.total_requests)"
    Write-Host "  Cache Hits: $($stats.cache_hits)"
    Write-Host "  Error Rate: $($stats.error_rate)"
} catch {
    Write-Host "✗ Statistics failed: $_" -ForegroundColor Red
}

# Test 6: Error Handling
Write-Host "`nTest 6: Testing Error Handling..." -ForegroundColor Yellow
try {
    $errorBody = @{
        mode = "notes"
        studentType = "invalid_type"
        text = "This should fail"
    } | ConvertTo-Json
    
    $errorResult = Invoke-RestMethod -Uri "$baseUrl/ai" `
        -Method Post `
        -Body $errorBody `
        -ContentType "application/json"
    
    Write-Host "✗ Error handling test failed - should have thrown error" -ForegroundColor Red
} catch {
    Write-Host "✓ Error handling works correctly" -ForegroundColor Green
    Write-Host "  Error caught as expected"
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Test Suite Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Offer to run interactive mode
Write-Host "`nWould you like to test with your own text? (Y/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "Enter your text to adapt:" -ForegroundColor Cyan
    $userText = Read-Host
    
    Write-Host "Select student type (1-4):" -ForegroundColor Cyan
    Write-Host "1. Vision"
    Write-Host "2. Hearing"
    Write-Host "3. Speech"
    Write-Host "4. Dyslexie"
    $typeChoice = Read-Host
    
    $studentType = switch ($typeChoice) {
        "1" { "vision" }
        "2" { "hearing" }
        "3" { "speech" }
        "4" { "dyslexie" }
        default { "vision" }
    }
    
    $userBody = @{
        mode = "notes"
        studentType = $studentType
        text = $userText
    } | ConvertTo-Json
    
    try {
        $userResult = Invoke-RestMethod -Uri "$baseUrl/ai" `
            -Method Post `
            -Body $userBody `
            -ContentType "application/json"
        
        Write-Host "`n--- Your Adapted Content ---" -ForegroundColor Green
        Write-Host $userResult.content
        Write-Host "`n--- Study Tips ---" -ForegroundColor Green
        Write-Host $userResult.tips
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
    }
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
