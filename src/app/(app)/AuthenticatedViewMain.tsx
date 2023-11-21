/*
  Pauly
  Andrew Mainella
  November 9 2023
  AuthenticatedViewMain.tsx
  This holds the main router to Pauly once authenticated.
*/
import React, { useState } from 'react';
import { View, ScaledSize } from 'react-native';
import { useSelector } from 'react-redux';
import { NativeRouter, Route, Routes } from 'react-router-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomePage from './Index';
import Commissions from './commissions';
import Notifications from './Notifications';
import Resources from './resources';
import Settings from './Profile/Settings';
import Government from './Profile/Government/Government';
import MicrosoftGraphOverview from './Profile/Government/MicrosoftGraphLists/MicrosoftGraphOverview';
import MicrosoftGraphCreateList from './Profile/Government/MicrosoftGraphLists/MicrosoftGraphCreateList';
import GovernmentCommissions from './Profile/Government/GovernmentCommissions/GovernmentCommissions';
import GovernmentEditCommission from './Profile/Government/GovernmentCommissions/GovernmentEditCommission';
import Sports from './sports';
import Calendar from './calendar';
import GovernmentSports from './Profile/Government/GovernmentSports/GovernmentSports';
import GovernmentCreateNewSport from './Profile/Government/GovernmentSports/GovernmentCreateNewSport';
import GovernmentSportsTeams from './Profile/Government/GovernmentSports/GovernmentSportsTeams';
import GovernmentSportTeamEdit from './Profile/Government/GovernmentSports/GovernmentSportTeamEdit';
import GovernmentSportsTeamAddPost from './Profile/Government/GovernmentSports/GovernmentSportsTeamAddPost';
import GovernmentReviewFileSubmission from './Profile/Government/GovernmentSports/GovernmentReviewFileSubmission';
import GovernmentCalendar from './Profile/Government/GovernmentCalendar/GovernmentCalendar';
import GovernmentSchedual from './Profile/Government/GovernmentCalendar/GovernmentSchedule/GovernmentSchedule';
import GovernmentTimetable from './Profile/Government/GovernmentCalendar/GovernmentTimetable/GovernmentTimetable';
import GovernmentScheduleEdit from './Profile/Government/GovernmentCalendar/GovernmentSchedule/GovernmentScheduleEdit';
import GovernmentClasses from './Profile/Government/GovernmentClasses/GovernmentClasses';
import GovernmentClassesEdit from './Profile/Government/GovernmentClasses/GovernmentClassesEdit';
import GovernmentHomePage from './Profile/Government/GovernmentHomePage';
import NavBarComponent from '../../UI/NavComponent';
import PageNotFound from './+not-found';
import GovernmentAdmin from './Profile/Government/GovernmentAdminCenter/GovernmentAdmin';
import GovernmentRooms from './Profile/Government/GovernmentClasses/GovernmentRooms';
import GovernmentRoomsCreate from './Profile/Government/GovernmentClasses/GovermentRoomsCreate';
import MicrosoftGraphEdit from './Profile/Government/MicrosoftGraphLists/MicrosoftGraphEdit';
import GovernmentResources from './Profile/Government/GovernmentResources';
import GovernmentDressCode from './Profile/Government/GovernmentCalendar/GovernmentDressCode/GovernmentDressCode';
import GovernmentDressCodeEdit from './Profile/Government/GovernmentCalendar/GovernmentDressCode/GovernmentDressCodeEdit';
import GovernmentTimetableEdit from './Profile/Government/GovernmentCalendar/GovernmentTimetable/GovernmentTimetableEdit';
import { RootState } from '../../Redux/store';
import ProfileBlock from './Profile/ProfileBlock';
import Students from './students';
import GovernmentStudents from './Profile/Government/GovernmentStudents';
import { Colors } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import { Slot } from 'expo-router';

export default function AuthenticatedView({
  dimensions,
  width,
}: {
  dimensions: { window: ScaledSize; screen: ScaledSize };
  width: number;
}) {
  const { height, currentBreakPoint } = useSelector(
    (state: RootState) => state.dimentions,
  );
  const { siteId } = useSelector((state: RootState) => state.paulyList);
  const authenticationToken = useSelector(
    (state: RootState) => state.authenticationToken,
  );
  const isShowingProfileBlock = useSelector(
    (state: RootState) => state.isShowingProfileBlock,
  );
  const insets = useSafeAreaInsets();
  const [overide, setOveride] = useState<boolean>(false);
  if ((siteId !== '' || overide) && authenticationToken !== '') {
    return (
      <View style={{ width, top: -insets.top }}>
        <View style={{ flexDirection: 'row', width }}>
          {currentBreakPoint >= 1 ? (
            <NavBarComponent
              width={width * 0.1}
              height={dimensions.window.height}
            />
          ) : null}
          <View
            style={{
              width: currentBreakPoint >= 1 ? width * 0.9 : width,
              height,
              backgroundColor: Colors.maroon,
            }}
          >
            <Slot />
            {currentBreakPoint >= 1 && isShowingProfileBlock ? (
              <ProfileBlock />
            ) : null}
          </View>
        </View>
      </View>
    );
  }
  return <LoadingScreen setOveride={setOveride} width={width} />;
}
