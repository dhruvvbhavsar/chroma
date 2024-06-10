export const GET = async (req: Request, res: Response) => {
  let urll = new URL(req.url);
  let authorizationCode = urll.searchParams.get("code") ?? "";
  console.log("Authorization code:", authorizationCode);
  const url = "https://api.amazon.com/auth/o2/token";
  const params = new URLSearchParams();

  params.append("grant_type", "authorization_code");
  params.append("code", authorizationCode);
  params.append(
    "client_id",
    "amzn1.application-oa2-client.70f2a6538920450ba8475f2c08c0c94e"
  );
  params.append(
    "client_secret",
    "amzn1.oa2-cs.v1.db01d31df54087310cd3f43e5571bd8601bb0001325de0ba23207acd3f9cafe4"
  );
  params.append("redirect_uri", "https://chroma-neon.vercel.app/");

  console.log(params.toString());

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: params.toString(),
  });

  if (response.ok) {
    const data = await response.json();
    try {
      await enableSkill(data.access_token, authorizationCode);
      return new Response("Skill enabled");
    } catch (error) {
      return new Response("Error enabling skill");
    }
  } else {
    console.error("Error getting access token:", await response.text());
    return new Response("Error getting access token");
  }
};

async function enableSkill(accessToken: string, userAuthCode: string) {
  console.log("Enabling skill");
  const skillId = "amzn1.ask.skill.d072586c-d77a-4759-bafe-a9b64d8dd4cc";
  const url = `https://api.amazonalexa.com/v1/users/~current/skills/${skillId}/enablement`;

  const body = JSON.stringify({
    stage: "development", // or "live"
    accountLinkRequest: {
      redirectUri: "https://chroma-neon.vercel.app/",
      authCode: userAuthCode,
      type: "AUTH_CODE",
    },
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: body,
  });

  console.log("Response:", await response.json());

  if (response.ok) {
    const data = await response.json();
    console.log(data);
  } else {
    console.error("Error enabling skill:", await response.text());
  }
}
