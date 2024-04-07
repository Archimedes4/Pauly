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

export function useSilentLogin(): () => Promise<void> {
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
    console.log("REsult:", result)
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
}

export function useInvokeLogin(): (government?: boolean) => Promise<void> {
  const { acquireTokenInteractively } = useMSAL({
    clientId: process.env.EXPO_PUBLIC_CLIENTID ?? '',
    authority: `https://login.microsoftonline.com/${process.env.EXPO_PUBLIC_TENANTID ?? ''}`,
    scopes: governmentScopes,
    redirectUri: Platform.select({
      ios: 'msauth.Archimedes4.Pauly://auth',
      android: 'msauth://expo.modules.msal.example',
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
    console.log("Inter REsult:", result)
    // On web the result is always undefined
    if (result !== undefined && result.result !== ResultState.error) {
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
    await signOut();
    store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(''));
  };
  return main;
}
