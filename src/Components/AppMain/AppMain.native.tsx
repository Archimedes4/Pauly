/*
  Pauly
  Andrew Mainella
  November 9 2023
  AppMain.web.tsx
  Holds authentication for ios, using expo-auth-session
*/
import {
  Prompt,
  exchangeCodeAsync,
  makeRedirectUri,
  refreshAsync,
  useAuthRequest,
  useAutoDiscovery,
} from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
import { ScaledSize } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Login from '../login';
import { clientId, scopes, tenantId } from '../../PaulyConfig';
import { authenticationRefreshTokenSlice } from '../../Redux/reducers/authenticationRefreshTokenReducer';
import { authenticationTokenSlice } from '../../Redux/reducers/authenticationTokenReducer';
import store, { RootState } from '../../Redux/store';
import { validateGovernmentMode } from '../../Functions/handleGovernmentLogin';
import getPaulyLists from '../../Functions/ultility/getPaulyLists';
import getUserProfile from '../../Functions/ultility/getUserProfile';
import { Slot } from 'expo-router';

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

  async function getAuthToken() {
    if (discovery !== null) {
      setIsLoading(true);
      console.log(redirectUri);
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

  const refreshToken = useCallback(async () => {
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
  }, [discovery, dispatch]);

  useEffect(() => {
    refreshToken();
  }, [authenticationCall, refreshToken]);

  if (authenticationToken !== '') {
    return (
      <Slot/>
    );
  }

  return (
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
  );
}
