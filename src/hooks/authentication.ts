/*
  Pauly
  Andrew Mainella
  21 November 2023
  authentiation/index.web.ts
  authentication component web, using msal library.
*/
import { authenticationTokenSlice } from '@redux/reducers/authenticationTokenReducer';
import { setWantGovernment } from '@utils/handleGovernmentLogin';
import { governmentScopes } from '@constants';
import { authActiveSlice } from '@redux/reducers/authActiveReducer';
import { ResultState, useMSAL } from '@archimedes4/expo-msal';
import { Platform } from 'react-native';
import store from '@redux/store';
import getAuthWebRedirectUrl from '@utils/getAuthWebRedirectUrl';
import { reloadAllTimelines, reloadTimelines } from 'react-native-widgetkit';

/**
 * A hook that aquires the token silently without government checks.
 * @returns A function to initate the request.
 */
export const useRefresh = () => {
  const { acquireTokenSilently } = useMSAL({
    clientId: process.env.EXPO_PUBLIC_CLIENTID ?? '',
    authority: `https://login.microsoftonline.com/${process.env.EXPO_PUBLIC_TENANTID ?? ''}`,
    scopes: governmentScopes,
    redirectUri: Platform.select({
      ios: 'msauth.Archimedes4.Pauly://auth',
      android: 'msauth://expo.modules.msal.example',
      default: '',
    }),
  });
  const main = async () => {
    const result = await acquireTokenSilently();
    if (result !== undefined && result.result !== ResultState.error) {
      store.dispatch(
        authenticationTokenSlice.actions.setAuthenticationToken(result.data),
      );
    } else {
      store.dispatch(
        authenticationTokenSlice.actions.setAuthenticationToken(''),
      );
    }
  };
  return main;
};

/**
 * A hook for a silent login (non- user initiated)
 * @returns A function that make a silent login request
 */
export function useSilentLogin(): (inital: boolean) => Promise<void> {
  const { acquireTokenSilently } = useMSAL({
    clientId: process.env.EXPO_PUBLIC_CLIENTID ?? '',
    authority: `https://login.microsoftonline.com/${process.env.EXPO_PUBLIC_TENANTID ?? ''}`,
    scopes: governmentScopes,
    redirectUri: Platform.select({
      ios: 'msauth.Archimedes4.Pauly://auth',
      android: 'msauth://expo.modules.msal.example',
      default: '',
    }),
  });
  const main = async (inital: boolean) => {
    const result = await acquireTokenSilently();
    if (result !== undefined && result.result !== ResultState.error) {
      reloadTimelines("Archimedes4.Pauly.Pauly-Widget")
      store.dispatch(
        authenticationTokenSlice.actions.setAuthenticationToken(result.data),
      );
    } else if (!inital) {
      store.dispatch(
        authenticationTokenSlice.actions.setAuthenticationToken(''),
      );
    }
  };
  return main;
}

/**
 * A hook for a inoked (user interaction) login.
 * @param redirectUrl Redirect Url
 * @returns A function that is for invoking the login.
 */
export function useInvokeLogin(redirectUrl?: string): (government?: boolean) => Promise<void> {
  const { acquireTokenInteractively } = useMSAL({
    clientId: process.env.EXPO_PUBLIC_CLIENTID ?? '',
    authority: `https://login.microsoftonline.com/${process.env.EXPO_PUBLIC_TENANTID ?? ''}`,
    scopes: governmentScopes,
    redirectUri: Platform.select({
      ios: 'msauth.Archimedes4.Pauly://auth',
      android: 'msauth://expo.modules.msal.example',
      web: getAuthWebRedirectUrl(redirectUrl),
      default: '',
    }),
  });
  const main = async (government?: boolean) => {
    if (store.getState().authActive) {
      return;
    }
    if (government) {
      setWantGovernment(government);
    } else {
      setWantGovernment(false);
    }
    store.dispatch(authActiveSlice.actions.setAuthActive(true));
    const result = await acquireTokenInteractively();
    // On web the result is always undefined
    if (result !== undefined && result.result !== ResultState.error) {
      console.log("RE RUN", result)
      reloadTimelines("Archimedes4.Pauly.Pauly-Widget")
      console.log("mark")
      store.dispatch(
        authenticationTokenSlice.actions.setAuthenticationToken(result.data),
      );
    } else {
      store.dispatch(
        authenticationTokenSlice.actions.setAuthenticationToken(''),
      );
    }
    store.dispatch(authActiveSlice.actions.setAuthActive(false));
  };
  return main;
}

/**
 * A hook that signs the user out updates the widget and removes the accesstoken
 * @returns A function that initates the signout process.
 */
export function useSignOut(): () => void {
  const { signOut } = useMSAL({
    clientId: process.env.EXPO_PUBLIC_CLIENTID ?? '',
    authority: `https://login.microsoftonline.com/${process.env.EXPO_PUBLIC_TENANTID ?? ''}`,
    scopes: governmentScopes,
    redirectUri: Platform.select({
      ios: 'msauth.expo.modules.msal.example://auth',
      android: 'msauth://expo.modules.msal.example',
      default: '',
    }),
  });
  const main = async () => {
    reloadTimelines("Archimedes4.Pauly.Pauly-Widget")
    await signOut();
    store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(''));
  };
  return main;
}
