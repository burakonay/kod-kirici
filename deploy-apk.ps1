# KOD KIRICI - APK Build & Firebase App Distribution Deploy
# Kullanim: powershell -ExecutionPolicy Bypass -File deploy-apk.ps1
# Opsiyonel: -Notes "v2" parametresi

param([string]$Notes = "")

$JAVA_HOME_PATH  = "C:\Program Files\Android\Android Studio\jbr"
$FIREBASE_APP_ID = "1:886055952920:android:e1e956a6598e6c201cd96d"
$APK_PATH        = "android\app\build\outputs\apk\debug\app-debug.apk"
$PROJECT_ROOT    = $PSScriptRoot

Set-Location $PROJECT_ROOT

Write-Host ""
Write-Host "=== KOD KIRICI - DEPLOY PIPELINE ===" -ForegroundColor Cyan
Write-Host ""

# 1. Web sync
Write-Host "[1/5] Cap sync..." -ForegroundColor Yellow
Copy-Item "index.html" "public_web\index.html" -Force
npx cap sync android 2>&1 | Where-Object { $_ -match "Sync finished|error" }
Write-Host "OK: Sync done" -ForegroundColor Green

# 2. APK Build
Write-Host ""
Write-Host "[2/5] Building APK..." -ForegroundColor Yellow
$env:JAVA_HOME = $JAVA_HOME_PATH
$env:PATH      = "$JAVA_HOME_PATH\bin;$env:PATH"
Set-Location "android"
.\gradlew assembleDebug 2>&1 | Where-Object { $_ -match "BUILD|FAILED" }
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: APK build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "OK: APK built" -ForegroundColor Green
Set-Location $PROJECT_ROOT

# 3. Firebase Hosting
Write-Host ""
Write-Host "[3/5] Deploying web..." -ForegroundColor Yellow
$hostResult = npx firebase deploy --only hosting 2>&1
if ($hostResult -match "Deploy complete") {
    Write-Host "OK: Web -> https://dilbaz-a802b.web.app" -ForegroundColor Green
} else {
    Write-Host "WARN: Hosting deploy may have failed" -ForegroundColor DarkYellow
}

# 4. Fetch testers from Firebase Auth (en guvenilir yontem)
Write-Host ""
Write-Host "[4/5] Fetching testers from Firebase Auth..." -ForegroundColor Yellow
$emailList = ""
$tmpFile = "$env:TEMP\kk_auth_users.json"
npx firebase auth:export $tmpFile --format=json --project dilbaz-a802b 2>&1 | Out-Null
if (Test-Path $tmpFile) {
    try {
        $authData = Get-Content $tmpFile -Raw | ConvertFrom-Json
        $emails = @()
        foreach ($u in $authData.users) {
            if ($u.email) { $emails += $u.email }
        }
        Remove-Item $tmpFile -Force
        if ($emails.Count -gt 0) {
            $emailList = $emails -join ","
            Write-Host "OK: $($emails.Count) user(s) found" -ForegroundColor Green
            npx firebase appdistribution:testers:add --emails $emailList --project dilbaz-a802b 2>&1 | Out-Null
        } else {
            Write-Host "WARN: No Google users found" -ForegroundColor DarkYellow
        }
    } catch {
        Write-Host "WARN: Could not parse auth export" -ForegroundColor DarkYellow
    }
} else {
    Write-Host "WARN: Auth export failed" -ForegroundColor DarkYellow
}

# 5. Upload APK to App Distribution
Write-Host ""
Write-Host "[5/5] Uploading APK to App Distribution..." -ForegroundColor Yellow
if (-not $Notes) {
    $Notes = "Build $(Get-Date -Format 'dd.MM.yyyy HH:mm')"
}

$firebaseCmd = "npx firebase appdistribution:distribute `"$APK_PATH`" --app $FIREBASE_APP_ID --release-notes `"$Notes`" --project dilbaz-a802b"
if ($emailList) {
    $firebaseCmd += " --testers `"$emailList`""
}

$distResult = Invoke-Expression $firebaseCmd 2>&1
if ($distResult -match "Upload complete|successfully uploaded|release.*created|distributed") {
    Write-Host "OK: APK uploaded! Testers will be notified." -ForegroundColor Green
} else {
    Write-Host "Result:" -ForegroundColor DarkYellow
    $distResult | Select-Object -Last 8 | ForEach-Object { Write-Host "  $_" }
}

Write-Host ""
Write-Host "=== DONE: $(Get-Date -Format 'HH:mm') ===" -ForegroundColor Green
Write-Host ""
