import HomePage from './HomePage';
import Commissions from './Commissions/Commissions';
import Notifications from './Notifications';
import Resources from './Resources';
import Settings from './Profile/Settings';
import Government from './Profile/Government/Government';
import MicrosoftGraphOverview from './Profile/Government/MicrosoftGraphLists/MicrosoftGraphOverview';
import MicrosoftGraphCreateList from './Profile/Government/MicrosoftGraphLists/MicrosoftGraphCreateList';
import GovernmentCommissions from './Profile/Government/GovernmentCommissions/GovernmentCommissions';
import GovernmentEditCommission from './Profile/Government/GovernmentCommissions/GovernmentEditCommission';
import Sports from './Sports';
import Calendar from './Calendar/Calendar';
import GovernmentSports from './Profile/Government/GovernmentSports/GovernmentSports';
import GovernmentCreateNewSport from './Profile/Government/GovernmentSports/GovernmentCreateNewSport';
import GovernmentSportsTeams from './Profile/Government/GovernmentSports/GovernmentSportsTeams';
import GovernmentSportTeamEdit from './Profile/Government/GovernmentSports/GovernmentSportTeamEdit';
import GovernmentSportsTeamAddPost from './Profile/Government/GovernmentSports/GovernmentSportsTeamAddPost';
import GovernmentReviewFileSubmission from './Profile/Government/GovernmentSports/GovernmentReviewFileSubmission';
import GovernmentCalendar from './Profile/Government/GovernmentCalendar/GovernmentCalendar';
import GovernmentSchedual from './Profile/Government/GovernmentCalendar/GovernmentSchedule/GovernmentSchedule';
import GovernmentTimetable from './Profile/Government/GovernmentCalendar/GovernmentTimetable/GovernmentTimetable';
import GovernmentScheduleCreate from './Profile/Government/GovernmentCalendar/GovernmentSchedule/GovernmentScheduleCreate';
import GovernmentScheduleEdit from './Profile/Government/GovernmentCalendar/GovernmentSchedule/GovernmentScheduleEdit';
import GovernmentClasses from './Profile/Government/GovernmentClasses/GovernmentClasses';
import GovernmentClassesEdit from './Profile/Government/GovernmentClasses/GovernmentClassesEdit';
import GovernmentHomePage from './Profile/Government/GovernmentHomePage';
import NavBarComponent from '../UI/NavComponent';
import Testing from './Profile/Government/Testing';
import PageNotFound from './404Page';
import GovernmentAdmin from './Profile/Government/GovernmentAdminCenter/GovernmentAdmin';
import GovernmentRooms from './Profile/Government/GovernmentClasses/GovernmentRooms';
import GovernmentRoomsCreate from './Profile/Government/GovernmentClasses/GovermentRoomsCreate'
import MicrosoftGraphEdit from './Profile/Government/MicrosoftGraphLists/MicrosoftGraphEdit';
import GovernmentResources from './Profile/Government/GovernmentResources';
import GovernmentDressCodeCreate from './Profile/Government/GovernmentCalendar/GovernmentDressCode/GovernmentDressCodeCreate';
import GovernmentDressCode from './Profile/Government/GovernmentCalendar/GovernmentDressCode/GovernmentDressCode';
import GovernmentDressCodeEdit from './Profile/Government/GovernmentCalendar/GovernmentDressCode/GovernmentDressCodeEdit';
import GovernmentTimetableEdit from './Profile/Government/GovernmentCalendar/GovernmentTimetable/GovernmentTimetableEdit';
import { NativeRouter, Route, Routes } from 'react-router-native';
import { View, ScaledSize, Text } from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../Redux/store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProfileBlock from './Profile/ProfileBlock';
import ProgressView from '../UI/ProgressView';

export default function AuthenticatedView({dimensions, width}:{dimensions: {window: ScaledSize,screen: ScaledSize}, width: number}) {
  const {height, currentBreakPoint} = useSelector((state: RootState) => state.dimentions)
  const {siteId} = useSelector((state: RootState) => state.paulyList)
  const authenticationToken = useSelector((state: RootState) => state.authenticationToken)
  const isShowingProfileBlock = useSelector((state: RootState) => state.isShowingProfileBlock)
  const insets = useSafeAreaInsets();
  return (
    <>
      { (siteId !== "" && authenticationToken !== "") ? 
        <View style={{width: width, top: -insets.top}}>
          <NativeRouter>
            <View style={{flexDirection: "row", width: width}}>
              { (currentBreakPoint >= 1) ?
                <NavBarComponent width={width * 0.1} height={dimensions.window.height} />:null
              }
              <View style={{width: (currentBreakPoint >= 1) ? width * 0.9:width, height: height, backgroundColor: "#793033"}}>
                <Routes>
                  <Route path="/" element={<HomePage/>}/>
                  <Route path="/sports" element={<Sports/>}/>
                  <Route path="/notifications" element={<Notifications/>}/>
                  <Route path="/calendar" element={<Calendar />}/>
                  <Route path="/resources" element={<Resources/>}/>
                  <Route path="/commissions" element={<Commissions/>}/>
                  <Route path="/profile" element={<Settings/>}/>
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
                  <Route path="/profile/government/calendar/timetable/:id" element={<GovernmentTimetableEdit/>} />
                  <Route path="/profile/government/calendar/dresscode" element={<GovernmentDressCode />} />
                  <Route path="/profile/government/calendar/dresscode/edit/:id" element={<GovernmentDressCodeEdit />} /> 
                  <Route path="/profile/government/calendar/dresscode/create" element={<GovernmentDressCodeCreate />} />
                  <Route path="/profile/government/sports" element={<GovernmentSports/>}/>
                  <Route path="/profile/government/sports/create" element={<GovernmentCreateNewSport/>}/>
                  <Route path="/profile/government/sports/team/:sport/:id" element={<GovernmentSportsTeams/>}/>
                  <Route path="/profile/government/sports/team/:sport/:id/:teamId" element={<GovernmentSportTeamEdit />} />
                  <Route path="/profile/government/sports/post/create" element={<GovernmentSportsTeamAddPost />} />
                  <Route path="/profile/government/sports/post/review/:submissionID" element={<GovernmentReviewFileSubmission />} />
                  <Route path="*" element={<PageNotFound />} />
                  {/* TO DO remove went development complete and move to production */}
                  <Route path="/testing" element={<Testing />} />
                </Routes>
              </View>
              { (currentBreakPoint >= 1 && isShowingProfileBlock) ?
                <ProfileBlock width={width * 0.1} />:null
              }
            </View>
          </NativeRouter>
        </View>:
        <View style={{width: width, top: -insets.top, height: height, alignContent: "center", alignItems: 'center', justifyContent: "center"}}>
          <ProgressView width={14} height={14}/>
          <Text style={{color: "white"}}>Loading</Text>
        </View>
      }
    </>
  )
}