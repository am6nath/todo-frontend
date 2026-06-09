pipeline {
 
agent any
 
environment {
 
IMAGE = "todo-frontend:${BUILD_NUMBER}"
 
CONT = "todo-frontend"
 
NETWORK = "app-net"
 
}
 
stages {
 
stage('Checkout') {
 
steps { checkout scm }
 
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
 
bat 'docker network create %NETWORK% 2>nul || ver > nul'
 
bat 'docker rm -f %CONT% 2>nul || ver > nul'
 
bat 'docker run -d --name %CONT% --network %NETWORK% --label com.docker.compose.project=todoapp -p 4200:80 %IMAGE%'
 
}
 
}
 
}
}
