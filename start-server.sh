#!/bin/bash
# TOP VACANCES.BF - Serveur local Python (WSL/Linux)

PORT=${1:-8000}
DIR="$(cd "$(dirname "$0")" && pwd)"

if ! command -v python3 >/dev/null 2>&1; then
    echo "[ERREUR] python3 n'est pas installé. Installez-le avec : sudo apt install python3"
    exit 1
fi

echo "============================================"
echo "  TOP VACANCES.BF - Serveur local Python"
echo "============================================"
echo ""
echo "Démarrage sur http://localhost:${PORT}/"
echo "Ouvrez cette URL dans votre navigateur."
echo ""
echo "Ctrl+C pour arrêter."
echo ""

cd "$DIR"
python3 -m http.server "$PORT"
