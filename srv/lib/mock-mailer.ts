export interface EmailContent {
    to: string
    subject: string
    body: string
}

// TODO: swap for a real mailer (e.g. nodemailer) when going to production
export default async function sendMockEmail(
    email: EmailContent,
): Promise<void> {
    console.log('[MOCK EMAIL SENT]')
    console.log(`   To: ${email.to}`)
    console.log(`   Subject: ${email.subject}`)
    console.log(`   Body: ${email.body}`)
}
