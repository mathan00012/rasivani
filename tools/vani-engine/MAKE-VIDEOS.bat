@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo First run: installing the video tools, about 2 minutes...
  call npm install --no-audit --no-fund
)
set D=
set /p D=Which date? (press Enter for the latest folder, or type e.g. 2026-11-16): 
node make-day.mjs %D%
echo.
pause
