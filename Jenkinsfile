pipeline {
    agent any

    environment {
        NEXUS_REGISTRY="host.docker.internal"
        IMAGE_TAG="pr-${env.CHANGE_ID}-build-${env.BUILD_ID}"
        GITHUB_REPO = "prajwalinna/online_clothes_store_devops"
        DOCKER_HOST = "unix:///var/run/docker.sock"
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

        stage('Build and label Docker Images') {
            steps {
                script {
                    sh "docker build -t ${NEXUS_REGISTRY}/cloth-shop/backend:${IMAGE_TAG} ./backend"
                    sh "docker build -t ${NEXUS_REGISTRY}/cloth-shop/frontend:${IMAGE_TAG} ./frontend"
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

        stage('Uploading the artifact to SonaType Nexus') {
            when { expression { env.CHANGE_ID !=null } }
            steps {
                withCredentials([usernamePassword(credentialsId: 'nexus-creds',passwordVariable: 'NEXUS_PASS' , usernameVariable: 'NEXUS_USER')]){
                    sh "docker login -u ${NEXUS_USER} -p ${NEXUS_PASS} https://${NEXUS_REGISTRY}"
                    sh "docker push ${NEXUS_REGISTRY}/cloth-shop/backend:${IMAGE_TAG}"
                    sh "docker push ${NEXUS_REGISTRY}/cloth-shop/frontend:${IMAGE_TAG}"

                    sh "docker logout http://${NEXUS_REGISTRY}"
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