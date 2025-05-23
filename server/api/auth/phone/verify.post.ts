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
  findUserByPhoneNumber,
  updateLastActiveTimestamp,
} from '@@/server/database/queries/users'
import { phoneVerificationSchema } from '@@/shared/validations/auth'

export default defineEventHandler(async (event) => {
  const data = await validateBody(event, phoneVerificationSchema)

  const oneTimePassword = await findOneTimePassword(data.code)
  if (!oneTimePassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid code',
    })
  }

  if (!isWithinExpiryDate(oneTimePassword.expiresAt.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Code has expired' })
  }

  const user = await findUserByPhoneNumber(data.phoneNumber)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  await deleteOneTimePassword(data.code)

  if (user.banned && user.bannedUntil && user.bannedUntil > new Date()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Your account has been banned',
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
