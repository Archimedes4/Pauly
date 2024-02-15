import AsyncStorage from '@react-native-async-storage/async-storage';
import { isGovernmentModeSlice } from '@redux/reducers/isGovernmentModeReducer';
import store from '@redux/store';
import callMsGraph from '@utils/ultility/microsoftAssets';

export async function validateGovernmentMode() {
  const userResult = await callMsGraph(
    'https://graph.microsoft.com/v1.0/me?$select=id',
  );
  if (userResult.ok) {
    const userData = await userResult.json();
    const teamsResult = await callMsGraph(
      `https://graph.microsoft.com/v1.0/groups/${process.env.EXPO_PUBLIC_ORGWIDEGROUPID}/owners?$filter=id%20eq%20'${userData.id}'`,
    );
    if (teamsResult.ok) {
      const teamsData = await teamsResult.json();
      if (teamsData.value.length === 1) {
        if (teamsData.value[0].id === userData.id) {
          try {
            await AsyncStorage.setItem(
              'paulyGovernmentMode',
              JSON.stringify(true),
            );
            store.dispatch(
              isGovernmentModeSlice.actions.setIsGovernmentMode(true),
            );
          } catch (e) {
            console.log(e)
            store.dispatch(
              isGovernmentModeSlice.actions.setIsGovernmentMode(false),
            );
          }
        } else {
          try {
            await AsyncStorage.setItem(
              'paulyGovernmentMode',
              JSON.stringify(false),
            );
            store.dispatch(
              isGovernmentModeSlice.actions.setIsGovernmentMode(false),
            );
          } catch (e) {
            store.dispatch(
              isGovernmentModeSlice.actions.setIsGovernmentMode(false),
            );
          }
        }
      } else {
        try {
          await AsyncStorage.setItem(
            'paulyGovernmentMode',
            JSON.stringify(false),
          );
          store.dispatch(
            isGovernmentModeSlice.actions.setIsGovernmentMode(false),
          );
        } catch (e) {
          store.dispatch(
            isGovernmentModeSlice.actions.setIsGovernmentMode(false),
          );
        }
      }
    } else if (teamsResult.status === 404) {
      store.dispatch(isGovernmentModeSlice.actions.setIsGovernmentMode(true));
    } else {
      try {
        await AsyncStorage.setItem(
          'paulyGovernmentMode',
          JSON.stringify(false),
        );
        store.dispatch(
          isGovernmentModeSlice.actions.setIsGovernmentMode(false),
        );
      } catch (e) {
        store.dispatch(
          isGovernmentModeSlice.actions.setIsGovernmentMode(false),
        );
      }
    }
  } else {
    try {
      await AsyncStorage.setItem('paulyGovernmentMode', JSON.stringify(false));
      store.dispatch(isGovernmentModeSlice.actions.setIsGovernmentMode(false));
    } catch (e) {
      store.dispatch(isGovernmentModeSlice.actions.setIsGovernmentMode(false));
    }
  }
}

export async function checkIfGovernmentMode() {
  try {
    const value = await AsyncStorage.getItem('paulyGovernmentMode');
    if (value !== null) {
      // value previously stored
      const governmentMode = JSON.parse(value);
      if (governmentMode) {
        store.dispatch(isGovernmentModeSlice.actions.setIsGovernmentMode(true));
      } else {
        store.dispatch(
          isGovernmentModeSlice.actions.setIsGovernmentMode(false),
        );
      }
    } else {
      store.dispatch(isGovernmentModeSlice.actions.setIsGovernmentMode(false));
    }
  } catch (e) {
    // error reading value
    store.dispatch(isGovernmentModeSlice.actions.setIsGovernmentMode(false));
  }
}

export async function setWantGovernment(value: boolean) {
  if (value) {
    try {
      await AsyncStorage.setItem(
        'paulyWantGovernmentMode',
        JSON.stringify(true),
      );
    } catch (e) {
      // TO DO deal with error
    }
  } else {
    try {
      await AsyncStorage.setItem(
        'paulyWantGovernmentMode',
        JSON.stringify(false),
      );
    } catch (e) {
      // TO DO deal with error
    }
  }
}

export async function getWantGovernment(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem('paulyWantGovernmentMode');
    if (value !== null) {
      const result = JSON.parse(value);
      if (result) {
        return true;
      }
      return false;
    }
    return false;
  } catch {
    return false;
    // TO DO deal with error
  }
}
