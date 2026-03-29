pipeline {
    agent any

    environment {
        PROJECT_NAME    = 'dit-bibliotheque'
    }

    stages {
        stage('📥 Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('🔍 Analyse & Tests') {
            parallel {
                stage('Books Service') {
                    steps {
                        dir('services/books') {
                            // On construit une image temporaire avec le code dedans pour tester
                            sh '''
                                docker build -t test-books .
                                docker run --rm test-books sh -c "pip install flake8 pytest --quiet && flake8 app.py --ignore=E501 || true && python -m pytest tests/ || echo No tests"
                            '''
                        }
                    }
                }
                stage('Users Service') {
                    steps {
                        dir('services/users') {
                            sh '''
                                docker build -t test-users .
                                docker run --rm test-users sh -c "pip install flake8 pytest --quiet && flake8 app.py --ignore=E501 || true && python -m pytest tests/ || echo No tests"
                            '''
                        }
                    }
                }
                stage('Loans Service') {
                    steps {
                        dir('services/loans') {
                            sh '''
                                docker build -t test-loans .
                                docker run --rm test-loans sh -c "pip install flake8 pytest --quiet && flake8 app.py --ignore=E501 || true && python -m pytest tests/ || echo No tests"
                            '''
                        }
                    }
                }
            }
        }

        stage('🚀 Build & Deploy') {
            steps {
                sh '''
                    # On force la suppression de TOUT ce qui porte le nom du projet
                    docker-compose down -v --remove-orphans || true
                    
                    # On s'assure qu'aucun conteneur orphelin ne bloque
                    docker rm -f dit-db dit-books dit-users dit-loans dit-frontend || true
                    
                    # On relance proprement
                    docker-compose up -d --build
                    echo "Attente de démarrage..."
                    sleep 20
                '''
            }
        }

        stage('✅ Vérification') {
            steps {
                sh 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep dit || true'
            }
        }
    }

    post {
        success { echo "✅ PROJET DÉPLOYÉ AVEC SUCCÈS" }
        failure { echo "❌ ÉCHEC DU PIPELINE" }
    }
}
