/*
  Pauly
  Andrew Mainella
  1 December 2023
  authentication/index.native.ts
  authentication hook for native
*/
import {
  Prompt,
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  revokeAsync,
  useAuthRequest,
  useAutoDiscovery,
} from 'expo-auth-session';
import { useRootNavigationState, useRouter } from 'expo-router';
import { setWantGovernment } from '@src/Functions/handleGovernmentLogin';
import { clientId, scopes, tenantId } from '../../PaulyConfig';
import store from '../../Redux/store';
import { authLoadingSlice } from '../../Redux/reducers/authLoadingReducer';
import { authenticationRefreshTokenSlice } from '../../Redux/reducers/authenticationRefreshTokenReducer';
import { authenticationTokenSlice } from '../../Redux/reducers/authenticationTokenReducer';
import getUserProfile from '../../Functions/ultility/getPaulyLists';
import getPaulyLists from '../../Functions/ultility/getPaulyLists';

// placeholder function
export function useSilentLogin(): () => Promise<void> {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  async function main() {
    setInterval(() => {
      if (rootNavigationState?.key != null) {
        if (store.getState().authenticationToken === '') {
          // checking if auth token exists
          router.push('/sign-in');
          // Needed to finish function
        }
        // Needed to finish function
      }
    }, 1000);
  }
  return main;
}

export function useInvokeLogin(): (government?: boolean) => Promise<void> {
  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${tenantId}/v2.0`,
  );

  const redirectUri = makeRedirectUri({
    scheme: 'com.Archimedes4.Pauly',
    path: 'auth',
  });

  const [authRequest, , promptAsync] = useAuthRequest(
    {
      clientId,
      redirectUri,
      scopes,
      prompt: Prompt.SelectAccount,
    },
    discovery,
  );

  async function main(government?: boolean) {
    if (discovery !== null) {
      if (government !== undefined) {
        await setWantGovernment(government);
      }
      store.dispatch(authLoadingSlice.actions.setAuthLoading(true));
      const res = await promptAsync();
      if (authRequest && res?.type === 'success' && discovery) {
        const exchangeRes = await exchangeCodeAsync(
          {
            clientId,
            code: res.params.code,
            extraParams: authRequest.codeVerifier
              ? { code_verifier: authRequest.codeVerifier }
              : undefined,
            redirectUri,
            scopes,
          },
          discovery,
        );
        if (exchangeRes.refreshToken !== undefined) {
          store.dispatch(
            authenticationRefreshTokenSlice.actions.setAuthenticationRefreshToken(
              exchangeRes.refreshToken,
            ),
          );
        }
        store.dispatch(
          authenticationTokenSlice.actions.setAuthenticationToken(
            exchangeRes.accessToken,
          ),
        );
        getPaulyLists();
        getUserProfile();
        store.dispatch(authLoadingSlice.actions.setAuthLoading(false));
      } else {
        store.dispatch(authLoadingSlice.actions.setAuthLoading(false));
      }
    }
  }
  return main;
}

// Refresh block to take a refresh token and get a new access token.
export function refresh(): () => Promise<void> {
  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${tenantId}/v2.0`,
  );
  async function main() {
    if (discovery !== null) {
      try {
        const result = await refreshAsync(
          {
            refreshToken: store.getState().authenticationRefreshToken,
            clientId,
            scopes,
          },
          discovery,
        );
        store.dispatch(
          authenticationTokenSlice.actions.setAuthenticationToken(
            result.accessToken,
          ),
        );
      } catch {
        store.dispatch(
          authenticationTokenSlice.actions.setAuthenticationToken(''),
        );
      }
    } else {
      store.dispatch(
        authenticationTokenSlice.actions.setAuthenticationToken(''),
      );
    }
  }
  return main;
}

export function useSignOut(): () => void {
  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${tenantId}/v2.0`,
  );
  async function main() {
    if (discovery !== null) {
      revokeAsync({ token: store.getState().authenticationToken }, discovery);
      store.dispatch(
        authenticationTokenSlice.actions.setAuthenticationToken(''),
      );
    }
  }
  return main;
}
