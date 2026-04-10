import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function otpBlock(otp) {
  return `
    <div style="background:#1e1e35;border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7c3aed;">Your Code</p>
      <div style="font-size:44px;font-weight:800;letter-spacing:12px;color:#fff;font-family:monospace;">${otp}</div>
    </div>`;
}

function emailWrapper(subtitle, body) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;background:#0f0f1a;color:#e5e5e5;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:32px 40px;text-align:center;">
        <h1 style="margin:0;font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.5px;">Doodle AI</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:14px;">${subtitle}</p>
      </div>
      <div style="padding:40px;">${body}</div>
      <div style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
        <p style="margin:0;font-size:12px;color:#4b5563;">© 2026 Doodle AI · If you didn't request this, ignore this email.</p>
      </div>
    </div>`;
}

export async function sendOtpEmail(email, otp, name) {
  const body = `
    <p style="margin:0 0 8px;font-size:16px;color:#d4d4d4;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 28px;font-size:15px;color:#9ca3af;line-height:1.6;">
      Use the code below to verify your email address and complete your account setup.
    </p>
    ${otpBlock(otp)}
    <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">
      Expires in <strong style="color:#9ca3af;">10 minutes</strong>. Do not share it.
    </p>`;

  await transporter.sendMail({
    from: `"Doodle AI" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Doodle AI Verification Code",
    html: emailWrapper("Email Verification", body),
  });
}

export async function sendPasswordResetEmail(email, otp) {
  const body = `
    <p style="margin:0 0 28px;font-size:15px;color:#9ca3af;line-height:1.6;">
      We received a request to reset your password. Use the code below to continue.
      If you didn't request this, you can safely ignore this email.
    </p>
    ${otpBlock(otp)}
    <p style="margin:0;font-size:13px;color:#6b7280;text-align:center;">
      Expires in <strong style="color:#9ca3af;">10 minutes</strong>. Do not share it.
    </p>`;

  await transporter.sendMail({
    from: `"Doodle AI" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Your Doodle AI Password",
    html: emailWrapper("Password Reset", body),
  });
}
