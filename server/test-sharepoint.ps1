# SharePoint Connection Test Script
# Can be run independently from PowerShell

param(
    [string]$TenantId = "da28b76b-d863-4415-a190-cec116ad367e",
    [string]$ClientId = "1443c462-d929-4195-9282-64df97cf4e3a",
    [string]$ClientSecret = "iIe8Q~kZ~zNMCtOw7T7ifxC0li_fJ.pIrcRB.c4-",
    [string]$SiteUrl = "https://rightarcconsulting.sharepoint.com",
    [string]$SiteName = "rightarcconsulting.sharepoint.com"
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SHAREPOINT CONNECTION TEST" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nStep 1: Authenticating with Azure AD..." -ForegroundColor Yellow

try {
    # Get OAuth token
    $tokenBody = @{
        grant_type = 'client_credentials'
        client_id = $ClientId
        client_secret = $ClientSecret
        scope = 'https://graph.microsoft.com/.default'
    }
    
    $tokenResponse = Invoke-RestMethod -Uri "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token" `
        -Method POST `
        -Body $tokenBody `
        -ContentType 'application/x-www-form-urlencoded' `
        -TimeoutSec 30
    
    Write-Host "✅ Authentication successful!" -ForegroundColor Green
    $accessToken = $tokenResponse.access_token
    
    # Get SharePoint site
    Write-Host "`nStep 2: Connecting to SharePoint site..." -ForegroundColor Yellow
    
    $headers = @{
        'Authorization' = "Bearer $accessToken"
        'Content-Type' = 'application/json'
    }
    
    $siteResponse = Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/sites/$SiteName" `
        -Headers $headers `
        -Method GET `
        -TimeoutSec 30
    
    Write-Host "✅ Site found: $($siteResponse.displayName)" -ForegroundColor Green
    $siteId = $siteResponse.id
    Write-Host "Site ID: $siteId" -ForegroundColor White
    
    # Get lists
    Write-Host "`nStep 3: Retrieving SharePoint lists..." -ForegroundColor Yellow
    
    $listsResponse = Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/sites/$siteId/lists" `
        -Headers $headers `
        -Method GET `
        -TimeoutSec 30
    
    $allLists = $listsResponse.value
    Write-Host "✅ Found $($allLists.Count) total lists" -ForegroundColor Green
    
    # Filter CentraPro lists
    $centraProLists = $allLists | Where-Object { 
        $_.displayName -in @('Timesheets', 'Employees', 'Projects', 'Tasks', 'Invoices', 'LeaveRequests', 'Users', 'AuditLogs')
    }
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "CONNECTION SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "CentraPro Lists Found: $($centraProLists.Count)/8" -ForegroundColor White
    
    if ($centraProLists.Count -gt 0) {
        Write-Host "`nExisting CentraPro Lists:" -ForegroundColor Cyan
        $centraProLists | ForEach-Object {
            Write-Host "  • $($_.displayName)" -ForegroundColor White
        }
    } else {
        Write-Host "`nNo CentraPro lists found. You can create them from the Admin Console." -ForegroundColor Yellow
    }
    
    Write-Host "`nAll SharePoint lists:" -ForegroundColor Cyan
    $allLists | Select-Object -First 10 | ForEach-Object {
        Write-Host "  • $($_.displayName)" -ForegroundColor Gray
    }
    if ($allLists.Count -gt 10) {
        Write-Host "  ... and $($allLists.Count - 10) more" -ForegroundColor Gray
    }
    
    Write-Host "`n========================================`n" -ForegroundColor Green
    
    # Return structured data for Node.js
    $result = @{
        success = $true
        siteId = $siteId
        siteName = $siteResponse.displayName
        listsFound = $centraProLists.Count
        totalLists = $allLists.Count
        allListsCreated = $centraProLists.Count -eq 8
        lists = $centraProLists.displayName
    }
    
    Write-Output ($result | ConvertTo-Json -Compress)
    
} catch {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "CONNECTION FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Error Details: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "========================================`n" -ForegroundColor Red
    
    $result = @{
        success = $false
        error = $_.Exception.Message
    }
    
    Write-Output ($result | ConvertTo-Json -Compress)
    exit 1
}
