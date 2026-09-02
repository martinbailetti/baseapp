# Configuración del cliente Keycloak para BaseKit

## Problema

Error CORS al intentar autenticar: `fetch` al endpoint `/token` es bloqueado por el navegador.

## Solución

El cliente `basekit` debe estar correctamente configurado en Keycloak Admin Console.

### Pasos

1. Accede a Keycloak Admin Console: `http://localhost:8080/admin`

2. Selecciona el realm **SMIApplications** (arriba a la izquierda)

3. Ve a **Clients** → busca `basekit`

4. Pestaña **Settings**:
   - **Client ID**: `basekit`
   - **Client Protocol**: `openid-connect`
   - **Access Type**: `public`
   - **Standard Flow Enabled**: `ON`
   - **Implicit Flow Enabled**: `OFF`
   - **Direct Access Grants Enabled**: `ON`
   - **Valid Redirect URIs**: 
     ```
     http://localhost:5173/*
     http://localhost:3000/*
     https://odin.smi2000.net:6767/*
     ```
   - **Valid Post Logout Redirect URIs**: 
     ```
     http://localhost:5173/*
     http://localhost:3000/*
     https://odin.smi2000.net:6767/*
     ```
   - **Web Origins**: 
     ```
     http://localhost:5173
     http://localhost:3000
     https://odin.smi2000.net:6767
     ```
     ⚠️ **Este campo es CRÍTICO para evitar CORS**. No incluir `/*` al final.

5. Pestaña **Roles** (si hay roles específicos del cliente):
   - Verificar que existen roles: `super`, `admin`, `viewer`

6. **Guardar cambios**

---

## Verificar configuración del usuario

Si el cliente está bien configurado pero **aún redirige al login**, comprueba que el usuario tiene los roles requeridos:

1. En Keycloak Admin Console → **Users** → busca tu usuario
2. Pestaña **Role Mappings**
3. **Client Roles** → selecciona `basekit`
4. Asigna al menos uno de: `super`, `admin`, `viewer`

---

## Desactivar restricción de roles (desarrollo)

Si quieres permitir acceso sin roles en desarrollo, edita `.env.development`:

```bash
# Roles requeridos (vacío = sin restricción)
VITE_REQUIRED_ROLES=
```

---

## Comandos útiles

Reiniciar Keycloak tras cambiar configuración:

```powershell
# Detener
taskkill /F /IM java.exe /FI "WINDOWTITLE eq *keycloak*"

# Iniciar
cd c:\keycloak
.\bin\kc.bat start-dev
```

---

## Troubleshooting

### Error persiste tras configurar Web Origins

1. **Limpia caché de Keycloak**: En Admin Console → **Realm Settings** → pestaña **Cache** → **Clear cache**
2. **Limpia localStorage del navegador**: DevTools → Application → Local Storage → eliminar todo
3. **Hard refresh**: `Ctrl+Shift+R` en el navegador

### Ver logs de Keycloak

```powershell
Get-Content c:\keycloak\data\log\keycloak.log -Tail 50 -Wait
```

### Activar logs detallados de keycloak-js

En `main.jsx`, añade tras crear la instancia de Keycloak:

```js
keycloak.init({
  onLoad: _qrTokens ? 'check-sso' : 'login-required',
  checkLoginIframe: false,
  pkceMethod: 'S256',
  enableLogging: true,  // ← añadir esta línea
  ...(_qrTokens ?? {}),
})
```
