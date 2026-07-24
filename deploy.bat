@echo off
REM Ozon ERP - Deploy to GitHub Pages
REM Wrapper: real work is in deploy.cjs (avoids cmd encoding issues)

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] node not found. Install from https://nodejs.org/
    pause
    exit /b 1
)

echo ===================================
echo   Ozon ERP - Deploy to GitHub Pages
echo ===================================
echo.

node "%~dp0deploy.cjs"
set RC=%ERRORLEVEL%

if not %RC%==0 (
    echo.
    echo Deploy failed, exit code: %RC%
) else (
    echo.
    echo Done. Press any key to close.
)

pause >nul 2>nul
exit /b %RC%
