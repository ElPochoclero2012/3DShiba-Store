const BY_CODE: Record<string, string> = {
  invalid_credentials: 'Email o contraseña incorrectos.',
  email_not_confirmed: 'Tenés que confirmar el correo antes de ingresar.',
  user_already_exists: 'Ese correo ya está registrado. Iniciá sesión.',
  signup_disabled: 'El registro está deshabilitado.',
  email_address_invalid: 'Ese email no es válido.',
  email_exists: 'Ese correo ya está registrado. Iniciá sesión.',
  weak_password: 'La contraseña es demasiado débil. Usá al menos 6 caracteres.',
  over_request_rate_limit: 'Demasiados intentos. Esperá un momento y volvé a probar.',
  over_email_send_rate_limit: 'Se enviaron demasiados correos. Esperá un rato y reintentá.',
  otp_expired: 'El enlace venció. Pedí uno nuevo.',
  otp_disabled: 'Ese método de ingreso no está disponible.',
  bad_jwt: 'La sesión no es válida. Iniciá sesión de nuevo.',
  session_not_found: 'No hay una sesión activa. Iniciá sesión de nuevo.',
  user_banned: 'Esta cuenta está deshabilitada.',
  validation_failed: 'Revisá los datos e intentá de nuevo.',
}

const BY_MESSAGE: [RegExp, string][] = [
  [/invalid login credentials/i, 'Email o contraseña incorrectos.'],
  [/email not confirmed/i, 'Tenés que confirmar el correo antes de ingresar.'],
  [/user already registered/i, 'Ese correo ya está registrado. Iniciá sesión.'],
  [/already (been )?registered/i, 'Ese correo ya está registrado. Iniciá sesión.'],
  [/password should be at least/i, 'La contraseña debe tener al menos 6 caracteres.'],
  [/password is known to be weak/i, 'Esa contraseña es demasiado débil. Elegí otra.'],
  [/unable to validate email/i, 'Ese email no es válido.'],
  [/email rate limit/i, 'Se enviaron demasiados correos. Esperá un rato y reintentá.'],
  [/for security purposes/i, 'Por seguridad, esperá un momento antes de reintentar.'],
  [/signup requires a valid password/i, 'Ingresá una contraseña válida.'],
  [/email link is invalid or has expired/i, 'El enlace de confirmación no es válido o venció.'],
  [/token has expired or is invalid/i, 'El enlace venció. Pedí uno nuevo.'],
  [/provider is not enabled/i, 'Ese método de ingreso no está habilitado.'],
  [/error sending confirmation/i, 'No pudimos enviar el correo de confirmación. Probá de nuevo.'],
  [/network request failed/i, 'No hay conexión. Revisá internet e intentá de nuevo.'],
]

export function authErrorMessage(
  error: { message?: string; code?: string } | null | undefined,
  fallback = 'No se pudo completar el inicio de sesión.'
) {
  if (!error) return fallback
  const code = error.code?.trim()
  if (code && BY_CODE[code]) return BY_CODE[code]

  const message = error.message?.trim() ?? ''
  for (const [pattern, text] of BY_MESSAGE) {
    if (pattern.test(message)) return text
  }

  return fallback
}

export function safeNextPath(value: string | null | undefined, fallback = '/') {
  if (!value) return fallback
  const path = value.trim()
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://')) {
    return fallback
  }
  return path
}
