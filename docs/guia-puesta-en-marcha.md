# Guía de puesta en marcha — interfaz web Sello Legítimo

Esta guía describe **todas las formas habituales** de levantar la aplicación web (desarrollo, contenedor de desarrollo, Docker y escenarios con gateway/ngrok). El objetivo es que un usuario sepa **qué elegir** según su entorno y **qué comandos ejecutar**.

---

## 1. Requisitos generales

| Componente | Desarrollo | Producción en contenedor |
|------------|------------|---------------------------|
| Node.js | 20 o superior | Solo en la etapa de *build* de la imagen |
| npm | 10 o superior | Incluido en la imagen base del builder |
| Docker (opcional) | Para modalidades Docker / Compose | Sí |
| VS Code + extensión “Dev Containers” | Opcional (modalidad Dev Container) | No |

La API de autenticación debe exponer rutas bajo **`/api/v1/auth`** (login, verificación OTP, etc.), compatibles con lo que consume el frontend.

---

## 2. Modalidad A — Desarrollo local (Node en tu máquina)

Uso típico: programar en el ordenador con recarga en caliente (Vite).

### Pasos

1. Clonar el repositorio e ir al directorio del frontend.
2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Variables de entorno (opcional): copiar el ejemplo y ajustar.

   ```bash
   cp .env.example .env
   ```

   - Para que el **mismo host** sirva la SPA y las rutas `/api` (recomendado con **gateway o ngrok**), **no definas** `VITE_API_URL` o déjala vacía.
   - Si el **gateway** (Caddy) escucha en tu máquina en el puerto **8181**, el proxy de desarrollo de Vite ya apunta allí por defecto. Si solo tienes el backend en **8080** y no usas gateway, en `.env` puedes poner:

     ```env
     VITE_DEV_PROXY_TARGET=http://localhost:8080
     ```

4. Arrancar el servidor de desarrollo (accesible en la red local si usas otras máquinas o túnel):

   ```bash
   npm run dev -- --host 0.0.0.0 --port 5173
   ```

5. Abrir en el navegador: **`http://localhost:5173`** (o `http://<IP-de-tu-PC>:5173` desde otro equipo en la misma red).

### Comportamiento de `/api` en desarrollo

Las peticiones del navegador a **`/api/...`** las recibe Vite y las **reenvía** al objetivo configurado (`VITE_DEV_PROXY_TARGET`, por defecto `http://localhost:8181`). Así imitas el mismo reparto de tráfico que con el gateway en producción.

---

## 3. Modalidad B — Dev Container (VS Code / Cursor)

Uso típico: entorno reproducible con Node 20 ya instalado en el contenedor.

### Pasos

1. Instalar la extensión **Dev Containers** en VS Code (o equivalente en Cursor).
2. Abrir la carpeta raíz del proyecto del frontend.
3. Ejecutar **“Dev Containers: Reopen in Container”**.
4. Al crearse el contenedor se ejecuta `.devcontainer/post-create.sh` (`npm ci` o `npm install`).
5. En la terminal **dentro del contenedor**:

   ```bash
   npm run dev -- --host 0.0.0.0 --port 5173
   ```

6. El editor suele **reenviar el puerto 5173** al host; ábrelo en el navegador del anfitrión.

### Nota sobre red

El `devcontainer.json` puede usar **`--network=host`** en Linux para facilitar acceso a servicios en el host (por ejemplo el backend). En otros sistemas el comportamiento puede variar; si no ves el backend, revisa la documentación de Dev Containers y la conectividad hacia `localhost` o la IP del host.

---

## 4. Modalidad C — Máquina virtual + gateway + ngrok (acceso público HTTPS)

Uso típico: demostración o pruebas con URL pública (**`*.ngrok-free.dev`**) sin exponer el backend directamente.

### Idea general

1. El **frontend** (Vite) debe escuchar en la IP/puerto a los que el **proxy inverso** (p. ej. Caddy) envían el tráfico “no API”. En muchos despliegues: **`0.0.0.0:8080`** para alinear con el `reverse_proxy` del gateway.
2. El **gateway** recibe el túnel (p. ej. ngrok → `gateway:80`), sirve **`/api/*`** al backend y el resto al frontend.
3. **No** configures el cliente con la IP privada del backend en el navegador: la página debe cargarse y llamar a **`/api/...`** en el **mismo origen** que ngrok (HTTPS), para evitar contenido mixto y errores de CORS aparentes.

### Pasos orientativos (en la VM)

1. Levantar **gateway** (Docker Compose del repositorio de infraestructura) y **ngrok** apuntando al gateway, según la documentación de ese proyecto.
2. En el servidor donde corre el frontend Vite:

   ```bash
   npm install
   npm run dev -- --host 0.0.0.0 --port 8080
   ```

   Ajusta el puerto si tu `Caddyfile` apunta a otro.

