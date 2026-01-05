# Create SharePoint Lists for CentraPro
param(
    [string]$TenantId = "da28b76b-d863-4415-a190-cec116ad367e",
    [string]$ClientId = "1443c462-d929-4195-9282-64df97cf4e3a",
    [string]$ClientSecret = "iIe8Q~kZ~zNMCtOw7T7ifxC0li_fJ.pIrcRB.c4-",
    [string]$SiteName = "rightarcconsulting.sharepoint.com"
)

Write-Host "`nCentraPro SharePoint Lists Creator`n" -ForegroundColor Cyan

# Step 1: Authenticate
Write-Host "Step 1: Authenticating..." -ForegroundColor Yellow
$tokenBody = @{
    grant_type = 'client_credentials'
    client_id = $ClientId
    client_secret = $ClientSecret
    scope = 'https://graph.microsoft.com/.default'
}

$tokenResponse = Invoke-RestMethod -Uri "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token" -Method POST -Body $tokenBody -ContentType "application/x-www-form-urlencoded"
$accessToken = $tokenResponse.access_token
Write-Host "Authenticated successfully`n" -ForegroundColor Green

# Step 2: Get Site ID
Write-Host "Step 2: Getting site..." -ForegroundColor Yellow
$headers = @{ Authorization = "Bearer $accessToken"; 'Content-Type' = 'application/json' }
$siteResponse = Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/sites/$SiteName" -Headers $headers -Method GET
$siteId = $siteResponse.id
Write-Host "Site ID: $siteId`n" -ForegroundColor Green

# Step 3: Get existing lists
Write-Host "Step 3: Checking existing lists..." -ForegroundColor Yellow
$existingLists = Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/sites/$siteId/lists" -Headers $headers -Method GET
$existingListNames = $existingLists.value | Select-Object -ExpandProperty displayName
Write-Host "Found $($existingLists.value.Count) existing lists`n" -ForegroundColor Green

# Step 4: Define lists
$listsToCreate = @(
    @{
        name = "CentraPro_Timesheets"
        desc = "Employee timesheet records"
        cols = @(
            @{ n = "EmployeeId"; t = "number" }
            @{ n = "EmployeeName"; t = "text" }
            @{ n = "WeekNumber"; t = "number" }
            @{ n = "Status"; t = "text" }
            @{ n = "TotalHours"; t = "number" }
        )
    },
    @{
        name = "CentraPro_Employees"
        desc = "Employee master data"
        cols = @(
            @{ n = "EmployeeId"; t = "text" }
            @{ n = "FullName"; t = "text" }
            @{ n = "Email"; t = "text" }
            @{ n = "Position"; t = "text" }
            @{ n = "Department"; t = "text" }
        )
    },
    @{
        name = "CentraPro_Projects"
        desc = "Project tracking"
        cols = @(
            @{ n = "ProjectCode"; t = "text" }
            @{ n = "ProjectName"; t = "text" }
            @{ n = "ClientName"; t = "text" }
            @{ n = "Status"; t = "text" }
        )
    },
    @{
        name = "CentraPro_Tasks"
        desc = "Task assignments"
        cols = @(
            @{ n = "TaskName"; t = "text" }
            @{ n = "ProjectId"; t = "number" }
            @{ n = "AssignedTo"; t = "text" }
            @{ n = "Status"; t = "text" }
        )
    },
    @{
        name = "CentraPro_Invoices"
        desc = "Invoice records"
        cols = @(
            @{ n = "InvoiceNumber"; t = "text" }
            @{ n = "ClientName"; t = "text" }
            @{ n = "Amount"; t = "number" }
            @{ n = "Status"; t = "text" }
        )
    },
    @{
        name = "CentraPro_LeaveRequests"
        desc = "Leave requests"
        cols = @(
            @{ n = "EmployeeId"; t = "number" }
            @{ n = "EmployeeName"; t = "text" }
            @{ n = "LeaveType"; t = "text" }
            @{ n = "Status"; t = "text" }
        )
    },
    @{
        name = "CentraPro_Users"
        desc = "System users"
        cols = @(
            @{ n = "Username"; t = "text" }
            @{ n = "Email"; t = "text" }
            @{ n = "Role"; t = "text" }
        )
    },
    @{
        name = "CentraPro_AuditLogs"
        desc = "Audit trail"
        cols = @(
            @{ n = "UserId"; t = "number" }
            @{ n = "UserName"; t = "text" }
            @{ n = "Action"; t = "text" }
            @{ n = "Resource"; t = "text" }
        )
    }
)

Write-Host "Step 4: Creating lists...`n" -ForegroundColor Yellow
$created = 0
$skipped = 0

foreach ($list in $listsToCreate) {
    if ($existingListNames -contains $list.name) {
        Write-Host "Skipped: $($list.name) (exists)" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    Write-Host "Creating: $($list.name)..." -ForegroundColor Cyan
    
    $listBody = @{
        displayName = $list.name
        description = $list.desc
        list = @{ template = "genericList" }
    } | ConvertTo-Json
    
    $newList = Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/sites/$siteId/lists" -Headers $headers -Method POST -Body $listBody
    Write-Host "  Created with ID: $($newList.id)" -ForegroundColor Green
    
    $colCount = 0
    foreach ($col in $list.cols) {
        $colDef = @{ name = $col.n; displayName = $col.n }
        switch ($col.t) {
            "text" { $colDef.text = @{} }
            "number" { $colDef.number = @{} }
        }
        
        $colBody = $colDef | ConvertTo-Json
        Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/sites/$siteId/lists/$($newList.id)/columns" -Headers $headers -Method POST -Body $colBody | Out-Null
        $colCount++
    }
    
    Write-Host "  Added $colCount columns`n" -ForegroundColor Green
    $created++
    Start-Sleep -Milliseconds 500
}

Write-Host "`nSUMMARY:" -ForegroundColor Cyan
Write-Host "Created: $created" -ForegroundColor Green
Write-Host "Skipped: $skipped" -ForegroundColor Yellow
Write-Host "Total: $($listsToCreate.Count)`n" -ForegroundColor White

$result = @{
    success = $true
    created = $created
    skipped = $skipped
    total = $listsToCreate.Count
}

$result | ConvertTo-Json
