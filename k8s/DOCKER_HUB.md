# 🐳 Guía de Docker Hub - Sistema de Números Primos Distribuidos

Esta guía te ayudará a **subir las imágenes a Docker Hub** (si eres el que construye) o **usar las imágenes** (si solo vas a probar).

---

## 👥 ¿Qué rol tienes?

### 🔨 Rol 1: Construir y Subir Imágenes (Solo 1 persona)

**Si eres la persona que subirá las imágenes por primera vez**, sigue la **Sección A**.

### 🧪 Rol 2: Probar el Sistema

**Si solo vas a probar el sistema** con las imágenes que ya están en Docker Hub, ve directo a la **Sección C**.

---

## 📦 SECCIÓN A: Subir Imágenes a Docker Hub (Primera vez)

### Prerrequisitos ✅

- [ ] Docker instalado y corriendo
- [ ] Cuenta en Docker Hub (gratis)
- [ ] Este repositorio clonado en tu PC

---

### Paso 1: Crear cuenta en Docker Hub (si no tienes)

1. Ve a: https://hub.docker.com/signup
2. Completa el formulario
3. Verifica tu email
4. **Anota tu usuario** (en nuestro caso: `jemartinez02`)

---

### Paso 2: Login a Docker Hub desde tu terminal

```bash
docker login
```

Te pedirá:
- **Username:** `jemartinez02` (o tu usuario)
- **Password:** tu contraseña de Docker Hub

✅ Deberías ver: `Login Succeeded`

---

### Paso 3: Construir y Subir las Imágenes

#### Opción A: Script Automático (⭐ Recomendado)

```bash
# Desde la raíz del proyecto
cd k8s
chmod +x build-and-push.sh
./build-and-push.sh jemartinez02
```

**¿Qué hace el script?**
1. ✅ Login a Docker Hub
2. ✅ Construye las 4 imágenes (micro1, micro2, micro3, worker)
3. ✅ Las sube a tu cuenta
4. ✅ Muestra los enlaces

**Tiempo aproximado:** 5-10 minutos (depende de tu internet)

**Salida esperada:**

```
🐳 Construyendo y subiendo imágenes a Docker Hub
Usuario: jemartinez02

🔐 Iniciando sesión en Docker Hub...
Login Succeeded

📦 [1/4] Construyendo microservicio1...
⬆️  Subiendo microservicio1...
✓ microservicio1 subido

📦 [2/4] Construyendo microservicio2...
⬆️  Subiendo microservicio2...
✓ microservicio2 subido

📦 [3/4] Construyendo microservicio3...
⬆️  Subiendo microservicio3...
✓ microservicio3 subido

📦 [4/4] Construyendo worker...
⬆️  Subiendo worker...
✓ worker subido

✅ ¡Todas las imágenes fueron construidas y subidas exitosamente!
```

---

#### Opción B: Manual (si el script no funciona)

```bash
# Desde la raíz del proyecto

# 1. Microservicio 1
docker build -t jemartinez02/microservicio1:latest -f src/services/microservicio1/Dockerfile .
docker push jemartinez02/microservicio1:latest

# 2. Microservicio 2
docker build -t jemartinez02/microservicio2:latest -f src/services/microservicio2/Dockerfile .
docker push jemartinez02/microservicio2:latest

# 3. Microservicio 3
docker build -t jemartinez02/microservicio3:latest -f src/services/microservicio3/Dockerfile .
docker push jemartinez02/microservicio3:latest

# 4. Worker
docker build -t jemartinez02/worker:latest -f src/services/worker/Dockerfile .
docker push jemartinez02/worker:latest
```

---

### Paso 4: Verificar en Docker Hub

1. Ve a: https://hub.docker.com/repositories/jemartinez02
2. Deberías ver 4 repositorios públicos:
   - ✅ `jemartinez02/microservicio1`
   - ✅ `jemartinez02/microservicio2`
   - ✅ `jemartinez02/microservicio3`
   - ✅ `jemartinez02/worker`

**🎉 ¡Listo! Las imágenes están públicas y listas para usar.**

---

### Paso 5: Hacer commit y push al repositorio

```bash
git add .
git commit -m "Agregados manifiestos de Kubernetes con imágenes en Docker Hub"
git push origin main
```

Ahora tu compañero puede clonar el repo y usar las imágenes.

---

