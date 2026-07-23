@echo off
chcp 65001 >nul
echo ===================================
echo    Ozon ERP 构建生产版本
echo ===================================
echo.
npm run build
echo.
echo 构建完成！输出目录: dist\
echo.
pause
