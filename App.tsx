/**
 * Pauly React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  Dimensions,
  Text,
  Pressable,
  View,
  ScaledSize
} from 'react-native';
import { Provider } from 'react-redux'
import { NativeRouter, Route, Routes } from 'react-router-native';
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from "expo-auth-session"
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

//Views
import HomePage from './src/AuthenticatedView/HomePage';
import Commissions from './src/AuthenticatedView/Commissions/Commissions';
import Notifications from './src/AuthenticatedView/Notifications';
import Resources from './src/AuthenticatedView/Resources';
import Settings from './src/AuthenticatedView/Profile/Settings';
import Profile from './src/AuthenticatedView/Profile/Profile';
import Government from './src/AuthenticatedView/Profile/Government/Government';
import MicrosoftGraphOverview from './src/AuthenticatedView/Profile/Government/MicrosoftGraphLists/MicrosoftGraphOverview';
import MicrosoftGraphCreateList from './src/AuthenticatedView/Profile/Government/MicrosoftGraphLists/MicrosoftGraphCreateList';
import GovernmentCommissions from './src/AuthenticatedView/Profile/Government/GovernmentCommissions/GovernmentCommissions';
import CreateNewCommission from './src/AuthenticatedView/Profile/Government/GovernmentCommissions/CreateNewCommission';
import Sports from './src/AuthenticatedView/Sports/Sports.web';
import Calendar from './src/AuthenticatedView/Calendar/Calendar';
import GovernmentSports from './src/AuthenticatedView/Profile/Government/GovernmentSports/GovernmentSports';
import GovernmentCreateNewSport from './src/AuthenticatedView/Profile/Government/GovernmentSports/GovernmentCreateNewSport';
import GovernmentCreateNewTeam from './src/AuthenticatedView/Profile/Government/GovernmentSports/GovernmentCreateNewTeam';
import GovernmentSportsTeams from './src/AuthenticatedView/Profile/Government/GovernmentSports/GovernmentSportsTeams';
import GovernmentSportTeamEdit from './src/AuthenticatedView/Profile/Government/GovernmentSports/GovernmentSportTeamEdit';
import GovernmentSportsTeamAddPost from './src/AuthenticatedView/Profile/Government/GovernmentSports/GovernmentSportsTeamAddPost';
import MicrosoftGraphEditList from './src/AuthenticatedView/Profile/Government/MicrosoftGraphLists/MicrosoftGraphEditList';
import GovernmentReviewFileSubmission from './src/AuthenticatedView/Profile/Government/GovernmentSports/GovernmentReviewFileSubmissions/GovernmentReviewFileSubmission';
import GovernmentCalendar from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentCalendar';
import GovernmentSchedual from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentSchedule/GovernmentSchedule';
import GovernmentTimetable from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentTimetable/GovernmentTimetable';
import GovernmentScheduleCreate from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentSchedule/GovernmentScheduleCreate';
import GovernmentScheduleEdit from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentSchedule/GovernmentScheduleEdit';
import GovernmentClasses from './src/AuthenticatedView/Profile/Government/GovernmentClasses/GovernmentClasses';
import GovernmentClassesCreateRoot from './src/AuthenticatedView/Profile/Government/GovernmentClasses/GovernmentClassesCreateRoot';
import GovernmentClassesCreate from './src/AuthenticatedView/Profile/Government/GovernmentClasses/GovernmentClassesCreate';
import CommissionsView from './src/AuthenticatedView/Commissions/CommissionsView';
import GovernmentHomePage from './src/AuthenticatedView/Profile/Government/GovernmentHomePage';
import callMsGraph from './src/Functions/microsoftAssets';
import NavBarComponent from './src/UI/NavComponent';
import GovernmentTimetableCreate from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentTimetable/GovernmentTimetableCreate';
import Testing from './src/AuthenticatedView/Profile/Government/Testing';
import store from './src/Redux/store';
import PageNotFound from './src/AuthenticatedView/404Page';
import GovernmentAdmin from './src/AuthenticatedView/Profile/Government/GovernmentAdminCenter/GovernmentAdmin';
import getPaulyLists from './src/Functions/getPaulyLists';
import GovernmentTimetableEdit from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentTimetable/GovernmentTimetableEdit';
import MicrosoftGraphEditGroup from './src/AuthenticatedView/Profile/Government/MicrosoftGraphLists/MicrosoftGraphEditGroup';

import { clientId, tenantId } from './src/PaulyConfig';
import { loadingStateEnum } from './src/types';

interface contextInterface {
  uri: string;
  displayName: string;
  dimensions: {window: ScaledSize, screen: ScaledSize};
  currentBreakPointMode: breakPointMode,
}

//From https://getbootstrap.com/docs/5.0/layout/breakpoints/
enum breakPointMode {
  xSmall,	//<576px
  small, //≥576px
  medium, //≥768px
  large, //≥992px
  xLarge //≥1200px
}

export const accessTokenContent = React.createContext<contextInterface>({uri: "", displayName: "", dimensions: {window: {width: 0, height: 0, fontScale: 0, scale: 0}, screen: {width: 0, height: 0, fontScale: 0, scale: 0}}, currentBreakPointMode: breakPointMode.xSmall});

function AuthenticatedView({dimensions, width, expandedMode, setExpandedMode}:{dimensions: {
  window: ScaledSize,
  screen: ScaledSize
}, width: number, currentBreakPointMode: breakPointMode, expandedMode: boolean, setExpandedMode: (item: boolean) => void}) {
  return (
    <View style={{width: width}}>
        <NativeRouter>
          <View style={{flexDirection: "row", overflow: "hidden", width: width}}>
              { (width >= 576) ?
                  <NavBarComponent width={width * 0.1} height={dimensions.window.height} expandedMode={expandedMode} onSetExpandedMode={setExpandedMode} />:null
              }
              <View style={{width: dimensions.window.width}}>
                <Routes>
                  <Route path="/" element={<HomePage/>}/>
                  <Route path="/sports" element={<Sports/>}/>
                  <Route path="/notifications" element={<Notifications/>}/>
                  <Route path="/calendar" element={<Calendar governmentMode={false} />}/>
                  <Route path="/resources" element={<Resources/>}/>
                  <Route path="/commissions" element={<Commissions/>}/>
                  <Route path="/commissions/:id" element={<CommissionsView/>}/>
                  <Route path="/profile/" element={<Profile/>}/>
                  <Route path="/profile/settings" element={<Settings/>}/>
                  <Route path="/profile/government" element={<Government />}/>
                  <Route path="/profile/government/admin" element={<GovernmentAdmin />} />
                  <Route path="/profile/government/graph" element={<MicrosoftGraphOverview/>}/>
                  <Route path="/profile/government/graph/list/create" element={<MicrosoftGraphCreateList/>}/>
                  <Route path="/profile/government/graph/list/edit/:listId" element={<MicrosoftGraphEditList />} />
                  <Route path="/profile/government/graph/group/edit/:groupId" element={<MicrosoftGraphEditGroup />} />
                  <Route path="/profile/government/commissions" element={<GovernmentCommissions/>}/>
                  <Route path="/profile/government/commissions/create" element={<CreateNewCommission/>}/>
                  <Route path="/profile/government/homepage" element={<GovernmentHomePage />} />
                  <Route path="/profile/government/classes" element={<GovernmentClasses />} />
                  <Route path="/profile/government/classes/main/create" element={<GovernmentClassesCreate />} />
                  <Route path="/profile/government/classes/root/create" element={<GovernmentClassesCreateRoot />} />
                  <Route path="/profile/government/calendar" element={<GovernmentCalendar />} />
                  <Route path="/profile/government/calendar/schedule" element={<GovernmentSchedual />} />
                  <Route path="/profile/government/calendar/schedule/create" element={<GovernmentScheduleCreate />} />
                  <Route path="/profile/government/calendar/schedule/edit/:scheduleId" element={<GovernmentScheduleEdit />} />
                  <Route path="/profile/government/calendar/timetable" element={<GovernmentTimetable />} />
                  <Route path="/profile/government/calendar/timetable/edit/:timetableId" element={<GovernmentTimetableEdit/>} />
                  <Route path="/profile/government/calendar/timetable/create" element={<GovernmentTimetableCreate />} />
                  <Route path="/profile/government/sports" element={<GovernmentSports/>}/>
                  <Route path="/profile/government/sports/create" element={<GovernmentCreateNewSport/>}/>
                  <Route path="/profile/government/sports/team/:sport/:id" element={<GovernmentSportsTeams/>}/>
                  <Route path="/profile/government/sports/team/:sport/:id/create/" element={<GovernmentCreateNewTeam/>}/>
                  <Route path="/profile/government/sports/team/edit/:sport/:id/:team/:teamId/:season" element={<GovernmentSportTeamEdit />} />
                  <Route path="/profile/government/sports/post/:sport/:id/:team/:teamId/:season" element={<GovernmentSportsTeamAddPost />} />
                  <Route path="/profile/government/sports/post/review/:submissionID" element={<GovernmentReviewFileSubmission />} />
                  <Route path="*" element={<PageNotFound />} />
                  {/* TO DO remove went development complete and move to production */}
                  <Route path="/testing" element={<Testing />} />
                </Routes>
              </View>
          </View>
        </NativeRouter>
    </View>
  )
}

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

