import { HttpRequest } from '@azure/functions';
import { JwtHeader, SigningKeyCallback, verify } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

type validationReturn = {
  onBehalfOfAccessToken: string;
  clientCredentialsAccessToken: string;
};

export default async function validateAndGetAccessTokens(
  req: HttpRequest,
): Promise<validationReturn | undefined> {
  // On behalf of flow
  try {
    const token = await validateToken(req);
    const authPostData = `&grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&client_id=${process.env.CLIENTID}&client_secret=${process.env.CLIENTSECRET}&assertion=${token}&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&requested_token_use=on_behalf_of`;
    const authResult = await fetch(
      `https://login.microsoftonline.com/${process.env.TENANTID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        body: authPostData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    if (!authResult.ok) {
      return;
    }
    const authResultData = await authResult.json();

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
    const clientCredentialsResultData = await clientCredentialsResult.json();
    return {
      onBehalfOfAccessToken: authResultData.access_token,
      clientCredentialsAccessToken: clientCredentialsResultData.access_token,
    };
  } catch {
    return
  }
}

// Validation
// https://github.com/estruyf/azure-samples/blob/main/msal-obo-azurefunctions/profile-get/index.ts
/**
 * Retrieve the signing key
 * @param header
 * @returns
 */
const getSigningKeys = (header: JwtHeader, callback: SigningKeyCallback) => {
  const client = new JwksClient({
    jwksUri: 'https://login.microsoftonline.com/common/discovery/keys',
  });

  client.getSigningKey(header.kid, function (err, key: any) {
    callback(null, key.publicKey || key.rsaPublicKey);
  });
};

/**
 * Validate the JWT Token
 * @param req
 */
const validateToken = (req: HttpRequest): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.split(' ').pop();

      const validationOptions = {
        audience: `${process.env.CLIENTSECRET}`,
      };

      verify(token, getSigningKeys, validationOptions, (err, payload) => {
        if (err) {
          reject(403);
          return;
        }

        resolve(token);
      });
    } else {
      reject(401);
    }
  });
};