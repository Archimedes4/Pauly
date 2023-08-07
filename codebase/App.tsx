/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Dimensions,
  StyleSheet,
  useColorScheme,
  View,
  ScaledSize
} from 'react-native';
import { Provider } from 'react-redux'
import HomePage from './src/AuthenticatedView/HomePage';
import Commissions from './src/AuthenticatedView/Profile/Commissions/Commissions';
import { NativeRouter, Route, Routes } from 'react-router-native';
import { msalConfig } from './src/authConfig.js';
import { PublicClientApplication } from '@azure/msal-browser';
import { AuthenticatedTemplate, MsalProvider, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import Login from './src/Login';
import { loginRequest } from './src/authConfig';
import Notifications from './src/AuthenticatedView/Notifications';
import Resources from './src/AuthenticatedView/Profile/Resources';
import Settings from './src/AuthenticatedView/Profile/Settings';
import Profile from './src/AuthenticatedView/Profile/Profile';
import Government from './src/AuthenticatedView/Profile/Government/Government';
import MicrosoftGraphOverview from './src/AuthenticatedView/Profile/Government/MicrosoftGraphLists/MicrosoftGraphOverview';
import MicrosoftGraphCreateList from './src/AuthenticatedView/Profile/Government/MicrosoftGraphLists/MicrosoftGraphCreateList';
import GovernmentCommissions from './src/AuthenticatedView/Profile/Government/GovernmentCommissions/GovernmentCommissions';
import CreateNewCommission from './src/AuthenticatedView/Profile/Government/GovernmentCommissions/CreateNewCommission';
import Messaging from './src/AuthenticatedView/Messaging/Messaging.web';
import QuizView from './src/AuthenticatedView/Quiz/Quiz';
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
import CommissionsView from './src/AuthenticatedView/Profile/Commissions/CommissionsView';
import GovernmentHomePage from './src/AuthenticatedView/Profile/Government/GovernmentHomePage';
import GovernmentEvents from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentEvents/GovernmentEvents';
import callMsGraph from './src/Functions/microsoftAssets';
import NavBarComponent from './src/UI/NavComponent';
import GovernmentTimetableCreate from './src/AuthenticatedView/Profile/Government/GovernmentCalendar/GovernmentTimetable/GovernmentTimetableCreate';
import Testing from './src/AuthenticatedView/Profile/Government/Testing';
import store from './src/Redux/store';
import PageNotFound from './src/AuthenticatedView/404Page';

const msalInstance = new PublicClientApplication(msalConfig);

const windowDimensions = Dimensions.get('window');
const screenDimensions = Dimensions.get('screen');

export const accessTokenContent = React.createContext<{uri: string, accessToken: string, dimensions: {window: ScaledSize, screen: ScaledSize}}>({uri: "", accessToken: "",dimensions: {window: {width: 0, height: 0, fontScale: 0, scale: 0}, screen: {width: 0, height: 0, fontScale: 0, scale: 0}}});

function AuthenticatedView({dimensions}:{dimensions: {
  window: ScaledSize,
  screen: ScaledSize
}}) {
  const { instance, accounts } = useMsal();
  const [context, setContext] = useState<{uri: string, accessToken: string, dimensions: {window: ScaledSize, screen: ScaledSize}}>({uri: "", accessToken: "",dimensions: dimensions})
  const [expandedMode, setExpandedMode] = useState<boolean>(false)
  
  async function getUserProfile(microsoftAccessToken: string) {
    console.log("Token", microsoftAccessToken)
    const result = await callMsGraph(microsoftAccessToken, "https://graph.microsoft.com/v1.0/me/photo/$value")
    // const data = await result.json()
    // console.log(data)
    const dataBlob = await result.blob()
    const urlOut = URL.createObjectURL(dataBlob)
    setContext({uri: urlOut, accessToken: microsoftAccessToken, dimensions: dimensions})
  }

  function getMicrosoftAccessToken() {
    instance
    .acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
    })
    .then((response) => {
      getUserProfile(response.accessToken)
    }).catch(() => {
      console.log("Error occured")
      instance.logoutPopup({
        postLogoutRedirectUri: "/",
        mainWindowRedirectUri: "/",
      });
    })
  }

  useEffect(() => {
    getMicrosoftAccessToken()
  }, [])

  useEffect(() => {
    var newContext = context
    if (dimensions.window.width > 576){
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
    setContext(newContext)
  }, [dimensions, expandedMode])
  return (
    <View>
      <accessTokenContent.Provider value={context}>
        <NativeRouter>
          <View style={{flexDirection: "row", overflow: "hidden"}}>
              { (dimensions.window.width > 576) ?
              <View style={{width: (expandedMode) ? dimensions.window.width * 0.25:dimensions.window.width * 0.1, height: dimensions.window.height}}>
                  <NavBarComponent width={dimensions.window.width * 0.1} height={dimensions.window.height} expandedMode={expandedMode} onSetExpandedMode={setExpandedMode} />
              </View>:null
              }
              <View style={{width: (dimensions.window.width > 576) ? (expandedMode) ? dimensions.window.width * 0.75:dimensions.window.width * 0.9:dimensions.window.width}}>
                <Routes>
                  <Route path="/" element={<HomePage/>}/>
                  <Route path="/quiz" element={<QuizView/>}/>
                  <Route path="/sports" element={<Sports/>}/>
                  <Route path="/notifications" element={<Notifications/>}/>
                  <Route path="/calendar" element={<Calendar governmentMode={false} />}/>
                  <Route path="/resources" element={<Resources/>}/>
                  <Route path="/commissions" element={<Commissions/>}/>
                  <Route path="/profile/" element={<Profile/>}/>
                  <Route path="/profile/commissions/:id" element={<CommissionsView/>}/>
                  <Route path="/profile/settings" element={<Settings/>}/>
                  <Route path="/profile/government" element={<Government />}/>
                  <Route path="/profile/government/graph" element={<MicrosoftGraphOverview/>}/>
                  <Route path="/profile/government/graph/create" element={<MicrosoftGraphCreateList/>}/>
                  <Route path="/profile/government/graph/edit/:listId" element={<MicrosoftGraphEditList />} />
                  <Route path="/profile/government/commissions" element={<GovernmentCommissions/>}/>
                  <Route path="/profile/government/commissions/create" element={<CreateNewCommission/>}/>
                  <Route path="/profile/government/homepage" element={<GovernmentHomePage />} />
                  <Route path="/profile/government/classes" element={<GovernmentClasses />} />
                  <Route path="/profile/government/classes/main/create" element={<GovernmentClassesCreate />} />
                  <Route path="/profile/government/classes/root/create" element={<GovernmentClassesCreateRoot />} />
                  <Route path="/profile/government/calendar" element={<GovernmentCalendar />} />
                  <Route path="/profile/government/calendar/events" element={<GovernmentEvents isCreatingEvent={false}/>} />
                  <Route path="/profile/government/calendar/events/create" element={<GovernmentEvents isCreatingEvent={true}/>} />
                  <Route path="/profile/government/calendar/schedule" element={<GovernmentSchedual />} />
                  <Route path="/profile/government/calendar/schedule/create" element={<GovernmentScheduleCreate />} />
                  <Route path="/profile/government/calendar/schedule/edit/:scheduleId" element={<GovernmentScheduleEdit />} />
                  <Route path="/profile/government/calendar/timetable" element={<GovernmentTimetable />} />
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
      </accessTokenContent.Provider>
    </View>
  )
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [dimensions, setDimensions] = useState({
    window: windowDimensions,
    screen: screenDimensions,
  });

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
    setDimensions({
        window: Dimensions.get('window'),
        screen: Dimensions.get('screen')
    })
  }, [])

  return (
    <Provider store={store}>
      <SafeAreaView>
        <MsalProvider instance={msalInstance}>
          <AuthenticatedTemplate>
          <AuthenticatedView dimensions={dimensions} />
            </AuthenticatedTemplate>
          <UnauthenticatedTemplate>
            <Login />
          </UnauthenticatedTemplate>
        </MsalProvider>
      </SafeAreaView>
    </Provider>
  );
}

// function AuthenticatedViewRedux({dimensions}:{dimensions: {window: ScaledSize, screen: ScaledSize}}) {
//   return (
      
//   )
// }

export default App;
