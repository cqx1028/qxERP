@echo off
chcp 65001 >nul
echo ===================================
echo    Ozon ERP 电商管理系统
echo ===================================
echo.
echo 正在启动开发服务器...
echo.
npm run dev -- --host 0.0.0.0 --port 5173
echo.
pause
