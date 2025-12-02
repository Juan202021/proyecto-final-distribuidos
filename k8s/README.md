# Despliegue en Kubernetes - Sistema de Números Primos Distribuidos

Este directorio contiene los manifiestos de Kubernetes para desplegar el sistema completo.

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      Kubernetes Cluster                      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Microservicio│  │ Microservicio│  │ Microservicio│       │
│  │      1       │  │      2       │  │      3       │       │
│  │ (2 réplicas) │  │ (2 réplicas) │  │ (2 réplicas) │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
│         └─────────────────┼─────────────────┘                │
│                           │                                  │
│         ┌─────────────────┴─────────────────┐                │
│         │                                   │                │
│    ┌────▼─────┐                     ┌───────▼──────┐         │
│    │PostgreSQL│                     │    Redis     │         │
│    │  (DB)    │                     │   (Cola)     │         │
│    └──────────┘                     └───────┬──────┘         │
│                                             │                │
│                    ┌────────────────────────┘                │
│                    │                                         │
│         ┌──────────▼──────────┐                              │
│         │   Worker Workers    │                              │
│         │   (5 réplicas)      │                              │
│         │  Distribución de    │                              │
│         │      carga          │                              │
│         └─────────────────────┘                              │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Archivos

- `00-namespace.yaml` - Namespace dedicado `primos-system`
- `01-configmap.yaml` - Variables de entorno y script de inicialización de DB
- `02-postgres.yaml` - PostgreSQL para almacenar solicitudes y resultados
- `03-redis.yaml` - Redis para cola de trabajos
- `04-microservicio1.yaml` - API para crear solicitudes (NodePort 30001)
- `05-microservicio2.yaml` - API para consultar estado (NodePort 30002)
- `06-microservicio3.yaml` - API para obtener resultados (NodePort 30003)
- `07-worker.yaml` - Workers que procesan los números primos (5 réplicas)
- `deploy.sh` - Script automatizado de despliegue

## 🚀 Despliegue en Killercoda

### Paso 1: Clonar el repositorio

```bash
git clone <tu-repo>
cd proyecto-final-distribuidos
```

### Paso 2: Construir las imágenes Docker

En Killercoda, construye las imágenes localmente:

```bash
# Microservicio 1
docker build -t microservicio1:latest -f src/services/microservicio1/Dockerfile .

# Microservicio 2  
docker build -t microservicio2:latest -f src/services/microservicio2/Dockerfile .

# Microservicio 3
docker build -t microservicio3:latest -f src/services/microservicio3/Dockerfile .

# Worker
docker build -t worker:latest -f src/services/worker/Dockerfile .
```

### Paso 3: Desplegar con el script

```bash
cd k8s
chmod +x deploy.sh
./deploy.sh apply
```

El script automáticamente:
1. ✅ Crea el namespace y ConfigMaps
2. ✅ Despliega PostgreSQL y espera a que esté listo
3. ✅ Despliega Redis y espera a que esté listo
4. ✅ Despliega los 3 microservicios
5. ✅ Despliega los 5 workers
6. ✅ Muestra el estado final

### Paso 4: Verificar el despliegue

```bash
# Ver todos los pods
kubectl get pods -n primos-system

# Ver todos los servicios
kubectl get services -n primos-system

# Ver logs de los workers
kubectl logs -n primos-system -l app=worker --tail=50
```

## 🧪 Probar el Sistema

### 1. Crear una solicitud

```bash
curl -X POST http://localhost:30001/nuevo \
  -H "Content-Type: application/json" \
  -d '{"cantidad": 20, "digitos": 10}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "idSolicitud": "abc-123-...",
  "mensaje": "Solicitud creada: 20 números primos de 10 dígitos"
}
```

### 2. Consultar el estado

```bash
curl -X POST http://localhost:30002/estado \
  -H "Content-Type: application/json" \
  -d '{"idSolicitud": "abc-123-..."}'
```

**Respuesta esperada:**
```json
{
  "total": 20,
  "generados": 15
}
```

### 3. Obtener los resultados

```bash
curl -X POST http://localhost:30003/resultado \
  -H "Content-Type: application/json" \
  -d '{"idSolicitud": "abc-123-..."}'
```

**Respuesta esperada:**
```json
{
  "totalGenerados": 20,
  "numerosPrimosGenerados": [1234567891, 2345678901, ...]
}
```

## 📊 Monitoreo

### Ver logs de workers en tiempo real

```bash
kubectl logs -n primos-system -l app=worker -f
```

Deberías ver cómo los diferentes workers procesan las tareas:

```
worker-deployment-xxx | 📥 Nueva solicitud recibida:
worker-deployment-xxx |    ID: abc-123
worker-deployment-xxx |    Cantidad: 20 números primos
worker-deployment-xxx |    Dígitos: 10
worker-deployment-yyy | 📥 Nueva solicitud recibida:
worker-deployment-yyy |    ID: def-456
...
```

### Ver estado detallado

```bash
./deploy.sh status
```

### Ver solo logs de workers

```bash
./deploy.sh logs
```

## 🔧 Escalamiento

### Aumentar workers

```bash
kubectl scale deployment worker-deployment -n primos-system --replicas=10
```

### Aumentar microservicios

```bash
kubectl scale deployment microservicio1-deployment -n primos-system --replicas=5
```

## 🗑️ Limpieza

```bash
./deploy.sh delete
```

O manualmente:

```bash
kubectl delete namespace primos-system
```

## 📝 Notas Importantes

- **NodePorts**: Los servicios están expuestos en puertos 30001-30003
- **ImagePullPolicy**: Configurado como `Never` para usar imágenes locales en Killercoda
- **Resources**: Cada pod tiene límites de CPU y memoria configurados
- **Workers**: 5 réplicas por defecto para demostrar distribución de carga
- **Persistencia**: No hay volúmenes persistentes (solo para pruebas/demo)

## 🎓 Para el Proyecto Final

Este despliegue demuestra:
- ✅ Arquitectura de microservicios
- ✅ Distribución de carga con múltiples workers
- ✅ Comunicación asíncrona mediante cola (Redis)
- ✅ Orquestación con Kubernetes
- ✅ Escalabilidad horizontal
- ✅ Separación de responsabilidades
