# Sistema Distribuido de Generación de Números Primos

Proyecto final para la clase de **Sistemas Distribuidos** - Una aplicación que permite solicitar números primos grandes y distribuye el cálculo entre múltiples workers usando Kubernetes.

---

## Descripción del Proyecto

Este sistema demuestra conceptos clave de sistemas distribuidos:

- **Arquitectura de microservicios**: 3 servicios independientes con responsabilidades específicas
- **Distribución de carga**: Múltiples workers procesando tareas en paralelo
- **Cola de mensajes**: Comunicación asíncrona mediante Redis
- **Orquestación con Kubernetes**: Despliegue escalable y resiliente
- **Base de datos compartida**: PostgreSQL para persistencia de datos

### Casos de uso

Un usuario puede solicitar: *"Quiero 50 números primos de 12 dígitos"*

El sistema:
1. Almacena la solicitud en la base de datos
2. Envía el trabajo a una cola (Redis)
3. Múltiples workers consumen de la cola y generan números primos en paralelo
4. Los resultados se guardan en PostgreSQL
5. El usuario puede consultar el progreso y obtener los resultados

---

## Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│Microservicio│     │Microservicio│     │Microservicio│
│      1      │     │      2      │     │      3      │
│  /nuevo     │     │  /estado    │     │ /resultado  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────┬───────┴───────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
  ┌────▼────┐           ┌──────▼──────┐
  │PostgreSQL│           │    Redis    │
  │   (DB)   │           │   (Cola)    │
  └──────────┘           └──────┬──────┘
                                │
                   ┌────────────┴────────────┐
                   │                         │
            ┌──────▼──────────────────┐      │
            │  Worker Workers (5x)    │      │
            │  Distribución de carga  │◄─────┘
            └─────────────────────────┘
```

### Componentes

| Componente | Tecnología | Puerto | Función |
|------------|-----------|--------|---------|
| **Microservicio 1** | Node.js + Express | 3001 | Crear solicitudes de números primos |
| **Microservicio 2** | Node.js + Express | 3002 | Consultar estado del progreso |
| **Microservicio 3** | Node.js + Express | 3003 | Obtener resultados generados |
| **Workers** | Python | - | Generar números primos (5 réplicas) |
| **PostgreSQL** | PostgreSQL 15 | 5432 | Almacenar solicitudes y resultados |
| **Redis** | Redis Alpine | 6379 | Cola de trabajos |

---

## Inicio Rápido

### Opción 1: Docker Compose (Desarrollo Local)

```bash
# Clonar el repositorio
git clone https://github.com/Juan202021/proyecto-final-distribuidos
cd proyecto-final-distribuidos

# Levantar todos los servicios
docker-compose up --build

# Probar
curl -X POST http://localhost:3001/nuevo \
  -H "Content-Type: application/json" \
  -d '{"cantidad": 10, "digitos": 8}'
```

### Opción 2: Kubernetes (Producción / Killercoda)

```bash
# Clonar el repositorio
git clone https://github.com/Juan202021/proyecto-final-distribuidos
cd proyecto-final-distribuidos/k8s

# Desplegar todo el sistema
chmod +x deploy.sh
./deploy.sh apply

# Verificar
kubectl get pods -n primos-system
```

Ver [k8s/README.md](k8s/README.md) para instrucciones detalladas.

---

## API Reference

### 1. Crear Solicitud

**Endpoint:** `POST /nuevo`

**Body:**
```json
{
  "cantidad": 10,
  "digitos": 8
}
```

**Respuesta:**
```json
{
  "success": true,
  "idSolicitud": "uuid-generado",
  "mensaje": "Solicitud creada: 10 números primos de 8 dígitos"
}
```

**Validaciones:**
- `cantidad`: 1-1000
- `digitos`: 1-20

---

### 2. Consultar Estado

**Endpoint:** `POST /estado`

**Body:**
```json
{
  "idSolicitud": "uuid-de-la-solicitud"
}
```

**Respuesta:**
```json
{
  "total": 10,
  "generados": 7
}
```

---

### 3. Obtener Resultados

**Endpoint:** `POST /resultado`

**Body:**
```json
{
  "idSolicitud": "uuid-de-la-solicitud"
}
```

**Respuesta:**
```json
{
  "totalGenerados": 10,
  "numerosPrimosGenerados": [12345679, 23456789, ...]
}
```

---

## Pruebas Completas

### Ejemplo end-to-end

```bash
# 1. Crear solicitud
SOLICITUD=$(curl -s -X POST http://localhost:30001/nuevo \
  -H "Content-Type: application/json" \
  -d '{"cantidad": 20, "digitos": 10}' | jq -r '.idSolicitud')

