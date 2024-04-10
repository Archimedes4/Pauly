import { useSignOut } from "@hooks/authentication";
import useIsShowingLogout from "@hooks/useIsShowingLogout";
import { RootState } from "@redux/store";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import ProgressView from "./ProgressView";
import React from "react";
import { Colors } from "@constants";

export default function LoadingComponent() {
  const isGovernmentMode = useSelector(
    (state: RootState) => state.isGovernmentMode,
  );
  const signOut = useSignOut();
  const { height, totalWidth } = useSelector(
    (state: RootState) => state.dimensions,
  );
  const insets = useSafeAreaInsets();
  const isShowingLogout = useIsShowingLogout();

  return (
    <View
      style={{
        width: totalWidth,
        top: -insets.top,
        height,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ProgressView width={14} height={14} />
      <Text style={{ color: Colors.white }}>Loading</Text>
      {isGovernmentMode ? (
        <Pressable style={{ margin: 5 }}>
          <Text style={{ color: Colors.white }}>Overide</Text>
        </Pressable>
      ) : null}
      {isShowingLogout ? (
        <Pressable
          onPress={() => {
            signOut();
          }}
          style={{ margin: 5 }}
        >
          <Text style={{ color: Colors.white }}>Logout</Text>
        </Pressable>
      ) : null}
    </View>
  );
}