import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'

import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJBKhPjb0hEMj0MA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFnVkYWNpdHktdG9kby5hdXRoMC5jb20wHhcNMjAwNDIwMDUyMjMxWhcNMzMx
MjI4MDUyMjMxWjAhMR8wHQYDVQQDExZ1ZGFjaXR5LXRvZG8uYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAveI6CoMiYl9IlNFkmbPdhoOK
CxqbsFbfxmCQxdbcx+4yrdPeNAzc69yDy0dPsPuOe0QRI1VqjcbBaQqWdbb204Po
j0EDSolgpT71Jig4BZta7okuJDKJ3kywKWJsN4X8LBUibNugCxaDZtu9ty9MJIkF
GFK9EPHNbqmw+uM6Gm/susLwL96atovVN9UqieD8sLAEAj+KVywOROVOtUTDUqsk
RkN4eTj4CTEBjyPXjTIeU3KkFonAIMA9HYvPZApyToLqru6rXS7GxtkVULXtEARo
QYAtjn9vhQ79XPbCsUQZQmDQ8S7si0qtQoM47NeKUrnazF0YXmtllh7apkHqkwID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ8PXjxxJYZzpsFeulx
BluuwGRZKjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAKaMKW/f
2MVtFAVRFvEdk2InDVs7YxjVANVXhFk2xs7wjOZUmAWHolHu9VJPOvUG3yEMHsB8
pIN5bKtSvG5+jUD/GAYCvCnR7E381QutYxwzvgANX3lj1hf4Z9e2ALG8PxS1L+2p
KmXCQBE4tQpZICg4/vpTNHACNX9SgIMyq0VQ3TJgvYPP2d4K6+8eiXUeOrxGZVQl
hl7u9BKAT0MAwqn7mCkisrRg94847zKhirjL5xea/YbRojMWfftWBurrojwtWyPE
PCjK01qOKjlfceT3IofaUbtMnZ13QEr5pszv1DY/nee6lzqXZ2+W7/kFimTDFx9h
SgFRSgToPvMrpLQ=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}
