@echo off
title Aura Studio Docker Auto-Start
echo ========================================================
echo   DANG KHOI CHAY AURA STUDIO BROWSER & BACKEND DOCKER
echo ========================================================
cd /d "%~dp0"
if not exist .env (
  echo Can tao file .env theo .env.example truoc khi chay.
  pause
  exit /b 1
)
docker compose up --build -d
if errorlevel 1 (
  echo Khong the khoi chay. Vui long xem loi o tren.
  pause
  exit /b 1
)

echo.
echo ========================================================
echo   HE THONG DA KHOI CHAY THANH CONG!
echo   - Frontend Website: http://localhost
echo   - Backend REST API: http://localhost:5000/api/health
echo ========================================================
timeout /t 5
