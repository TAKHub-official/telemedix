# Entwicklungshinweise für TeleMedix

Dieses Dokument enthält wichtige Hinweise für die Entwicklung der TeleMedix-Anwendung.

## Testbenutzer während der Entwicklung

In der Entwicklungsumgebung werden automatisch die folgenden Testbenutzer angelegt:

1. Admin:
   - E-Mail: admin@telemedix.com
   - Passwort: admin123
   - Rolle: ADMIN

2. Arzt:
   - E-Mail: doctor@telemedix.com
   - Passwort: doctor123
   - Rolle: DOCTOR

3. Mediziner:
   - E-Mail: medic@telemedix.com
   - Passwort: medic123
   - Rolle: MEDIC

Diese Benutzer werden beim Start der Anwendung automatisch durch das Prisma-Seed-Skript (`backend/prisma/seed.js`) angelegt. Zusätzlich werden einige Beispiel-Sessions erstellt, um die Funktionalität zu demonstrieren.

## Wichtig vor dem Produktiveinsatz

Vor dem Einsatz in einer Produktivumgebung müssen folgende Änderungen vorgenommen werden:

1. In der `docker-compose.yml`-Datei den `command`-Abschnitt beim Backend-Service entfernen oder auskommentieren, um das automatische Seeding zu deaktivieren:
   ```yaml
   # command: >
   #   sh -c "
   #     sleep 5 &&
   #     npx prisma migrate reset --force &&
   #     npm start
   #   "
   ```

2. Den JWT_SECRET in einer Umgebungsvariable setzen:
   ```bash
   export JWT_SECRET=ein_sicherer_geheimer_schluessel
   ```

3. Starke, eindeutige Passwörter für die Datenbank setzen:
   ```bash
   export DB_PASSWORD=ein_sicheres_passwort
   ```

4. Das Seed-Skript anpassen, um die Erstellung von Testbenutzern zu deaktivieren oder durch echte Benutzer zu ersetzen.

## Datenbankmanagement

### Migration ausführen
```bash
docker-compose exec backend npx prisma migrate dev
```

### Datenbank zurücksetzen
```bash
docker-compose exec backend npx prisma migrate reset --force
```

### Seed-Daten einpflegen
```bash
docker-compose exec backend npx prisma db seed
```

### Prisma Studio starten (Datenbank-UI)
```bash
docker-compose exec backend npx prisma studio
```

## Debugging

### Backend-Logs anzeigen
```bash
docker-compose logs -f backend
```

### Frontend-Logs anzeigen
```bash
docker-compose logs -f frontend
```

### Datenbank-Logs anzeigen
```bash
docker-compose logs -f db
``` 