import { sendEmail } from '@@/server/services/email'
import {
  updateFeedback,
  getFeedbackById,
} from '@@/server/database/queries/admin'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (!user.superAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You are not authorized to access this resource',
    })
  }
  const { id, message, email } = await readBody(event)
  const feedback = await getFeedbackById(id)
  if (!feedback) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Feedback not found',
    })
  }
  await updateFeedback(id, { reply: message, status: 'replied' })

  await sendEmail({
    to: email,
    subject: 'Feedback Reply',
    text: message,
  })

  sendNoContent(event)
})
