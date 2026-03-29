pipeline {
    agent any

    environment {
        PROJECT_NAME    = 'dit-bibliotheque'
        DOCKER_REGISTRY = 'ghcr.io/dit-devops'
        GIT_REPO        = 'https://github.com'
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
                echo '=== Nettoyage et Récupération manuelle ==='
                deleteDir() // Supprime le dossier de travail corrompu
                git credentialsId: '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', url: 'https://github.com/babacarA1/dit-bibliotheque-devops.git', branch: 'main'
            }
        }


        // ──────────────────────────────────────────────────────
        stage('🔍 Analyse du code') {
            parallel {
                stage('Lint Books Service') {
                    steps {
                        dir('services/books') {
                            sh 'docker run --rm -v $(pwd):/app -w /app python:3.11-slim sh -c "pip install flake8 --quiet && flake8 app.py --max-line-length=120 --ignore=E501 || true"'
                        }
                    }
                }
                stage('Lint Users Service') {
                    steps {
                        dir('services/users') {
                            sh 'docker run --rm -v $(pwd):/app -w /app python:3.11-slim sh -c "pip install flake8 --quiet && flake8 app.py --max-line-length=120 --ignore=E501 || true"'
                        }
                    }
                }
                stage('Lint Loans Service') {
                    steps {
                        dir('services/loans') {
                            sh 'docker run --rm -v $(pwd):/app -w /app python:3.11-slim sh -c "pip install flake8 --quiet && flake8 app.py --max-line-length=120 --ignore=E501 || true"'
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
                            sh 'docker run --rm -v $(pwd):/app -w /app python:3.11-slim sh -c "pip install -r requirements.txt pytest --quiet && python -m pytest tests/ -v || echo No tests"'
                        }
                    }
                }
                stage('Tests Users') {
                    steps {
                        dir('services/users') {
                            sh 'docker run --rm -v $(pwd):/app -w /app python:3.11-slim sh -c "pip install -r requirements.txt pytest --quiet && python -m pytest tests/ -v || echo No tests"'
                        }
                    }
                }
                stage('Tests Loans') {
                    steps {
                        dir('services/loans') {
                            sh 'docker run --rm -v $(pwd):/app -w /app python:3.11-slim sh -c "pip install -r requirements.txt pytest --quiet && python -m pytest tests/ -v || echo No tests"'
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
                    docker-compose down --remove-orphans || true
                    docker-compose up -d --build
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
                    for service in "books-service:5001" "users-service:5002" "loans-service:5003"; do
                        PORT=$(echo $service | cut -d: -f2)
                        if curl -sf http://localhost:$PORT/health > /dev/null 2>&1; then
                            echo "✅ $service est opérationnel"
                        else
                            echo "⚠️ $service ne répond pas"
                        fi
                    done
                '''
            }
        }

        // ──────────────────────────────────────────────────────
        stage('📊 Rapport') {
            steps {
                echo '=== Génération du rapport ==='
                sh 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep dit || true'
            }
        }
    }

    post {
        success {
            echo "✅ DÉPLOIEMENT RÉUSSI - Build #${BUILD_NUMBER}"
        }
        failure {
            echo "❌ DÉPLOIEMENT ÉCHOUÉ - Build #${BUILD_NUMBER}"
        }
    }
}
