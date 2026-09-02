import { describe, it, expect, vi, beforeEach } from 'vitest'

const KeycloakMock = vi.fn()

vi.mock('keycloak-js', () => ({
  default: KeycloakMock,
}))

describe('keycloak', () => {
  beforeEach(() => {
    vi.resetModules()
    KeycloakMock.mockClear()
  })

  it('instancia Keycloak con la configuración por defecto', async () => {
    await import('@/utils/keycloak')

    expect(KeycloakMock).toHaveBeenCalledWith({
      url: expect.any(String),
      realm: expect.any(String),
      clientId: expect.any(String),
    })
  })
})
