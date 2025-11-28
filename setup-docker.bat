@echo off
REM Setup script for Gerobakku Docker deployment

echo ========================================
echo   Gerobakku Docker Setup Script
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check if .env file exists
if exist .env (
    echo [INFO] .env file already exists
    choice /C YN /M "Do you want to overwrite it with .env.example"
    if errorlevel 2 goto skip_env
    if errorlevel 1 goto copy_env
) else (
    goto copy_env
)

:copy_env
echo [INFO] Creating .env file from .env.example...
copy .env.example .env >nul
echo [OK] .env file created
echo.
goto continue

:skip_env
echo [INFO] Keeping existing .env file
echo.

:continue
echo ========================================
echo   Building and starting containers...
echo ========================================
echo.
echo This may take a few minutes on first run...
echo.

docker-compose up --build

echo.
echo ========================================
echo   Setup complete!
echo ========================================
pause
