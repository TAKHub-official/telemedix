# TeleMedix – Spezifikation der Telemedizin-Webapp

## 1. Einleitung

Die Vision von **TeleMedix** ist es, eine nahtlose und intuitive Telemedizin-Plattform zu schaffen, die in Notfallsituationen eine direkte und effiziente Kommunikation zwischen vor Ort agierenden Medics und zentral stationierten Ärzten ermöglicht. Durch eine speziell optimierte, benutzerfreundliche Weboberfläche – angepasst an Smartphones, Tablets und PCs – sollen Medics Patientendaten schnell und fehlerfrei mittels vordefinierter Textbausteine und Dropdown-Menüs erfassen können, selbst bei instabilen Internetverbindungen dank integrierter Offline-Funktionalitäten und automatischer Synchronisation. Gleichzeitig erhalten Ärzte diese Daten in Echtzeit, können darauf basierend schrittweise Behandlungspläne erstellen und den Behandlungsverlauf mittels visueller Vitalwerte überwachen. Die Administration übernimmt die Benutzerverwaltung und sorgt für eine sichere, revisionssichere Datenarchivierung.

---

## 2. Zielsetzung

TeleMedix richtet sich an drei Hauptbenutzergruppen:

- **Admin:**  
  Verwaltung von Benutzern, Rollenzuweisung, Systemeinstellungen und Audit-Logs.

- **Arzt:**  
  Empfang und Verwaltung von Sessions, Erstellung und Übermittlung schrittweiser Behandlungspläne sowie Überwachung von Vitaldaten und Echtzeit-Updates.

- **Medic:**  
  Erfassung von Patientendaten mittels eines vereinfachten Anamnesebogens und Abarbeitung der vom Arzt erstellten Behandlungspläne. Hierzu zählen auch lokale Zwischenspeicherung und Synchronisation bei instabiler Verbindung.

Übergreifend werden Funktionen wie **Behandlungspläne** und der **Anamnesebogen** implementiert, um eine strukturierte Kommunikation und lückenlose Dokumentation der medizinischen Versorgung zu gewährleisten.

---

## 3. Spezifikation

### 3.1 Funktionale Anforderungen

#### 3.1.1 Admin

- **Benutzerverwaltung:**  
  - **Erstellen:** Anlegen von Benutzerkonten für Ärzte und Medics (mit initialem Passwort, das beim ersten Login geändert werden muss).  
  - **Bearbeiten:** Aktualisierung von Benutzerdaten wie Name, Kontaktinformationen, Rolle und Status.  
  - **Löschen:** Entfernen von Benutzern, wobei historische Daten (z. B. archivierte Sessions) unverändert bleiben.  
  - **Rollenvergabe:** Zuweisung der Benutzerrolle (Arzt, Medic) sowie Festlegung eines leitenden Arztes mit erweiterten Rechten.

- **Systemeinstellungen:**  
  - Konfiguration von Benachrichtigungen (z. B. per E-Mail, Telegram).  
  - Verwaltung globaler Parameter wie Timeout-Werte, Datenschutz- und Sicherheitsrichtlinien.

- **Audit-Logs:**  
  - Protokollierung aller administrativen Aktionen zur revisionssicheren Nachvollziehbarkeit.

#### 3.1.2 Arzt

- **Session-Management:**  
  - Empfang neuer Sessions in einem übersichtlichen Dashboard (Sortierung nach Datum, Priorität, Verletzungsart).  
  - Annahme von Sessions (Statusänderung von "offen" zu "angenommen").  
  - Verwaltung mehrerer aktiver Sessions mit Echtzeit-Updates bei Änderungen (z. B. Vitalwerte).

- **Erstellung von Behandlungsplänen:**  
  - Nutzung eines „Tweet“-ähnlichen Eingabeformats zur Erstellung eines schrittweisen, klar strukturierten Plans.  
  - Möglichkeit, einzelne Schritte zu speichern, zu überprüfen und vor Versand zu bearbeiten.  
  - Echtzeit-Überwachung des Bearbeitungsfortschritts (Anzeige, in welchem Schritt der Medic sich befindet).

