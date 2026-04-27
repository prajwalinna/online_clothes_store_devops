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

        stage('Run Containers') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Verify Containers') {
            steps {
                sh 'docker ps'
            }
        }

        stage('Push to Nexus') {
            when { expression { env.CHANGE_ID != null } }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'nexus-creds',
                    usernameVariable: 'NEXUS_USER',
                    passwordVariable: 'NEXUS_PASS'
                )]) {
                    sh """
                    docker login ${NEXUS_REGISTRY} -u ${NEXUS_USER} -p ${NEXUS_PASS}

                    docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/backend:${IMAGE_TAG}
                    docker push ${NEXUS_REGISTRY}/${NEXUS_REPO}/frontend:${IMAGE_TAG}

                    docker logout ${NEXUS_REGISTRY}
                    """
                }
            }
        }
    }

    post {
        success {
            script {
                if (env.CHANGE_ID) {
                    echo "Build successful! Pushed to Nexus. Merging PR #${env.CHANGE_ID}..."
                    withCredentials([string(credentialsId: 'github-token', variable: 'GH_TOKEN')]) {
                        sh """
                        curl -s -X PUT \
                          -H "Accept: application/vnd.github+json" \
                          -H "Authorization: Bearer \$GH_TOKEN" \
                          -H "X-GitHub-Api-Version: 2022-11-28" \
                          -d '{"commit_title":"Merge PR #${env.CHANGE_ID} automatically via Jenkins", "merge_method":"merge"}' \
                          https://api.github.com/repos/${GITHUB_REPO}/pulls/${env.CHANGE_ID}/merge
                        """
                    }
                }
            }
        }

        failure {
            script {
                if (env.CHANGE_ID) {
                    echo "Build failed! Closing PR #${env.CHANGE_ID}..."
                    withCredentials([string(credentialsId: 'github-token', variable: 'GH_TOKEN')]) {
                        sh """
                        curl -s -X PATCH \
                          -H "Accept: application/vnd.github+json" \
                          -H "Authorization: Bearer \$GH_TOKEN" \
                          -H "X-GitHub-Api-Version: 2022-11-28" \
                          -d '{"state":"closed"}' \
                          https://api.github.com/repos/${GITHUB_REPO}/pulls/${env.CHANGE_ID}
                        """
                    }
                }
            }
        }

        always {
            sh 'docker compose down || true'
        }
    }
}
