@echo off
cd /d "%~dp0"
echo Joins finished VANI stories into one long video (Tamil Wed + Sun, other languages Sun).
echo Tamil Wednesday: Sun to Tue stories.  Sunday: the Wed to Sat stories (or the whole week for te/hi/en).
set /p FROM=First date, e.g. 2026-11-15: 
set /p TO=Last date, e.g. 2026-11-17: 
set /p LANGS=Languages (Enter = ta,te,hi,en): 
if "%LANGS%"=="" set LANGS=ta,te,hi,en
node join-week.mjs %FROM% %TO% %LANGS%
echo Output is in ..\ready\long\
pause
