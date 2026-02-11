import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendNewMessageEmail({
  customerName,
  customerPhone,
  messageBody,
}: {
  customerName: string | null
  customerPhone: string
  messageBody: string
}) {
  const to = process.env.NOTIFICATION_EMAIL || 'info@myhomepromotions.com'
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'My Home Promotions CRM <crm@myhomepromotions.com>',
    to,
    subject: `New Message from ${customerName || customerPhone}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Message Received</h2>
        <p><strong>From:</strong> ${customerName || 'Unknown'} (${customerPhone})</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 0; white-space: pre-wrap;">${messageBody}</p>
        </div>
        <p><a href="https://att-crm.vercel.app/conversations" style="background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View in CRM</a></p>
      </div>
    `,
    text: `New message from ${customerName || customerPhone}:\n\n${messageBody}\n\nView in CRM: https://att-crm.vercel.app/conversations`,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Email notification sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
