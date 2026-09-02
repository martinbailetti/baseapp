import { DEFAULT_PER_PAGE } from './defaults'

export const LANGUAGES = [
  { code: 'es', label: 'ES', title: 'Español' },
  { code: 'ca', label: 'CA', title: 'Català' },
  { code: 'en', label: 'EN', title: 'English' },
]

// ── ActivityLog Page ──────────────────────────────────────────────────────

export const ACTIVITY_LOG_PER_PAGE_OPTIONS = [25, DEFAULT_PER_PAGE, 100]

export const ACTIVITY_LOG_COLUMNS_KEYS = [
  { tKey: 'activityLog.colId',       sortKey: 'Id'           },
  { tKey: 'activityLog.colUser',     sortKey: 'user_email'   },
  { tKey: 'activityLog.colAction',   sortKey: 'action'       },
  { tKey: 'activityLog.colEntity',   sortKey: 'entity'       },
  { tKey: 'activityLog.colEntityId', sortKey: 'entity_id'    },
  { tKey: 'activityLog.colDetails',  sortKey: null           },
  { tKey: 'activityLog.colIp',       sortKey: 'ip_address'   },
  { tKey: 'activityLog.colDate',     sortKey: 'created_at'   },
]

export const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN:  'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-gray-100 text-gray-600',
  VIEW:   'bg-yellow-100 text-yellow-700',
}

// ── Home Page ──────────────────────────────────────────────────────

export const HOME_WEBAPP_ENV = [
  { name: 'VITE_REQUIRED_ROLES',        description: 'Roles permitidos, separados por coma. Vacio = cualquier autenticado',   example: 'super,admin,viewer' },
  { name: 'VITE_API_URL',               description: 'URL base de la API. Vacio = proxy Vite / mismo origen',                 example: '',        required: false },
  { name: 'VITE_SMI_MSG_WS_URL',        description: 'WebSocket de smi_msg para notificaciones en tiempo real',               example: 'wss://smimsg.smi2000.net:35074', required: false },
  { name: 'VITE_APP_TOKEN',             description: 'Token de aplicacion para smi_msg',                                      example: 'basekit', required: false },
  { name: 'VITE_ENABLE_USERS_PAGE',     description: 'Muestra menu Usuarios',                                                  example: 'true',    required: false },
  { name: 'VITE_ENABLE_INSTALL_PROMPT', description: 'Muestra banner para instalar la PWA. Solo visible en dispositivos moviles', example: 'true',    required: false },
  { name: 'VITE_SVN_URL',               description: 'URL del repositorio SVN (se muestra en esta pagina)',                   example: 'svn://host/repo', required: false },
]

export const HOME_API_ENV = [
  { name: 'APP_NAME',                   description: 'Nombre de la aplicacion',                                               example: 'BaseKitAPI' },
  { name: 'APP_ENV',                    description: 'Entorno de ejecucion',                                                  example: 'production' },
  { name: 'APP_DEBUG',                  description: 'Muestra errores PHP detallados en la respuesta JSON',                   example: 'false' },
  { name: 'DB_HOST',                    description: 'Host de la base de datos',                                               example: '127.0.0.1' },
  { name: 'DB_PORT',                    description: 'Puerto de la base de datos',                                             example: '3306' },
  { name: 'DB_DATABASE',                description: 'Nombre de la base de datos',                                            example: 'basekit' },
  { name: 'DB_USERNAME',                description: 'Usuario de la base de datos',                                           example: 'basekit' },
  { name: 'DB_PASSWORD',                description: 'Contrasena de la base de datos',                                        example: 'xxxxxxxx' },
  { name: 'CORS_ALLOWED_ORIGINS',       description: 'Origenes CORS permitidos. Vacio si frontend y API comparten URL',       example: '',        required: false },
  { name: 'SMI_MSG_URL',                description: 'URL HTTP del servidor smi_msg',                                         example: 'https://smimsg.smi2000.net:35074', required: false },
  { name: 'SMI_MSG_INTERNAL_TOKEN',     description: 'Token interno para autenticar llamadas a smi_msg',                      example: 'xxxxxxxx', required: false },
  { name: 'JWT_SECRET',                 description: 'Secreto HMAC para firmar y verificar JWT de la API',                    example: 'xxxxxxxx' },
  { name: 'JWT_ISSUER',                 description: 'Emisor (iss) de los tokens JWT',                                        example: 'basekit', required: false },
  { name: 'JWT_TTL',                    description: 'Vida del access token en segundos',                                     example: '900',     required: false },
  { name: 'JWT_REFRESH_TTL',            description: 'Vida del refresh token en segundos',                                    example: '604800',  required: false },
  { name: 'JWT_REFRESH_TTL_REMEMBER',   description: 'Vida del refresh token con “recordarme”',                               example: '2592000', required: false },
  { name: 'JWT_VERIFY',                 description: 'Verificar firma JWT. false solo en tests',                              example: 'true' },
  { name: 'PUSH_ENABLED',               description: 'Habilita o deshabilita envio de notificaciones push desde la API',      example: 'true' },
  { name: 'PUSH_PUBLIC_KEY',            description: 'Clave publica VAPID para Web Push',                                     example: 'BExxxxxxx...' },
  { name: 'PUSH_PRIVATE_KEY',           description: 'Clave privada VAPID para Web Push',                                     example: 'xxxxxxxxx...' },
  { name: 'PUSH_SUBJECT',               description: 'Identificador del remitente VAPID, recomendado mailto:',                example: 'mailto:admin@smi2000.net', required: false },
]