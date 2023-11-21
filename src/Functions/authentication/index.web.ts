import { useMsal } from "@azure/msal-react";
import { useCallback, useEffect } from "react";
import { authenticationTokenSlice } from "../../Redux/reducers/authenticationTokenReducer";
import store from "../../Redux/store";
import { scopes } from "../../PaulyConfig";
import { checkIfGovernmentMode, getWantGovernment, setWantGovernment, validateGovernmentMode } from "../handleGovernmentLogin";
import getPaulyLists from "../ultility/getPaulyLists";
import getUserProfile from "../ultility/getUserProfile";
import { EventType } from "@azure/msal-browser";

export const refreshToken = () => {
  const { instance } = useMsal();
  const result = instance.acquireTokenSilent({
    scopes,
  });
  result.then((result) => {
    store.dispatch(
      authenticationTokenSlice.actions.setAuthenticationToken(
        result.accessToken,
      ),
    );
  })
}

export const login = (userInitated: boolean, government?: boolean) => {
  const { instance } = useMsal();
  // Account selection logic is app dependent. Adjust as needed for different use cases.
  // Set active acccount on page load
  async function webAuth() {
    if (government !== undefined) {
      setWantGovernment(government);
    }
  
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      instance.setActiveAccount(accounts[0]);
      const accountResult = await instance.getActiveAccount();
      if (accountResult !== null) {
        const result = await instance.acquireTokenSilent({
          scopes,
        });
        store.dispatch(
          authenticationTokenSlice.actions.setAuthenticationToken(
            result.accessToken,
          ),
        );
        getPaulyLists();
        getUserProfile();
        if (await getWantGovernment()) {
          checkIfGovernmentMode();
        }
        return;
      }
    }
  
    instance.addEventCallback((event: any) => {
      // set active account after redirect
      if (
        event.eventType === EventType.LOGIN_SUCCESS &&
        event.payload.account
      ) {
        const { account } = event.payload;
        instance.setActiveAccount(account);
      } else {
        console.log('failed On line 89');
      }
    });
  
    // handle auth redired/do all initial setup for msal
    instance
      .handleRedirectPromise()
      .then(async authResult => {
        // Check if user signed in
        const account = instance.getActiveAccount();
        if (!account && userInitated) {
          // redirect anonymous user to login page
          instance.loginRedirect({
            scopes,
          });
        } else if (account) {
          if (authResult !== undefined && authResult !== null) {
            store.dispatch(
              authenticationTokenSlice.actions.setAuthenticationToken(
                authResult.accessToken,
              ),
            );
            if (await getWantGovernment()) {
              validateGovernmentMode();
            }
            getPaulyLists();
            getUserProfile();
          }
        }
      })
      .catch(async err => {
        // TODO: Handle errors
        try {
          const result = await instance.acquireTokenSilent({
            scopes,
          });
          store.dispatch(
            authenticationTokenSlice.actions.setAuthenticationToken(
              result.accessToken,
            ),
          );
          if (await getWantGovernment()) {
            validateGovernmentMode();
          }
          getPaulyLists();
          getUserProfile();
        } catch (e) {}
      });
  }

  useEffect(() => {
    webAuth();
  }, [])
}