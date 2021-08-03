import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { ViewProps } from '../../components/view';
import { PanViewDirections, TranslationLock, PanViewDismissThreshold } from './panningUtil';
export { PanViewDirections, TranslationLock, PanViewDismissThreshold };
export interface PanViewProps extends ViewProps {
    /**
     * The directions of the allowed pan (default is all)
     * Types: UP, DOWN, LEFT and RIGHT (using PanView.directions.###)
     */
    directions?: PanViewDirections[];
    /**
     * Will enable the dismissible behavior:
     * 1. Dismiss if over the threshold.
     * 2. Animate to start if no dismissed.
     */
    dismissible?: boolean;
    /**
     * Callback to the dismiss animation end
     */
    onDismiss?: () => void;
    /**
     * Should the direction of dragging be locked once a drag has started.
     */
    directionLock?: boolean;
    /**
     * Allows locking the translation when dragging or dropping.
     * i.e. cannot drag back when a certain direction is not allowed.
     * Only when dismissible={false}
     */
    translationLock?: TranslationLock;
    /**
     * Object to adjust the dismiss threshold limits (eg {x, y, velocity}).
     */
    threshold?: PanViewDismissThreshold;
    /**
     * Add a style to the container
     */
    containerStyle?: StyleProp<ViewStyle>;
}
interface StaticMembers {
    directions: typeof PanViewDirections;
    translationLock: typeof TranslationLock;
}
declare const _default: React.ComponentClass<PanViewProps & {
    useCustomTheme?: boolean | undefined;
}, any> & StaticMembers;
export default _default;
