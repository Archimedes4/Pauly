import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { AccountInfo, IPublicClientApplication } from "@azure/msal-browser";

export default async function callMsGraph(accessToken: string, url: string, instance: IPublicClientApplication, accounts: AccountInfo[], method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT", perfer?: boolean, body?: string, secondAuth?: boolean): Promise<Response> {
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
    if (response.status === 401) {
        if (secondAuth === undefined){
            try{
                const tokenResponse = await instance.acquireTokenSilent({
                    ...loginRequest,
                    account: accounts[0],
                })
                const secondResult = await callMsGraph(tokenResponse.accessToken, url, instance, accounts, method, perfer, body, true)
                return secondResult
            } catch {
                instance.logoutPopup({
                    postLogoutRedirectUri: "/",
                    mainWindowRedirectUri: "/",
                });
                return response
            }
        } else {
            return response
        }
    } else {
        return response
    }
}