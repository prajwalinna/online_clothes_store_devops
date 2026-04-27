pipeline {
    agent any

    environment {
        NEXUS_REGISTRY = "192.168.29.10:8082"
        NEXUS_REPO = "my-docker-repo"
        IMAGE_TAG = "pr-${env.CHANGE_ID ?: 'dev'}-build-${env.BUILD_ID}"
        GITHUB_REPO = "prajwalinna/online_clothes_store_devops"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh """
                    docker build -t ${NEXUS_REGISTRY}/${NEXUS_REPO}/backend:${IMAGE_TAG} ./backend
                    docker build -t ${NEXUS_REGISTRY}/${NEXUS_REPO}/frontend:${IMAGE_TAG} ./frontend
                    """
                }
            }
        }

        stage('Push to Nexus') {
            when {
                anyOf {
                    expression { env.CHANGE_ID != null }
                    branch 'development'
                }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'nexus-creds',
                    usernameVariable: 'NEXUS_USER',
                    passwordVariable: 'NEXUS_PASS'
                )]) {
                    sh """
                    echo "${NEXUS_PASS}" | docker login ${NEXUS_REGISTRY} -u ${NEXUS_USER} --password-stdin

                    docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/backend:${IMAGE_TAG}
                    docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/frontend:${IMAGE_TAG}

                    docker logout ${NEXUS_REGISTRY}
                    """
                }
            }
        }

        stage('Run Containers (Optional)') {
            when {
                branch 'development'
            }
            steps {
                sh 'docker compose up -d'
                sh 'docker ps'
            }
        }
    }

    post {
        always {
            sh 'docker compose down || true'
        }
    }
}