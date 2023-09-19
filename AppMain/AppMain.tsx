import { View, Text, ScaledSize } from 'react-native'

export default function AppMain({expandedMode, setExpandedMode}:{expandedMode: boolean, setExpandedMode: (item: boolean) => void, dimensions: {window: ScaledSize; screen: ScaledSize}}) {
  return (
    <View>
      <Text>AppMain</Text>
    </View>
  )
}