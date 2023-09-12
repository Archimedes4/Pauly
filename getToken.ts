import { clientId, tenantId } from "./src/PaulyConfig";

export const getToken = async (code: string, redirectUrl: string, scope: string[], codeVerifier?: string) => {
  /* parse/gather correct key values for the POST request to the token endpoint */
  /* Client secret is omitted here; including it yields an error */
  var requestParams = {
    client_id: clientId,
    scope: scope,
    code: code,
    redirect_uri: redirectUrl,
    grant_type: 'authorization_code'
  }
  if (codeVerifier !== undefined){
    requestParams["code_verifier"] = codeVerifier
  }

  /* loop through object and encode each item as URI component before storing in array */
  /* then join each element on & */
  /* request is x-www-form-urlencoded as per docs: https://docs.microsoft.com/en-us/graph/use-the-api */
  var formBody = [];
  for (var p in requestParams) {
    var encodedKey = encodeURIComponent(p);
    var encodedValue = encodeURIComponent(requestParams[p]);
    formBody.push(encodedKey + '=' + encodedValue);
    }
  const formBodyString = formBody.join('&');

  /* make a POST request using fetch and the body params we just setup */
  await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: formBodyString,
  })
  .then((response) => response.json())
  .then((response) => {
    console.log(response)
  })
  .catch((error) => {
    console.error(error);
  });
};