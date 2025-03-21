# TeleMedix Test Scenario Guide

Diese Anleitung erklärt, wie Sie das beschriebene Szenario mit TeleMedix testen können: Ein Medic erstellt eine Session, die dann von einem Arzt angenommen wird.

## Voraussetzungen

- Docker Desktop muss installiert und ausgeführt werden
- Freie Ports: 80, 3000, 5432

## Setup

1. **Docker-Container bauen und starten:**
   ```
   rebuild-docker.cmd
   ```
   Dies baut alle Docker-Container neu und startet sie.

2. **Datenbank mit Testdaten befüllen:**
   ```
   seed-data.cmd
   ```
   Dies erzeugt Testbenutzer zum Anmelden.

## Testbenutzer

- **Medic:** medic@telemedix.com / medic123
- **Arzt:** doctor@telemedix.com / doctor123
- **Admin:** admin@telemedix.com / admin123

## Testszenario: Medic erstellt Session, Arzt nimmt sie an

### Schritt 1: Als Medic anmelden und Session erstellen

1. Öffnen Sie die Anwendung im Browser: http://localhost
2. Melden Sie sich als Medic an:
   - E-Mail: medic@telemedix.com
   - Passwort: medic123
3. Im Medic-Dashboard, klicken Sie auf "Neue Session"
4. Füllen Sie den Anamnesebogen aus:
   - **Patienten-Daten**:
     - Session-Titel: z.B. "Schmerzen im Oberbauch"
     - Patienten-Code: z.B. "P12345"
     - Alter: z.B. "45"
     - Geschlecht: wählen Sie aus
   - Klicken Sie auf "Weiter"
   - **Vitalwerte**:
     - Herzfrequenz: z.B. "85"
     - Blutdruck: z.B. "120/80"
     - Sauerstoffsättigung: z.B. "98"
     - Andere Werte nach Bedarf
   - Klicken Sie auf "Weiter"
   - **Vorfall**:
     - Beschwerden: z.B. "Patient klagt über starke Schmerzen im Oberbauch seit 3 Stunden"
     - Beschreibung: Details zum Vorfall
     - Vorerkrankungen: z.B. "Bluthochdruck, Diabetes"
   - Klicken Sie auf "Weiter"
   - Überprüfen Sie die **Übersicht** und klicken Sie auf "Session erstellen"
5. Sie werden zur Sessions-Übersicht weitergeleitet
6. Melden Sie sich ab (oben rechts, Benutzermenü)

### Schritt 2: Als Arzt anmelden und Session annehmen

1. Melden Sie sich als Arzt an:
   - E-Mail: doctor@telemedix.com
   - Passwort: doctor123
2. Im Arzt-Dashboard sehen Sie die neu erstellte Session
3. Klicken Sie auf die Session, um die Details zu sehen
4. Klicken Sie auf "Session annehmen"
5. Sie können nun die Patientendaten und Vitalwerte einsehen
6. Unter "Behandlungsplan" können Sie Schritte für die Behandlung hinzufügen
7. Klicken Sie auf "Session abschließen", wenn Sie fertig sind

### Schritt 3: Als Medic den Status prüfen

1. Melden Sie sich ab und wieder als Medic an
2. Im Medic-Dashboard sehen Sie die Session mit dem aktualisierten Status
3. Klicken Sie auf die Session, um die Details und den Behandlungsplan zu sehen

## Fehlerbehebung

- **Docker-Fehler**: Stellen Sie sicher, dass Docker Desktop läuft
- **Port-Konflikte**: Stellen Sie sicher, dass die Ports 80, 3000 und 5432 nicht von anderen Anwendungen verwendet werden
- **Datenbank-Probleme**: Führen Sie `docker-compose down -v` aus, um alle Container und Volumes zu löschen, und starten Sie dann von vorne 