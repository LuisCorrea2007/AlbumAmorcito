# Nuestro Espacio 🏡💕

**Ecosistema digital privado y autocontenido para parejas**

Una aplicación móvil multiplataforma (iOS/Android) que ofrece un espacio digital íntimo para parejas, con funcionalidades en tiempo real, cápsulas del tiempo, galería privada y más.

## 🌟 Características Principales

- **💭 Pensando en Ti**: Botón que envía vibraciones y animaciones en tiempo real a tu pareja
- **💊 Cápsulas del Tiempo**: Mensajes encriptados que se revelan en una fecha específica
- **🎡 Ruleta de Citas**: Selector aleatorio de actividades para parejas
- **📖 Línea de Tiempo**: Historia interactiva de la relación con scroll parallax
- **😊 Estado de Ánimo**: Widget sincronizado que cambia la paleta de colores de la app
- **📷 Galería Privada**: Sistema de archivos local con thumbnails automáticos
- **📝 Notas y Calendario**: Hilos de conversación y planificación de citas

## 🔒 Principios Fundamentales

1. **Zero External Dependencies**: Sin Firebase, AWS, Cloudinary o APIs externas
2. **Privacy-First & Self-Hosted**: Todo se guarda en tu propio servidor
3. **Offline-First**: Caché local y sincronización automática

## 🛠️ Stack Tecnológico

### Mobile (Frontend)
- React Native CLI (Bare Workflow)
- TypeScript 5.x
- React Navigation v6
- Zustand (estado global)
- TanStack Query v5 (caché y server state)
- react-native-reanimated v3 (animaciones 60fps)
- Lottie (animaciones)
- react-native-haptic-feedback
- react-native-mmkv (almacenamiento local)
- Socket.io-client (tiempo real)

### Backend
- Node.js 20.x
- Express + TypeScript
- Socket.io (WebSocket)
- Prisma ORM
- PostgreSQL 15
- Multer + Sharp (upload y procesamiento de imágenes)
- Winston (logging)

### Infraestructura
- Docker & Docker Compose
- Nginx (reverse proxy)
- Monorepo structure

## 📁 Estructura del Proyecto

```
nuestro-espacio/
├── backend/          # API REST + Socket.io
├── mobile/           # React Native app
├── infra/            # Docker, Nginx, scripts
├── docker-compose.yml
└── README.md
```

## 🚀 Configuración Local (macOS Intel Core i7)

### Prerrequisitos

#### 1. Homebrew e Instalaciones Base
```bash
# Instalar Homebrew (si no lo tienes)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar herramientas de desarrollo
brew install node@20
brew install watchman
brew install postgresql@15
brew install ruby
brew install cocoapods
```

#### 2. Configurar Ruby (para CocoaPods)
```bash
# Agregar Ruby al PATH (agrega esto a tu ~/.zshrc)
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Instalar bundler
gem install bundler
```

#### 3. Clonar el Repositorio
```bash
cd ~/Projects  # O tu directorio preferido
git clone <repository-url> nuestro-espacio
cd nuestro-espacio
```

### Levantar Backend con Docker

#### 1. Configurar Variables de Entorno
```bash
cd backend
cp .env.example .env
# Editar .env con tus configuraciones (JWT_SECRET, DATABASE_URL, etc.)
```

#### 2. Iniciar Servicios con Docker Compose
```bash
# Desde la raíz del proyecto
docker-compose up -d

# Ver logs
docker-compose logs -f backend
docker-compose logs -f postgres
```

#### 3. Ejecutar Migraciones de Base de Datos
```bash
# Dentro del contenedor del backend
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma generate
```

#### 4. Verificar Backend
```bash
curl http://localhost:3000/health
# Debería responder: {"status":"healthy","timestamp":"..."}
```

### Configurar Mobile (React Native CLI)

#### 1. Instalar Dependencias
```bash
cd mobile
npm install
```

#### 2. Configurar iOS
```bash
# Instalar pods de CocoaPods
cd ios
pod install
cd ..

# Abrir en Xcode
open ios/NuestroEspacio.xcworkspace
```

**Requisitos iOS:**
- macOS Sequoia (o versión compatible)
- Xcode 15.x
- iOS Simulator o dispositivo físico

#### 3. Configurar Android
```bash
# Asegurar que ANDROID_HOME esté configurado
# Agrega esto a tu ~/.zshrc si es necesario:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
source ~/.zshrc

# Verificar conexión de dispositivo o emulador
adb devices
```

