export default async function callMsGraph(accessToken: string, url: string, method?: "GET" | "POST" | "PATCH" | "DELETE", perfer?: boolean, body?: string): Promise<Response> {
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
    headers.append("Content-Type", "application/json")

    if (perfer){
        headers.append('Prefer','outlook.timezone="Central America Standard Time"')
    }

    const options = {
        method: (method) ? method:"GET",
        headers: headers,
        body: body
    };

    const response  = await fetch(url, options)
    return response
}