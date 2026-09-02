# BaseKit — Frontend

Aplicación web React 18 + Vite 5 con autenticación via **Keycloak** y gestión de estado con **Zustand**.

---

## Stack

| Tecnología | Rol |
|-----------|-----|
| React 18 | UI |
| React Router v6 | Enrutado SPA |
| Vite 5 | Bundler / dev server |
| Tailwind CSS 3 | Estilos |
| Zustand | Estado global de auth |
| keycloak-js | Integración con Keycloak |
| Vitest + Testing Library | Tests |

---

## Requisitos previos

- Node.js ≥ 18
- Un servidor Keycloak accesible con el realm y cliente configurados
- La API PHP corriendo en `http://localhost:8888` durante desarrollo

---

## Instalación

```powershell
cd c:\Projects\BaseKit\webapp
npm install
```

---

## Configuración

El archivo de entorno es `.env.development` (para desarrollo local).
Existe un `.env.development.example` como plantilla:

```env
VITE_KEYCLOAK_URL=https://iam.smi2000.net:8181
VITE_KEYCLOAK_REALM=SMIApplications
VITE_KEYCLOAK_CLIENT_ID=basekit

# Roles requeridos separados por coma (vacío = cualquier usuario autenticado)
VITE_REQUIRED_ROLES=super,admin,viewer

# Vacío = usa proxy de Vite hacia localhost:8888
VITE_API_URL=

VITE_SMI_MSG_WS_URL=ws://localhost:3008
VITE_APP_TOKEN=basekit
```

> Todas las variables deben empezar con `VITE_` para que Vite las exponga al cliente.

---

## Comandos

```powershell
npm run dev          # servidor de desarrollo en http://localhost:5173
npm run build        # build de producción → dist/ + stamp + deploy a api/public/ (por defecto)
npm run build:only   # build + stamp sin deploy (solo genera dist/)
npm run preview      # previsualizar el build de producción
npm run test         # tests con Vitest (modo watch)
npm run test:ui      # tests con interfaz gráfica
npm run test:coverage
npm run lint         # ESLint sobre src/
```

---

## Estructura de archivos

```
src/
├── main.jsx              ← entry point: inicializa Keycloak y monta React
├── App.jsx               ← rutas principales + ProtectedRoute
├── index.css             ← directivas Tailwind + overrides dark mode
│
├── components/
│   ├── Navbar.jsx           ← navegación principal con soporte móvil y dark mode
│   ├── ProtectedRoute.jsx   ← redirige a /login o /unauthorized según auth/roles
│   └── ui/                  ← componentes reutilizables (Badge, Button, Card, Input, Spinner)
│
├── hooks/
│   ├── useAuth.js        ← hook principal: isAuthenticated, login, logout, hasRole…
│   ├── useDarkMode.js    ← modo oscuro sincronizado con BD vía user-prefs
│   └── useLanguage.js    ← idioma activo sincronizado con BD (es, ca, en)
│
├── pages/
│   ├── LoginPage.jsx
│   ├── LoadingPage.jsx
│   ├── UnauthorizedPage.jsx
│   ├── ProfilePage.jsx
│   ├── DashboardPage.jsx    ← debug/info JWT (sin enlace en nav)
│   ├── ActivityLogPage.jsx  ← registro de actividad (rol super)
│   ├── UsersPage.jsx        ← usuarios Keycloak con roles (rol super)
│   ├── MoviesPage.jsx       ← CRUD películas (rol super)
│   ├── ActorsPage.jsx       ← CRUD actores (rol super)
│   ├── DirectorsPage.jsx    ← CRUD directores (rol super)
│   └── QrConfirmPage.jsx    ← confirmación de login por QR
│
├── store/
│   └── useAuthStore.js   ← Zustand: isAuthenticated, isLoading, user, token
│
└── utils/
    ├── apiFetch.js       ← fetch autenticado con JWT de Keycloak
    ├── cn.js             ← helper clsx + twMerge para classNames
    ├── keycloak.js       ← instancia singleton de Keycloak
    ├── keycloakPrefs.js  ← preferencias de UI persistidas en BD por clave
    └── roleHome.js       ← mapeo rol → ruta home tras login

public/
├── sw.js                 ← service worker (versionado por stamp-sw.js)
└── silent-check-sso.html ← iframe para SSO silencioso

tests/
├── setup.js
├── components/
├── hooks/
└── utils/
```

---

## Flujo de autenticación

1. `main.jsx` llama a `keycloak.init({ onLoad: 'login-required' })` antes de montar React.
2. Keycloak redirige al usuario al login si no tiene sesión activa.
3. Tras autenticar, `useAuthStore` recibe `token` y `user` (tokenParsed).
4. `App.jsx` lee `isLoading` del store; mientras carga muestra `<LoadingPage />`.
5. `ProtectedRoute` verifica `isAuthenticated` y `hasRequiredRoles` en cada ruta.
6. `keycloak.onTokenExpired` intenta refrescar el token automáticamente (margen: 60 s).

### Roles

Los roles se leen de `VITE_REQUIRED_ROLES` (separados por coma).
`hasRequiredRoles` es `true` si el usuario tiene **al menos uno** de los roles listados.
Los roles se buscan en `realm_access.roles` y en `resource_access[clientId].roles`.

| Rol | Acceso |
|-----|--------|
| `super` | Todo: cine, usuarios, activity log |
| `admin` | Home `/` |
| `viewer` | Home `/` |

---

## Consumir la API

Para hacer llamadas autenticadas usar `apiFetch`:

```js
import { apiFetch } from '@/utils/apiFetch'

const res = await apiFetch('/api/movies')
const json = await res.json()
```

`apiFetch` añade automáticamente el header `Authorization: Bearer <token>`.

---

## Agregar una nueva página

1. Crear `src/pages/MiPagina.jsx`.
2. Registrar la ruta en `App.jsx` dentro de `<Routes>` (envolver en `<ProtectedRoute>` si requiere auth).
3. Añadir el enlace en `Navbar.jsx` si corresponde.

---

## Agregar un componente UI

Colocar en `src/components/ui/`. Usar el helper `cn()` de `@/utils/cn` para combinar clases Tailwind:

```jsx
import { cn } from '@/utils/cn'

const MiComponente = ({ className, ...props }) => (
  <div className={cn('base-classes', className)} {...props} />
)
```

---

## Tests

Los tests usan **Vitest** con `jsdom` y **Testing Library**.
El setup global está en `tests/setup.js` (importa `@testing-library/jest-dom`).
La configuración de Vitest está dentro de `vite.config.js` bajo la clave `test`.

```powershell
npm run test           # watch mode
npm run test:coverage  # reporte de cobertura
```