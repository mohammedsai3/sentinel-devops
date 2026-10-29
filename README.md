# Sentinel DevSecOps Platform 🛡️⚡

> Plateforme collaborative DevSecOps de nouvelle génération propulsée par **Groq LPU** (Inférence IA ultra-rapide en ~40ms). Permet d'importer n'importe quel projet de code (dépôt GitHub ou fichiers locaux) pour l'auditer, le refactorer, tester sa sécurité et orchestrer son déploiement.

---

## 📌 Statut du Projet
- [x] **Backend & APIs (`server/`)** : **Terminé à 100%**
  - Serveur Express avec endpoints REST sécurisés (`/api/users`, `/api/incidents`, `/api/roles`, `/api/audit-logs`)
  - Moteur d'audit 360° et génération de correctifs automatisés via Groq LPU
  - Inspecteur de dépôts GitHub publics en temps réel (`/api/github/inspect`)
  - Base de données immuable avec persistance JSON et horodatage UTC
- [x] **Frontend & Cockpits par Rôle (`src/`)** :
  - **Développeur** : AI Code Refactoring, Jest Test Generator, CI/CD Pipeline Debugger
  - **Sécurité** : Threat Intelligence & Générateur WAF/Suricata, Audit de conformité SOC2/ISO27001/RGPD
  - **QA / Testeur** : Générateur de tests E2E Playwright/Cypress, K6 Stress Lab
  - **Admin / SRE** : Matrice RBAC Zero-Trust, Topologie Kubernetes & FinOps Cloud, Synthèse Exécutive Comex
- [ ] **Extensions Collaboratives** : En cours de contribution par l'équipe

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) v18+ installé

### 1. Installation
```bash
git clone https://github.com/mohammedsai3/sentinel-devops.git
cd sentinel-devops
npm install
```

### 2. Configuration des Variables d'Environnement
Copiez le fichier `.env.example` en `.env` :
```bash
cp .env.example .env
```
Renseignez votre clé d'API Groq (gratuite sur [console.groq.com](https://console.groq.com)) :
```env
GROQ_API_KEY=gsk_votre_cle_ici
VITE_GROQ_API_KEY=gsk_votre_cle_ici
PORT=5000
```

### 3. Lancer l'Application

**Lancer le Backend (Terminal 1) :**
```bash
node server/index.js
```
*(Le serveur API démarre sur http://localhost:5000)*

**Lancer le Frontend (Terminal 2) :**
```bash
npm run dev
```
*(L'application web est accessible sur http://localhost:5173)*

---

## 👥 Guide de Contribution pour l'Équipe (Workflow Git)

Pour collaborer sans écraser le code original sur la branche principale :

1. **Créer une branche dédiée à votre tâche :**
   ```bash
   git checkout -b feat/nom-de-votre-fonctionnalite
   ```
2. **Effectuer vos modifications et commiter :**
   ```bash
   git add .
   git commit -m "feat: description des changements"
   ```
3. **Pousser votre branche sur GitHub :**
   ```bash
   git push origin feat/nom-de-votre-fonctionnalite
   ```
4. **Créer une Pull Request sur GitHub** pour relecture et fusion dans `main`.

---

## 🔒 Sécurité
Les clés d'API et variables sensibles ne doivent **jamais** être commitées dans le dépôt. Le fichier `.gitignore` protège automatiquement les fichiers `.env` et les dossiers de build.
