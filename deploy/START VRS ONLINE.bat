@echo off
title VRS ONLINE (keep open)
REM Your VRS website + license server, online on your fixed Tailscale address. Keep this window open.
cd /d "%~dp0.."
if not exist ".venv\Scripts\python.exe" py -m venv .venv
".venv\Scripts\python.exe" -m pip install -q -r saas\requirements.txt
".venv\Scripts\python.exe" deploy\run_online.py
pause
