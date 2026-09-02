import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import keycloak from '@/utils/keycloak'
import { APP_NAME } from '@/utils/appConfig'
import { API_URL } from '@/config/defaults'

export default function QrConfirmPage () {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('s') ?? ''

  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [errorMsg, setErrorMsg] = useState(null)
  const sentRef = useRef(false)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setErrorMsg(t('qr.confirmInvalidLink'))
    }
  }, [sessionId, t])

  const handleConfirm = async () => {
    if (sentRef.current || !sessionId) return
    sentRef.current = true
    setStatus('sending')
    setErrorMsg(null)

    try {
      // Refrescar el token antes de enviarlo para asegurarnos que está vigente
      try { await keycloak.updateToken(30) } catch { /* noop si falla */ }

      const accessToken  = keycloak.token         ?? null
      const refreshToken = keycloak.refreshToken   ?? null

      if (!accessToken) {
        throw new Error(t('qr.confirmNoSession'))
      }

      const res = await fetch(`${API_URL}/api/qr/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          session_id:    sessionId,
          access_token:  accessToken,
          refresh_token: refreshToken,
        }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json?.message || `Error ${res.status}`)
      }

      setStatus('done')
    } catch (err) {
      sentRef.current = false
      setStatus('error')
      setErrorMsg(err?.message || t('qr.confirmError'))
    }
  }

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
        maxWidth: 420,
        width: '100%',
        background: 'rgba(22,27,39,0.92)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 16,
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#3b82f6', marginBottom: 4 }}>
          {APP_NAME}
        </div>
        <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: '1.5rem' }}>
          {t('qr.confirmTitle')}
        </div>

        {status === 'idle' && sessionId && (
          <>
            <p style={{ color: '#cbd5e1', fontSize: 15, marginBottom: '1.5rem' }}>
              {t('qr.confirmMessage')}
            </p>
            <button
              onClick={handleConfirm}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('qr.confirmBtn')}
            </button>
          </>
        )}

        {status === 'sending' && (
          <p style={{ color: '#94a3b8', fontSize: 15 }}>{t('qr.confirmSending')}</p>
        )}

        {status === 'done' && (
          <div>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
            <p style={{ color: '#4ade80', fontSize: 16, fontWeight: 600 }}>
              {t('qr.confirmDone')}
            </p>
            <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>
              {t('qr.confirmDoneMessage')}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <p style={{ color: '#f87171', fontSize: 15, marginBottom: '1rem' }}>
              {errorMsg || 'Error al vincular el dispositivo.'}
            </p>
            {sessionId && (
              <button
                onClick={() => { sentRef.current = false; setStatus('idle'); setErrorMsg(null) }}
                style={{
                  padding: '0.6rem 1.5rem',
                  background: 'transparent',
                  color: '#3b82f6',
                  border: '1px solid #3b82f6',
                  borderRadius: 8,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {t('qr.confirmRetry')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