3. Asegúrate de que **no** tengas `VITE_API_URL` apuntando a una URL `http://10.x…` en el entorno donde construyes o ejecutas el cliente: con origen vacío, las llamadas van al host público y Caddy enruta `/api`.

4. Abre la URL pública que muestre ngrok (panel en `http://localhost:4040` en la máquina donde corre ngrok, según tu instalación).

---

## 5. Modalidad D — Imagen Docker (construir en local)

Uso típico: generar el mismo artefacto que en CI (HTML/JS estático dentro de nginx).

### Construir

En la raíz del frontend:

```bash
docker build \
  --build-arg VITE_API_URL= \
  -t sello-legitimo-frontend:local .
```

- **`VITE_API_URL` vacía** (como arriba): el cliente usará rutas relativas **`/api/...`** respecto al host que sirva la SPA (recomendado si delante tienes un proxy que envía `/api` al backend).
- Si el despliegue **no** tiene proxy en el mismo dominio, puedes fijar la URL del API en tiempo de build, por ejemplo:

  ```bash
  docker build \
    --build-arg VITE_API_URL=https://api.ejemplo.com \
    -t sello-legitimo-frontend:local .
  ```

### Ejecutar

```bash
docker run --rm -p 8080:80 sello-legitimo-frontend:local
```

Aplicación estática: **`http://localhost:8080`**.

La imagen usa **`nginx/default.conf`**: `try_files` reenvía rutas desconocidas a **`index.html`**, de modo que **`/tarjeton`**, **`/login`**, etc. funcionan al recargar o al abrir un enlace directo (comportamiento típico de una SPA).

---

## 6. Modalidad E — Docker Compose (imagen publicada)

El archivo **`compose.yml`** del frontend referencia una imagen en GitHub Container Registry (`ghcr.io/...`). Sirve para **arrancar la última imagen construida** desde la rama principal del flujo de integración continua, sin construir en tu máquina.

```bash
docker compose up -d
```

Por defecto publica **`8080:80`** en el host → **`http://localhost:8080`**.

**Importante:** los valores de `VITE_*` quedan **congelados en el momento del build** de esa imagen. Si necesitas otra URL de API, hay que **reconstruir la imagen** con el `build-arg` adecuado (como en la modalidad D) o ajustar el pipeline que publica la imagen.

---

## 7. Modalidad F — Vista previa del build (sin Docker)

Sirve para probar localmente el resultado de **`npm run build`** (archivos en `dist/`).

```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

Abre **`http://localhost:4173`**. El proxy de `/api` del modo `dev` **no** aplica aquí: o sirves la app detrás del mismo host que el API, o pruebas solo la UI sin backend.

---

## 8. Variables de entorno (resumen)

| Variable | Momento | Uso |
|----------|---------|-----|
| `VITE_API_URL` | Build (prod) y desarrollo (Vite) | Base URL del API para Axios/`fetch`. **Vacía** = mismo origen que la página (`/api/...`). Evita URLs `http` a IPs privadas cuando la página es **HTTPS** (ngrok). |
| `VITE_AUTH_SERVICE_URL` | Igual | Opcional; si está vacía se aplica la misma lógica que `VITE_API_URL` para código que use `fetch` directo. |
| `VITE_DEV_PROXY_TARGET` | Solo `vite` en desarrollo | Destino del proxy interno de **`/api`** (por defecto **`http://localhost:8181`**, gateway). |
| `VITE_AUTH_TIMEOUT_MS` | Cliente | Tiempo de espera u otros usos definidos en el proyecto. |

Más detalle en **`.env.example`** y en **`DEV_ENVIRONMENT.md`**.

---

## 9. Comprobaciones rápidas

```bash
npm run lint
npm run build
npm run test
```

---

## 10. Problemas frecuentes

- **Login falla con ngrok y en la consola ves llamadas a una IP privada (`10.x`, etc.)**  
  Revisa que `VITE_API_URL` no esté definida con esa URL en `.env` o en el build. Debe usarse el mismo origen público y la ruta `/api/...`.

- **En desarrollo, `/api` devuelve error de conexión**  
  Comprueba que el backend o el gateway esté levantado y que `VITE_DEV_PROXY_TARGET` apunte al puerto correcto (8181 vs 8080).

- **Puerto 5173 ocupado**  
  Usa otro puerto: `npm run dev -- --host 0.0.0.0 --port 5273`.

- **Imagen Docker con API incorrecta**  
  Los `VITE_*` son **del tiempo de build**. Reconstruye la imagen con el `--build-arg` adecuado.

---

## 11. Dónde ampliar

- Incorporación de desarrolladores: **`docs/onboarding.md`**
- Entorno de desarrollo resumido: **`DEV_ENVIRONMENT.md`**
- Arquitectura: **`docs/architecture.md`**
- Incidencias: **`docs/troubleshooting.md`**
