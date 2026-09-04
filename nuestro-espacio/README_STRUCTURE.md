# Nuestro Espacio - Monorepo Structure

## Overview
Arquitectura monorepo para aplicación móvil multiplataforma (iOS/Android) de ecosistema digital privado para parejas.

## Estructura del Monorepo

```
nuestro-espacio/
├── backend/                    # Node.js + Express + TypeScript + Socket.io
│   ├── src/
│   │   ├── controllers/        # Controladores de la lógica de negocio
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── media.controller.ts
│   │   │   ├── note.controller.ts
│   │   │   ├── capsule.controller.ts
│   │   │   ├── timeline.controller.ts
│   │   │   ├── mood.controller.ts
│   │   │   └── date.controller.ts
│   │   ├── routes/             # Definición de rutas API
│   │   │   ├── index.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── media.routes.ts
│   │   │   ├── note.routes.ts
│   │   │   ├── capsule.routes.ts
│   │   │   ├── timeline.routes.ts
│   │   │   ├── mood.routes.ts
│   │   │   └── date.routes.ts
│   │   ├── services/           # Servicios de negocio (SOLID)
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── media.service.ts
│   │   │   ├── note.service.ts
│   │   │   ├── capsule.service.ts
│   │   │   ├── timeline.service.ts
│   │   │   ├── mood.service.ts
│   │   │   ├── date.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── sync.service.ts
│   │   ├── models/             # Modelos de dominio (DTOs)
│   │   │   ├── user.model.ts
│   │   │   ├── note.model.ts
│   │   │   ├── media.model.ts
│   │   │   ├── capsule.model.ts
│   │   │   ├── timeline.model.ts
│   │   │   ├── mood.model.ts
│   │   │   └── date.model.ts
│   │   ├── middleware/         # Middleware (auth, validation, error handling)
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── upload.middleware.ts
│   │   ├── socket/             # Socket.io handlers
│   │   │   ├── index.ts
│   │   │   ├── thinking.handler.ts
│   │   │   ├── mood.handler.ts
│   │   │   ├── note.handler.ts
│   │   │   └── sync.handler.ts
│   │   ├── utils/              # Utilidades y helpers
│   │   │   ├── encryption.util.ts
│   │   │   ├── file.util.ts
│   │   │   ├── logger.util.ts
│   │   │   └── cron.util.ts
│   │   ├── prisma/             # Prisma client instance
│   │   │   └── index.ts
│   │   ├── app.ts              # Configuración de Express
│   │   ├── server.ts           # Entry point del servidor
│   │   └── types/              # Tipos TypeScript globales
│   │       └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma       # Esquema de base de datos
│   │   └── migrations/         # Migraciones de Prisma
│   ├── uploads/                # Archivos subidos (fotos, videos, notas)
│   │   ├── images/
│   │   ├── videos/
│   │   └── thumbnails/
│   ├── tests/                  # Tests unitarios y de integración
│   ├── .env.example            # Variables de entorno de ejemplo
│   ├── .env                    # Variables de entorno (no commitear)
│   ├── tsconfig.json           # Configuración TypeScript
│   ├── package.json            # Dependencias del backend
│   └── Dockerfile              # Contenerización del backend
│
├── mobile/                     # React Native CLI + TypeScript
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── ui/             # Componentes UI base
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── Loading.tsx
│   │   │   ├── ThinkingButton.tsx    # Botón "Pensando en Ti"
│   │   │   ├── MoodWidget.tsx        # Widget de estado de ánimo
│   │   │   ├── DateRoulette.tsx      # Ruleta de citas
│   │   │   ├── TimelineItem.tsx      # Item de línea de tiempo
│   │   │   ├── CapsuleCard.tsx       # Tarjeta de cápsula
│   │   │   ├── NoteThread.tsx        # Hilo de notas
│   │   │   ├── GalleryMasonry.tsx    # Galería masonry
│   │   │   └── CalendarPicker.tsx    # Selector de calendario
│   │   ├── screens/          # Pantallas principales
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── TimelineScreen.tsx
│   │   │   ├── GalleryScreen.tsx
│   │   │   ├── NotesScreen.tsx
│   │   │   ├── CapsulesScreen.tsx
│   │   │   ├── DatesScreen.tsx
│   │   │   ├── CalendarScreen.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   └── AuthScreen.tsx
│   │   ├── hooks/            # Custom hooks
│   │   │   ├── useThinking.ts
│   │   │   ├── useMood.ts
│   │   │   ├── useSync.ts
│   │   │   ├── useMedia.ts
│   │   │   ├── useNotes.ts
│   │   │   └── useCapsules.ts
│   │   ├── services/         # Servicios API y Socket
│   │   │   ├── api.ts        # Configuración Axios
│   │   │   ├── socket.ts     # Configuración Socket.io
│   │   │   ├── auth.service.ts
│   │   │   ├── media.service.ts
│   │   │   ├── note.service.ts
│   │   │   ├── capsule.service.ts
│   │   │   ├── timeline.service.ts
│   │   │   ├── mood.service.ts
│   │   │   ├── date.service.ts
│   │   │   └── sync.service.ts
│   │   ├── store/            # Zustand stores
│   │   │   ├── auth.store.ts
│   │   │   ├── mood.store.ts
│   │   │   ├── sync.store.ts
│   │   │   └── ui.store.ts
│   │   ├── types/            # Tipos TypeScript
│   │   │   ├── api.types.ts
│   │   │   ├── entity.types.ts
│   │   │   └── navigation.types.ts
│   │   ├── utils/            # Utilidades
│   │   │   ├── storage.ts    # MMKV configuration
│   │   │   ├── encryption.ts # Encriptación local
│   │   │   ├── validators.ts # Validadores
│   │   │   └── constants.ts  # Constantes de la app
│   │   ├── navigation/       # React Navigation
│   │   │   ├── AppNavigator.tsx
│   │   │   ├── AuthNavigator.tsx
│   │   │   └── MainNavigator.tsx
│   │   ├── assets/           # Recursos estáticos
│   │   │   ├── images/
│   │   │   ├── lottie/       # Animaciones Lottie
│   │   │   │   ├── thinking.json
│   │   │   │   ├── particles.json
│   │   │   │   └── celebration.json
│   │   │   └── fonts/
│   │   └── App.tsx           # Entry point de la app
│   ├── ios/                  # Proyecto iOS nativo
│   │   ├── NuestroEspacio/
│   │   │   ├── AppDelegate.mm
│   │   │   ├── Info.plist
│   │   │   └── Images.xcassets
│   │   ├── Podfile           # CocoaPods dependencies
│   │   └── Podfile.lock
│   ├── android/              # Proyecto Android nativo
│   │   ├── app/
│   │   │   ├── src/
│   │   │   ├── build.gradle
│   │   │   └── AndroidManifest.xml
│   │   ├── build.gradle
│   │   └── gradle.properties
│   ├── .env.example          # Variables de entorno de ejemplo
│   ├── .env                  # Variables de entorno (no commitear)
│   ├── tsconfig.json         # Configuración TypeScript
│   ├── package.json          # Dependencias del mobile
│   ├── metro.config.js       # Configuración Metro bundler
│   ├── babel.config.js       # Configuración Babel
│   └── react-native.config.js # Configuración React Native
│
├── infra/                    # Infraestructura y DevOps
│   ├── nginx/
│   │   ├── nginx.conf        # Configuración Nginx (reverse proxy)
│   │   └── ssl/              # Certificados SSL (auto-generados)
│   ├── docker/
│   │   ├── backend.Dockerfile
│   │   └── postgres.Dockerfile
│   └── scripts/
│       ├── setup.sh          # Script de configuración inicial
│       └── backup.sh         # Script de backup de BD
│
├── docker-compose.yml        # Orquestación de contenedores
├── docker-compose.dev.yml    # Configuración para desarrollo
├── .gitignore                # Archivos ignorados por Git
├── .env.example              # Variables de entorno globales
├── README.md                 # Documentación principal
└── package.json              # Root package.json (scripts globales)
```