WebBrowser.maybeCompleteAuthSession();

function App() {
  //Dimentions
  const [dimensions, setDimensions] = useState({
    window: windowDimensions,
    screen: screenDimensions,
  });

  const [currentBreakPointMode, setCurerentBreakPointMode] = useState<breakPointMode>(breakPointMode.xSmall)

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({window, screen}) => {
        console.log("Window Change")
        setDimensions({window, screen});
      },
    );
    return () => subscription?.remove();
  });

  useEffect(() => {
    if (dimensions.window.width >= 1200) {
      //extraLarge ≥1200px
      setCurerentBreakPointMode(breakPointMode.xLarge)
    } else if (dimensions.window.width  >= 992) {
      //large, ≥992px
      setCurerentBreakPointMode(breakPointMode.large)
    } else if (dimensions.window.width  >= 768) {
      //medium, ≥768px
      setCurerentBreakPointMode(breakPointMode.medium)
    } else if (dimensions.window.width  >= 576) {
      //small, ≥576px
      setCurerentBreakPointMode(breakPointMode.small)
    } else if (dimensions.window.width  < 576) {
      //xSmall,	<576px
      setCurerentBreakPointMode(breakPointMode.xSmall)
    }
  }, [dimensions.window.width])

  //Context
  const [context, setContext] = useState<contextInterface>({uri: "", displayName: "", dimensions: {window: windowDimensions, screen: screenDimensions,}, currentBreakPointMode: breakPointMode.xSmall})

  const [expandedMode, setExpandedMode] = useState<boolean>(false)

  useEffect(() => {
    var newContext = context
    if (dimensions.window.width >= 576) {
      newContext.dimensions.window.width = dimensions.window.width * 0.9
    }
    setContext(newContext)
  }, [])

  useEffect(() => {
    var newContext = {...context}
    if (dimensions.window.width >= 576){
      if (expandedMode){
        newContext.dimensions.window.width = dimensions.window.width * 0.75
      } else {
        newContext.dimensions.window.width = dimensions.window.width * 0.9
      }
    } else {
      newContext.dimensions.window.width = dimensions.window.width
    }
    newContext.dimensions.window.height = dimensions.window.height 
    newContext.dimensions.window.scale = dimensions.window.scale
    newContext.dimensions.window.fontScale = dimensions.window.fontScale
    newContext.currentBreakPointMode = currentBreakPointMode
    setContext(newContext)
  }, [dimensions, currentBreakPointMode])

  useEffect(() => {
    var newContext = {...context}
    if (dimensions.window.width >= 576){
      if (expandedMode){
        newContext.dimensions.window.width = dimensions.window.width * 0.75
      } else {
        newContext.dimensions.window.width = dimensions.window.width * 0.9
      }
    } 
    setContext(newContext)
  }, [expandedMode])

  //Authentication
  async function getUserProfile() {
    //TO DO check if ok
    const result = await callMsGraph("https://graph.microsoft.com/v1.0/me/photo/$value")
    if (result.ok){
      const dataBlob = await result.blob()
      const urlOut = URL.createObjectURL(dataBlob)
      const profileResult = await callMsGraph("https://graph.microsoft.com/v1.0/me")
      if (profileResult.ok){
        const profileData = await profileResult.json()
        console.log(profileData)
        var newDimentions: {window: ScaledSize, screen: ScaledSize} = dimensions
        if (dimensions.window.width >= 576) {
          newDimentions.window.width = dimensions.window.width * 0.9
        }
        setContext({uri: urlOut, displayName: profileData["displayName"], dimensions: newDimentions, currentBreakPointMode: currentBreakPointMode})
      }
    }
  }

  const discovery = AuthSession.useAutoDiscovery(
    'https://login.microsoftonline.com/' + tenantId +'/v2.0',
  );

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: undefined,
    path: 'auth',
  });

  // Request
  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes: ["User.Read", "User.ReadBasic.All", "Sites.Read.All", "Sites.Manage.All", "ChannelMessage.Read.All", "Chat.ReadWrite", "Calendars.ReadWrite", "Team.ReadBasic.All", "Group.ReadWrite.All"],
      redirectUri,
    },
    discovery,
  );

  async function getAuthToken() {
    promptAsync().then((codeResponse) => {
      if (request && codeResponse?.type === 'success' && discovery) {
        AuthSession.exchangeCodeAsync(
          {
            clientId,
            code: codeResponse.params.code,
            extraParams: request.codeVerifier
              ? { code_verifier: request.codeVerifier }
              : undefined,
            redirectUri,
          },
          discovery,
        ).then((response) => {
          getPaulyLists()
          getUserProfile()
        });
      }
    });
  }

  // useEffect(() => {
  //   refreshAuthToken()
  // }, [])

  // Font
  useEffect(() => {
    console.log("Request Changed", result)
    console.log()
    if (!request) {
      console.log("True")
    } else {
      console.log("Not True")
    }
  }, [result])

  const [fontsLoaded] = useFonts({
    'BukhariScript': require('./assets/fonts/BukhariScript.ttf'),
  });
  
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <SafeAreaView>
        { (result) ?
          <View>
            <accessTokenContent.Provider value={context}>
              <AuthenticatedView dimensions={dimensions} width={dimensions.window.width} currentBreakPointMode={currentBreakPointMode} expandedMode={expandedMode} setExpandedMode={setExpandedMode}/>
            </accessTokenContent.Provider>
          </View>:
          <View style={{backgroundColor: "#793033", alignContent: "center", alignItems: "center", justifyContent: "center", height: dimensions.window.height, width: dimensions.window.width}}>
            <Text style={{fontFamily: "BukhariScript", fontSize: 150, textShadowColor: "white", textShadowRadius: 10}}>Pauly</Text>
            <Pressable onPress={async () => {
              getAuthToken()
            }} style={{height: dimensions.window.height * 0.2, width: dimensions.window.width * 0.5, borderRadius: 25, backgroundColor: "white", alignContent: "center", alignItems: "center", justifyContent: "center", shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.8, shadowRadius: 10}}>
              <Text style={{textAlign: "center"}}>LOGIN</Text>
            </Pressable>
          </View>
        }
      </SafeAreaView>
    </Provider>
  );
}

export default App;
