@echo off
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion
title SoloHelm Installer

:: ============================================================================
:: SoloHelm — Windows One-click Installer (double-click to run)
:: ============================================================================

:: cd to the folder where this script lives (the project root)
cd /d "%~dp0"

set "PORT=3000"
set "NODE_MIN=16"

echo.
echo  ========================================
echo    SoloHelm Installer (Windows)
echo  ========================================
echo.

:: ---- Step 1: Check Node.js ----
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Node.js not found.
    goto :install_node
)

for /f "tokens=1 delims=v" %%a in ('node -v') do set "NODE_RAW=%%a"
for /f "tokens=1 delims=." %%a in ('node -v') do set "NODE_TAG=%%a"
set "NODE_TAG=%NODE_TAG:v=%"

if %NODE_TAG% GEQ %NODE_MIN% (
    echo [ OK ] Node.js detected: && node -v
    goto :deps
) else (
    echo [WARN] Node.js version too old: && node -v
    goto :install_node
)

:install_node
echo.
echo [INFO] Need to install Node.js ...
echo.

:: Try winget first (Windows 10/11)
where winget >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Installing Node.js via winget ...
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [ OK ] Node.js installed via winget.
        echo [INFO] Please CLOSE this window and DOUBLE-CLICK install.bat again.
        echo        (New PATH needs a fresh terminal to take effect)
        echo.
        pause
        exit /b 0
    )
)

:: Fallback: download installer
echo [INFO] Downloading Node.js 20 installer ...
set "NODE_URL=https://nodejs.org/dist/v20.19.0/node-v20.19.0-x64.msi"
set "NODE_MSI=%TEMP%\node-installer.msi"

:: Try PowerShell download
powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%NODE_MSI%' }" 2>nul

if not exist "%NODE_MSI%" (
    :: Try curl
    curl -fsSL -o "%NODE_MSI%" "%NODE_URL%" 2>nul
)

if exist "%NODE_MSI%" (
    echo [INFO] Running Node.js installer ...
    echo        Please follow the installer wizard.
    start /wait msiexec /i "%NODE_MSI%"
    del "%NODE_MSI%" 2>nul
    echo.
    echo [ OK ] Node.js installer finished.
    echo [INFO] Please CLOSE this window and DOUBLE-CLICK install.bat again.
    echo        (New PATH needs a fresh terminal to take effect)
    echo.
    pause
    exit /b 0
) else (
    echo [ERR] Failed to download Node.js.
    echo       Please install manually: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: ---- Step 2: Install dependencies ----
:deps
echo.
echo [INFO] Installing dependencies (npm install) ...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERR] npm install failed.
    echo       Try: npm install --registry=https://registry.npmmirror.com
    echo.
    pause
    exit /b 1
)
echo [ OK ] Dependencies installed.

:: ---- Step 3: Start server ----
echo.
echo  ============================================
echo    SoloHelm is starting!
echo    Open browser: http://localhost:%PORT%
echo    Close this window to stop the server
echo  ============================================
echo.

:: Open browser automatically
start http://localhost:%PORT%

:: Start server (keeps window open)
node server.js

:: If server exits
echo.
echo Server stopped.
pause
