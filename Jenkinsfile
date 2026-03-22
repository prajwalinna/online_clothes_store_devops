pipeline {
    agent any

    environment {
        DOCKER_HOST = "unix:///home/prajwal-inna/.docker/desktop/docker.sock"
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

        // stage('SonarQube Analysis') {
        //     steps {
        //         withSonarQubeEnv('sonarqube') {
        //             sh '''
        //             sonar-scanner \
        //             -Dsonar.projectKey=online-clothing-store \
        //             -Dsonar.sources=. \
        //             -Dsonar.host.url=http://localhost:9000 \
        //             -Dsonar.login=sqa_0f12922c95892f7bb4e0ee6bad82e6c15c5ae56d
        //             '''
        //         }
        //     }
        // }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
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
        stage('Upload artifact to nexus'){
            steps {

            }
        }

    }

    post {

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