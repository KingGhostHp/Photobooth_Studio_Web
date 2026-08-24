@echo off
title Aura Studio Docker Auto-Start
echo ========================================================
echo   DANG KHOI CHAY AURA STUDIO BROWSER & BACKEND DOCKER
echo ========================================================
cd /d "%~dp0"
docker compose up --build -d

echo.
echo ========================================================
echo   HE THONG DA KHOI CHAY THANH CONG!
echo   - Frontend Website: http://localhost
echo   - Backend REST API: http://localhost:5000/api/health
echo ========================================================
timeout /t 5
