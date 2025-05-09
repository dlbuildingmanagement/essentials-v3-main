// flow
// 1. Validate body (code)
// 2. Check if user exists (@method findUserById)
// 3. Delete one-time password (@method deleteOneTimePassword)
// 4. Update last active timestamp (@method updateLastActiveTimestamp)
// 5. Set user session (@method setUserSession)
// 6. Sanitize user data (@method sanitizeUser)
// 7. Return user (email, name)

// Used in:
// - app/components/auth/MagicLinkLogin.vue

import { validateBody } from '@@/server/utils/bodyValidation'
import { otpLoginSchema } from '@@/shared/validations/auth'
import {
  findOneTimePassword,
  deleteOneTimePassword,
} from '@@/server/database/queries/auth'
import {
  isWithinExpiryDate,
  sanitizeUser,
  sendLoginNotification,
} from '@@/server/utils/auth'
import {
  findUserById,
  updateLastActiveTimestamp,
} from '@@/server/database/queries/users'

export default defineEventHandler(async (event) => {
  const data = await validateBody(event, otpLoginSchema)

  const oneTimePassword = await findOneTimePassword(data.code)
  if (!oneTimePassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid code',
    })
  }
  if (!isWithinExpiryDate(oneTimePassword.expiresAt.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'OTP has expired' })
  }

  const user = await findUserById(oneTimePassword.userId)

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  await deleteOneTimePassword(data.code)

  if (user.banned && user.bannedUntil && user.bannedUntil > new Date()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You account has been banned',
    })
  }

  await updateLastActiveTimestamp(user.id)
  await setUserSession(event, { user: sanitizeUser(user) })

  // Send login notification
  await sendLoginNotification({
    name: user.name,
    email: user.email,
  })

  return sanitizeUser(user)
})
