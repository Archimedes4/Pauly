/*
  Pauly
  Andrew Mainella
  21 November 2023
  authentiation/index.web.ts
  authentication component web, using msal library.
*/
import { authenticationTokenSlice } from '@redux/reducers/authenticationTokenReducer';
import store from '@redux/store';
import { setWantGovernment } from '@utils/handleGovernmentLogin';
import { useMsal } from '@azure/msal-react';
import { governmentScopes, scopes } from '@constants';
import { authActiveSlice } from '@redux/reducers/authActiveReducer';
import { InteractionStatus } from '@azure/msal-browser';

export const useRefresh = () => {
  const { instance } = useMsal();
  async function main() {
    if (instance.getActiveAccount() === null) {
      return;
    }
    const result = instance.acquireTokenSilent({
      scopes,
    });
    result.then(result => {
      store.dispatch(
        authenticationTokenSlice.actions.setAuthenticationToken(
          result.accessToken,
        ),
      );
    });
  }
  return main;
};

export function useSilentLogin(): () => Promise<void> {
  const { instance, inProgress } = useMsal();
  async function main() {
    if (store.getState().authActive) {
      return;
    }
    store.dispatch(authActiveSlice.actions.setAuthActive(true));
    // handle auth redired/do all initial setup for msal
    const redirectResult = await instance.handleRedirectPromise();
    if (
      redirectResult !== null &&
      inProgress === InteractionStatus.HandleRedirect &&
      redirectResult.account !== null
    ) {
      instance.setActiveAccount(redirectResult.account);
      store.dispatch(
        authenticationTokenSlice.actions.setAuthenticationToken(
          redirectResult.accessToken,
        ),
      );
      return;
    }
    // checking if an account exists
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      // getting the first account
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
      }
    }
    store.dispatch(authActiveSlice.actions.setAuthActive(false));
  }
  return main;
}

export function useInvokeLogin(): (government?: boolean) => Promise<void> {
  const { instance } = useMsal();
  // Invoking the login redirect does not handle the token
  async function loginFunction(government?: boolean) {
    if (government !== undefined) {
      await setWantGovernment(government);
    }
    store.dispatch(authActiveSlice.actions.setAuthActive(true));
    instance.loginRedirect({
      scopes: government === true ? governmentScopes : scopes,
      redirectUri: `${window.location.protocol}//${window.location.host}/`,
    });
  }

  return loginFunction;
}

export function useSignOut(): () => void {
  const { instance } = useMsal();
  async function main() {
    const account = instance.getActiveAccount();
    store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(''));
    instance.logoutPopup({
      account,
    });
  }
  return main;
}
