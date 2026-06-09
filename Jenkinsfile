pipeline {
 
    agent any
 
    environment {
        IMAGE = "todo-frontend:${BUILD_NUMBER}"
        CONT = "todo-frontend"
    }
 
    stages {
 
        stage('Checkout') {
            steps { 
                checkout scm 
            }
        }
 
        stage('Debug') {
            steps {
                bat 'echo IMAGE=%IMAGE%'
            }
        }
 
        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE% .'
            }
        }
 
        stage('Run Container') {
            steps {
                bat 'docker rm -f %CONT% 2>nul'
                bat 'docker run -d --name %CONT% -p 4200:80 %IMAGE%'
            }
        }
    }
}
