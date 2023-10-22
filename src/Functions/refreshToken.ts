import * as AuthSession from 'expo-auth-session';
import { clientId } from '../PaulyConfig';

export default async function refreshToken() {
  const tokenResult = await AuthSession.refreshAsync(
    {
      clientId,
      refreshToken: '<your-refresh-token>',
    },
    {
      tokenEndpoint: 'www.googleapis.com/oauth2/v4/token',
    },
  );
}
