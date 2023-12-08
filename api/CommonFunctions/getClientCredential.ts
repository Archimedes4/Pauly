export default async function getClientCredentiall(): Promise<string> {
  // Client Credentials
  const postData = `&grant_type=client_credentials&client_id=${process.env.CLIENTID}&client_secret=${process.env.CLIENTSECRET}&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default`;
  const clientCredentialsResult = await fetch(
    `https://login.microsoftonline.com/${process.env.TENANTID}/oauth2/v2.0/token`,
    {
      method: 'POST',
      body: postData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );
  if (clientCredentialsResult.ok) {
    const clientCredentialsResultData = await clientCredentialsResult.json();
    return clientCredentialsResultData.access_token;
  } else {
    return "";
  }
}