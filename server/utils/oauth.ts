// OAuth Authentication Flow
// 1. Validate OAuth user data from provider (handled by Nuxt OAuth module)
// 2. Check if user exists (@method findUserByEmail)
// 3. If new user, create user with OAuth data (@method createUserWithOAuth)
// 4. Update avatar if not set (@method updateUser)
// 5. Link OAuth account to user (@method linkOAuthAccount)
// 6. Check if user is banned
// 7. Sanitize user data (@method sanitizeUser)
// 8. Set user session and redirect to dashboard

// Used in:
// - server/api/auth/oauth/discord.ts
// - server/api/auth/oauth/google.ts
// - server/api/auth/oauth/github.ts

import {
  findUserByEmail,
  createUserWithOAuth,
  updateUser,
  linkOAuthAccount,
} from '@@/server/database/queries/users'
import { sendLoginNotification } from '@@/server/utils/auth'
import type { H3Event } from 'h3'

export interface OAuthUserData {
  email: string
  name: string
  avatarUrl: string
  provider: 'discord' | 'google' | 'github'
  providerUserId: string
}

export const handleOAuthSuccess = async (
  event: H3Event,
  oauthUser: OAuthUserData,
) => {
  // 2. Check if user exists
  let dbUser = await findUserByEmail(oauthUser.email)

  // 3. If new user, create user with OAuth data
  if (!dbUser) {
    dbUser = await createUserWithOAuth({
      email: oauthUser.email,
      name: oauthUser.name,
      avatarUrl: oauthUser.avatarUrl,
      emailVerified: true,
    })
  }

  // 4. Update avatar if not set
  if (!dbUser.avatarUrl && oauthUser.avatarUrl) {
    dbUser = await updateUser(dbUser.id, {
      avatarUrl: oauthUser.avatarUrl,
    })
  }

  // 5. Link OAuth account to user
  await linkOAuthAccount(
    dbUser.id,
    oauthUser.provider,
    oauthUser.providerUserId,
  )

  // 6. Check if user is banned
  if (dbUser.banned) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Your account has been banned',
    })
  }

  // 7. Sanitize user data
  const sanitizedUser = sanitizeUser(dbUser)

  // 8. Set user session and redirect to dashboard
  await setUserSession(event, { user: sanitizedUser })

  // Send login notification
  await sendLoginNotification({
    name: sanitizedUser.name,
    email: sanitizedUser.email,
  })
  return sendRedirect(event, '/dashboard')
}
