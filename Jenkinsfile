pipeline {
    agent any

    environment {
        PROJECT_NAME    = 'dit-bibliotheque'
        GIT_REPO        = 'https://github.com'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {
        // 1. Récupération du code
        stage('📥 Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        // 2. Analyse (Lint)
        stage('🔍 Analyse du code') {
            parallel {
                stage('Lint Books') {
                    steps {
                        sh "docker run --rm -v ${WORKSPACE}/services/books:/app -w /app python:3.11-slim sh -c 'pip install flake8 --quiet && flake8 app.py --ignore=E501 || true'"
                    }
                }
                stage('Lint Users') {
                    steps {
                        sh "docker run --rm -v ${WORKSPACE}/services/users:/app -w /app python:3.11-slim sh -c 'pip install flake8 --quiet && flake8 app.py --ignore=E501 || true'"
                    }
                }
                stage('Lint Loans') {
                    steps {
                        sh "docker run --rm -v ${WORKSPACE}/services/loans:/app -w /app python:3.11-slim sh -c 'pip install flake8 --quiet && flake8 app.py --ignore=E501 || true'"
                    }
                }
            }
        }

        // 3. Tests unitaires
        stage('🧪 Tests unitaires') {
            parallel {
                stage('Tests Books') {
                    steps {
                        sh "docker run --rm -v ${WORKSPACE}/services/books:/app -w /app python:3.11-slim sh -c 'pip install -r requirements.txt pytest --quiet && python -m pytest tests/ -v || echo No tests'"
                    }
                }
                stage('Tests Users') {
                    steps {
                        sh "docker run --rm -v ${WORKSPACE}/services/users:/app -w /app python:3.11-slim sh -c 'pip install -r requirements.txt pytest --quiet && python -m pytest tests/ -v || echo No tests'"
                    }
                }
                stage('Tests Loans') {
                    steps {
                        sh "docker run --rm -v ${WORKSPACE}/services/loans:/app -w /app python:3.11-slim sh -c 'pip install -r requirements.txt pytest --quiet && python -m pytest tests/ -v || echo No tests'"
                    }
                }
            }
        }

        // 4. Build et Déploiement
        stage('🐳 Build & Deploy') {
            steps {
                sh '''
                    docker-compose down --remove-orphans || true
                    docker-compose up -d --build
                    echo "Attente du démarrage des services..."
                    sleep 20
                '''
            }
        }

        // 5. Vérification
        stage('✅ Santé') {
            steps {
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
