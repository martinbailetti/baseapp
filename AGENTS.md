# AGENTS.md — Guía para agentes de programación (BaseKit frontend)

Instrucciones de referencia rápida para trabajar en este proyecto sin cometer errores comunes.

---

## Stack y restricciones

- **React 18** con JSX. No usar React 19 APIs.
- **Vite 5** — alias `@` apunta a `src/`. Usar `@/` en imports, no rutas relativas largas.
- **Tailwind CSS 3** — no instalar Tailwind 4; la config está en `tailwind.config.js`.
- **ESLint** configurado — no desactivar reglas sin justificación.
- **Variables de entorno** — solo las que empiezan con `VITE_` son accesibles en el cliente.  
  Nunca leer `process.env` en el frontend; usar `import.meta.env.VITE_*`.

---

## Alias de imports

El alias `@` = `src/`. Úsalo siempre:

```js
// ✅ correcto
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

// ❌ incorrecto
import { useAuth } from '../../hooks/useAuth'
```

---

## Auth — cosas críticas

### No reimplementar la lógica de autenticación

Todo el flujo de auth ya existe y está encapsulado:

| Necesidad | Solución existente |
|----------|--------------------|
| Saber si el usuario está autenticado | `useAuth().isAuthenticated` |
| Login / logout | `useAuth().login()` / `useAuth().logout()` |
| Token JWT | `useAuth().token` o `keycloak.token` |
| Verificar un rol | `useAuth().hasRole('nombre-rol')` |
| Verificar roles requeridos globales | `useAuth().hasRequiredRoles` |
| Datos del usuario (claims) | `useAuth().user` (= `keycloak.tokenParsed`) |

### No llamar a `keycloak.init()` en ningún otro lugar

Solo se llama una vez en `main.jsx`. Hacerlo de nuevo rompe la sesión.

### Proteger rutas nuevas

Envolver en `<ProtectedRoute>` en `App.jsx`:

```jsx
<Route
  path="/nueva-ruta"
  element={
    <ProtectedRoute>
      <AppLayout>
        <NuevaPagina />
      </AppLayout>
    </ProtectedRoute>
  }
/>
```

### Token para llamadas a la API

Usar siempre `apiFetch` — añade el JWT automáticamente desde el store:

```js
import { apiFetch } from '@/utils/apiFetch'

const res = await apiFetch('/api/movies')
const json = await res.json()
```

La API verifica el token en servidor (`api/src/Services/JwtService.php`). Las mutaciones
`POST/PUT/DELETE` requieren JWT válido; sin token responderá `401`.

El token se refresca automáticamente en `main.jsx` (`onTokenExpired`). No manejar
el refresh manualmente ni guardar el JWT en `localStorage`.

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_KEYCLOAK_URL` | URL base del servidor Keycloak |
| `VITE_KEYCLOAK_REALM` | Nombre del realm |
| `VITE_KEYCLOAK_CLIENT_ID` | Client ID del cliente Keycloak |
| `VITE_REQUIRED_ROLES` | Roles requeridos separados por coma |

Archivo activo en desarrollo: `.env.development`.  
Nunca commitear `.env.development` con credenciales reales; existe `.env.development.example` como plantilla.

---

## Componentes UI

Están en `src/components/ui/`. Antes de crear uno nuevo verificar si ya existe:
`Badge`, `Button`, `Card`, `Input`, `Spinner`.

Para combinar clases Tailwind usar siempre `cn()`:

```jsx
import { cn } from '@/utils/cn'
// cn usa clsx + tailwind-merge internamente
```

---

## Zustand store

Solo existe un store: `useAuthStore` en `src/store/useAuthStore.js`.  
Leer el estado desde el store **solo a través de `useAuth()`** en componentes.  
Acceso directo al store (sin React) solo en `main.jsx`:

```js
useAuthStore.getState().setAuthenticated(true)
```

---

## Tests

- Framework: **Vitest** (no Jest). La API es idéntica pero el entorno es `jsdom`.
- Setup global: `tests/setup.js` importa `@testing-library/jest-dom`.
- Los archivos de test van en `tests/` replicando la estructura de `src/`.
- Correr antes de hacer PR: `npm run test`.

---

## Checklist para añadir una nueva página

1. Crear `src/pages/NuevaPagina.jsx`
2. Registrar la ruta en `src/config/routes.jsx` (`protected`, `requiredRole`, `nav` si aplica)
3. `App.jsx` ya mapea `routes` automáticamente — no añadir `<Route>` manual salvo caso excepcional
4. Crear `tests/pages/NuevaPagina.test.jsx` (al menos smoke test)

---

## Comandos rápidos

```powershell
npm run dev          # dev server → http://localhost:5173
npm run build        # build producción
npm run test         # tests watch
npm run lint         # ESLint
```

---

## Lo que NO hacer

- No modificar `public/sw.js` manualmente → se versiona con `scripts/stamp-sw.js` durante el build.
- No agregar librerías de UI pesadas (MUI, Ant Design, etc.); el proyecto usa Tailwind + componentes propios.
- No usar `any` ni suprimir errores de lint sin justificación en comentario.
- No guardar el token JWT en `localStorage` manualmente; Keycloak lo gestiona en memoria.
