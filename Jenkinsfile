pipeline {
    agent any

    environment {
        DOCKER_HOST = "unix:///home/prajwal-inna/.docker/desktop/docker.sock"
        NEXUS_REGISTRY = "localhost:8083"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Start MongoDB') {
            steps {
                sh '''
                docker rm -f test-mongo || true
                docker run -d -p 27017:27017 --name test-mongo mongo
                '''
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

        stage('Run Backend Tests') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    sh '''
                    sonar-scanner \
                    -Dsonar.projectKey=online-clothing-store \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=http://localhost:9000 \
                    -Dsonar.login=sqa_0f12922c95892f7bb4e0ee6bad82e6c15c5ae56d
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Tag Docker Images') {
            steps {
                sh '''
                docker tag online-clothing-ci-backend ${NEXUS_REGISTRY}/backend:${IMAGE_TAG}
                docker tag online-clothing-ci-frontend ${NEXUS_REGISTRY}/frontend:${IMAGE_TAG}
                '''
            }
        }

        stage('Login to Nexus') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'nexus-docker',
                    usernameVariable: 'NEXUS_USER',
                    passwordVariable: 'NEXUS_PASS'
                )]) {
                    sh '''
                    docker logout ${NEXUS_REGISTRY} || true
                    echo $NEXUS_PASS | docker login ${NEXUS_REGISTRY} \
                    -u $NEXUS_USER --password-stdin
                    '''
                }
            }
        }

        stage('Push Images to Nexus') {
            steps {
                sh '''
                docker push ${NEXUS_REGISTRY}/backend:${IMAGE_TAG}
                docker push ${NEXUS_REGISTRY}/frontend:${IMAGE_TAG}
                '''
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
    }

    post {

        always {
            sh 'docker rm -f test-mongo || true'
        }

        success {
            script {
                if (env.CHANGE_ID) {
                    setGitHubPullRequestStatus(
                        context: 'jenkins/build',
                        state: 'SUCCESS'
                    )
                }
            }
        }

        failure {
            script {
                if (env.CHANGE_ID) {
                    setGitHubPullRequestStatus(
                        context: 'jenkins/build',
                        state: 'FAILURE'
                    )
                }
            }
        }

        unstable {
            script {
                if (env.CHANGE_ID) {
                    setGitHubPullRequestStatus(
                        context: 'jenkins/build',
                        state: 'FAILURE'
                    )
                }
            }
        }
    }
}