- **Datenvisualisierung:**  
  - Darstellung zeitlicher Graphen (z. B. Puls, Blutdruck, SpO₂) zur Überwachung des Patientenverlaufs.

- **Benachrichtigungen:**  
  - Konfigurierbare Optionen für Benachrichtigungen (E-Mail/Telegram) bei neuen Sessions oder Statusänderungen.

#### 3.1.3 Medic

- **Erfassung des Anamnesebogens:**  
  - Bereitstellung einer stark vereinfachten Oberfläche (große Buttons, klare Icons) zur schnellen Datenerfassung.  
  - Verwendung von vordefinierten Textbausteinen und Dropdown-Menüs zur Erfassung von Basisdaten, Vitalparametern und Verletzungshergang.  
  - Auswahl von Prioritätsstufen (normal, dringend, Notfall) mit visuellen Markierungen (Farben, Symbole).

- **Abarbeitung von Behandlungsplänen:**  
  - Anzeige des vom Arzt erstellten, nummerierten Behandlungsplans.  
  - Interaktive Steuerung zum schrittweisen Abarbeiten, mit Verhinderung des Überspringens von Schritten.  
  - Lokale Zwischenspeicherung der Daten und automatische Synchronisation, sobald die Verbindung wieder stabil ist.

- **Feedback und Kommunikation:**  
  - Möglichkeit, dem Arzt Rückmeldungen oder kurze Nachrichten zu senden.  
  - Anzeige des aktuellen Bearbeitungsstatus der Session.

#### 3.1.4 Übergreifende Funktionen

- **Behandlungspläne:**  
  - Erstellung durch den Arzt als Abfolge kurzer, prägnanter Anweisungen.  
  - Übermittlung an den zuständigen Medic mit Echtzeit-Synchronisation.  
  - Nach Start des Plans werden Änderungen gesperrt, um die Nachvollziehbarkeit zu gewährleisten, und der Plan wird archiviert.

- **Anamnesebogen:**  
  - Umfassende Erfassung aller relevanten Patientendaten und Vitalwerte.  
  - Verwendung von vorgefertigten Textbausteinen und Dropdown-Menüs zur Fehlervermeidung.  
  - Lokale Zwischenspeicherung und automatische Synchronisation bei stabiler Internetverbindung.  
  - Möglichkeit zur Versionierung und Anpassung des Protokolls durch den leitenden Arzt.

---

### 3.2 Nicht-funktionale Anforderungen

#### 3.2.1 Performance & Datenoptimierung

- **Minimierung der Datenübertragung:**  
  - Nutzung schlanker JSON-Antworten und HTTP-Kompression (Gzip/Brotli).

- **Optimierung der Ladezeiten:**  
  - Code-Splitting und Lazy Loading von Komponenten.

- **Client-seitige Optimierung:**  
  - Einsatz von Browser-Caching und Service Workern (Workbox) für statische Assets.

#### 3.2.2 Offline-Funktionalitäten

- **PWA-Funktionalität:**  
  - Implementierung von Service Workern und einer Manifest-Datei, damit die App auch offline funktioniert.

- **Lokale Datenspeicherung:**  
  - Nutzung von IndexedDB zur Speicherung von Eingaben und Background Sync zur automatischen Nachsynchronisation.

- **Robuste Synchronisation:**  
  - Implementierung einer Retry-Logik und klarer Regeln zur Konfliktlösung bei Offline-Bearbeitung.

#### 3.2.3 Sicherheit & Datenschutz

- **Datenverschlüsselung:**  
  - TLS (HTTPS) für alle Übertragungen und Verschlüsselung sensibler Daten im Ruhezustand.

- **Authentifizierung & Autorisierung:**  
  - Einsatz von JWT für API-Sicherheit und rollenbasierter Zugriffskontrolle (RBAC).

