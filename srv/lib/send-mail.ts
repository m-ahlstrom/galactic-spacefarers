import nodemailer from 'nodemailer'

interface EmailContent {
    to: string
    subject: string
    html: string
}

const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS
const smtpHost = process.env.SMTP_HOST
const smtpPort = process.env.SMTP_PORT
    ? Number(process.env.SMTP_PORT)
    : undefined
const smtpSecure = process.env.SMTP_SECURE === 'true'

if (!smtpUser || !smtpPass) {
    console.warn(
        'SMTP_USER / SMTP_PASS not set, emails will fail to send. Check your .env file.',
    )
}

// If SMTP_HOST is provided, use a generic SMTP transport (works with any
// provider: Outlook, a company mail server, a self-hosted relay, etc.).
// Otherwise, fall back to nodemailer's Gmail shortcut for convenience.
const transporter = smtpHost
    ? nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort ?? 587,
          secure: smtpSecure,
          auth: {
              user: smtpUser,
              pass: smtpPass,
          },
      })
    : nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: smtpUser,
              pass: smtpPass,
          },
      })

export default async function sendMail(content: EmailContent): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
        console.log('[TEST MODE — MOCK EMAIL]', content)
        return
    }

    try {
        await transporter.sendMail({
            from: `"Galactic Spacefarer HQ" <${smtpUser}>`,
            to: content.to,
            subject: content.subject,
            html: content.html,
        })
        console.log(`Email sent to ${content.to}`)
    } catch (err) {
        console.error('Failed to send email:', err)
    }
}
