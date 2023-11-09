import {
  Prompt,
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  useAuthRequest,
  useAutoDiscovery,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import { ScaledSize } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Login from '../src/login';
import AuthenticatedView from '../src/Components/AuthenticatedViewMain';
import { clientId, scopes, tenantId } from '../src/PaulyConfig';
import { authenticationRefreshTokenSlice } from '../src/Redux/reducers/authenticationRefreshTokenReducer';
import { authenticationTokenSlice } from '../src/Redux/reducers/authenticationTokenReducer';
import store, { RootState } from '../src/Redux/store';
import { validateGovernmentMode } from '../src/Functions/handleGovernmentLogin';
import getPaulyLists from '../src/Functions/ultility/getPaulyLists';
import getUserProfile from '../src/Functions/ultility/getUserProfile';

WebBrowser.maybeCompleteAuthSession();

export default function AppMain({
  dimensions,
}: {
  dimensions: { window: ScaledSize; screen: ScaledSize };
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const authenticationToken = useSelector(
    (state: RootState) => state.authenticationToken,
  );
  const dispatch = useDispatch();
  const authenticationCall = useSelector(
    (state: RootState) => state.authenticationCall,
  );

  const discovery = useAutoDiscovery(
    `https://login.microsoftonline.com/${tenantId}/v2.0`,
  );

  const redirectUri = makeRedirectUri({
    scheme: 'Pauly',
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

  async function getAuthToken() {
    if (discovery !== null) {
      setIsLoading(true);
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
          dispatch(
            authenticationRefreshTokenSlice.actions.setAuthenticationRefreshToken(
              exchangeRes.refreshToken,
            ),
          );
        }
        dispatch(
          authenticationTokenSlice.actions.setAuthenticationToken(
            exchangeRes.accessToken,
          ),
        );
        getPaulyLists();
        getUserProfile();
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  }

  async function getGovernmentAuthToken() {
    if (discovery !== null) {
      promptAsync().then(async res => {
        if (authRequest && res?.type === 'success' && discovery) {
          exchangeCodeAsync(
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
          ).then(res => {
            dispatch(
              authenticationTokenSlice.actions.setAuthenticationToken(
                res.accessToken,
              ),
            );
            getPaulyLists();
            getUserProfile();
            validateGovernmentMode();
          });
        }
      });
    }
  }

  async function refreshToken() {
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
        dispatch(
          authenticationTokenSlice.actions.setAuthenticationToken(
            result.accessToken,
          ),
        );
      } catch {
        dispatch(authenticationTokenSlice.actions.setAuthenticationToken(''));
      }
    } else {
      dispatch(authenticationTokenSlice.actions.setAuthenticationToken(''));
    }
  }

  useEffect(() => {
    refreshToken();
  }, [authenticationCall]);

  return (
    <>
      {authenticationToken !== '' ? (
        <AuthenticatedView
          dimensions={dimensions}
          width={dimensions.window.width}
        />
      ) : (
        <Login
          onGetAuthToken={() => {
            getAuthToken();
          }}
          onGetGovernmentAuthToken={() => {
            getGovernmentAuthToken();
          }}
          width={dimensions.window.width}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