- **Datenschutz & Compliance:**  
  - Einhaltung von DSGVO und ggf. HIPAA.  
  - Protokollierung wichtiger Aktionen (Audit-Logs).

#### 3.2.4 Benutzerfreundlichkeit & Barrierefreiheit

- **Responsive Design:**  
  - Optimierung der UI für verschiedene Geräte mittels Media Queries, Flexbox und CSS Grid.

- **Intuitive Bedienung:**  
  - Klare Navigation, große Schaltflächen und leicht verständliche Icons, speziell für stressige Einsatzbedingungen.

- **Barrierefreiheit:**  
  - Umsetzung von WCAG-Richtlinien und Option für Mehrsprachigkeit.

#### 3.2.5 Skalierbarkeit & Zuverlässigkeit

- **Skalierbarkeit:**  
  - Einsatz von Cloud-Diensten (z. B. AWS Free Tier) mit Auto-Scaling und Load Balancing.  
  - Containerisierung mit Docker zur Sicherstellung konsistenter Deployments.

- **Zuverlässigkeit:**  
  - Einrichtung von CI/CD-Pipelines (z. B. GitHub Actions).  
  - Monitoring und Logging (z. B. CloudWatch, Prometheus) zur Überwachung der Systemleistung.

---

### 3.3 Use Cases und User Stories

#### 3.3.1 Admin Use Cases

- **Benutzerverwaltung:**  
  *User Story:* „Als Admin möchte ich neue Benutzer anlegen, um Ärzte und Medics mit entsprechenden Rollen zu versorgen.“  
  *Details:* Formular zum Anlegen neuer Benutzer, automatische Passwortgenerierung und Übersicht mit Such-/Filterfunktionen.

- **Rollenvergabe:**  
  *User Story:* „Als Admin möchte ich Benutzern bestimmte Rollen zuweisen, damit sie die korrekten Funktionen nutzen können.“  
  *Details:* Möglichkeit zur Änderung von Benutzerrollen und Festlegung eines leitenden Arztes.

- **Audit-Logs:**  
  *User Story:* „Als Admin möchte ich alle Änderungen protokollieren, um eine nachvollziehbare Historie zu gewährleisten.“

#### 3.3.2 Arzt Use Cases

- **Session-Management:**  
  *User Story:* „Als Arzt möchte ich alle neuen Sessions in einem Dashboard sehen, um schnell die relevanten Fälle zu bearbeiten.“  
  *Details:* Anzeige offener Sessions, Filtermöglichkeiten und Statusänderung (z. B. Annahme einer Session).

- **Behandlungsplan-Erstellung:**  
  *User Story:* „Als Arzt möchte ich einen detaillierten Behandlungsplan erstellen, um dem Medic klare Anweisungen zu geben.“  
  *Details:* Eingabeformular im „Tweet“-Format, schrittweises Speichern und Statusanzeige des Fortschritts.

- **Vitalwerteüberwachung:**  
  *User Story:* „Als Arzt möchte ich Diagramme der erfassten Vitalwerte einsehen, um den Behandlungserfolg zu kontrollieren.“

#### 3.3.3 Medic Use Cases

- **Erfassung des Anamnesebogens:**  
  *User Story:* „Als Medic möchte ich einen vereinfachten Anamnesebogen ausfüllen, um unter Stress alle relevanten Patientendaten schnell zu erfassen.“  
  *Details:* Nutzung von vordefinierten Textbausteinen, Dropdowns und visueller Prioritätsauswahl.

- **Abarbeitung von Behandlungsplänen:**  
  *User Story:* „Als Medic möchte ich den Behandlungsplan Schritt für Schritt abarbeiten, um die Behandlung systematisch durchzuführen.“  
  *Details:* Anzeige nummerierter Schritte, interaktive Steuerung und Echtzeit-Rückmeldung an den Arzt.

- **Feedback:**  
  *User Story:* „Als Medic möchte ich dem Arzt bei Unklarheiten direkt Feedback geben können.“

