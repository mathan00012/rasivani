@echo off
cd /d "%~dp0"
echo Makes titles, descriptions and thumbnails ahead of time (no clips needed).
echo Run MAKE-START-FRAMES for those dates first, so thumbnails can be made.
set /p F=From date (e.g. 2026-11-16): 
set /p T=To date (e.g. 2026-11-30): 
node make-day.mjs prep %F% %T%
echo.
pause
