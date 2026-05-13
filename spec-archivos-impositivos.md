📄 Spec: Docufacil — Generador de PDF Mensual
Objetivo
Aplicación web PWA para gestionar comprobantes de pagos impositivos mensuales.
Permite a múltiples usuarios subir archivos (PDF/JPG) durante el mes y generar
un único PDF consolidado para presentar al banco.

Stack Técnico
CapaTecnologíaFrontendReact + Vite + Tailwind CSSBackendNode.js + ExpressPDFpdf-lib (combinar PDFs) + sharp (JPG → PDF)AuthJWT con bcrypt — usuarios hardcodeados en .envStorageSistema de archivos local (/uploads/YYYY-MM/)DeployDocker + Cloudflare Tunnel

Estructura del Proyecto
docufacil/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUploader.jsx
│   │   │   ├── FileList.jsx
│   │   │   ├── MonthSelector.jsx
│   │   │   └── GenerateButton.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── manifest.json        # PWA manifest
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── files.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   ├── services/
│   │   │   └── pdfService.js
│   │   └── index.js
│   ├── uploads/                 # Archivos subidos por mes (YYYY-MM/)
│   └── package.json
├── docker-compose.yml
├── Dockerfile.frontend
├── Dockerfile.backend
└── .env.example

Funcionalidades
Autenticación

Login con usuario y contraseña
Dos usuarios: Nacho y Pancho (configurables en .env)
JWT con expiración de 24 horas
Sesión persistente en localStorage

Dashboard Principal

Selector de mes/año (por defecto: mes actual)
Vista de archivos cargados en el mes seleccionado
Indicador de cantidad de archivos
Botón "Generar PDF" destacado

Carga de Archivos

Drag & drop de archivos desde desktop
Botón de selección de archivos (PDF y JPG/JPEG)
Captura directa con cámara del celular (<input accept="image/*" capture="environment">)
Soporte multi-archivo (subir varios a la vez)
Preview del archivo antes de confirmar subida
Nombre del archivo editable antes de subir
Progress bar durante la subida

Lista de Archivos

Vista de lista con nombre, tipo, tamaño y fecha de subida
Quién subió el archivo (Nacho o Pancho)
Preview al hacer clic (PDF en modal, JPG como imagen)
Botón eliminar con confirmación ("¿Seguro que querés eliminar X?")
Ordenable por nombre / fecha / tipo

Generación de PDF

Botón "Generar PDF del mes"
Convierte todos los JPG a PDF automáticamente
Combina todos los archivos en un único PDF
Orden de archivos: por fecha de subida (configurable)
Nombre del PDF generado: comprobantes-YYYY-MM.pdf
Descarga automática al completarse
Loading state mientras se genera

PWA (Progressive Web App)

Instalable en Android como app
Ícono en pantalla de inicio
Funciona desde cualquier navegador
Diseño mobile-first responsive


API Endpoints
Auth
POST /api/auth/login
  body: { username, password }
  returns: { token, user }
Files
GET  /api/files/:year/:month
  returns: [{ id, name, type, size, uploadedBy, uploadedAt, url }]

POST /api/files/upload/:year/:month
  multipart: files[]
  returns: [{ id, name, ... }]

DELETE /api/files/:year/:month/:filename
  returns: { success }

GET  /api/files/preview/:year/:month/:filename
  returns: file stream

POST /api/files/generate-pdf/:year/:month
  returns: PDF file stream (descarga directa)

Modelos de Datos
Usuario (en .env)
USERS=[{"username":"nacho","password":"hash_bcrypt"},{"username":"jefe","password":"hash_bcrypt"}]
JWT_SECRET=secret_key
Metadata de archivo (JSON por mes)
json{
  "files": [
    {
      "id": "uuid",
      "originalName": "boleta-iva-abril.pdf",
      "storedName": "uuid.pdf",
      "type": "application/pdf",
      "size": 245000,
      "uploadedBy": "nacho",
      "uploadedAt": "2026-04-15T10:30:00Z"
    }
  ]
}

Variables de Entorno (.env)
env# Backend
PORT=3001
JWT_SECRET=cambiar_esto_por_algo_seguro
UPLOAD_PATH=./uploads

# Usuarios (passwords en bcrypt hash)
USER_NACHO_PASSWORD_HASH=
USER_PANCHO_PASSWORD_HASH=

# Frontend
VITE_API_URL=http://localhost:3001

Docker
docker-compose.yml
yamlservices:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    volumes:
      - ./uploads:/app/uploads
    env_file: .env

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

Diseño UI

Tema: Oscuro (dark mode por defecto)
Colores primarios: Azul/violeta — acorde a Guida Pixel Design
Mobile-first: Optimizado para usar desde el celular
Tipografía: Inter o similar sans-serif moderna
Componentes: Cards, modales, botones con estados loading/disabled

Pantallas principales
Login:

Logo Guida Pixel Design
Campo usuario y contraseña
Botón ingresar

Dashboard:

Header con usuario logueado y logout
Selector de mes prominente
Zona de drop/upload grande (fácil de usar en mobile)
Lista de archivos con acciones
Botón generar PDF fijo en la parte inferior (sticky)


Instrucciones para el Agente

Crear el proyecto completo con la estructura definida
Implementar backend primero (Express + rutas + pdfService)
Implementar frontend (React + componentes)
Configurar Docker y docker-compose
Generar .env.example con todas las variables
Crear script de setup inicial para hashear passwords
Verificar que todos los imports y dependencias son correctos
El código debe compilar y correr sin errores

Consideraciones importantes

Los archivos se guardan en /uploads/YYYY-MM/ con nombre UUID para evitar colisiones
Los metadatos se guardan en /uploads/YYYY-MM/metadata.json
El PDF generado NO se guarda en el servidor — se genera on-demand y se descarga
Validar tipos de archivo: solo PDF, JPG, JPEG
Tamaño máximo por archivo: 20MB
El frontend debe correr en puerto 3000 y el backend en 3001