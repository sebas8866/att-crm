import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { to, subject, customerName, customerPhone, address } = await req.json();

    if (!to || !customerPhone || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'crm@myhomepromotions.com',
      to,
      subject: subject || 'New Client Needs Address Verification',
      text: `
New client needs address verification:

Customer: ${customerName}
Phone: ${customerPhone}
Address: ${address}

Please check AT&T availability at this address and follow up with the customer.

View in CRM: https://att-crm.vercel.app/conversations
      `,
      html: `
<h2>New Client Needs Address Verification</h2>
<p><strong>Customer:</strong> ${customerName}</p>
<p><strong>Phone:</strong> ${customerPhone}</p>
<p><strong>Address:</strong> ${address}</p>
<p>Please check AT&T availability at this address and follow up with the customer.</p>
<p><a href="https://att-crm.vercel.app/conversations">View in CRM</a></p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending agent notification:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
