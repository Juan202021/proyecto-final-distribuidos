#!/bin/bash

# Script de despliegue para Kubernetes
# Uso: ./deploy.sh [apply|delete|status]

set -e

NAMESPACE="primos-system"
K8S_DIR="$(dirname "$0")"

function apply_manifests() {
    echo "🚀 Desplegando sistema de números primos distribuidos..."
    echo ""
    
    echo "📦 Paso 1: Creando namespace y configuración..."
    kubectl apply -f "$K8S_DIR/00-namespace.yaml"
    kubectl apply -f "$K8S_DIR/01-configmap.yaml"
    echo "✓ Namespace y ConfigMaps creados"
    echo ""
    
    echo "🗄️  Paso 2: Desplegando PostgreSQL..."
    kubectl apply -f "$K8S_DIR/02-postgres.yaml"
    echo "⏳ Esperando a que PostgreSQL esté listo..."
    kubectl wait --for=condition=ready pod -l app=postgres -n $NAMESPACE --timeout=120s
    echo "✓ PostgreSQL listo"
    echo ""
    
    echo "📡 Paso 3: Desplegando Redis..."
    kubectl apply -f "$K8S_DIR/03-redis.yaml"
    echo "⏳ Esperando a que Redis esté listo..."
    kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=60s
    echo "✓ Redis listo"
    echo ""
    
    echo "🔧 Paso 4: Desplegando microservicios..."
    kubectl apply -f "$K8S_DIR/04-microservicio1.yaml"
    kubectl apply -f "$K8S_DIR/05-microservicio2.yaml"
    kubectl apply -f "$K8S_DIR/06-microservicio3.yaml"
    echo "⏳ Esperando a que los microservicios estén listos..."
    kubectl wait --for=condition=ready pod -l app=microservicio1 -n $NAMESPACE --timeout=120s
    kubectl wait --for=condition=ready pod -l app=microservicio2 -n $NAMESPACE --timeout=120s
    kubectl wait --for=condition=ready pod -l app=microservicio3 -n $NAMESPACE --timeout=120s
    echo "✓ Microservicios listos"
    echo ""
    
    echo "👷 Paso 5: Desplegando workers..."
    kubectl apply -f "$K8S_DIR/07-worker.yaml"
    echo "⏳ Esperando a que los workers estén listos..."
    kubectl wait --for=condition=ready pod -l app=worker -n $NAMESPACE --timeout=120s
    echo "✓ Workers listos"
    echo ""
    
    echo "✅ ¡Despliegue completado exitosamente!"
    echo ""
    show_status
}

function delete_manifests() {
    echo "🗑️  Eliminando todos los recursos..."
    kubectl delete namespace $NAMESPACE --ignore-not-found=true
    echo "✓ Recursos eliminados"
}

function show_status() {
    echo "📊 Estado del sistema:"
    echo ""
    echo "Pods:"
    kubectl get pods -n $NAMESPACE -o wide
    echo ""
    echo "Services:"
    kubectl get services -n $NAMESPACE
    echo ""
    echo "🌐 Acceso a los microservicios:"
    echo "  - Microservicio 1 (crear solicitud): http://localhost:30001/nuevo"
    echo "  - Microservicio 2 (consultar estado): http://localhost:30002/estado"
    echo "  - Microservicio 3 (obtener resultados): http://localhost:30003/resultado"
    echo ""
    echo "💡 Ejemplo de uso:"
    echo '  curl -X POST http://localhost:30001/nuevo \'
    echo '    -H "Content-Type: application/json" \'
    echo '    -d '"'"'{"cantidad": 10, "digitos": 8}'"'"
}

function show_logs() {
    echo "📋 Logs de los workers (últimas 20 líneas):"
    kubectl logs -n $NAMESPACE -l app=worker --tail=20 --prefix=true
}

# Main
case "${1:-apply}" in
    apply)
        apply_manifests
        ;;
    delete)
        delete_manifests
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "Uso: $0 [apply|delete|status|logs]"
        echo ""
        echo "Comandos:"
        echo "  apply   - Despliega todos los recursos"
        echo "  delete  - Elimina todos los recursos"
        echo "  status  - Muestra el estado del sistema"
        echo "  logs    - Muestra los logs de los workers"
        exit 1
        ;;
esac
