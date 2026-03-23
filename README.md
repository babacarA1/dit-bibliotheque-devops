# 📚 DIT Bibliothèque Numérique — Microservices

> Projet DevOps — Master 1 Intelligence Artificielle — Dakar Institute of Technology  
> Période : 09 Mars 2026 → 29 Mars 2026

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     NAVIGATEUR CLIENT                       │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP :80
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (Nginx + React/Vite SPA)              │
│                      Port: 80                               │
└────┬──────────────────┬─────────────────────┬───────────────┘
     │ /api/books       │ /api/users          │ /api/loans
     ▼                  ▼                     ▼
┌──────────┐     ┌──────────┐         ┌──────────────┐
│  Books   │     │  Users   │         │    Loans     │
│ Service  │     │ Service  │◄────────│   Service    │
│ :5001    │     │ :5002    │         │   :5003      │
└────┬─────┘     └────┬─────┘         └──────┬───────┘
     │               │                       │
     └───────────────┴───────────────────────┘
                         │
                         ▼
               ┌──────────────────┐
               │   PostgreSQL     │
               │   Database :5432 │
               └──────────────────┘
```

---

## 🚀 Installation et Lancement

### Prérequis
- Docker ≥ 24.0
- Docker Compose ≥ 2.0
- Git

### 1. Cloner le dépôt

```bash
git clone https://github.com/dit-devops/dit-bibliotheque.git
cd dit-bibliotheque
```

### 2. Lancer avec Docker Compose

```bash
# Construction et démarrage de tous les services
docker-compose up -d --build

# Vérifier que tous les services sont en cours d'exécution
docker-compose ps
```

### 3. Accéder à l'application

| Service | URL |
|---------|-----|
| 🖥️ Frontend | http://localhost |
| 📖 Books API | http://localhost:5001 |
| 👥 Users API | http://localhost:5002 |
| 🔄 Loans API | http://localhost:5003 |

### 4. Arrêter les services

```bash
docker-compose down
# Pour supprimer aussi les volumes (base de données)
docker-compose down -v
```

---

## 🧩 Microservices

### 📖 Books Service (Port 5001)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/books` | Lister tous les livres |
| GET | `/api/books?search=<term>` | Rechercher par titre/auteur/ISBN |
| GET | `/api/books/:id` | Détail d'un livre |
| POST | `/api/books` | Ajouter un livre |
| PUT | `/api/books/:id` | Modifier un livre |
| DELETE | `/api/books/:id` | Supprimer un livre |
| GET | `/api/books/stats` | Statistiques |

### 👥 Users Service (Port 5002)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/users` | Lister les utilisateurs |
| GET | `/api/users?type=Etudiant` | Filtrer par type |
| GET | `/api/users/:id` | Profil utilisateur |
| POST | `/api/users` | Créer un utilisateur |
| PUT | `/api/users/:id` | Modifier un utilisateur |
| DELETE | `/api/users/:id` | Supprimer un utilisateur |
| POST | `/api/users/login` | Authentification |

### 🔄 Loans Service (Port 5003)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/loans` | Historique des emprunts |
| GET | `/api/loans?status=active` | Emprunts actifs |
| GET | `/api/loans?status=overdue` | Emprunts en retard |
| POST | `/api/loans` | Emprunter un livre |
| PUT | `/api/loans/:id/return` | Retourner un livre |
| GET | `/api/loans/stats` | Statistiques |

---

## 🔧 Pipeline Jenkins

### Prérequis Jenkins
- Jenkins ≥ 2.400
- Plugins : Pipeline, Git, Docker Pipeline
- Docker installé sur l'agent Jenkins

### Configuration

1. Créer un nouveau **Pipeline** dans Jenkins
2. Dans "Pipeline" → "Definition" → sélectionner **"Pipeline script from SCM"**
3. SCM : **Git**, URL : `https://github.com/dit-devops/dit-bibliotheque.git`
4. Script Path : `Jenkinsfile`

### Étapes du pipeline

```
📥 Checkout → 🔍 Analyse Code → 🧪 Tests → 🐳 Build Docker → 🚀 Deploy → ✅ Health Check → 📊 Rapport
```

---

## 📁 Structure du projet

```
dit-bibliotheque/
├── services/
│   ├── books/
│   │   ├── app.py              # Flask API - Microservice Livres
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── users/
│   │   ├── app.py              # Flask API - Microservice Utilisateurs
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── loans/
│       ├── app.py              # Flask API - Microservice Emprunts
│       ├── requirements.txt
│       └── Dockerfile
├── frontend/
│   ├── src/                    # Code source React (App, Composants, Pages)
│   ├── package.json            # Dépendances Vite & React
│   ├── vite.config.js          # Configuration Vite
│   ├── index.html              # Point d'entrée SPA
│   ├── nginx.conf              # Config reverse proxy
│   └── Dockerfile              # Dockerfile Multi-stage (Node + Nginx)
├── frontend-old/               # Ancienne version HTML (Backup)
├── docker-compose.yml          # Orchestration Docker
├── Jenkinsfile                 # Pipeline CI/CD
└── README.md
```

---

## 🛠️ Technologies

| Composant | Technologie |
|-----------|------------|
| Backend | Python / Flask |
| Base de données | PostgreSQL 15 |
| Frontend | React 18 / Vite / JSX |
| Conteneurisation | Docker |
| Orchestration | Docker Compose |
| Reverse Proxy | Nginx |
| CI/CD | Jenkins |
| Contrôle de version | Git / GitHub |

---

## 👥 Types d'utilisateurs

- **Étudiant** — Emprunter des livres, consulter le catalogue
- **Professeur** — Accès prioritaire, durée d'emprunt étendue
- **Personnel administratif** — Gestion complète du système

---

## 📊 Exemples d'appels API

```bash
# Lister tous les livres
curl http://localhost:5001/api/books

# Rechercher un livre
curl "http://localhost:5001/api/books?search=python"

# Créer un utilisateur
curl -X POST http://localhost:5002/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Moussa Diop","email":"moussa@dit.sn","user_type":"Etudiant"}'

# Emprunter un livre
curl -X POST http://localhost:5003/api/loans \
  -H "Content-Type: application/json" \
  -d '{"book_id":1,"user_id":1}'

# Retourner un livre
curl -X PUT http://localhost:5003/api/loans/1/return
```

---

*DIT — Dakar Institute of Technology · DevOps Master 1 · 2026*
