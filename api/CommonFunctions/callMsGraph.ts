export default async function callMsGraph(
  authenticationToken: string,
  url: string,
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT',
  body?: string,
): Promise<Response> {
  const headers = new Headers();
  const bearer = `Bearer ${authenticationToken}`;

  headers.append('Authorization', bearer);
  headers.append('Content-Type', 'application/json');

  const options = {
    method: method || 'GET',
    headers,
    body,
  };
  try {
    const response = await fetch(url, options);
    return response;
  } catch (e) {}
}