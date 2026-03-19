import { extractBearerToken, verifyAccessToken } from '@/lib/jwt'
import type { AccessTokenPayload } from '@/lib/jwt'
import type { UserRole } from '@/types/user'

export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function requireAuth(
  req: Request,
  options?: { roles?: UserRole[] },
): Promise<AccessTokenPayload> {
  const authHeader = req.headers.get('authorization')
  const token = extractBearerToken(authHeader)

  if (!token) {
    throw new HttpError(401, 'Unauthorized')
  }

  let payload: AccessTokenPayload

  try {
    payload = await verifyAccessToken(token)
  } catch {
    throw new HttpError(401, 'Invalid or expired token')
  }

  if (options?.roles && !options.roles.includes(payload.role)) {
    throw new HttpError(403, 'Forbidden')
  }

  return payload
}

export function handleHttpError(error: unknown, fallbackMessage: string) {
  if (error instanceof HttpError) {
    return {
      status: error.status,
      message: error.message,
    }
  }

  const message = error instanceof Error ? error.message : fallbackMessage

  return {
    status: 500,
    message,
  }
}
