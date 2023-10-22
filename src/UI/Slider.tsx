import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  PanResponderGestureState,
} from 'react-native';

interface BoxProps {
  width: number;
  height: number;
  value: number;
  onValueChange: (item: number) => void;
  containerWidth: number;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  box: {
    backgroundColor: 'blue',
    borderRadius: 5,
    position: 'absolute',
  },
});

const Box: React.FC<BoxProps> = ({
  width,
  height,
  value,
  onValueChange,
  containerWidth,
}) => {
  const pan = useRef(new Animated.Value(value)).current;
  const valueRef = useRef({ currentValue: value });
  const containerWidthRef = useRef({ currentValue: value });
  const lastValue = useRef({ currentValue: value });
  useEffect(() => {
    containerWidthRef.current.currentValue = containerWidth;
  }, [containerWidth]);
  useEffect(() => {
    valueRef.current.currentValue = value;
  }, [value]);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (
        evt: any,
        gestureState: PanResponderGestureState,
      ) => {
        const { dx } = gestureState;
        const valueRead = valueRef.current.currentValue;
        let adding =
          lastValue.current.currentValue > 0
            ? dx - lastValue.current.currentValue
            : dx + lastValue.current.currentValue;
        adding /= width - height / 2;
        lastValue.current.currentValue = dx;
        const newValue = valueRead + adding;

        if (newValue <= 1 && newValue >= 0) {
          valueRef.current.currentValue = newValue;
          onValueChange(newValue);
          Animated.event([null, { dx: pan }], {
            useNativeDriver: false,
          })(evt, { ...gestureState, dx: newValue * width });
        } else if (newValue < 0) {
          valueRef.current.currentValue = 0;
          onValueChange(0);
          Animated.event([null, { dx: pan }], {
            useNativeDriver: false,
          })(evt, { ...gestureState, dx: 0 });
        } else if (newValue > 1) {
          valueRef.current.currentValue = 1;
          onValueChange(1);
          Animated.event([null, { dx: pan }], {
            useNativeDriver: false,
          })(evt, { ...gestureState, dx: width - height / 2 });
        }
      },
      onPanResponderRelease: () => {
        pan.setValue(valueRef.current.currentValue * width);
        lastValue.current.currentValue = 0;
      },
    }),
  ).current;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.box,
          {
            width: height / 2,
            height: height / 2,
            transform: [{ translateX: pan }],
          },
        ]}
        {...panResponder.panHandlers}
      />
    </View>
  );
};

interface SliderProps {
  width: number;
  height: number;
  value: number;
  onValueChange: (item: number) => void;
  containerWidth: number; // This is the width of the screen
}

export default function Slider({
  width,
  height,
  value,
  onValueChange,
  containerWidth,
}: SliderProps) {
  return (
    <View
      style={{
        width,
        height,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width,
          height: height > 10 ? height : 10,
          backgroundColor: 'black',
        }}
      >
        <Box
          width={width}
          height={height}
          value={value}
          onValueChange={onValueChange}
          containerWidth={containerWidth}
        />
      </View>
    </View>
  );
}
