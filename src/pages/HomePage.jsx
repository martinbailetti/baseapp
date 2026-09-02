import { useState } from 'react'
import { ExternalLink, FolderGit2, Server, Monitor, Terminal, Database, Download, Palette, KeyRound, Bot, FileText, HardDrive, BellRing } from 'lucide-react'
import { apiFetch } from '@/utils/apiFetch'
import { generateHomeMarkdown } from '@/utils/generateHomeMarkdown'
import { Section, CodeBlock, EnvTable } from '@/components/Home'
import { HOME_WEBAPP_ENV, HOME_API_ENV } from '@/config/pageConfigs'

const downloadMarkdown = () => {
  const content = generateHomeMarkdown()
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'basekit-instrucciones.md'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const HomePage = () => {
  const [dumping, setDumping] = useState(false)
  const [dumpError, setDumpError] = useState(null)
  const svnUrl = import.meta.env.VITE_SVN_URL

  const handleDbDump = async () => {
    setDumping(true)
    setDumpError(null)
    try {
      const res = await apiFetch('/api/db-dump')
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.message || `Error ${res.status}`)
      }
      const disposition = res.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename="([^"]+)"/)
      const filename = match ? match[1] : 'basekit_dump.sql'
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      setDumpError(err.message)
    } finally {
      setDumping(false)
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BaseKit</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Documentacion de configuracion del proyecto
          </p>
        </div>
        <button
          onClick={downloadMarkdown}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2 text-sm font-medium transition-colors"
          title="Descargar esta documentacion como archivo .md"
        >
          <Download className="h-4 w-4" />
          Descargar instrucciones
        </button>
      </div>

      {/* Quick Start — Agente IA */}
      <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">Instalaci&#243;n asistida por IA</h2>
        </div>
        <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-4">
          Para instalar y configurar este proyecto, descarga los dos archivos siguientes
          y p&#225;salos a tu agente de programaci&#243;n (GitHub Copilot, Cursor, Claude, etc.).
          El agente leer&#225; la documentaci&#243;n y el esquema de la base de datos y deber&#237;a guiarte
          &#8212; o ejecutar directamente &#8212; todo el proceso de instalaci&#243;n y configuraci&#243;n.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={downloadMarkdown}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-medium transition-colors"
          >
            <FileText className="h-4 w-4" />
            Descargar instrucciones (.md)
          </button>
          <button
            onClick={handleDbDump}
            disabled={dumping}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 text-sm font-medium transition-colors"
          >
            <HardDrive className="h-4 w-4" />
            {dumping ? 'Generando dump...' : 'Descargar base de datos (.sql)'}
          </button>
        </div>
        {dumpError && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{dumpError}</p>
        )}
      </div>

      {/* Conexión con Keycloak */}
      <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-6">
        <div className="flex items-center gap-2 mb-3">
          <KeyRound className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">Conexi&#243;n con Keycloak</h2>
        </div>
        <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-4">
          Manuales para crear los clientes necesarios en Keycloak.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/tutorials/DEV%20-%20Creaci%C3%B3n%20de%20Cliente%20de%20API%20Keycloak.pdf"
            download
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-medium transition-colors"
            title="Cliente Keycloak para login en desarrollo"
          >
            <Download className="h-4 w-4" />
            Cliente Keycloak para login en desarrollo <span className="ml-1 rounded-full bg-emerald-800/40 text-emerald-200 px-2 py-0.5 text-xs font-normal">DEV</span>
          </a>
          <a
            href="/tutorials/Creaci%C3%B3n%20de%20Cliente%20Keycloak%20para%20login%20de%20aplicaciones.pdf"
            download
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-medium transition-colors"
            title="Creacion de Cliente Keycloak para autenticacion (Obligatorio)"
          >
            <Download className="h-4 w-4" />
            Cliente Keycloak para login <span className="ml-1 rounded-full bg-emerald-800/40 text-emerald-200 px-2 py-0.5 text-xs font-normal">Obligatorio</span>
          </a>
          <a
            href="/tutorials/Creaci%C3%B3n%20de%20Cliente%20de%20API%20Keycloak.pdf"
            download
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-sm font-medium transition-colors"
            title="Creacion de Cliente de API Keycloak (Opcional) — para acceder a la API de Keycloak desde la app"
          >
            <Download className="h-4 w-4" />
            Cliente de API Keycloak <span className="ml-1 rounded-full bg-emerald-800/40 text-emerald-200 px-2 py-0.5 text-xs font-normal">Opcional</span>
          </a>
        </div>
      </div>

      {svnUrl && (
        <Section icon={FolderGit2} title="Repositorio SVN">
          <p className="mb-3 text-sm text-gray-600 dark:text-slate-300">Checkout del repositorio completo:</p>
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-4 py-3">
            <code className="flex-1 font-mono text-sm text-gray-800 dark:text-slate-200 break-all">
              svn checkout {svnUrl}
            </code>
            <a href={svnUrl} target="_blank" rel="noopener noreferrer"
              className="ml-2 text-indigo-500 hover:text-indigo-700 flex-shrink-0" title="Abrir en navegador">
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </Section>
      )}

      <Section icon={KeyRound} title="Autenticacion — Keycloak">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            La autenticacion esta basada en{' '}
            <strong className="text-gray-800 dark:text-slate-200">Keycloak 26.5.6</strong>.
            Para desarrollo hay un servidor Keycloak disponible en{' '}
            <strong className="text-gray-800 dark:text-slate-200">http://192.168.13.162:8080/</strong>.
            Si prefieres usar una instancia propia, instala y configura Keycloak antes de arrancar la aplicacion.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 px-4 py-3 space-y-1">
              <p className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">Version requerida</p>
              <p className="font-mono text-sm font-semibold text-gray-800 dark:text-slate-200">26.5.6</p>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 px-4 py-3 space-y-1">
              <p className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">Runtime</p>
              <p className="font-mono text-sm font-semibold text-gray-800 dark:text-slate-200">Quarkus (JVM / Java)</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">Descarga</p>
            <a
              href="https://www.keycloak.org/downloads-archive"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              keycloak.org/downloads-archive
            </a>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              Buscar la version <code className="font-mono bg-gray-100 dark:bg-slate-700 px-1 rounded">26.5.6</code> en el listado de versiones anteriores.
            </p>
          </div>
          <div className="rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
            El realm, cliente y roles de Keycloak deben coincidir con las variables{' '}
            <code className="font-mono text-xs bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">VITE_KEYCLOAK_*</code>{' '}
            del <code className="font-mono text-xs bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">.env</code> de la webapp
            y las variables <code className="font-mono text-xs bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">KEYCLOAK_*</code>{' '}
            del <code className="font-mono text-xs bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">.env</code> de la API.
          </div>
        </div>
      </Section>

      <Section icon={Terminal} title="Entorno de desarrollo">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">
              Webapp <span className="font-normal text-gray-400 dark:text-slate-500">— React + Vite en http://192.168.13.162:5173</span>
            </p>
            <p className="mb-1 text-xs text-gray-500 dark:text-slate-400">
              Posicionarse dentro de la carpeta <code className="font-mono bg-gray-100 dark:bg-slate-700 px-1 rounded">webapp</code> y ejecutar:
            </p>
            <CodeBlock>
              <div><span className="text-gray-400 dark:text-slate-500 select-none"># </span>npm install</div>
              <div>npm run dev</div>
            </CodeBlock>
            <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
              El proxy de Vite redirige <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">/api/*</code> a{' '}
              <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">http://192.168.13.162:8888</code> automaticamente.
            </p>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">
              API PHP <span className="font-normal text-gray-400 dark:text-slate-500">— servidor built-in en http://0.0.0.0:8888</span>
            </p>
            <p className="mb-1 text-xs text-gray-500 dark:text-slate-400">
              Posicionarse dentro de la carpeta <code className="font-mono bg-gray-100 dark:bg-slate-700 px-1 rounded">api</code> y ejecutar:
            </p>
            <CodeBlock>
              <div><span className="text-gray-400 dark:text-slate-500 select-none"># </span>Copiar .env.ONLINE1 como .env.NOMBRE_DE_PC y ajustar credenciales</div>
              <div>php -S 0.0.0.0:8888 index.php</div>
            </CodeBlock>
          </div>
        </div>
      </Section>

      <Section icon={Palette} title="Frontend — Estilos y recursos">
        <div className="space-y-5">
          <div>
            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-slate-200">Stack tecnologico</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                ['React 18',       'Componentes y hooks'],
                ['Vite 5',         'Bundler y dev server'],
                ['Tailwind CSS 3', 'Utility-first CSS'],
                ['React Router v6','Enrutamiento SPA'],
                ['Zustand',        'Estado global'],
                ['i18next',        'Internacionalizacion'],
                ['keycloak-js',    'Autenticacion SSO'],
                ['lucide-react',   'Iconos SVG'],
              ].map(([name, desc]) => (
                <div key={name} className="rounded-lg border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 px-3 py-2">
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">Estilos</p>
            <p className="text-sm text-gray-600 dark:text-slate-300">
              Las clases de Tailwind se configuran en{' '}
              <code className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">tailwind.config.js</code>.
              El modo oscuro usa la estrategia <code className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">class</code>,
              gestionado mediante el store de Zustand. Los estilos globales estan en{' '}
              <code className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">src/index.css</code>.
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">Iconos y favicons</p>
            <p className="mb-3 text-sm text-gray-600 dark:text-slate-300">
              Para generar los iconos de la aplicacion (favicon, iconos PWA, etc.) usar el generador online:
            </p>
            <a
              href="https://www.favicon-generator.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              favicon-generator.org
            </a>
            <div className="mt-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
              <strong>Importante:</strong> solo reemplazar las imagenes generadas en{' '}
              <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">webapp/public/images/</code>.{' '}
              <strong>No modificar</strong> el archivo{' '}
              <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">manifest.json</code>{' '}
              ni <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">browserconfig.xml</code> — esos ya estan configurados correctamente.
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
              Al ejecutar <code className="font-mono bg-gray-100 dark:bg-slate-700 px-1 rounded">npm run build</code> las imagenes se despliegan automaticamente a{' '}
              <code className="font-mono bg-gray-100 dark:bg-slate-700 px-1 rounded">api/public/images/</code>.
            </p>
          </div>
        </div>
      </Section>

      <Section icon={Database} title="Base de datos">
        <p className="mb-4 text-sm text-gray-600 dark:text-slate-300">
          Descarga un dump completo de la base de datos{' '}
          <code className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">basekit</code>{' '}
          en formato SQL. Requiere que <code className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">mysqldump</code> este instalado en el servidor.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDbDump}
            disabled={dumping}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 text-sm font-medium transition-colors"
          >
            <Download className="h-4 w-4" />
            {dumping ? 'Generando dump...' : 'Descargar backup SQL'}
          </button>
          {dumpError && (
            <p className="text-sm text-red-600 dark:text-red-400">{dumpError}</p>
          )}
        </div>
      </Section>

      <Section icon={BellRing} title="Notifications — Push Web">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            BaseKit permite enviar notificaciones push desde la pagina de administracion de notificaciones.
            Para que funcione, debes habilitar PUSH en el <code className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">.env</code> de la API y configurar claves VAPID.
          </p>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">Obtener claves VAPID</p>
            <CodeBlock>
              <div>web-push generate-vapid-keys</div>
            </CodeBlock>
            <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
              Copiar la clave publica en <code className="font-mono bg-gray-100 dark:bg-slate-700 px-1 rounded">PUSH_PUBLIC_KEY</code> y la privada en <code className="font-mono bg-gray-100 dark:bg-slate-700 px-1 rounded">PUSH_PRIVATE_KEY</code>.
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-200">Variables minimas en API</p>
            <CodeBlock>
              <div>PUSH_ENABLED=true</div>
              <div>PUSH_PUBLIC_KEY=TU_CLAVE_PUBLICA_VAPID</div>
              <div>PUSH_PRIVATE_KEY=TU_CLAVE_PRIVADA_VAPID</div>
              <div>PUSH_SUBJECT=mailto:admin@smi2000.net</div>
            </CodeBlock>
          </div>

          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            Si <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 rounded">PUSH_ENABLED=false</code>,
            la pagina de notificaciones mostrara un warning y bloqueara el envio.
          </div>
        </div>
      </Section>

      <Section icon={Monitor} title="Webapp — Variables de entorno">
        <p className="mb-4 text-sm text-gray-600 dark:text-slate-300">
          Archivo <code className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">webapp/.env.development</code> para local y{' '}
          <code className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">webapp/.env.production</code> para el build.
          Usar <code className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">.env.development.example</code> como plantilla.
          Todas las variables deben comenzar con <code className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">VITE_</code>.
        </p>
        <EnvTable rows={HOME_WEBAPP_ENV} />
      </Section>

      <Section icon={Server} title="API — Variables de entorno">
        <p className="mb-3 text-sm text-gray-600 dark:text-slate-300">
          La API busca el archivo{' '}
          <code className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">api/.env</code>{' '}
          en tiempo de ejecucion. El archivo debe crearse copiando la plantilla correspondiente al servidor:
        </p>
        <div className="mb-4 rounded-lg border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 px-4 py-3 space-y-2">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">Convencion de nombres</p>
          <p className="text-sm text-gray-700 dark:text-slate-200">
            El sufijo del archivo debe coincidir con el <strong>nombre del equipo</strong> (hostname de la PC o servidor).
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {['api/.env.ONLINE1', 'api/.env.ONLINE2', 'api/.env.MIPC'].map((f) => (
              <code key={f} className="font-mono text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2 py-1 rounded text-indigo-600 dark:text-indigo-400">
                {f}
              </code>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 pt-1">
            Para activarlo: copiar el archivo correspondiente como{' '}
            <code className="font-mono bg-gray-100 dark:bg-slate-700 px-1 rounded">api/.env</code>{' '}
            y ajustar las credenciales si es necesario.
          </p>
        </div>
        <EnvTable rows={HOME_API_ENV} />
      </Section>
    </div>
    </div>
  )
}

export default HomePage