echo "ID de solicitud: $SOLICITUD"

# 2. Monitorear progreso
watch "curl -s -X POST http://localhost:30002/estado \
  -H 'Content-Type: application/json' \
  -d '{\"idSolicitud\": \"$SOLICITUD\"}'"

# 3. Obtener resultados
curl -X POST http://localhost:30003/resultado \
  -H "Content-Type: application/json" \
  -d "{\"idSolicitud\": \"$SOLICITUD\"}" | jq
```

---

## Desarrollo

### Estructura del Proyecto

```
proyecto-final-distribuidos/
├── src/
│   ├── libs/                    # Código compartido
│   │   ├── db.js               # Funciones de PostgreSQL
│   │   └── cola.js             # Cliente de Redis
│   └── services/
│       ├── microservicio1/     # API crear solicitudes
│       ├── microservicio2/     # API consultar estado
│       ├── microservicio3/     # API obtener resultados
│       └── worker/             # Worker Python
├── k8s/                        # Manifiestos de Kubernetes
├── database/
│   └── init.sql               # Schema de PostgreSQL
└── docker-compose.yaml        # Configuración local
```

### Algoritmo de Primalidad

Los workers usan **Miller-Rabin determinista** con bases específicas que garantizan 100% de precisión para números menores a 10^16.

Ver: [src/services/worker/worker.py](src/services/worker/worker.py)

---

## Docker Hub

Las imágenes están disponibles públicamente en Docker Hub:

- `jemartinez02/microservicio1:latest`
- `jemartinez02/microservicio2:latest`
- `jemartinez02/microservicio3:latest`
- `jemartinez02/worker:latest`

Ver [k8s/DOCKER_HUB.md](k8s/DOCKER_HUB.md) para instrucciones de cómo construir y subir las imágenes.

---

## Documentación

- **[k8s/README.md](k8s/README.md)** - Guía completa de Kubernetes
- **[k8s/DOCKER_HUB.md](k8s/DOCKER_HUB.md)** - Guía de Docker Hub
- **[k8s/deploy.sh](k8s/deploy.sh)** - Script de despliegue automatizado

---

## 🎓 Conceptos de Sistemas Distribuidos Demostrados

### Escalabilidad Horizontal
- Workers pueden escalarse independientemente: `kubectl scale deployment worker --replicas=10`

### Tolerancia a Fallos
- Múltiples réplicas de cada microservicio
- Si un worker falla, otros continúan procesando

### Desacoplamiento
- Microservicios se comunican mediante cola (no sincrónicamente)
- Cambios en un servicio no afectan a otros

### Distribución de Carga
- Redis BLPOP distribuye tareas automáticamente entre workers disponibles
- Sin coordinación centralizada (cada worker es independiente)

### Idempotencia
- Constraint UNIQUE en base de datos previene duplicados
- Workers pueden reintentar sin efectos secundarios

---

## Tecnologías Utilizadas

- **Backend**: Node.js, Express, Python
- **Base de Datos**: PostgreSQL 15
- **Cola**: Redis
- **Orquestación**: Kubernetes
- **Contenedores**: Docker
- **Algoritmos**: Miller-Rabin determinista

---

## Equipo

- **Desarrollador 1**: Joshua Martinez (@jemartinez02)
- **Desarrollador 2**: Juan Aristizabal

**Curso**: Sistemas Distribuidos  
**Institución**: Universidad de los Llanos 
**Año**: 2025

---

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

## Agradecimientos

- Profesor(a) de Sistemas Distribuidos por la guía y enseñanzas
- Documentación de Kubernetes y Docker
- Comunidad de código abierto