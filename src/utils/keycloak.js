import Keycloak from 'keycloak-js'
import { KEYCLOAK_CONFIG } from '@/config/defaults'

const keycloak = new Keycloak(KEYCLOAK_CONFIG)

export default keycloak
