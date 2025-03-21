@echo off
echo Building TeleMedix Docker containers...

REM Prüfe, ob die docker-compose.yml Datei existiert
if not exist "docker-compose.yml" (
    echo ERROR: docker-compose.yml wurde nicht gefunden!
    echo Bitte führen Sie dieses Skript im Hauptverzeichnis des Projekts aus, 
    echo in dem sich die docker-compose.yml Datei befindet.
    echo.
    echo Aktuelles Verzeichnis: %CD%
    echo.
    echo Press any key to exit...
    pause > nul
    exit /b 1
)

echo Docker-Compose Konfiguration gefunden!

echo Stopping existing containers...
docker-compose down

echo Building new containers...
docker-compose build --no-cache

echo Starting new containers...
docker-compose up -d

echo.
echo Done! The application is now running.
echo Frontend: http://localhost
echo Backend API: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul 