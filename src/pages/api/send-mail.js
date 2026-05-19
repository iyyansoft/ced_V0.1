// src/pages/api/send-email.js
import nodemailer from 'nodemailer';

export async function post({ request }) {
  try {
    const { name, email, message } = await request.json();

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or use your email provider
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Define the email options
    const mailOptions = {
      from: email,
      to: 'cedau.outreach@gmail.com', // destination email
      subject: `New Contact Form Submission from ${name}`,
      text: `You have a new message from your website contact form:
        Name: ${name}
        Email: ${email}
        Message: ${message}`,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: 'Failed to send message' }), { status: 500 });
  }
}