#### 4. Ejecutar la App

**iOS:**
```bash
npm run ios
# O específico simulador
npm run ios -- --simulator="iPhone 15 Pro"
```

**Android:**
```bash
npm run android
```

### Variables de Entorno del Mobile

Crear `mobile/.env`:
```bash
API_URL=http://localhost:3000
SOCKET_URL=http://localhost:3000
ENVIRONMENT=development
```

## 🔧 Comandos Útiles

### Backend
```bash
cd backend

# Desarrollo con hot-reload
npm run dev

# Build de producción
npm run build

# Iniciar en producción
npm start

# Migraciones de BD
npx prisma migrate dev
npx prisma migrate deploy
npx prisma studio  # GUI de base de datos

# Tests
npm test
```

### Mobile
```bash
cd mobile

# Iniciar Metro bundler
npm start

# Limpiar caché y rebuild
npm run clean

# Type check
npm run type-check

# Lint
npm run lint
```

### Docker
```bash
# Iniciar todos los servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build

# Acceder al contenedor
docker-compose exec backend sh

# Ver estado
docker-compose ps
```

## 🎨 Diseño y UX

### Paleta de Colores
- **Crema**: `#FFF5F5` (fondo principal)
- **Terracota**: `#E07A5F` (acentos)
- **Dorado**: `#FFD700` (detalles premium)
- **Rosado**: `#FF6B6B` (corazones, thinking button)
- **Marrón**: `#8B7355` (texto)

### Micro-interacciones
- Animaciones spring a 60fps con Reanimated
- Haptic feedback en interacciones clave
- Partículas Lottie en eventos especiales
- Transiciones suaves entre pantallas

## 📱 Funcionalidades Detalladas

### 1. Dashboard y Botón "Pensando en Ti"
- WebSocket en tiempo real
- Vibración háptica al recibir
- Animación de partículas Lottie
- Indicador de estado online/offline

### 2. Cápsula del Tiempo
- Encriptación AES-256
- Cronjob backend para revelación automática
- Notificaciones push locales
- Soporte multimedia (fotos, videos, texto)

### 3. Ruleta de Citas
- Animación giratoria con Reanimated
- Categorías: home, outdoor, creative, romantic
- Historial de citas completadas
- Sistema de rating

### 4. Línea de Tiempo (Storyline)
- Scroll vertical parallax
- Hitos de la relación
- Multimedia integrada
- Vista de calendario

### 5. Widget de Estado de Ánimo
- Sincronización en tiempo real
- Cambia paleta de colores de la app
- Historial de estados
- Notas opcionales

### 6. Galería y Sistema de Archivos
- Upload con multer
- Compresión con sharp
- Thumbnails automáticos
- Vista masonry
- Caché offline con MMKV

### 7. Notas y Calendario
- Hilos de respuestas anidadas
- Calendario interactivo
- Recordatorios programados
- Sincronización offline-first

## 🔐 Seguridad

- JWT authentication
- Encriptación de datos sensibles
- Rate limiting en API
- Helmet.js security headers
- CORS configurado
- Validación de inputs con express-validator

## 📊 Base de Datos

El esquema incluye:
- Users & Authentication
- Mood State (real-time)
- Notes con hilos de respuesta
- Time Capsules (scheduled reveal)
- Timeline Events
- Media Gallery
- Date Activities
- Calendar Events
- Sync Logs (offline-first)
- Notifications

## 🚨 Troubleshooting

### Problemas comunes en macOS Intel

#### CocoaPods falla
```bash
cd ios
pod deintegrate
pod cache clean --all
pod install --repo-update
```

#### Watchman error
```bash
brew uninstall watchman
brew install watchman
```

#### Metro bundler cache issues
```bash
cd mobile
rm -rf node_modules
npm install
npm start -- --reset-cache
```

#### Android SDK no encontrado
```bash
# Verificar instalación
ls $HOME/Library/Android/sdk

# Si falta, instalar desde Android Studio o:
brew install --cask android-sdk
```

#### Error de permisos en Docker
```bash
# Asegurar que el usuario tenga permisos
sudo usermod -aG docker $USER
# Reiniciar sesión
```

## 📄 Licencia

MIT License - Ver LICENSE para detalles

## 👥 Contribución

Este es un proyecto privado para uso personal. No se aceptan contribuciones externas.

---

**Hecho con 💕 para parejas que valoran su privacidad**
