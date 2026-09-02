import { describe, it, expect } from 'vitest'
import { APP_NAME } from '@/utils/appConfig'

describe('appConfig', () => {
  it('expone un nombre de aplicación no vacío', () => {
    expect(APP_NAME).toBeTruthy()
    expect(typeof APP_NAME).toBe('string')
  })
})
