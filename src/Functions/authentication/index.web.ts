/*
  Pauly
  Andrew Mainella
  21 November 2023
  authentiation/index.web.ts
  authentication component web, using msal library.
*/
import { useMsal } from "@azure/msal-react";
import { useCallback, useEffect } from "react";
import { authenticationTokenSlice } from "../../Redux/reducers/authenticationTokenReducer";
import store from "../../Redux/store";
import { scopes } from "../../PaulyConfig";
import { checkIfGovernmentMode, getWantGovernment, setWantGovernment, validateGovernmentMode } from "../handleGovernmentLogin";
import getPaulyLists from "../ultility/getPaulyLists";
import getUserProfile from "../ultility/getUserProfile";
import { EventType } from "@azure/msal-browser";
import { useRouter } from "expo-router";
import { authenticationRefreshTokenSlice } from "../../Redux/reducers/authenticationRefreshTokenReducer";

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

function instanceFunction() {
  const { instance } = useMsal();
  return instance
}

export function useSilentLogin(): (() => Promise<void>) {
  const instance = instanceFunction()
  const route = useRouter();
  async function main() {
    // handle auth redired/do all initial setup for msal
    const redirectResult = await instance.handleRedirectPromise();
    if (redirectResult !== null) {
      instance.setActiveAccount(redirectResult.account);
      store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(redirectResult.accessToken))
      route.push('/');
    } else {
      console.log('silent login called')
      //checking if an account exists
      const accounts = instance.getAllAccounts();
      if (accounts.length > 0) {
        //getting the first account
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
          console.log('route called')
          route.push('/')
          getPaulyLists();
          getUserProfile();
          if (await getWantGovernment()) {
            checkIfGovernmentMode();
          }
          return;
        }
      }
    }
  }
  return main;
}

export function useInvokeLogin(): ((government?: boolean) => Promise<void>) {
  const instance = instanceFunction()
  //Invoking the login redirect does not handle the token
  async function loginFunction(government?: boolean) {
    if (government !== undefined) {
      setWantGovernment(government);
    }
    instance.loginRedirect({scopes});
  }

  return loginFunction;
}