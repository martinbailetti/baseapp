import { useState, useEffect } from 'react'

export const usePwaInstall = () => {
  const [prompt, setPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    setPrompt(null)
  }

  const dismiss = () => setPrompt(null)

  return { canInstall: !!prompt, install, dismiss }
}
