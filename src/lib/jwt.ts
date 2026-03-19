import { JWTPayload, SignJWT, jwtVerify } from 'jose'
import { UserRole } from '@/types/user'

const encoder = new TextEncoder()

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET

  if (!secret || secret.length < 32)
    throw new Error('JWT_SECRET must be defined with at least 32 characters')

  return encoder.encode(secret)
}

const JWT_ISSUER = process.env.JWT_ISSUER ?? 'quizzer-api'
const JWT_AUDIENCE = process.env.JWT_AUDIENCE ?? 'quizzer-client'
const JWT_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION ?? '15m'

export interface AccessTokenPayload extends JWTPayload {
  sub: string
  email: string
  role: UserRole
}

export const createAccessToken = async (
  payload: Pick<AccessTokenPayload, 'sub' | 'email' | 'role'>,
) => {
  const token = await new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(getJwtSecret())

  return token
}

export const verifyAccessToken = async (token: string) => {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  })

  return payload as AccessTokenPayload
}

export const extractBearerToken = (authorizationHeader?: string | null) => {
  if (!authorizationHeader) return null

  const [scheme, token] = authorizationHeader.split(' ')
  if (scheme !== 'Bearer' || !token) return null

  return token
}