## Principios de Arquitectura

### Backend (Clean Architecture + SOLID)
- **Controllers**: Manejan requests HTTP y delegan a services
- **Services**: Contienen la lógica de negocio pura
- **Models**: DTOs y entidades de dominio
- **Middleware**: Autenticación, validación, manejo de errores
- **Socket Handlers**: Eventos en tiempo real separados por dominio

### Mobile (Feature-based + Clean Architecture)
- **Components**: Componentes UI reutilizables y específicos de feature
- **Screens**: Pantallas completas que componen componentes
- **Hooks**: Lógica reusable extraída de componentes
- **Services**: Comunicación con API y Socket.io
- **Store**: Estado global con Zustand (solo estado UI crítico)
- **TanStack Query**: Server state, caché y sincronización

### Base de Datos (Prisma ORM)
- Relaciones explícitas con índices optimizados
- Soft deletes para preservación de datos
- Timestamps automáticos (createdAt, updatedAt)
- Encriptación de datos sensibles a nivel de aplicación

### Zero External Dependencies
- Todos los archivos se guardan en el sistema local del servidor
- No hay dependencias de servicios cloud externos
- Auto-contenido y auto-hospedado

### Privacy-First
- Encriptación de datos sensibles
- Cápsulas del tiempo con revelación programada
- Sin tracking ni analytics externos

### Offline-First
- Caché local con MMKV y SQLite
- Sincronización automática al recuperar conexión
- Cola de operaciones pendientes

```