#### 3.3.4 Übergreifende Use Cases

- **Behandlungspläne:**  
  *User Story (Arzt):* „Als Arzt möchte ich einen detaillierten Behandlungsplan erstellen und an den zuständigen Medic übermitteln.“  
  *User Story (Medic):* „Als Medic möchte ich den übermittelten Plan abrufen und in klaren Schritten umsetzen.“  
  *Details:* Echtzeit-Synchronisation, Sperrung von Änderungen nach Start und Archivierung des Plans.

- **Anamnesebogen:**  
  *User Story (Medic):* „Als Medic möchte ich den Anamnesebogen mit vorgefertigten Bausteinen ausfüllen, um die Patientendaten vollständig zu erfassen.“  
  *User Story (Arzt):* „Als leitender Arzt möchte ich das Layout und die abgefragten Parameter des Anamnesebogens definieren.“  
  *Details:* Lokale Speicherung, automatische Synchronisation und Versionierung.

---

### 3.4 Szenarien / Beispielabläufe

Ein exemplarisches Szenario:

1. **Erfassung:** Ein Medic füllt in einem Notfalleinsatz den Anamnesebogen über die vereinfachte Oberfläche aus.  
2. **Synchronisation:** Die Daten werden lokal gespeichert und synchronisiert, sobald eine stabile Verbindung besteht.  
3. **Benachrichtigung:** Der Arzt erhält in Echtzeit eine Benachrichtigung und sieht die neue Session in seinem Dashboard.  
4. **Intervention:** Der Arzt übernimmt die Session, erstellt basierend auf dem Anamnesebogen einen schrittweisen Behandlungsplan und sendet diesen an den Medic.  
5. **Abarbeitung:** Der Medic arbeitet den Plan Schritt für Schritt ab, gibt Rückmeldungen und aktualisiert kontinuierlich die Vitalwerte.  
6. **Archivierung:** Nach Abschluss wird die Session archiviert und alle Daten stehen für spätere Analysen zur Verfügung.

---

## 4. Technische Architektur & Tools

### 4.1 Backend

- **Plattform:** Node.js  
- **Framework:** Express.js  
- **Sicherheit:** JWT, Socket.IO für Echtzeitkommunikation  
- **Datenbank:** PostgreSQL, Anbindung via Prisma  
- **Weitere Tools:** Nodemailer, node-telegram-bot-api

### 4.2 Frontend

- **Framework:** React  
- **Projektaufbau:** Vite  
- **Routing:** React Router  
- **State Management:** Redux Toolkit  
- **UI-Bibliothek:** Material-UI (MUI)  
- **Datenvisualisierung:** Recharts  
- **PWA-Funktionalität:** Workbox

### 4.3 Deployment & Infrastruktur

