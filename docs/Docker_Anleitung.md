# Docker-Anleitung für TeleMedix

Diese Anleitung beschreibt, wie Sie TeleMedix mit Docker lokal ausführen und entwickeln können.

## Voraussetzungen

Folgende Software muss auf Ihrem System installiert sein:

- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/install/) (meistens bereits in Docker Desktop enthalten)

## Lokale Entwicklung

### 1. Umgebungsvariablen einrichten (optional)

Sie können eine `.env`-Datei im Hauptverzeichnis des Projekts erstellen, um sensible Informationen wie Passwörter zu speichern:

```
JWT_SECRET=mein_sicherer_geheimer_schluessel
DB_PASSWORD=mein_datenbank_passwort
```

### 2. Docker-Container starten

Führen Sie im Hauptverzeichnis des Projekts den folgenden Befehl aus:

```bash
docker-compose up
```

Dies baut und startet alle Container. Beim ersten Start kann dieser Vorgang einige Minuten dauern.

Um die Container im Hintergrund zu starten, verwenden Sie:

```bash
docker-compose up -d
```

### 3. Auf die Anwendung zugreifen

- Frontend: http://localhost
- Backend API: http://localhost:3000

### 4. Container stoppen

Um die laufenden Container zu stoppen, drücken Sie `Ctrl+C` im Terminal oder führen Sie folgenden Befehl aus:

```bash
docker-compose down
```

## Entwicklungsmodus

Für die aktive Entwicklung empfiehlt es sich, Front- und Backend lokal zu starten:

### Backend

```bash
cd backend
npm install
npm run dev
```

Das Backend läuft dann auf http://localhost:3000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Das Frontend läuft dann auf http://localhost:5173

## Nützliche Docker-Befehle

- Container-Status anzeigen: `docker-compose ps`
- Logs anzeigen: `docker-compose logs`
- Logs eines bestimmten Dienstes anzeigen: `docker-compose logs backend`
- In einen Container einsteigen: `docker-compose exec backend sh`
- Container neu bauen: `docker-compose build`
- Container und Volumes löschen: `docker-compose down -v`

## Produktionsdeployment

Für ein Produktionsdeployment sollten Sie folgende Schritte beachten:

1. Setzen Sie sichere Werte für alle Umgebungsvariablen
2. Verwenden Sie HTTPS mit einem gültigen SSL-Zertifikat
3. Skalieren Sie die Dienste nach Bedarf 