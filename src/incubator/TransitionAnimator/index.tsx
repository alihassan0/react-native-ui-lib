/* eslint-disable react-hooks/exhaustive-deps */
import React, {PropsWithChildren, useEffect, useCallback, useImperativeHandle} from 'react';
import {View as RNView, LayoutChangeEvent} from 'react-native';
import Animated, {useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS} from 'react-native-reanimated';
import View, {ViewProps} from '../../components/view';
import {forwardRef, ForwardRefInjectedProps} from '../../commons/new';
import useHiddenLocations, {HiddenLocation} from './useHiddenLocations';
const AnimatedView = Animated.createAnimatedComponent(View);
export {HiddenLocation as TransitionLocation};

const DEFAULT_ANIMATION_VELOCITY = 300;
const DEFAULT_ANIMATION_CONFIG = {velocity: DEFAULT_ANIMATION_VELOCITY, damping: 18, stiffness: 300, mass: 0.4};

export type TransitionAnimationEndType = 'in' | 'out';

export interface TransitionAnimatorProps extends ViewProps {
  /**
   * Callback to the animation end.
   */
  onAnimationEnd?: (animationType: TransitionAnimationEndType) => void;
  /**
   * If this is given there will be an enter animation from this location.
   */
  enterFrom?: HiddenLocation;
  /**
   * If this is given there will be an exit animation to this location.
   */
  exitTo?: HiddenLocation;
}

type Props = PropsWithChildren<TransitionAnimatorProps> & ForwardRefInjectedProps;
interface Statics {
  animateOut: () => void;
}

const TransitionAnimator = (props: Props) => {
  const {
    onAnimationEnd,
    enterFrom,
    exitTo,
    forwardedRef,
    style: propsStyle,
    onLayout: propsOnLayout,
    ...others
  } = props;
  const containerRef = React.createRef<RNView>();
  const {onLayout: hiddenLocationOnLayout, hiddenLocations} = useHiddenLocations({containerRef});
  const visible = useSharedValue<boolean>(!enterFrom);

  // Has to start at {0, 0} with {opacity: 0} so layout can be measured
  const translateX = useSharedValue<number>(0);
  const translateY = useSharedValue<number>(0);

  const getLocation = (location?: HiddenLocation) => {
    return {
      x: location && ['left', 'right'].includes(location) ? hiddenLocations[location] : 0,
      y: location && ['top', 'bottom'].includes(location) ? hiddenLocations[location] : 0
    };
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}, {translateY: translateY.value}],
      // TODO: do we want to take the component's opacity here? - I think combining opacities is buggy
      opacity: Number(visible.value)
    };
  }, []);

  const animate = (to: {x: number; y: number},
    callback: (isFinished: boolean) => void,
    animationLocation?: HiddenLocation) => {
    'worklet';
    if (animationLocation) {
      if (['left', 'right'].includes(animationLocation)) {
        translateX.value = withSpring(to.x, DEFAULT_ANIMATION_CONFIG, callback);
      } else if (['top', 'bottom'].includes(animationLocation)) {
        translateY.value = withSpring(to.y, DEFAULT_ANIMATION_CONFIG, callback);
      }
    }
  };

  const onExitAnimationEnd = useCallback((isFinished: boolean) => {
    'worklet';
    if (onAnimationEnd && isFinished) {
      runOnJS(onAnimationEnd)('out');
    }
  },
  [onAnimationEnd]);

  const exit = useCallback(() => {
    'worklet';
    animate(getLocation(exitTo), onExitAnimationEnd, exitTo);
  }, [hiddenLocations, exitTo, onExitAnimationEnd]);

  const onEnterAnimationEnd = useCallback((isFinished: boolean) => {
    'worklet';
    if (onAnimationEnd && isFinished) {
      runOnJS(onAnimationEnd)('in');
    }
  },
  [onAnimationEnd]);

  const enter = useCallback(() => {
    'worklet';
    animate({x: 0, y: 0}, onEnterAnimationEnd, enterFrom);
  }, [onEnterAnimationEnd]);

  useImperativeHandle(forwardedRef,
    () => ({
      animateOut: exit // TODO: should this be renamed as well?
    }),
    [exit]);

  useEffect(() => {
    if (!hiddenLocations.isDefault && enterFrom) {
      const location = getLocation(enterFrom);
      if (['left', 'right'].includes(enterFrom)) {
        translateX.value = withTiming(location.x, {duration: 0}, enter);
      } else {
        translateY.value = withTiming(location.y, {duration: 0}, enter);
      }

      visible.value = true;
    }
  }, [hiddenLocations.isDefault]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    hiddenLocationOnLayout(event);
    propsOnLayout?.(event);
  }, []);

  return <AnimatedView {...others} onLayout={onLayout} style={[propsStyle, animatedStyle]} ref={containerRef}/>;
};

export default forwardRef<Props, Statics>(TransitionAnimator);
