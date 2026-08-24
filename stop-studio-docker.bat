@echo off
title Aura Studio Docker Stop
echo ========================================================
echo   DANG DUNG CONG CONG TY & SERVER AURA STUDIO
echo ========================================================
cd /d "%~dp0"
docker compose down

echo.
echo ========================================================
echo   DA DUNG CONG TY THANH CONG!
echo ========================================================
timeout /t 3
