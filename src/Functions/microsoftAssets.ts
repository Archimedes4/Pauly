import { authenticationCallSlice } from "../Redux/reducers/authenticationCallReducer";
import store from "../Redux/store";

// declare global {
//     type callMsGraphType = {
//         url: string
//         method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT"
//         perfer?: boolean
//         body?: string
//         secondAuth?: boolean
//         authenticationToken?: string
//     }
// }

export default async function callMsGraph(url: string, method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT", perfer?: boolean, body?: string, secondAuth?: boolean, authenticationToken?: string): Promise<Response> {
    const headers = new Headers();
    const bearer = `Bearer ${(authenticationToken !== undefined) ? authenticationToken:store.getState().authenticationToken}`

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

    //console.log("THis is result for", url, "Auth:", `Bearer ${(authenticationToken !== undefined) ? authenticationToken:store.getState().authenticationToken}`)

    const response  = await fetch(url, options)
    if (response.status === 401) {
        if (secondAuth === undefined){
            // var secondResultOut: Response | null = null
            // const getNewResult = async function () {
            //     if (previousValue !== store.getState().authenticationToken){
            //         const secondResult = await callMsGraph(url, method, perfer, body, secondAuth, authenticationToken)
            //         secondResultOut = secondResult
            //         return unsubscribe()
            //     }
            // }
            // const unsubscribe = store.subscribe(getNewResult)
            store.dispatch(authenticationCallSlice.actions.setAuthenticationCallIncrement())
            const previousValue: string = store.getState().authenticationToken
            return new Promise((resolve) => {
                const unsubscribe = store.subscribe(async () => {
                  const newValue = store.getState().authenticationToken;
                  if (newValue !== previousValue) {
                    const result = await callMsGraph(url, method, perfer, body, true, authenticationToken)
                    resolve(result)
                    unsubscribe(); // Unsubscribe after getting the new result
                  }
                });
            });
        } else {
            return response
        }
    } else {
        return response
    }
}