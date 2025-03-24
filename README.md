# TeleMedix

Eine moderne Telemedizin-Plattform zur effizienten Verbindung zwischen Medics und Ärzten in Notfallsituationen.

## Beschreibung

TeleMedix ist eine innovative Telemedizin-Plattform, die eine nahtlose und intuitive Kommunikation zwischen vor Ort agierenden Medics und zentral stationierten Ärzten ermöglicht. Die Plattform wurde entwickelt, um die medizinische Versorgung in Notfallsituationen zu optimieren und die Zusammenarbeit zwischen Medics und Ärzten zu verbessern.

### Hauptfunktionen

#### Für Medics
- Schnelle Erfassung von Patientendaten mittels vordefinierter Textbausteine und Dropdown-Menüs
- Echtzeit-Übermittlung von Vitalparametern und Patienteninformationen
- Erstellung und Verwaltung von medizinischen Sessions
- Abarbeitung von Behandlungsplänen
- Echtzeit-Kommunikation mit Ärzten
- Offline-Funktionalität für instabile Internetverbindungen (in Entwicklung)

#### Für Ärzte
- Übersichtliche Darstellung aller aktiven und wartenden Sessions
- Echtzeit-Monitoring von Vitalparametern
- Erstellung und Verwaltung von Behandlungsplänen
- Verwaltung von Behandlungsplan-Vorlagen
- Direkte Kommunikation mit Medics
- Archivierung und Nachverfolgung von abgeschlossenen Sessions

#### Behandlungspläne
- Erstellung von strukturierten Behandlungsplänen
- Schrittweise Abarbeitung von Behandlungsschritten
- Status-Tracking für jeden Behandlungsschritt
- Vorlagen-Verwaltung für häufig verwendete Behandlungspläne
- Echtzeit-Updates des Behandlungsfortschritts

## Technologie-Stack

### Backend
- Node.js mit Express.js
- PostgreSQL
- Prisma ORM
- Socket.IO für Echtzeit-Kommunikation
- JWT für Authentifizierung
- Nodemailer für E-Mail-Benachrichtigungen (geplant)

### Frontend
- React mit Vite
- Redux Toolkit für State Management
- React Router für Navigation
- Material-UI für UI-Komponenten
- Recharts für Datenvisualisierung (geplant)
- Socket.IO Client für Echtzeit-Updates
- IndexedDB für lokale Datenspeicherung (geplant)
- PWA-Features mit Workbox (geplant)

### Infrastruktur
- Docker und Docker Compose
- Nginx als Reverse Proxy
- GitHub für Code-Verwaltung
- CI/CD (geplant)

## Installation

### Voraussetzungen
- Docker Desktop
- Git

### Installationsschritte

1. Repository klonen:
   ```bash
   git clone [repository-url]
   cd telemedix
   ```

2. Umgebungsvariablen einrichten:
   ```bash
   cp .env.example .env
   ```
   Bearbeiten Sie die `.env` Datei nach Bedarf.

3. Docker Container starten:
   ```bash
   docker-compose up -d --build
   ```

4. Testbenutzer initialisieren:
   ```bash
   docker-compose exec backend npx prisma db seed
   ```

### Testbenutzer

Nach der Initialisierung stehen folgende Testbenutzer zur Verfügung:

1. Administrator
   - E-Mail: admin@telemedix.de
   - Passwort: admin123

2. Arzt
   - E-Mail: arzt@telemedix.de
   - Passwort: arzt123

3. Medic
   - E-Mail: medic@telemedix.de
   - Passwort: medic123

## Entwicklung

### Entwicklungsserver starten
```bash
docker-compose up -d
```

### Logs anzeigen
```bash
docker-compose logs -f
```

### Container neustarten
```bash
docker-compose restart
```

### Datenbank zurücksetzen
```bash
docker-compose exec backend npx prisma migrate reset
```

## Dokumentation

- [Docker Anleitung](docs/Docker_Anleitung.md)
- [Benutzeranleitung](docs/Benutzeranleitung.md)
- [Entwicklungsfortschritt](docs/progress.md)

## Lizenz

Copyright (c) 2023 TAKHub-official. Alle Rechte vorbehalten.

Diese Software und die zugehörigen Dokumentationsdateien sind proprietär und vertraulich.
Unbefugte Vervielfältigung, Verbreitung oder Verwendung dieser Software ist strengstens untersagt. 