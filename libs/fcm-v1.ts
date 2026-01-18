import { JWT } from 'google-auth-library';

// Load service account credentials from environment variable or file
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  : undefined;

if (!serviceAccount) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON env variable not set');
}

const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

const jwtClient = new JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: SCOPES,
});

export async function getAccessToken() {
  const tokens = await jwtClient.authorize();
  return tokens.access_token;
}

export async function sendFcmV1Message({
  registrationTokens,
  title,
  body,
  projectId,
}: {
  registrationTokens: string[];
  title: string;
  body: string;
  projectId: string;
}) {
  const accessToken = await getAccessToken();
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  // Send to each token (FCM v1 does not support batch send in one call)
  const results = await Promise.all(
    registrationTokens.map(async (token) => {
      const payload = {
        message: {
          token,
          notification: {
            title,
            body,
          },
        },
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      return { token, ok: res.ok, status: res.status, text: await res.text() };
    })
  );
  return results;
}
