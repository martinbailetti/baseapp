import '@testing-library/jest-dom'
import { beforeEach } from 'vitest'
import i18n from '@/i18n'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock

beforeEach(async () => {
  await i18n.changeLanguage('es')
})
