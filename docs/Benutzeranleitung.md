# TeleMedix - Benutzeranleitung

## Inhaltsverzeichnis

1. [Einführung](#einführung)
2. [Installation und Einrichtung](#installation-und-einrichtung)
3. [Anmeldung und Navigation](#anmeldung-und-navigation)
4. [Admin-Bereich](#admin-bereich)
5. [Arzt-Bereich](#arzt-bereich)
6. [Medic-Bereich](#medic-bereich)
7. [Häufig gestellte Fragen](#häufig-gestellte-fragen)

## Einführung

TeleMedix ist eine moderne Telemedizin-Plattform, die in Notfällen eine direkte und effiziente Verbindung zwischen vor Ort tätigen Medics und zentral arbeitenden Ärzten ermöglicht. "Bringing Doctors Closer" - das ist unser Motto.

Mit TeleMedix können Medics Patientendaten schnell und intuitiv erfassen, auch unter schwierigen Bedingungen dank Offline-Funktionalitäten. Diese Daten werden in Echtzeit an Ärzte übermittelt, die daraufhin schrittweise Behandlungspläne erstellen und den Patientenverlauf überwachen können.

## Installation und Einrichtung

### Voraussetzungen

- Docker Desktop (für die Datenbank)
- Node.js (Version 16 oder höher)
- npm (normalerweise mit Node.js installiert)
- Ein moderner Browser (Chrome, Firefox, Edge)

### Erstmalige Einrichtung

1. Stellen Sie sicher, dass Docker Desktop installiert ist und läuft.
2. Führen Sie die Datei `start-dev.cmd` aus, die sich im Hauptverzeichnis des Projekts befindet.
3. Folgen Sie den Anweisungen auf dem Bildschirm, um die Entwicklungsumgebung einzurichten und zu starten.

Während der Einrichtung werden folgende Schritte ausgeführt:

- Starten eines PostgreSQL-Datenbankcontainers
- Installation der Abhängigkeiten für Backend und Frontend
- Ausführen der Datenbankmigrationen und Seed-Daten
- Starten der Entwicklungsserver für Backend und Frontend

### Zugangsdaten

Für Testzwecke stehen folgende Benutzer zur Verfügung:

- **Admin**: admin@telemedix.com / admin123
- **Arzt**: dr.mueller@telemedix.com / doctor123
- **Medic**: medic.wagner@telemedix.com / medic123

## Anmeldung und Navigation

1. **Anmeldung**: Öffnen Sie http://localhost:5173 in Ihrem Browser und geben Sie Ihre Zugangsdaten ein.
2. Nach erfolgreicher Anmeldung werden Sie je nach Rolle automatisch weitergeleitet:
   - Admins zum Admin-Dashboard
   - Ärzte zur Session-Übersicht
   - Medics zur Session-Übersicht

## Admin-Bereich

Im Admin-Bereich können Sie:

1. **Benutzer verwalten**:
   - Neue Benutzer anlegen (Ärzte, Medics)
   - Bestehende Benutzer bearbeiten oder deaktivieren
   - Benutzerrollen ändern

2. **Systemeinstellungen konfigurieren**:
   - Benachrichtigungseinstellungen (E-Mail, Telegram)
   - Allgemeine Systemparameter

3. **Audit-Logs einsehen**:
   - Protokolle über Systemaktivitäten prüfen
   - Nach Benutzer, Aktion oder Zeitraum filtern

## Arzt-Bereich

Als Arzt können Sie:

1. **Sessions verwalten**:
   - Offene Sessions ansehen und annehmen
   - Patientendaten und Vitalwerte einsehen
   - Detaillierten Überblick über den Patientenzustand erhalten

2. **Behandlungspläne erstellen**:
   - Schrittweise Anweisungen formulieren
   - Behandlungspläne an Medics übermitteln
   - Fortschritt der Behandlung überwachen

3. **Vitalwerte überwachen**:
   - Grafische Darstellung von Trends
   - Echtzeit-Updates erhalten
   - Kritische Veränderungen erkennen

## Medic-Bereich

Als Medic können Sie:

1. **Neue Sessions erstellen**:
   - Patientendaten erfassen
   - Anamnesebogen ausfüllen
   - Sessions an verfügbare Ärzte übermitteln

2. **Behandlungspläne abarbeiten**:
   - Vom Arzt erhaltene Anweisungen schrittweise umsetzen
   - Schritte als abgeschlossen markieren
   - Rückmeldungen an den Arzt senden

3. **Vitalwerte dokumentieren**:
   - Regelmäßige Messungen erfassen
   - Veränderungen im Patientenzustand festhalten
   - Notizen und Beobachtungen hinzufügen

## Häufig gestellte Fragen

### Wie funktioniert die Offline-Funktionalität?

TeleMedix speichert Daten lokal, wenn keine Internetverbindung besteht, und synchronisiert sie automatisch, sobald die Verbindung wiederhergestellt ist. So können Sie auch in Bereichen mit schlechter Netzabdeckung arbeiten.

### Wie erhalte ich Benachrichtigungen?

Benachrichtigungen werden innerhalb der Anwendung angezeigt. Je nach Konfiguration können auch E-Mail- oder Telegram-Benachrichtigungen aktiviert werden.

### Was passiert bei einem Systemausfall?

Alle Daten werden regelmäßig gesichert. Bei einem Systemausfall werden keine Daten verloren, und die Anwendung kann schnell wiederhergestellt werden.

### Wie kann ich mein Passwort ändern?

Über Ihr Benutzerprofil können Sie jederzeit Ihr Passwort ändern. Klicken Sie dazu auf Ihren Namen oben rechts und wählen Sie "Passwort ändern".

### Ist die Kommunikation sicher?

Ja, alle Daten werden verschlüsselt übertragen und gespeichert. TeleMedix erfüllt die gängigen Datenschutz- und Sicherheitsstandards für medizinische Anwendungen. 