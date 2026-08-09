export function otpTemplate(otp: string, minutesValid = 10) {
  return `
  <div style="font-family:Arial,sans-serif; max-width: 100vwh; margin:auto; padding:20px; background-color: #F12321; border:1px solid #eee; border-radius:8px;">
    <h2 style="color:#ffffff;">Your Verification Code</h2>
    <p style="font-size:16px; color: #f9f9f9;">Use the code below to verify your account. It expires in ${minutesValid} minutes.</p>
    <div style="font-size:32px; font-weight:bold; letter-spacing:6px; background: #f9f9f9; padding:15px; text-align:center; border-radius:6px; margin:20px 0;">
      ${otp}
    </div>
    <p style="font-size:13px; color:#f9f9f9;">If you didn't request this, you can safely ignore this email.</p>
  </div>
  `;
}