## 🧪 SECCIÓN B: Probar Localmente (Antes de Kubernetes)

### Verificar que las imágenes funcionan con Docker Compose

```bash
# Desde la raíz del proyecto
docker-compose down
docker-compose pull  # Descarga las imágenes de Docker Hub
docker-compose up
```

**Prueba rápida:**
```bash
curl -X POST http://localhost:3001/nuevo \
  -H "Content-Type: application/json" \
  -d '{"cantidad": 5, "digitos": 8}'
```

Si funciona, ¡las imágenes están bien! ✅

---

## 🚀 SECCIÓN C: Usar las Imágenes en Kubernetes (Para tu compañero)

### Para el compañero/a que va a probar en Killercoda

**Ya NO necesitas construir nada**, solo desplegar:

#### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/Juan202021/proyecto-final-distribuidos
cd proyecto-final-distribuidos
```

#### Paso 2: Desplegar en Kubernetes

```bash
cd k8s
chmod +x deploy.sh
./deploy.sh apply
```

Kubernetes automáticamente:
- ✅ Descarga las imágenes de Docker Hub
- ✅ Despliega todo el sistema
- ✅ Levanta 13 pods

**Tiempo:** 2-3 minutos

#### Paso 3: Probar el sistema

```bash
# Crear solicitud
curl -X POST http://localhost:30001/nuevo \
  -H "Content-Type: application/json" \
  -d '{"cantidad": 10, "digitos": 8}'

# Copiar el idSolicitud que te devuelve

# Consultar estado
curl -X POST http://localhost:30002/estado \
  -H "Content-Type: application/json" \
  -d '{"idSolicitud": "TU-ID-AQUI"}'

# Ver resultados
curl -X POST http://localhost:30003/resultado \
  -H "Content-Type: application/json" \
  -d '{"idSolicitud": "TU-ID-AQUI"}'
```

#### Paso 4: Ver logs de workers

```bash
kubectl logs -n primos-system -l app=worker --tail=50
```

Deberías ver los 5 workers procesando en paralelo.

---

## 🆘 Troubleshooting

### ❌ Error: "denied: requested access to the resource is denied"

**Causa:** No hiciste login o usaste el usuario incorrecto.

**Solución:**
```bash
docker login
# Ingresa jemartinez02 y tu password
```

---

### ❌ Error: "no basic auth credentials"

**Causa:** Docker no tiene credenciales.

**Solución:**
```bash
docker login
```

---

### ❌ Error al construir: "Cannot connect to Docker daemon"

**Causa:** Docker Desktop no está corriendo.

**Solución:**
- Abre Docker Desktop
- Espera a que diga "Docker is running"
- Intenta de nuevo

---

### ⏳ Las imágenes tardan mucho en subir

**Normal si tienes internet lento.**

Cada imagen pesa:
- Microservicios: ~100-150 MB cada uno
- Worker: ~200 MB (Python)

**Total:** ~500-600 MB

Con internet normal: 5-10 minutos.

---

### 🔄 Actualizar las imágenes (si hiciste cambios)

Si modificaste el código y quieres actualizar las imágenes:

```bash
cd k8s
./build-and-push.sh jemartinez02
```

Esto reconstruye y sube todo de nuevo.

---

## 📋 Checklist Final

### Para quien sube las imágenes:
- [ ] Cuenta de Docker Hub creada
- [ ] Login exitoso con `docker login`
- [ ] Script ejecutado sin errores
- [ ] 4 imágenes visibles en Docker Hub
- [ ] Cambios subidos a Git (commit + push)

### Para quien prueba:
- [ ] Repositorio clonado
- [ ] Kubernetes corriendo (minikube/killercoda)
- [ ] Deploy exitoso con `./deploy.sh apply`
- [ ] 13 pods en estado Running
- [ ] Endpoints responden correctamente

---

## 🎓 Resumen

**Para construir (1 vez):**
```bash
docker login
cd k8s
./build-and-push.sh jemartinez02
```

**Para probar (varias veces):**
```bash
git clone <repo>
cd proyecto-final-distribuidos/k8s
./deploy.sh apply
```

---

## 🔗 Enlaces Útiles

- Docker Hub del proyecto: https://hub.docker.com/u/jemartinez02
- Documentación de Kubernetes: `k8s/README.md`
- Script de despliegue: `k8s/deploy.sh`

