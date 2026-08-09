export function resetPasswordTemplate(resetLink: string, minutesValid = 15) {
  return `
  <div style="font-family:Arial,sans-serif; max-width:500px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px;">
    <h2 style="color:#333;">Reset Your Password</h2>
    <p style="font-size:16px; color:#555;">Click the button below to reset your password. This link expires in ${minutesValid} minutes.</p>
    <a href="${resetLink}"
       style="display:inline-block; background:#e63946; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; margin-top:10px;">
      Reset Password
    </a>
    <p style="font-size:13px; color:#999; margin-top:20px;">If you didn't request this, ignore this email — your password will stay the same.</p>
  </div>
  `;
}
