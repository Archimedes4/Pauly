import { Prompt, exchangeCodeAsync, makeRedirectUri, refreshAsync, useAuthRequest, useAutoDiscovery } from "expo-auth-session";
import { clientId, scopes, tenantId } from "../../PaulyConfig";
import store from "../../Redux/store";
import { authLoadingSlice } from "../../Redux/reducers/authLoadingReducer";
import { authenticationRefreshTokenSlice } from "../../Redux/reducers/authenticationRefreshTokenReducer";
import { authenticationTokenSlice } from "../../Redux/reducers/authenticationTokenReducer";
import getUserProfile from "../ultility/getUserProfile";
import getPaulyLists from "../ultility/getPaulyLists";
import { useCallback } from "react";

export async function login(government?: boolean) {
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

  if (discovery !== null) {
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

export const refresh = useCallback(async () => {
  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${tenantId}/v2.0`,
  );
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
      store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(''));
    }
  } else {
    store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(''));
  }
}, []);