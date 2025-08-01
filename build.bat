@echo off
echo Building project for Netlify deployment...

REM Remove existing dist directory
if exist dist rmdir /s /q dist

REM Create dist directory
mkdir dist

REM Copy all files from public to dist
xcopy public\* dist\ /E /I /Y

echo Build complete. Files copied to dist/ directory. 