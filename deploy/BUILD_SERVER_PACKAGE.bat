@echo off
REM Makes deploy\vrs-server.zip (the online server + website, without any of your private files).
cd /d "%~dp0.."
if exist ".venv\Scripts\python.exe" (".venv\Scripts\python.exe" deploy\build_package.py) else (py deploy\build_package.py)
echo.
pause
