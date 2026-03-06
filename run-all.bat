@echo off
title ATHEA Shop - Khoi dong
color 0A

echo.
echo  ============================================
echo    ATHEA SHOP - LOCAL DEVELOPMENT SERVER
echo  ============================================
echo.
echo  [1/2] Dang mo Backend  (http://localhost:7299)
start "ATHEA Backend API" cmd /k "cd /d %~dp0FashionShop.NodeApi && npm run dev"

timeout /t 2 /nobreak >nul

echo  [2/2] Dang mo Frontend (http://localhost:5173)
start "ATHEA Frontend Web" cmd /k "cd /d %~dp0FashionShop.Web && npm run dev"

echo.
echo  Da khoi dong xong! Kiem tra 2 cua so vua mo.
echo  Backend:   http://localhost:7299
echo  Frontend:  http://localhost:5173
echo.
pause
