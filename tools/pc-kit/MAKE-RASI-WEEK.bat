@echo off
cd /d "%~dp0"
echo Makes 7 days of rasi palan reels (ta, te, hi, en) from rasivani.com, starting from the date you type.
set /p F=First date (e.g. 2026-11-16): 
node make-week-shorts.mjs .. %F% 7 ta,te,hi,en https://rasivani.com chrome
echo.
pause
