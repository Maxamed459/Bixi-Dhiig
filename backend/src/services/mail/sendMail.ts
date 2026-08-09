import { gmail, encodeMessage } from "../../lib/Email.js";
import { SENDER_EMAIL } from "../../config/dotenv.js";

interface sendMailOptions {
  to: string;
  subject: string;
  html: string;
}

const createMimeMessage = ({ to, subject, html }: sendMailOptions): string => {
  const messageParts = [
    `From: "bixi-dhiig" <${SENDER_EMAIL}>`,
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    html,
  ];

  return messageParts.join("\r\n");
};

export const sendMail = async (options: sendMailOptions) => {
  const raw = encodeMessage(createMimeMessage(options));

  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });

  return res.data;
};
