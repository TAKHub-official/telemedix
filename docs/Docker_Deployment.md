# TeleMedix Docker-Deployment-Anleitung

Diese Anleitung beschreibt, wie Sie TeleMedix mit Docker in einer Produktions- oder Testumgebung deployen können.

## Inhaltsverzeichnis

1. [Voraussetzungen](#voraussetzungen)
2. [Deployment mit Docker Compose](#deployment-mit-docker-compose)
3. [Umgebungsvariablen konfigurieren](#umgebungsvariablen-konfigurieren)
4. [Sicherheitsempfehlungen](#sicherheitsempfehlungen)
5. [Wartung und Updates](#wartung-und-updates)
6. [Backup und Wiederherstellung](#backup-und-wiederherstellung)
7. [Troubleshooting](#troubleshooting)

## Voraussetzungen

- Server mit Linux, Windows oder macOS
- Docker und Docker Compose installiert
- Grundlegende Kenntnisse in der Verwendung von Terminal/Kommandozeile
- Optional: Eigene Domain mit SSL-Zertifikat für HTTPS

## Deployment mit Docker Compose

### 1. Projekt klonen oder kopieren

Kopieren Sie das TeleMedix-Projektverzeichnis auf Ihren Server oder klonen Sie es direkt:

```bash
git clone https://github.com/ihr-username/telemedix.git
cd telemedix
```

### 2. Umgebungsvariablen einrichten

Erstellen Sie eine `.env`-Datei im Hauptverzeichnis des Projekts:

```bash
# Im Projektverzeichnis
cp .env.example .env
# Bearbeiten Sie die .env-Datei mit Ihren eigenen Werten
```

### 3. Container bauen und starten

Führen Sie Docker Compose aus, um die Anwendung zu starten:

```bash
docker-compose up -d
```

Dieser Befehl baut die Container und startet sie im Hintergrund. Beim ersten Start kann dieser Vorgang einige Minuten dauern.

### 4. Auf die Anwendung zugreifen

Nach erfolgreichem Start können Sie auf die Anwendung zugreifen:

- Frontend: `http://ihre-server-ip` oder `http://ihre-domain.de`
- Backend-API: `http://ihre-server-ip:3000` oder `http://api.ihre-domain.de`

## Umgebungsvariablen konfigurieren

Wichtige Umgebungsvariablen, die Sie anpassen sollten:

### Allgemein

- `NODE_ENV`: `production` für Produktionsumgebungen
- `JWT_SECRET`: Ein sicherer, zufälliger String für JWT-Token-Signierung (unbedingt ändern!)
- `JWT_EXPIRATION`: Gültigkeitsdauer der JWT-Tokens (z.B. `1d` für einen Tag)

### Datenbank

- `DB_PASSWORD`: Ein sicheres Passwort für die PostgreSQL-Datenbank
- `DATABASE_URL`: Die Verbindungs-URL für die Datenbank, mit dem Format: `postgresql://postgres:${DB_PASSWORD}@db:5432/telemedix`

### E-Mail (optional)

Wenn Sie E-Mail-Benachrichtigungen aktivieren möchten:

- `EMAIL_HOST`: SMTP-Server-Adresse
- `EMAIL_PORT`: SMTP-Port (meist 587 für TLS)
- `EMAIL_USER`: SMTP-Benutzername
- `EMAIL_PASS`: SMTP-Passwort
- `EMAIL_FROM`: Absender-E-Mail-Adresse

### Beispiel für eine .env-Datei

```
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://ihre-domain.de
JWT_SECRET=ihr_sehr_sicherer_und_langer_zufälliger_string
JWT_EXPIRATION=1d

# Database
DB_PASSWORD=sicheres_datenbank_passwort
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/telemedix

# Email (optional)
EMAIL_HOST=smtp.beispiel.de
EMAIL_PORT=587
EMAIL_USER=benachrichtigungen@ihre-domain.de
EMAIL_PASS=email_passwort
EMAIL_FROM=telemedix@ihre-domain.de
```

## Sicherheitsempfehlungen

Für eine sichere Produktionsumgebung beachten Sie bitte:

1. **Verwenden Sie HTTPS**: Richten Sie ein SSL-Zertifikat ein (z.B. mit Let's Encrypt und Certbot).
2. **Ändern Sie alle Standard-Passwörter**: Insbesondere das Datenbank-Passwort und JWT_SECRET.
3. **Beschränken Sie den Zugriff**: Verwenden Sie Firewalls, um nur die notwendigen Ports freizugeben.
4. **Aktualisieren Sie regelmäßig**: Halten Sie Docker, Images und Abhängigkeiten aktuell.
5. **Erstellen Sie regelmäßige Backups**: Sichern Sie die Datenbank und wichtige Konfigurationsdateien.

## Wartung und Updates

### Updates einspielen

1. Ziehen Sie die neuesten Änderungen:
   ```bash
   git pull
   ```

2. Stoppen Sie die laufenden Container:
   ```bash
   docker-compose down
   ```

3. Bauen Sie die Container neu und starten Sie sie:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

### Logs anzeigen

Um die Logs anzusehen:

```bash
# Alle Container
docker-compose logs

# Spezifischer Dienst
docker-compose logs backend
```

Mit dem Flag `-f` können Sie den Logs in Echtzeit folgen:

```bash
docker-compose logs -f
```

## Backup und Wiederherstellung

### Datenbank-Backup erstellen

```bash
# Im Projektverzeichnis
docker-compose exec db pg_dump -U postgres telemedix > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Datenbank wiederherstellen

```bash
# Im Projektverzeichnis
cat your_backup.sql | docker-compose exec -T db psql -U postgres telemedix
```

## Troubleshooting

### Container starten nicht

Überprüfen Sie die Logs:

```bash
docker-compose logs
```

### Datenbank-Verbindungsprobleme

Stellen Sie sicher, dass die Umgebungsvariablen korrekt sind:

```bash
docker-compose exec backend env | grep DATABASE_URL
```

Testen Sie die Datenbankverbindung:

```bash
docker-compose exec db psql -U postgres -c "SELECT NOW();"
```

### Frontend kann Backend nicht erreichen

Überprüfen Sie, ob die FRONTEND_URL und der CORS-Header richtig konfiguriert sind:

```bash
docker-compose exec backend env | grep FRONTEND_URL
```

---

Bei weiteren Fragen oder Problemen wenden Sie sich bitte an den Support oder öffnen Sie ein Issue auf GitHub. 