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
      <div style="font-family: 'Arial', sans-serif; background-color: rgba(60, 96, 76, 0.08); padding: 30px;">
        <div style="
          max-width: 650px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 16px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          border: 1px solid #e0e0e0;
          overflow: hidden;
        ">
          <!-- Header -->
          <div style="
            background-color: rgb(60, 96, 76);
            text-align: center;
            padding: 30px 20px;
          ">
            <h1 style="
              color: #ffffff;
              font-size: 28px;
              font-weight: 700;
              margin: 0;
              line-height: 1.2;
            ">
              Coffee Beats By Life
            </h1>
          </div>

          <!-- Body -->
          <div style="padding: 35px 30px; font-size: 16px; line-height: 1.6; color: #333333;">
            <p style="color: #555555;">Dear ${recipientName || "Valued Customer"},</p>

            <p style="color: #555555;">
              ${message}
            </p>

            <p style="color: #555555;">
              Sincerely,<br><strong>The Coffee Beats Team</strong>
            </p>

            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 35px 0;">

            <p style="font-size: 12px; color: #999999; text-align: center;">
              This is an official communication from <strong>Coffee Beats By Life</strong>.<br/>
              Please do not reply directly to this email. If you have questions, kindly contact us through our official channels.
            </p>
          </div>
        </div>
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
