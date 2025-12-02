# ✅ Checklist Pre-Push - Proyecto Final Distribuidos

## 📋 Verificación Antes de Hacer Push

### 1. Archivos del Proyecto

- [x] `src/libs/cola.js` - Usa Redis en vez de BullMQ
- [x] `src/libs/db.js` - Funciones de base de datos
- [x] `src/services/microservicio1/nuevo.js` - Con validaciones
- [x] `src/services/microservicio2/estado.js` - Consulta estado
- [x] `src/services/microservicio3/resultado.js` - Obtiene resultados
- [x] `src/services/worker/worker.py` - Con logging mejorado
- [x] `docker-compose.yaml` - Incluye worker
- [x] `database/init.sql` - Schema de PostgreSQL

### 2. Manifiestos de Kubernetes

- [x] `k8s/00-namespace.yaml`
- [x] `k8s/01-configmap.yaml`
- [x] `k8s/02-postgres.yaml`
- [x] `k8s/03-redis.yaml`
- [x] `k8s/04-microservicio1.yaml` - Con `jemartinez02/microservicio1:latest`
- [x] `k8s/05-microservicio2.yaml` - Con `jemartinez02/microservicio2:latest`
- [x] `k8s/06-microservicio3.yaml` - Con `jemartinez02/microservicio3:latest`
- [x] `k8s/07-worker.yaml` - Con `jemartinez02/worker:latest`
- [x] `k8s/deploy.sh` - Script de despliegue
- [x] `k8s/build-and-push.sh` - Script para Docker Hub
- [x] `k8s/README.md` - Documentación de K8s
- [x] `k8s/DOCKER_HUB.md` - Guía de Docker Hub

### 3. Documentación

- [x] `README.md` - README principal completo
- [x] Incluye arquitectura del sistema
- [x] Incluye guía de inicio rápido
- [x] Incluye API reference
- [x] Incluye conceptos de sistemas distribuidos

### 4. Verificar Usuario de Docker Hub

- [x] Todos los manifiestos usan `jemartinez02` (no `TU_USUARIO_DOCKERHUB`)
- [x] Script `build-and-push.sh` acepta el usuario como parámetro

---

## 🐳 Subir Imágenes a Docker Hub

### Paso 1: Login

```bash
docker login
```

- **Username:** jemartinez02
- **Password:** [tu password]

### Paso 2: Construir y Subir

```bash
cd k8s
chmod +x build-and-push.sh
./build-and-push.sh jemartinez02
```

### Paso 3: Verificar en Docker Hub

Ve a: https://hub.docker.com/u/jemartinez02

Deberías ver:
- [ ] microservicio1
- [ ] microservicio2
- [ ] microservicio3
- [ ] worker

---

## 🧪 Probar Localmente ANTES de Push

### Test 1: Docker Compose

```bash
docker-compose down
docker-compose up --build
```

En otra terminal:
```bash
curl -X POST http://localhost:3001/nuevo \
  -H "Content-Type: application/json" \
  -d '{"cantidad": 5, "digitos": 8}'
```

**Esperado:**
- [x] Devuelve `idSolicitud`
- [x] Workers procesan (ver logs)
- [x] Estado muestra progreso
- [x] Resultados contienen números primos

---

## 📤 Git Push

### Verificar cambios

```bash
git status
```

### Agregar archivos

```bash
git add .
```

### Commit

```bash
git commit -m "Proyecto completo: microservicios + Kubernetes + Docker Hub

- Arreglada comunicación microservicios-worker (Redis RPUSH/BLPOP)
- Agregados manifiestos de Kubernetes (5 workers, 3 microservicios)
- Imágenes subidas a Docker Hub (jemartinez02)
- Documentación completa (README, k8s/README, DOCKER_HUB.md)
- Script automatizado de despliegue
"
```

### Push

```bash
git push origin main
```

---

## 👥 Para tu Compañero

Una vez que hagas push, tu compañero puede:

```bash
# Clonar el repo
git clone https://github.com/Juan202021/proyecto-final-distribuidos
cd proyecto-final-distribuidos

# Opción 1: Probar con Docker Compose
docker-compose up

# Opción 2: Desplegar en Kubernetes (Killercoda)
cd k8s
./deploy.sh apply
```

**No necesita construir nada** - las imágenes se descargan de Docker Hub automáticamente.

---

## 📝 Instrucciones para tu Compañero

Comparte este mensaje:

> Hey! Ya subí todo el proyecto a GitHub y las imágenes a Docker Hub.
> 
> **Para probarlo:**
> 
> 1. Clona el repo: `git clone https://github.com/Juan202021/proyecto-final-distribuidos`
> 2. Lee el archivo `k8s/DOCKER_HUB.md` - Sección C (para quien va a probar)
> 3. Ve a Killercoda: https://killercoda.com/playgrounds
> 4. Selecciona "Kubernetes Playground"
> 5. Ejecuta:
> ```bash
> git clone https://github.com/Juan202021/proyecto-final-distribuidos
> cd proyecto-final-distribuidos/k8s
> ./deploy.sh apply
> ```
> 
> Todo se descarga automáticamente de Docker Hub. En 2-3 minutos deberías tener 13 pods corriendo.
> 
> Cualquier duda, revisa el README principal o el `k8s/README.md`

---

## 🎯 Checklist Final

Antes de hacer push, verifica:

- [ ] Docker Compose funciona localmente
- [ ] Imágenes subidas a Docker Hub
- [ ] Todos los YAML tienen `jemartinez02`
- [ ] README.md está completo
- [ ] DOCKER_HUB.md es claro para el compañero
- [ ] Scripts tienen permisos de ejecución (chmod +x)
- [ ] .gitignore está bien configurado
- [ ] No hay credenciales hardcodeadas

---

## 🚀 Post-Push

Después de hacer push:

1. [ ] Verificar que el repo se vea bien en GitHub
2. [ ] Probar clonar en otra carpeta
3. [ ] Enviar instrucciones al compañero
4. [ ] Programar sesión de prueba en Killercoda juntos
5. [ ] Preparar presentación del proyecto

---

## 📊 Métricas del Proyecto

- **Archivos totales:** ~30
- **Líneas de código:** ~1500
- **Microservicios:** 3
- **Workers:** 5 réplicas
- **Pods totales en K8s:** 13
- **Imágenes Docker:** 4
- **Tiempo de despliegue:** 2-3 minutos

---

¡Listo para entregar! 🎉
