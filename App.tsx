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
  ScaledSize,
  Image,
  Platform
} from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux'
import { NativeRouter, Route, Routes } from 'react-router-native';
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from "expo-auth-session"

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
import GovernmentEditCommission from './src/AuthenticatedView/Profile/Government/GovernmentCommissions/GovernmentEditCommission';
import Sports from './src/AuthenticatedView/Sports/Sports.web';
import Calendar from './src/AuthenticatedView/Calendar/Calendar';
import GovernmentSports from './src/AuthenticatedView/Profile/Government/GovernmentSports/GovernmentSports';
import GovernmentCreateNewSport from './src/AuthenticatedView/Profile/Government/GovernmentSports/GovernmentCreateNewSport';
import GovernmentCreateNewTeam from './src/AuthenticatedView/Profile/Government/GovernmentSports/GovernmentCreateNewTeam';
import GovernmentSportsTeams from './src/AuthenticatedView/Profile/Government/GovernmentSports/GovernmentSportsTeams';
import GovernmentSportTeamEdit from './src/AuthenticatedView/Profile/Government/GovernmentSports/GovernmentSportTeamEdit';
import GovernmentSportsTeamAddPost from './src/AuthenticatedView/Profile/Government/GovernmentSports/GovernmentSportsTeamAddPost';
import GovernmentReviewFileSubmission from './src/AuthenticatedView/Profile/Government/GovernmentSports/GovernmentReviewFileSubmissions/GovernmentReviewFileSubmission';
import GovernmentCalendar from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentCalendar';
import GovernmentSchedual from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentSchedule/GovernmentSchedule';
import GovernmentTimetable from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentTimetable/GovernmentTimetable';
import GovernmentScheduleCreate from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentSchedule/GovernmentScheduleCreate';
import GovernmentScheduleEdit from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentSchedule/GovernmentScheduleEdit';
import GovernmentClasses from './src/AuthenticatedView/Profile/Government/GovernmentClasses/GovernmentClasses';
import GovernmentClassesEdit from './src/AuthenticatedView/Profile/Government/GovernmentClasses/GovernmentClassesEdit';
import CommissionsView from './src/AuthenticatedView/Commissions/CommissionsView';
import GovernmentHomePage from './src/AuthenticatedView/Profile/Government/GovernmentHomePage';
import callMsGraph from './src/Functions/Ultility/microsoftAssets';
import NavBarComponent from './src/UI/NavComponent';
import GovernmentTimetableCreate from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentTimetable/GovernmentTimetableCreate';
import Testing from './src/AuthenticatedView/Profile/Government/Testing';
import store, { RootState } from './src/Redux/store';
import PageNotFound from './src/AuthenticatedView/404Page';
import GovernmentAdmin from './src/AuthenticatedView/Profile/Government/GovernmentAdminCenter/GovernmentAdmin';
import getPaulyLists from './src/Functions/Ultility/getPaulyLists';
import GovernmentTimetableEdit from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentTimetable/GovernmentTimetableEdit';
import MicrosoftGraphEditGroup from './src/AuthenticatedView/Profile/Government/MicrosoftGraphLists/MicrosoftGraphEditGroup';
import MicrosoftGraphEditExtension from './src/AuthenticatedView/Profile/Government/MicrosoftGraphLists/MicrosoftGraphEditExtension';
import { clientId, tenantId } from './src/PaulyConfig';
import { loadingStateEnum } from './src/types';
import authenticationTokenReducer, { authenticationTokenSlice } from './src/Redux/reducers/authenticationTokenReducer';
import { microsoftProfileDataSlice } from './src/Redux/reducers/microsoftProfileDataReducer';
import { dimentionsSlice } from './src/Redux/reducers/dimentionsReducer';
import Login from './src/login';
import MicrosoftGraphEdit from './src/AuthenticatedView/Profile/Government/MicrosoftGraphLists/MicrosoftGraphEdit';
import GovernmentResources from './src/AuthenticatedView/Profile/Government/GovernmentResources';
import GovernmentDressCodeCreate from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentDressCode/GovernmentDressCodeCreate';
import GovernmentDressCode from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentDressCode/GovernmentDressCode';
import GovernmentDressCodeEdit from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentDressCode/GovernmentDressCodeEdit';
import { authenticationRefreshTokenSlice } from './src/Redux/reducers/authenticationRefreshTokenReducer';
import GovernmentRooms from './src/AuthenticatedView/Profile/Government/GovernmentClasses/GovernmentRooms';
import GovernmentRoomsCreate from './src/AuthenticatedView/Profile/Government/GovernmentClasses/GovermentRoomsCreate'
import { getToken } from "./getToken"
import PublicClientApplication, { MSALAccount, MSALConfiguration, MSALInteractiveParams, MSALResult, MSALSignoutParams } from 'react-native-msal';
import getUserProfile from './src/Functions/getUserProfile';

