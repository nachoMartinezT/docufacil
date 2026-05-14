# Docufacil 📄

Aplicación web PWA para gestionar y consolidar comprobantes de pagos mensuales en un único PDF.

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-000000?logo=express)](https://expressjs.com/)

## ✨ Características

- 📱 **PWA (Progressive Web App)** - Instalable en dispositivos móviles y escritorio
- 📄 **Gestión de archivos** - Sube PDFs e imágenes (JPG/PNG)
- 🖱️ **Drag & Drop** - Arrastra archivos para subirlos
- 📸 **Captura con cámara** - Toma fotos directamente desde el celular
- 🔄 **Reordenamiento** - Arrastra los archivos para cambiar el orden
- 📑 **Generación de PDF** - Combina todos los archivos en un solo PDF
- 🔐 **Autenticación segura** - JWT con expiración de 24 horas
- 🎨 **Diseño moderno** - Dark mode con Tailwind CSS
- 📱 **Mobile-first** - Optimizado para usar desde el celular

## 🚀 Tecnologías

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router DOM
- Axios
- @dnd-kit (drag & drop)
- lucide-react (iconos)

### Backend
- Node.js + Express
- JWT para autenticación
- bcryptjs para hashing
- Multer para subida de archivos
- pdf-lib para manipulación de PDFs
- sharp para procesamiento de imágenes

### Infraestructura
- Docker + Docker Compose
- Nginx (frontend)
- Cloudflare Tunnel (opcional para deploy)

## 📋 Requisitos

- Docker y Docker Compose
- Node.js 20+ (para desarrollo local)

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/nachoMartinezT/docufacil.git
cd docufacil
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Backend Configuration
PORT=3001
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
UPLOAD_PATH=./uploads

# User Passwords (bcrypt hashed)
# Para generar hashes, ejecutá:
# cd backend && node setup.js tu-password
USER_NACHO_PASSWORD_HASH=$2a$10$...
USER_PANCHO_PASSWORD_HASH=$2a$10$...

# Frontend Configuration
VITE_API_URL=http://localhost:3001
```

### 3. Generar hashes de contraseñas

```bash
cd backend
npm install
node setup.js password-nacho
node setup.js password-pancho
```

Copiá los hashes generados al archivo `.env`.

### 4. Iniciar con Docker

```bash
# En la raíz del proyecto
docker-compose up -d --build
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001

## 🧑‍💻 Desarrollo

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## 📱 Uso

1. **Iniciar sesión**: Usá el usuario `Nacho` o `Pancho` con sus contraseñas configuradas
2. **Seleccionar mes**: Elegí el mes y año correspondiente
3. **Subir archivos**: Arrastrá archivos o usá el botón de selección
4. **Reordenar**: Arrastrá los archivos con el ícono ⠿ para cambiar el orden
5. **Previsualizar**: Hacé clic en el ícono 👁️ para ver el archivo
6. **Generar PDF**: Presioná el botón inferior para descargar el PDF consolidado

## 📁 Estructura del Proyecto

```
docufacil/
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas (Login, Dashboard)
│   │   └── context/       # Contextos de React
│   └── public/            # Assets estáticos
├── backend/               # API Express
│   ├── src/
│   │   ├── routes/        # Rutas de la API
│   │   ├── middleware/    # Middlewares
│   │   └── services/      # Servicios (PDF, etc.)
│   └── uploads/           # Archivos subidos (no commitear)
├── docker-compose.yml     # Configuración de Docker
└── .env                   # Variables de entorno (no commitear)
```

## 🔒 Seguridad

- Las contraseñas se almacenan con bcrypt (hash + salt)
- Autenticación mediante JWT con expiración de 24 horas
- Validación de tipos de archivo (solo PDF, JPG, PNG)
- Límite de tamaño: 20MB por archivo
- Archivos `.env` y `uploads/` ignorados en git

## 👥 Usuarios

La aplicación tiene dos usuarios configurables:

- **Nacho** - Usuario regular
- **Pancho** - Usuario administrador

Ambos tienen los mismos permisos en la aplicación.

## 🐳 Docker

### Comandos útiles

```bash
# Construir e iniciar
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reiniciar
docker-compose restart

# Reconstruir solo el frontend
docker-compose up -d --build frontend
```

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Archivos
- `GET /api/files/:year/:month` - Listar archivos
- `POST /api/files/upload/:year/:month` - Subir archivos
- `POST /api/files/reorder/:year/:month` - Reordenar archivos
- `DELETE /api/files/:year/:month/:filename` - Eliminar archivo
- `GET /api/files/preview/:year/:month/:filename` - Ver archivo
- `POST /api/files/generate-pdf/:year/:month` - Generar PDF

## 🤝 Contribuir

1. Fork el repositorio
2. Creá una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commiteá tus cambios (`git commit -am 'Agrego nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrí un Pull Request

## 📄 Licencia

Este proyecto es privado y de uso exclusivo.

## 🎨 Créditos

Desarrollado por [Guida Pixel Design](https://guidapixeldesign.com)

---

¿Tenés alguna pregunta o sugerencia? No dudes en abrir un issue.
