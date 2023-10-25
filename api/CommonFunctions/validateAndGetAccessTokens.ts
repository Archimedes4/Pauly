import { Context, HttpRequest } from '@azure/functions';
import { JwtHeader, SigningKeyCallback, verify } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';
import { config } from '../config';

type validationReturn = {
  onBehalfOfAccessToken: string;
  clientCredentialsAccessToken: string;
};

export default async function validateAndGetAccessTokens(
  context: Context,
  req: HttpRequest,
): Promise<validationReturn> {
  // On behalf of flow
  try {
    const token = await validateToken(req);
    const authPostData = `&grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&client_id=${config.auth.clientId}&client_secret=${config.auth.clientSecret}&assertion=${token}&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&requested_token_use=on_behalf_of`;
    const authResult = await fetch(
      `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        body: authPostData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    if (!authResult.ok) {
      context.res = {
        status: 401,
        body: 'Unauthorized: something went wrong validating token',
      };
      return;
    }
    const authResultData = await authResult.json();

    // Client Credentials
    const postData = `&grant_type=client_credentials&client_id=${config.auth.clientId}&client_secret=${config.auth.clientSecret}&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default`;
    const clientCredentialsResult = await fetch(
      `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
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
    context.res = {
      status: 401,
      body: 'Unauthorized: something went wrong validating token',
    };
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
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ').pop();

      const validationOptions = {
        audience: `${config.auth.clientId}`,
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
