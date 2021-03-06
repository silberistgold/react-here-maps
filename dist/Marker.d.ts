/// <reference types="heremaps" />
/// <reference types="react" />
import * as React from "react";
import * as PropTypes from "prop-types";
export interface MarkerProps extends H.map.Marker.Options, H.geo.IPoint {
    bitmap?: string;
}
export interface MarkerContext {
    map: H.Map;
}
export declare class Marker extends React.Component<MarkerProps, object> {
    static contextTypes: {
        map: PropTypes.Requireable<any>;
    };
    context: MarkerContext;
    private marker;
    componentWillReceiveProps(nextProps: MarkerProps): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
    private addMarkerToMap();
    private setPosition(point);
}
export default Marker;