- **Containerisierung:** Docker (mit Dockerfiles für Frontend und Backend)  
- **Orchestrierung:** Docker Compose  
- **Cloud:** VPS (z. B. AWS Free Tier, DigitalOcean o.ä.)  
- **Reverse-Proxy:** Nginx (mit HTTPS via Let's Encrypt)  
- **CI/CD:** GitHub Actions  
- **Versionskontrolle:** Git (z. B. auf GitHub)

---

## 5. Schritt-für-Schritt Entwicklungsplan

### Phase 1: MVP – Grundfunktionalitäten

1. **Projektsetup und Versionskontrolle:**  
   - Git-Repository erstellen, Ordnerstruktur anlegen (Frontend, Backend, Docker Compose, Docs) und erste Commits durchführen.

2. **Backend-Entwicklung (MVP):**  
   - Node.js-Projekt initialisieren und einen Express-Server mit Basis-Endpunkten (z. B. Test-Endpunkt, POST/GET für Sessions) erstellen.  
   - Vorläufige Datenspeicherung (In-Memory oder SQLite) implementieren.  
   - Lokale Tests durchführen und Änderungen committen.

3. **Frontend-Entwicklung (MVP):**  
   - React-Projekt mit Vite initialisieren und grundlegende Seiten (Login, Dashboard, Session-Formular) mit React Router erstellen.  
   - Einfache API-Anbindung zum Backend implementieren (z. B. zum Erstellen und Abrufen von Sessions).  
   - Lokale Tests durchführen und Änderungen committen.

4. **Integration & Lokale Tests:**  
   - Frontend und Backend zusammenführen (z. B. über Docker Compose) und alle grundlegenden Abläufe testen (Anmeldung, Session-Erstellung, Anzeige).  
   - Erste Fehlerbehebung, Logging und Debugging durchführen.  
   - Den integrierten MVP-Stand committen.

### Phase 2: Erweiterung und Zusatzfeatures

1. **Backend-Erweiterungen:**  
   - Sichere Authentifizierung mit JWT und rollenbasierter Zugriffskontrolle implementieren.  
   - Erweiterte Session-Logik (Statusänderungen, Behandlungsplan-Management) hinzufügen.  
   - Umstieg von In-Memory/SQLite auf PostgreSQL mit Prisma realisieren.  
   - Echtzeit-Kommunikation via Socket.IO integrieren.  
   - Änderungen committen und testen.

2. **Frontend-Erweiterungen:**  
   - Benutzeroberflächen mit Material-UI optimieren und erweiterte Dashboards für Arzt und Medic implementieren.  
   - Zusätzliche Formulare (detaillierte Behandlungspläne, erweiterter Anamnesebogen) einbauen.  
   - Offline-Funktionalitäten mittels Workbox und IndexedDB hinzufügen.  
   - Erweiterte Validierung, Fehlermeldungen und Nutzerfeedback implementieren.  
   - Änderungen committen und testen.

3. **Systemintegration:**  
   - Externe Dienste einbinden (z. B. E-Mail-Versand über Nodemailer, Telegram-Benachrichtigungen).  
   - Performance-Optimierungen (HTTP-Kompression, Caching) vornehmen.  
   - Reverse-Proxy (Nginx) einrichten und CI/CD-Pipeline finalisieren.  
   - Umfassende Integrationstests durchführen und committen.

### Phase 3: Finaler Test, Deployment und Monitoring

1. **Deployment auf einem VPS:**  
   - VPS vorbereiten, Docker installieren und den Code vom Git-Repository klonen.  
   - Mit Docker Compose alle Container (Frontend, Backend, Datenbank) im Produktionsmodus starten.  
   - DNS konfigurieren, Domain mit der VPS-IP verknüpfen und Nginx als Reverse-Proxy (mit HTTPS) einrichten.

2. **Monitoring und Logging:**  
   - Monitoring-Tools (z. B. CloudWatch, Prometheus) einrichten, um die Systemleistung zu überwachen.  
   - Laufende Überwachung und Fehlerbehebung durchführen.

3. **Feedback und kontinuierliche Verbesserung:**  
   - Nutzerfeedback sammeln und regelmäßige Updates planen.  
   - Iterative Erweiterungen und Sicherheits-/Performance-Updates implementieren.

---

## 6. Zusammenfassung

Dieses Dokument bietet eine umfassende Spezifikation und einen strukturierten Entwicklungsplan für die TeleMedix-Webapp. Die Plattform ermöglicht eine effiziente Kommunikation in Notfallsituationen, indem sie Medics und Ärzte über eine intuitive, plattformübergreifende Weboberfläche vernetzt. Durch einen schrittweisen Entwicklungsansatz – beginnend mit einem minimal funktionsfähigen MVP und anschließender Erweiterung um sichere Authentifizierung, Offline-Funktionalitäten und Echtzeit-Kommunikation – wird eine robuste, skalierbare und benutzerfreundliche Lösung geschaffen.

Dieses Dokument dient als Grundlage für die weitere Entwicklung und kann an Entwickler übergeben werden, um die Vision von TeleMedix präzise und nachvollziehbar umzusetzen.

---

*Ende der Spezifikation*
