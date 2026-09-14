// Thin wrapper around 2Factor.in's SMS OTP API. 2Factor generates and holds
// the actual OTP on their side (AUTOGEN2) — we only ever see a session id —
// and later checks a submitted code against it (VERIFY). This keeps the OTP
// itself off our server and logs entirely.
//
// Every 2Factor response is a flat { Status: "Success" | "Error", Details: string }
// envelope — on success, Details holds the payload (session id, "OTP Matched");
// on error, it holds a human-readable reason.

const BASE_URL = 'https://2factor.in/API/V1';

type TwoFactorResponse = {
  Status: 'Success' | 'Error';
  Details: string;
};

function requireApiKey(): string {
  const key = process.env.TWO_FACTOR_API_KEY;
  if (!key) {
    throw new Error('TWO_FACTOR_API_KEY is not set (see .env.example)');
  }
  return key;
}

function requireTemplateName(): string {
  const template = process.env.TWO_FACTOR_OTP_TEMPLATE;
  if (!template) {
    throw new Error('TWO_FACTOR_OTP_TEMPLATE is not set (see .env.example)');
  }
  return template;
}

// 2Factor wants the number as countrycode+number with no leading "+" (e.g.
// "919876543210"), not the "+919876543210" E.164 form we store everywhere
// else — strip it here rather than anywhere callers have to remember.
function toTwoFactorPhone(e164Phone: string): string {
  return e164Phone.replace(/^\+/, '');
}

async function callTwoFactor(path: string): Promise<TwoFactorResponse> {
  const res = await fetch(`${BASE_URL}/${path}`);
  const data = (await res.json()) as TwoFactorResponse;
  return data;
}

// Sends the OTP SMS using the DLT-approved template and returns the session
// id needed to verify it later. Throws with 2Factor's own reason on failure
// (bad API key, template mismatch, invalid number, etc.).
export async function sendOtpViaTwoFactor(e164Phone: string): Promise<string> {
  const apiKey = requireApiKey();
  const template = requireTemplateName();
  const phone = toTwoFactorPhone(e164Phone);

  const data = await callTwoFactor(
    `${apiKey}/SMS/${phone}/AUTOGEN2/${encodeURIComponent(template)}`,
  );

  if (data.Status !== 'Success') {
    throw new Error(data.Details || 'Could not send OTP');
  }
  return data.Details; // session id
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Checks the code the user typed against the session 2Factor is holding.
// Returns false for a wrong/expired code rather than throwing, since that's
// an expected outcome here, not a failure to talk to 2Factor.
//
// 2Factor's VERIFY endpoint has a brief propagation lag right after AUTOGEN2
// issues the OTP — a session/OTP pair that's genuinely correct can still come
// back "OTP Mismatch" for the first second or so (confirmed by hand: the same
// call fails immediately after send, then succeeds moments later with no
// other change). A real user takes long enough reading the SMS and typing it
// in that this never shows up for them, but retry a couple of times with a
// short backoff anyway rather than leave a narrow window where a correctly
// typed OTP could get rejected.
export async function verifyOtpViaTwoFactor(
  sessionId: string,
  otp: string,
): Promise<boolean> {
  const apiKey = requireApiKey();
  const attempts = [0, 700, 1500];

  for (let i = 0; i < attempts.length; i++) {
    if (attempts[i] > 0) {
      await delay(attempts[i]);
    }
    const data = await callTwoFactor(`${apiKey}/SMS/VERIFY/${sessionId}/${otp}`);
    if (data.Status === 'Success') {
      return true;
    }
  }
  return false;
}