//From https://getbootstrap.com/docs/5.0/layout/breakpoints/
enum breakPointMode {
  xSmall,	  //<576px  ->0
  small,    //≥576px  ->1
  medium,   //≥768px  ->2
  large,    //≥992px  ->3
  xLarge    //≥1200px ->4
}

function AuthenticatedView({dimensions, width, expandedMode, setExpandedMode}:{dimensions: {
  window: ScaledSize,
  screen: ScaledSize
}, width: number, expandedMode: boolean, setExpandedMode: (item: boolean) => void}) {
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
                  <Route path="/calendar" element={<Calendar />}/>
                  <Route path="/resources" element={<Resources/>}/>
                  <Route path="/commissions" element={<Commissions/>}/>
                  <Route path="/profile/" element={<Profile/>}/>
                  <Route path="/profile/settings" element={<Settings/>}/>
                  <Route path="/profile/government" element={<Government />}/>
                  <Route path="/profile/government/resources" element={<GovernmentResources />} />
                  <Route path="/profile/government/admin" element={<GovernmentAdmin />} />
                  <Route path="/profile/government/graph/:mode" element={<MicrosoftGraphOverview/>}/>
                  <Route path="/profile/government/graph/:mode/edit/:id" element={<MicrosoftGraphEdit />}/>
                  <Route path="/profile/government/graph/:mode/create" element={<MicrosoftGraphCreateList/>}/>
                  <Route path="/profile/government/commissions" element={<GovernmentCommissions/>}/>
                  <Route path="/profile/government/commissions/:id" element={<GovernmentEditCommission/>}/>
                  <Route path="/profile/government/homepage" element={<GovernmentHomePage />} />
                  <Route path="/profile/government/classes" element={<GovernmentClasses />} />
                  <Route path="/profile/government/classes/edit/:id" element={<GovernmentClassesEdit />} />
                  <Route path="/profile/government/classes/room" element={<GovernmentRooms />} />
                  <Route path="/profile/government/classes/room/create" element={<GovernmentRoomsCreate />} />
                  <Route path="/profile/government/calendar" element={<GovernmentCalendar />} />
                  <Route path="/profile/government/calendar/schedule" element={<GovernmentSchedual />} />
                  <Route path="/profile/government/calendar/schedule/create" element={<GovernmentScheduleCreate />} />
                  <Route path="/profile/government/calendar/schedule/edit/:scheduleId" element={<GovernmentScheduleEdit />} />
                  <Route path="/profile/government/calendar/timetable" element={<GovernmentTimetable />} />
                  <Route path="/profile/government/calendar/timetable/edit/:timetableId" element={<GovernmentTimetableEdit/>} />
                  <Route path="/profile/government/calendar/timetable/create" element={<GovernmentTimetableCreate />} />
                  <Route path="/profile/government/calendar/dresscode" element={<GovernmentDressCode />} />
                  <Route path="/profile/government/calendar/dresscode/edit/:id" element={<GovernmentDressCodeEdit />} /> 
                  <Route path="/profile/government/calendar/dresscode/create" element={<GovernmentDressCodeCreate />} />
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

const config: MSALConfiguration = {
  auth: {
    clientId: clientId,
    // This authority is used as the default in `acquireToken` and `acquireTokenSilent` if not provided to those methods.
    // Defaults to 'https://login.microsoftonline.com/common'
    authority: `https://login.microsoftonline.com/${tenantId}`
  },
};
const scopes = ["User.Read", "User.ReadBasic.All", "Sites.Read.All", "Sites.Manage.All", "ChannelMessage.Read.All", "Chat.ReadWrite", "Calendars.ReadWrite", "Team.ReadBasic.All", "Group.ReadWrite.All", "Tasks.ReadWrite", "Channel.ReadBasic.All", "Application.ReadWrite.All"]

const pca = new PublicClientApplication(config);

function AppMain() {
  //Dimentions
  const statusBarColor = useSelector((state: RootState) => state.statusBarColor)
  const authenticationToken = useSelector((state: RootState) => state.authenticationToken)
  const [dimensions, setDimensions] = useState({window: windowDimensions, screen: screenDimensions});
  const [expandedMode, setExpandedMode] = useState<boolean>(false)
  const [account, setAccount] = useState<undefined | MSALAccount>(undefined)
  const dispatch = useDispatch()

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({window, screen}) => {
        setDimensions({window, screen});
      },
    );
    return () => subscription?.remove();
  });

  useEffect(() => {
    const width = dimensions.window.width
    if (width >= 576){
      if (expandedMode){
        store.dispatch(dimentionsSlice.actions.setDimentionsWidth(width * 0.75))
      } else {
        store.dispatch(dimentionsSlice.actions.setDimentionsWidth(width * 0.9))
      }
    }
  }, [expandedMode])

  useEffect(() => {
    const oldWidth = store.getState().dimentions.width
    const height = store.getState().dimentions.height
    const width = dimensions.window.width
    if (oldWidth !== width) {
      var oldCurrentBreakPointMode: breakPointMode = store.getState().dimentions.currentBreakPoint
      var currentBreakPoint: breakPointMode = breakPointMode.xSmall
      if (dimensions.window.width >= 1200) {
        //extraLarge ≥1200px
        currentBreakPoint = breakPointMode.xLarge
      } else if (dimensions.window.width  >= 992) {
        //large, ≥992px
        currentBreakPoint = breakPointMode.large
      } else if (dimensions.window.width  >= 768) {
        //medium, ≥768px
        currentBreakPoint = breakPointMode.medium
      } else if (dimensions.window.width  >= 576) {
        //small, ≥576px
        currentBreakPoint = breakPointMode.small
      } else if (dimensions.window.width  < 576) {
        //xSmall,	<576px
        currentBreakPoint = breakPointMode.xSmall
      }
      if (oldCurrentBreakPointMode !== currentBreakPoint){
        if (width >= 576){
          if (expandedMode){
            store.dispatch(dimentionsSlice.actions.setDimentionsWidthCurrentBreakPoint({width: width * 0.75, currentBreakPoint: currentBreakPoint}))
          } else {
            store.dispatch(dimentionsSlice.actions.setDimentionsWidthCurrentBreakPoint({width: width * 0.9, currentBreakPoint: currentBreakPoint}))
          }
        } else {
          store.dispatch(dimentionsSlice.actions.setDimentionsWidthCurrentBreakPoint({width: width , currentBreakPoint: currentBreakPoint}))
        }
      } else {
        if (width >= 576){
          if (expandedMode){
            store.dispatch(dimentionsSlice.actions.setDimentionsWidth(width * 0.75))
          } else {
            store.dispatch(dimentionsSlice.actions.setDimentionsWidth(width * 0.9))
          }
        } else {
          store.dispatch(dimentionsSlice.actions.setDimentionsWidth(width))
        }
      }
    }
    if (height !== dimensions.window.height) {
      console.log("height changed")
      store.dispatch(dimentionsSlice.actions.setDimentionsHeight(dimensions.window.height))
    }
  }, [dimensions])

  //Authentication
  async function authInit() {
    try {
      await pca.init();
      const isSignedIn = await pca.getAccounts()
      if (isSignedIn.length >= 1) {
        dispatch(authenticationTokenSlice.actions.setAuthenticationToken(await pca.acquireTokenSilent({
          scopes,
          account: isSignedIn[0]
        })))
        setAccount(isSignedIn[0])
      }
    } catch (error) {
      console.error('Error initializing the pca, check your config.', error);
    }
  }

  useEffect(() => {
    authInit()
  }, [])

  async function getAuthToken() {
    const params: MSALInteractiveParams = { scopes };
    const result: MSALResult | undefined = await pca.acquireToken(params);
    setAccount(result.account)
    store.dispatch(authenticationTokenSlice.actions.setAuthenticationToken(result.accessToken))
    getPaulyLists(result.accessToken)
    getUserProfile(result.accessToken)
  }

  async function signOut() {
    // Same as `pca.removeAccount` with the exception that, if called on iOS with the `signoutFromBrowser` option set to true, it will additionally remove the account from the system browser
    // Remove all tokens from the cache for this application for the provided account
    const removeSuccess: boolean = await pca.removeAccount(account);
    const params: MSALSignoutParams = {
      account: account,
      signoutFromBrowser: true,
    };
    const success: boolean = await pca.signOut(params);
  }

  return (
    <View style={{backgroundColor: statusBarColor}}>
      {
        <View style={{height: dimensions.window.height, width: (expandedMode) ? dimensions.window.width * 0.25:dimensions.window.width * 0.1, backgroundColor: "#793033"}}/>
      }
      <SafeAreaView style={{width: dimensions.window.width, height: dimensions.window.height, zIndex: 2, position: "absolute", left: 0, top: 0}}>
        { (authenticationToken !== '') ?
          <View>
            <AuthenticatedView dimensions={dimensions} width={dimensions.window.width} expandedMode={expandedMode} setExpandedMode={setExpandedMode}/>
          </View>:
          <Login onGetAuthToken={() => {getAuthToken()}} width={dimensions.window.width}/>
        }
      </SafeAreaView>
    </View>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppMain />
    </Provider>
  )
}

export default App;
