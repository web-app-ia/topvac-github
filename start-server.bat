@echo off
echo ============================================
echo   TOP VACANCES.BF - Serveur local Python
echo ============================================
echo.

REM Vérifier si Python est installé
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Python n'est pas installe sur ce systeme.
    echo Telechargez-le sur https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Trouver le port disponible (8000 par défaut)
set PORT=8000

REM Lancer le serveur HTTP dans le dossier du script
echo Demarrage du serveur sur http://localhost:%PORT%/
echo Ouvrez cette URL dans votre navigateur.
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur.
echo.

cd /d "%~dp0"
python -m http.server %PORT%

pause
