@echo off
echo.
echo TeleMedix Entwicklungsumgebung Setup
echo =====================================
echo.
echo Diese Datei wird die Entwicklungsumgebung vorbereiten und starten.
echo.
echo Schritte:
echo 1. Starten des Datenbank-Containers mit Docker Compose
echo 2. Installieren der Abhängigkeiten (Backend und Frontend)
echo 3. Vorbereiten der Datenbank mit Prisma
echo 4. Starten der Entwicklungsserver (Backend und Frontend)
echo.
echo Um fortzufahren, stellen Sie sicher, dass Docker Desktop läuft.
echo.
pause

echo.
echo Starte Datenbank-Container...
echo.
docker-compose up -d db
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo FEHLER: Docker-Container konnte nicht gestartet werden.
    echo Bitte stellen Sie sicher, dass Docker Desktop läuft und funktioniert.
    echo.
    pause
    exit /b
)

echo.
echo Installiere Backend-Abhängigkeiten...
echo.
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo FEHLER: Backend-Abhängigkeiten konnten nicht installiert werden.
    echo.
    pause
    exit /b
)

echo.
echo Bereite Datenbank vor...
echo.
call npm run db:prepare
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo FEHLER: Datenbank konnte nicht vorbereitet werden.
    echo.
    pause
    exit /b
)

echo.
echo Installiere Frontend-Abhängigkeiten...
echo.
cd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo FEHLER: Frontend-Abhängigkeiten konnten nicht installiert werden.
    echo.
    pause
    exit /b
)

echo.
echo Starte Backend- und Frontend-Entwicklungsserver...
echo.
echo Die Anwendung wird in separaten Fenstern gestartet:
echo - Backend auf http://localhost:3000
echo - Frontend auf http://localhost:5173
echo.
echo Zugangsdaten für die Test-Benutzer:
echo - Admin: admin@telemedix.com / admin123
echo - Arzt: dr.mueller@telemedix.com / doctor123
echo - Medic: medic.wagner@telemedix.com / medic123
echo.
echo Bitte schließen Sie diese Fenster, wenn Sie die Anwendung beenden möchten.
echo.
pause

cd ..
set PROJECT_DIR=%CD%

start cmd /k "cd /d %PROJECT_DIR%\backend && npm run dev"
start cmd /k "cd /d %PROJECT_DIR%\frontend && npm run dev" 