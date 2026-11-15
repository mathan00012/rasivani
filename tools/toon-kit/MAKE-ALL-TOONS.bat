@echo off
cd /d "%~dp0"
echo RasiVani cartoons: makes every story in stories\nov that is not made yet (Tamil, Telugu, Hindi, English).
echo Takes a few hours for all 30. You can close it any time and run again: finished ones are skipped.
echo.
set /p FROM=First date (Enter = all), e.g. 2026-11-16: 
set /p TO=Last date (Enter = all), e.g. 2026-11-22: 
if "%FROM%"=="" set FROM=0000
if "%TO%"=="" set TO=9999
if not exist node_modules call npm install
node tools\make-all.mjs stories\nov %FROM% %TO% ta,te,hi,en
pause
