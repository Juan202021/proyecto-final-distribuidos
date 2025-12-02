#!/bin/bash

# Script para construir y subir imágenes a Docker Hub
# Uso: ./build-and-push.sh TU_USUARIO_DOCKERHUB

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar tu usuario de Docker Hub"
    echo ""
    echo "Uso: ./build-and-push.sh TU_USUARIO_DOCKERHUB"
    echo ""
    echo "Ejemplo: ./build-and-push.sh juanperez"
    exit 1
fi

DOCKER_USER=$1
PROJECT_ROOT="$(dirname "$0")/.."

echo "🐳 Construyendo y subiendo imágenes a Docker Hub"
echo "Usuario: $DOCKER_USER"
echo ""

# Login a Docker Hub
echo "🔐 Iniciando sesión en Docker Hub..."
docker login
echo ""

# Microservicio 1
echo "📦 [1/4] Construyendo microservicio1..."
cd "$PROJECT_ROOT"
docker build -t $DOCKER_USER/microservicio1:latest -f src/services/microservicio1/Dockerfile .
echo "⬆️  Subiendo microservicio1..."
docker push $DOCKER_USER/microservicio1:latest
echo "✓ microservicio1 subido"
echo ""

# Microservicio 2
echo "📦 [2/4] Construyendo microservicio2..."
docker build -t $DOCKER_USER/microservicio2:latest -f src/services/microservicio2/Dockerfile .
echo "⬆️  Subiendo microservicio2..."
docker push $DOCKER_USER/microservicio2:latest
echo "✓ microservicio2 subido"
echo ""

# Microservicio 3
echo "📦 [3/4] Construyendo microservicio3..."
docker build -t $DOCKER_USER/microservicio3:latest -f src/services/microservicio3/Dockerfile .
echo "⬆️  Subiendo microservicio3..."
docker push $DOCKER_USER/microservicio3:latest
echo "✓ microservicio3 subido"
echo ""

# Worker
echo "📦 [4/4] Construyendo worker..."
docker build -t $DOCKER_USER/worker:latest -f src/services/worker/Dockerfile .
echo "⬆️  Subiendo worker..."
docker push $DOCKER_USER/worker:latest
echo "✓ worker subido"
echo ""

echo "✅ ¡Todas las imágenes fueron construidas y subidas exitosamente!"
echo ""
echo "📝 Próximo paso:"
echo "   Actualiza los manifiestos de Kubernetes reemplazando TU_USUARIO_DOCKERHUB con: $DOCKER_USER"
echo ""
echo "   Puedes hacerlo manualmente o ejecutar:"
echo "   sed -i 's/TU_USUARIO_DOCKERHUB/$DOCKER_USER/g' k8s/*.yaml"
echo ""
echo "🔗 Imágenes disponibles en:"
echo "   - https://hub.docker.com/r/$DOCKER_USER/microservicio1"
echo "   - https://hub.docker.com/r/$DOCKER_USER/microservicio2"
echo "   - https://hub.docker.com/r/$DOCKER_USER/microservicio3"
echo "   - https://hub.docker.com/r/$DOCKER_USER/worker"
