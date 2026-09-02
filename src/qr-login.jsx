import './i18n/index.js'
import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { QRCodeCanvas } from 'qrcode.react'
import { useTranslation } from 'react-i18next'
import { APP_NAME } from '@/utils/appConfig'
import ErrorBoundary from '@/components/ErrorBoundary'
import {
  APP_TOKEN,
  SMI_MSG_WS_URL,
  QR_REDIRECT_DELAY_MS,
  QR_WS_SUBSCRIBE_INTERVAL_MS,
  QR_WS_SUBSCRIBE_MAX_ATTEMPTS,
} from '@/config/defaults'

const WS_URL = SMI_MSG_WS_URL

/** Genera un ID de sesión único (UUID v4 simplificado) */
function generateSessionId () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function QrLoginApp () {
  const { t } = useTranslation()
  const sessionId = useRef(generateSessionId()).current
  const wsRef = useRef(null)

  const [status, setStatus] = useState('connecting') // connecting | waiting | linked | error
  const [errorMsg, setErrorMsg] = useState('')

  const confirmUrl = `${window.location.origin}/qr-confirm?s=${sessionId}`

  useEffect(() => {
    if (!WS_URL) {
      setStatus('error')
      setErrorMsg(t('qr.errorNoWsUrl'))
      return
    }

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws
    let subAttempts = 0
    let subTimer = null

    const sendSubscribe = () => {
      if (ws.readyState !== WebSocket.OPEN) return false
      try {
        ws.send(JSON.stringify({ type: 'subscribe', payload: { topic: `device-link:${APP_TOKEN}:${sessionId}` } }))
        return true
      } catch {
        return false
      }
    }

    ws.onopen = () => {
      // Identificar el socket en smi_msg
      try {
        ws.send(JSON.stringify({ type: 'identify', payload: { appToken: APP_TOKEN } }))
      } catch { /* noop */ }

      // Suscribirse al topic con reintentos
      subAttempts = 0
      subTimer = setInterval(() => {
        const ok = sendSubscribe()
        if (ok) {
          clearInterval(subTimer)
          setStatus('waiting')
        } else {
          subAttempts++
          if (subAttempts >= QR_WS_SUBSCRIBE_MAX_ATTEMPTS) {
            clearInterval(subTimer)
            setStatus('error')
          setErrorMsg(t('qr.errorSubscribe'))
          }
        }
      }, QR_WS_SUBSCRIBE_INTERVAL_MS)
    }

    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(String(evt.data))
        if (
          data.type === 'DEVICE_LINKED' &&
          String(data.client) === APP_TOKEN &&
          data.sessionId === sessionId
        ) {
          const accessToken  = data.access_token  ?? null
          const refreshToken = data.refresh_token ?? null

          if (!accessToken) {
            setStatus('error')
            setErrorMsg(t('qr.errorInvalidPayload'))
            return
          }

          // Guardar tokens para que main.jsx los use en keycloak.init()
          try {
            localStorage.setItem('qr_access_token',  accessToken)
            if (refreshToken) localStorage.setItem('qr_refresh_token', refreshToken)
          } catch { /* noop */ }

          setStatus('linked')

          // Redirigir a la app principal después de un instante
          setTimeout(() => { window.location.replace('/') }, QR_REDIRECT_DELAY_MS)
        }
      } catch { /* noop */ }
    }

    ws.onerror = () => {
      setStatus('error')
      setErrorMsg(t('qr.errorWs'))
    }

    ws.onclose = () => {
      clearInterval(subTimer)
    }

    return () => {
      clearInterval(subTimer)
      try { ws.send(JSON.stringify({ type: 'unsubscribe', payload: { topic: `device-link:${APP_TOKEN}:${sessionId}` } })) } catch { /* noop */ }
      ws.close()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0d1117 0%, #161b27 40%, #1a2236 70%, #0d1117 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1.5rem',
    }}>
      <div style={{
        maxWidth: 400,
        width: '100%',
        background: 'rgba(22,27,39,0.92)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 16,
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        textAlign: 'center',
      }}>
        {/* Logo / título */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#3b82f6', letterSpacing: '-0.5px' }}>
            {APP_NAME}
          </div>
          <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
            {t('qr.pageTitle')}
          </div>
        </div>

        {/* QR */}
        {(status === 'waiting' || status === 'connecting') && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{
              background: '#ffffff',
              padding: 12,
              borderRadius: 12,
              display: 'inline-block',
              opacity: status === 'connecting' ? 0.4 : 1,
              transition: 'opacity 0.3s',
            }}>
              <QRCodeCanvas value={confirmUrl} size={200} includeMargin={false} />
            </div>
          </div>
        )}

        {/* Estado */}
        {status === 'connecting' && (
          <p style={{ color: '#94a3b8', fontSize: 14 }}>{t('qr.connecting')}</p>
        )}
        {status === 'waiting' && (
          <>
            <p style={{ color: '#cbd5e1', fontSize: 14, marginBottom: 8 }}>
              {t('qr.instructions')}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#3b82f6',
                boxShadow: '0 0 8px #3b82f6',
                display: 'inline-block',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <span style={{ color: '#64748b', fontSize: 13 }}>{t('qr.waiting')}</span>
            </div>
          </>
        )}
        {status === 'linked' && (
          <div style={{ color: '#4ade80', fontSize: 16, fontWeight: 600 }}>
            {t('qr.linked')}
          </div>
        )}
        {status === 'error' && (
          <div style={{ color: '#f87171', fontSize: 14 }}>
            {errorMsg || t('qr.errorConnect')}
          </div>
        )}

        {/* Volver a login normal */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.2rem' }}>
          <a
            href="/"
            style={{ color: '#3b82f6', fontSize: 13, textDecoration: 'none' }}
          >
            {t('qr.backToLogin')}
          </a>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('qr-root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QrLoginApp />
    </ErrorBoundary>
  </React.StrictMode>
)
