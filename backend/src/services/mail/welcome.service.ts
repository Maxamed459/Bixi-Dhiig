import { sendMail } from "./sendMail.js";
import { welcomeTemplate } from "./templates/welcome.template.js";

export const sendWelcomeEmail = (to: string, display_name: string) => {
  return sendMail({
    to,
    subject: `Welcome to bixi-shiig ${display_name}`,
    html: welcomeTemplate(display_name),
  });
};
