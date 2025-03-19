# TeleMedix

Eine moderne Telemedizin-Plattform zur effizienten Verbindung zwischen Medics und Ärzten in Notfallsituationen.

## Beschreibung

TeleMedix ermöglicht eine nahtlose und intuitive Kommunikation zwischen vor Ort agierenden Medics und zentral stationierten Ärzten. Die Plattform bietet:

- Schnelle Erfassung von Patientendaten mittels vordefinierter Textbausteine und Dropdown-Menüs
- Echtzeit-Übermittlung von Vitalparametern und Patienteninformationen
- Schrittweise Erstellung und Abarbeitung von Behandlungsplänen
- Offline-Funktionalität für instabile Internetverbindungen

## Technologie-Stack

### Backend
- Node.js mit Express.js
- PostgreSQL
- Prisma ORM
- Socket.IO für Echtzeit-Kommunikation
- JWT für Authentifizierung

### Frontend
- React mit Vite
- Redux Toolkit für State Management
- React Router für Navigation
- Material-UI für UI-Komponenten
- Socket.IO Client für Echtzeit-Updates

### Infrastruktur
- Docker und Docker Compose
- Nginx als Reverse Proxy

## Installation

Vollständige Installationsanleitung finden Sie in der [Docker_Anleitung.md](docs/Docker_Anleitung.md).

### Kurze Anleitung

1. Repository klonen
2. Docker Desktop installieren und starten
3. Im Hauptverzeichnis des Projekts ausführen:
   ```
   docker-compose up
   ```

## Nutzung

Ausführliche Nutzungsinformationen finden Sie in der [Benutzeranleitung](docs/Benutzeranleitung.md).

## Lizenz

Copyright (c) 2023 TAKHub-official. Alle Rechte vorbehalten.

Diese Software und die zugehörigen Dokumentationsdateien sind proprietär und vertraulich.
Unbefugte Vervielfältigung, Verbreitung oder Verwendung dieser Software ist strengstens untersagt. 