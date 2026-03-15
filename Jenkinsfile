pipeline {
    agent any

    environment {
        DOCKER_HOST = "unix:///home/prajwal-inna/.docker/desktop/docker.sock"
    }

    stages {

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

    }
}