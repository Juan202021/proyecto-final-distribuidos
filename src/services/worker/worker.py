import os
import json
import random
import redis
import psycopg2
from psycopg2 import sql

# --- CONFIGURACIÓN ---
# Usamos variables de entorno para que funcione igual en tu PC y en Docker
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_NAME = os.getenv('DB_NAME', 'primos_db')
DB_USER = os.getenv('DB_USER', 'usuario')
DB_PASS = os.getenv('DB_PASS', 'password')

# --- CONEXIONES ---
print(f"🚀 Iniciando Worker...")
print(f"📡 Conectando a Redis en {REDIS_HOST}:6379")
print(f"🗄️  Conectando a PostgreSQL en {DB_HOST}")

# Conexión a Redis
r_queue = redis.Redis(host=REDIS_HOST, port=6379, db=0, decode_responses=True)

# Probar conexión
try:
    r_queue.ping()
    print("✓ Conexión a Redis exitosa")
except Exception as e:
    print(f"❌ Error conectando a Redis: {e}")
    exit(1)

# Conexión a Base de Datos
def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )

# --- LÓGICA MATEMÁTICA ---
def es_primo(n):
    """
    Verifica si n es primo. Garantiza 100% de primalidad para números de 12 dígitos.
    Usa una variante determinista de Miller-Rabin para enteros de 64 bits.
    """
    if n < 2: return False
    if n in (2, 3): return True
    if n % 2 == 0 or n % 3 == 0: return False

    # Para números < 10^16, basta con probar estos testigos (bases)
    # para garantizar determinismo (sin error de probabilidad).
    testigos = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]
    
    d = n - 1
    s = 0
    while d % 2 == 0:
        d //= 2
        s += 1
        
    for a in testigos:
        if n <= a: break
        if pow(a, d, n) == 1: continue # Probablemente primo
        es_compuesto = True
        for r in range(s):
            if pow(a, (2**r) * d, n) == n - 1:
                es_compuesto = False
                break
        if es_compuesto:
            return False
            
    return True

def generar_primo(digitos):
    """Genera un número primo aleatorio de 'n' dígitos."""
    min_val = 10**(digitos - 1)
    max_val = (10**digitos) - 1
    
    while True:
        # Generamos un impar aleatorio para tener más probabilidad
        candidato = random.randint(min_val, max_val)
        if candidato % 2 == 0: 
            candidato += 1
            
        if es_primo(candidato):
            return candidato

# --- PROCESAMIENTO ---
def procesar_solicitud():
    print("\n⏳ Worker listo. Esperando tareas en la cola 'solicitudes'...\n")
    
    while True:
        try:
            # 1. BLPOP bloquea el código hasta que llega algo a la lista 'solicitudes'
            # Devuelve una tupla (nombre_cola, datos)
            tarea = r_queue.blpop('solicitudes')
            
            # Si tarea es None, continuar esperando
            if not tarea:
                continue
            
            datos_json = tarea[1]  # Ya viene decodificado por decode_responses=True
            solicitud = json.loads(datos_json)
            
            req_id = solicitud['id']
            cantidad = solicitud['cantidad']
            digitos = solicitud['num_digitos']
            
            print(f"📥 Nueva solicitud recibida:")
            print(f"   ID: {req_id}")
            print(f"   Cantidad: {cantidad} números primos")
            print(f"   Dígitos: {digitos}")
            print()
            
            # Verificar que la solicitud existe en la BD
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT id FROM solicitudes WHERE id = %s", (req_id,))
            if not cursor.fetchone():
                print(f"⚠️  Solicitud {req_id} no existe en BD. Descartando trabajo.")
                cursor.close()
                conn.close()
                continue
            
            generados = 0
            
            while generados < cantidad:
                # 2. Generar el número
                nuevo_primo = generar_primo(digitos)
                
                try:
                    # 3. Intentar guardar en BD
                    query = "INSERT INTO resultados (solicitud_id, numero) VALUES (%s, %s)"
                    cursor.execute(query, (req_id, nuevo_primo))
                    conn.commit()
                    generados += 1
                    
                    # Imprimir progreso
                    print(f"   ✓ [{generados}/{cantidad}] {nuevo_primo}")
                    
                except psycopg2.errors.UniqueViolation:
                    # 4. Manejo de duplicados (Requisito del proyecto)
                    # Si el número ya existe para esta ID, Postgres lanza error.
                    # Hacemos rollback y NO incrementamos el contador 'generados'.
                    conn.rollback()
                    print(f"   ⚠️  Duplicado detectado: {nuevo_primo}. Generando otro...")
                except Exception as e:
                    conn.rollback()
                    print(f"❌ Error en BD: {e}")
                    
            cursor.close()
            conn.close()
            print(f"\n✅ Solicitud {req_id} completada exitosamente!\n")
            print("⏳ Esperando siguiente tarea...\n")
            
        except Exception as e:
            print(f"❌ Error procesando tarea: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    procesar_solicitud()