import { getRedisClient } from "../../lib/redis.js";
import { generateOTPCode } from "../../lib/generateCode.js";
import { sendMail } from "./sendMail.js";
import { otpTemplate } from "./templates/otp.template.js";

const OTP_PREFIX = "otp";
const DEFAULT_TTL_SECONDS = 10 * 60;

interface OtpRecord {
  code: string;
  createdAt: number;
}

function otpKey(userId: string) {
  return `${OTP_PREFIX}${userId}`;
}

export const createOtp = async (
  userId: string,
  ttleseconds = DEFAULT_TTL_SECONDS,
) => {
  const client = getRedisClient();
  const code = generateOTPCode();
  const record: OtpRecord = { code, createdAt: Date.now() };

  await client.set(otpKey(userId), JSON.stringify(record), { EX: ttleseconds });

  return code;
};

export const resendOtp = async (
  userId: string,
  ttleseconds = DEFAULT_TTL_SECONDS,
) => {
  const client = getRedisClient();
  const code = generateOTPCode();
  const record: OtpRecord = { code, createdAt: Date.now() };

  await client.del(otpKey(userId));

  await client.set(otpKey(userId), JSON.stringify(record), { EX: ttleseconds });

  return code;
};

export const verifyOtp = async (userId: string, submittedCode: string) => {
  const client = getRedisClient();
  const raw = await client.get(otpKey(userId));

  if (!raw) return { valid: false, reason: "expired_or_not_found" };

  const record: OtpRecord = JSON.parse(raw);
  if (record.code !== submittedCode)
    return { valid: false, reason: "mismatch" };

  await client.del(otpKey(userId));
  return { valid: true };
};

export const getOtpTtl = (userId: string) => {
  const client = getRedisClient();
  return client.ttl(otpKey(userId));
};

export const sendOtpEmail = (to: string, otp: string) => {
  return sendMail({
    to,
    subject: "Your Verication Code",
    html: otpTemplate(otp),
  });
};
