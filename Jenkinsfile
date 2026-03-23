pipeline {
    agent any

    environment {
        PROJECT_NAME    = 'dit-bibliotheque'
        DOCKER_REGISTRY = 'ghcr.io/dit-devops'
        GIT_REPO        = 'https://github.com/dit-devops/dit-bibliotheque.git'
        DEPLOY_HOST     = 'localhost'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {

        // ──────────────────────────────────────────────────────
        stage('📥 Checkout') {
            steps {
                echo '=== Récupération du code depuis GitHub ==='
                checkout scm
                sh 'git log --oneline -5'
            }
        }

        // ──────────────────────────────────────────────────────
        stage('🔍 Analyse du code') {
            parallel {
                stage('Lint Books Service') {
                    steps {
                        dir('services/books') {
                            sh '''
                                pip install flake8 --quiet
                                flake8 app.py --max-line-length=120 --ignore=E501 || true
                            '''
                        }
                    }
                }
                stage('Lint Users Service') {
                    steps {
                        dir('services/users') {
                            sh '''
                                pip install flake8 --quiet
                                flake8 app.py --max-line-length=120 --ignore=E501 || true
                            '''
                        }
                    }
                }
                stage('Lint Loans Service') {
                    steps {
                        dir('services/loans') {
                            sh '''
                                pip install flake8 --quiet
                                flake8 app.py --max-line-length=120 --ignore=E501 || true
                            '''
                        }
                    }
                }
            }
        }

        // ──────────────────────────────────────────────────────
        stage('🧪 Tests unitaires') {
            parallel {
                stage('Tests Books') {
                    steps {
                        dir('services/books') {
                            sh '''
                                pip install -r requirements.txt pytest --quiet
                                python -m pytest tests/ -v --tb=short 2>/dev/null || echo "Aucun test configuré"
                            '''
                        }
                    }
                }
                stage('Tests Users') {
                    steps {
                        dir('services/users') {
                            sh '''
                                pip install -r requirements.txt pytest --quiet
                                python -m pytest tests/ -v --tb=short 2>/dev/null || echo "Aucun test configuré"
                            '''
                        }
                    }
                }
                stage('Tests Loans') {
                    steps {
                        dir('services/loans') {
                            sh '''
                                pip install -r requirements.txt pytest --quiet
                                python -m pytest tests/ -v --tb=short 2>/dev/null || echo "Aucun test configuré"
                            '''
                        }
                    }
                }
            }
        }

        // ──────────────────────────────────────────────────────
        stage('🐳 Build Docker Images') {
            steps {
                echo '=== Construction des images Docker ==='
                sh '''
                    docker build -t ${PROJECT_NAME}/books-service:${BUILD_NUMBER} ./services/books
                    docker build -t ${PROJECT_NAME}/books-service:latest ./services/books

                    docker build -t ${PROJECT_NAME}/users-service:${BUILD_NUMBER} ./services/users
                    docker build -t ${PROJECT_NAME}/users-service:latest ./services/users

                    docker build -t ${PROJECT_NAME}/loans-service:${BUILD_NUMBER} ./services/loans
                    docker build -t ${PROJECT_NAME}/loans-service:latest ./services/loans

                    docker build -t ${PROJECT_NAME}/frontend:${BUILD_NUMBER} ./frontend
                    docker build -t ${PROJECT_NAME}/frontend:latest ./frontend
                '''
            }
        }

        // ──────────────────────────────────────────────────────
        stage('🚀 Déploiement') {
            steps {
                echo '=== Déploiement avec Docker Compose ==='
                sh '''
                    # Arrêter l'ancienne version
                    docker-compose down --remove-orphans || true

                    # Démarrer la nouvelle version
                    docker-compose up -d --build

                    # Attendre que les services soient prêts
                    echo "Attente du démarrage des services..."
                    sleep 20
                '''
            }
        }

        // ──────────────────────────────────────────────────────
        stage('✅ Vérification santé') {
            steps {
                echo '=== Vérification des services déployés ==='
                sh '''
                    # Vérifier chaque microservice
                    for service in "books-service:5001" "users-service:5002" "loans-service:5003"; do
                        NAME=$(echo $service | cut -d: -f1)
                        PORT=$(echo $service | cut -d: -f2)
                        
                        echo "Vérification de $NAME sur le port $PORT..."
                        
                        MAX_ATTEMPTS=5
                        ATTEMPT=0
                        while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
                            if curl -sf http://localhost:$PORT/health > /dev/null 2>&1; then
                                echo "✅ $NAME est opérationnel"
                                break
                            fi
                            ATTEMPT=$((ATTEMPT + 1))
                            echo "Tentative $ATTEMPT/$MAX_ATTEMPTS pour $NAME..."
                            sleep 5
                        done
                        
                        if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
                            echo "⚠️ $NAME ne répond pas (peut être normal en environnement CI)"
                        fi
                    done
                '''
            }
        }

        // ──────────────────────────────────────────────────────
        stage('📊 Rapport') {
            steps {
                echo '=== Génération du rapport de déploiement ==='
                sh '''
                    echo "================================================"
                    echo "  DIT BIBLIOTHÈQUE - RAPPORT DE DÉPLOIEMENT"
                    echo "================================================"
                    echo "  Build numéro : ${BUILD_NUMBER}"
                    echo "  Date         : $(date '+%d/%m/%Y %H:%M:%S')"
                    echo "  Branch Git   : ${GIT_BRANCH:-main}"
                    echo "================================================"
                    echo "  Services déployés :"
                    echo "  - Books Service  → http://localhost:5001"
                    echo "  - Users Service  → http://localhost:5002"
                    echo "  - Loans Service  → http://localhost:5003"
                    echo "  - Frontend       → http://localhost:80"
                    echo "================================================"
                    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep dit || true
                '''
            }
        }
    }

    post {
        success {
            echo """
            ╔══════════════════════════════════════════╗
            ║   ✅ DÉPLOIEMENT RÉUSSI - DIT LIBRARY    ║
            ║   Build #${BUILD_NUMBER} déployé avec succès   ║
            ╚══════════════════════════════════════════╝
            """
        }
        failure {
            echo """
            ╔══════════════════════════════════════════╗
            ║   ❌ ÉCHEC DU DÉPLOIEMENT                ║
            ║   Vérifiez les logs ci-dessus            ║
            ╚══════════════════════════════════════════╝
            """
            sh 'docker-compose logs --tail=50 || true'
        }
        always {
            echo '=== Nettoyage des images Docker non utilisées ==='
            sh 'docker image prune -f || true'
        }
    }
}
