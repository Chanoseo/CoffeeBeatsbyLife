import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { toEmail, subject, message, recipientName } = await req.json();

    if (!toEmail || !message) {
      return NextResponse.json(
        { error: "Recipient email and message are required." },
        { status: 400 }
      );
    }

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Simple HTML (no styles)
    const htmlTemplate = `
      <div>
        <h2>Coffee Beats By Life</h2>
        <p>Dear ${recipientName || "Valued Customer"},</p>
        <p>${message}</p>
        <p>Sincerely,</p>
        <p>The Coffee Beats Team</p>
        <hr />
        <p>
          This is an official communication from <strong>Coffee Beats By Life</strong>.<br/>
          Please do not reply directly to this email. If you have questions, kindly contact us through our official channels.
        </p>
      </div>
    `;

    // Email options
    const mailOptions = {
      from: `"Coffee Beats By Life" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: subject || "Official Notice from Coffee Beats By Life",
      text: message, // fallback for plain-text clients
      html: htmlTemplate,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Plain email sent successfully.",
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send plain email." },
      { status: 500 }
    );
  }
}
