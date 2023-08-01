export default async function callMsGraph(accessToken: string, url: string, method?: "GET" | "POST" | "PATCH" | "DELETE", body?: string): Promise<Response> {
    console.log("This", url)
    const headers = new Headers();
    const bearer = `Bearer ${accessToken}`;

    headers.append("Authorization", bearer);
    headers.append("Content-Type", "application/json")

    console.log("This is data", body)

    const options = {
        method: (method) ? method:"GET",
        headers: headers,
        body: body
    };

    const response  = await fetch(url, options)
    return response
}