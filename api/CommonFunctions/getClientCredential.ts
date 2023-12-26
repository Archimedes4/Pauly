
// CLIENTID = "08624b03-1aa6-40c4-8fb3-149c39026dff"
// CLIENTSECRET = "6XM8Q~ae.~umHxbazF8Jtx.trbGJWp1jSl7R5bWc"
// TENANTID = "551df04d-543a-4d61-955e-e4294c4cf950"
export default async function getClientCredentiall(): Promise<string> {
  // Client Credentials
  const postData = `&grant_type=client_credentials&client_id=${"08624b03-1aa6-40c4-8fb3-149c39026dff"}&client_secret=${"6XM8Q~ae.~umHxbazF8Jtx.trbGJWp1jSl7R5bWc"}&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default`;
  const clientCredentialsResult = await fetch(
    `https://login.microsoftonline.com/${"551df04d-543a-4d61-955e-e4294c4cf950"}/oauth2/v2.0/token`,
    {
      method: 'POST',
      body: postData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  )
  if (clientCredentialsResult.ok) {
    const clientCredentialsResultData = await clientCredentialsResult.json();
    return clientCredentialsResultData.access_token;
  } else {
    return "";
  }
}