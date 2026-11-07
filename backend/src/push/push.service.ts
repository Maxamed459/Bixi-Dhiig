type PushMessage = {
  userIds: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
};

export const sendPushNotifications = async ({ userIds, title, body, data }: PushMessage) => {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_API_KEY;
  if (!appId || !apiKey || userIds.length === 0) return;

  await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      app_id: appId,
      target_channel: "push",
      include_aliases: { external_id: userIds },
      headings: { en: title },
      contents: { en: body },
      data,
    }),
  });
};
