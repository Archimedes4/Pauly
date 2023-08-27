import { clientId, tenantId } from "../../PaulyConfig"
import store from "../../Redux/store"
export default async function testApi() {
    const body = {
        authToken: store.getState().authenticationToken
    }
    fetch("https://login.microsoftonline.com/" + tenantId + "/oauth2/v2.0/authorize?client_id=" + clientId + "&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A19006&response_mode=query&scope=api://6f1e349a-7320-4452-9f32-7e6633fe465b/Functions&state=12345")
    
    console.log('{"name":"Azure", "authToken": "' + store.getState().authenticationToken + '"}')
}