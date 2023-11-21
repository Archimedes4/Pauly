/*
  Pauly
  Andrew Mainella
  November 9 2023
  AppMain.web.tsx
  Holds authentication for web, using the native azure msal library
*/
import { SafeAreaView, ScaledSize } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EventType, PublicClientApplication } from '@azure/msal-browser';
import {
  AuthenticatedTemplate,
  MsalProvider,
  UnauthenticatedTemplate,
  useMsal,
} from '@azure/msal-react';
import Login from '../login';
import { clientId, scopes, tenantId } from '../../PaulyConfig';
import getPaulyLists from '../../Functions/ultility/getPaulyLists';
import getUserProfile from '../../Functions/ultility/getUserProfile';
import { authenticationTokenSlice } from '../../Redux/reducers/authenticationTokenReducer';
import {
  checkIfGovernmentMode,
  getWantGovernment,
  setWantGovernment,
  validateGovernmentMode,
} from '../../Functions/handleGovernmentLogin';
import { RootState } from '../../Redux/store';
import { Slot } from 'expo-router';

// This is for the microsoft authentication on web.
const pca = new PublicClientApplication({
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}/`,
  },
});

function AuthDeep({
  dimensions,
}: {
  dimensions: { window: ScaledSize; screen: ScaledSize };
}) {
  const { instance } = useMsal();
  const dispatch = useDispatch();
  const authenticationCall = useSelector(
    (state: RootState) => state.authenticationCall,
  );
  const [mounted, setMounted] = useState<boolean>(false);

  const getAuthToken = useCallback(
    async (userInitated: boolean, government?: boolean) => {
      // Account selection logic is app dependent. Adjust as needed for different use cases.
      // Set active acccount on page load
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
          dispatch(
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
              dispatch(
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
            dispatch(
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
    },
    [dispatch, instance],
  );

  useEffect(() => {
    getAuthToken(false);
  }, [getAuthToken]);

  const refreshToken = useCallback(async () => {
    if (mounted) {
      const result = await instance.acquireTokenSilent({
        scopes,
      });
      dispatch(
        authenticationTokenSlice.actions.setAuthenticationToken(
          result.accessToken,
        ),
      );
    } else {
      setMounted(false);
    }
  }, [dispatch, instance, mounted]);

  useEffect(() => {
    refreshToken();
  }, [authenticationCall, refreshToken]);

  return (
    <SafeAreaView
      style={{
        width: dimensions.window.width,
        height: dimensions.window.height,
        zIndex: 2,
        position: 'absolute',
        left: 0,
        top: 0,
      }}
    >
      <AuthenticatedTemplate>
        <Slot />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Login
          onGetAuthToken={() => {
            getAuthToken(true, false);
          }}
          onGetGovernmentAuthToken={() => {
            getAuthToken(true, true);
          }}
          width={dimensions.window.width}
          isLoading={false}
        />
      </UnauthenticatedTemplate>
    </SafeAreaView>
  );
}

export default function AppMain({
  dimensions,
}: {
  dimensions: { window: ScaledSize; screen: ScaledSize };
}) {
  return (
    <MsalProvider instance={pca}>
      <SafeAreaView
        style={{
          width: dimensions.window.width,
          height: dimensions.window.height,
          zIndex: 2,
          position: 'absolute',
          left: 0,
          top: 0,
        }}
      >
        <AuthDeep dimensions={dimensions} />
      </SafeAreaView>
    </MsalProvider>
  );
}
