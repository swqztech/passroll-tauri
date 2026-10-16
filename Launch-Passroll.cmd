@echo off
chcp 65001 >nul
REM 正式版；勿用 cargo run / tauri dev
set "EXE=%~dp0src-tauri\target\release\passroll_tauri.exe"

if exist "%EXE%" (

  start "" "%EXE%"

  exit /b 0

)

set "INST=%LocalAppData%\Programs\随密\passroll_tauri.exe"

if exist "%INST%" (

  start "" "%INST%"

  exit /b 0

)

echo 未找到 passroll_tauri.exe，请先运行: npm run build:client

pause


