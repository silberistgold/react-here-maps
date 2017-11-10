/// <reference types="heremaps" />
/// <reference types="react" />
import * as React from "react";
export interface CircleProps extends H.map.Circle.Options, H.geo.IPoint {
    strokeColor?: string;
    lineWidth?: number;
    fillColor?: string;
    radius?: number;
}
export interface CircleContext {
    map: H.Map;
}
export declare class Circle extends React.Component<CircleProps, object> {
    static contextTypes: {
        map: React.Requireable<any>;
    };
    static defaultProps: {
        fillColor: string;
        lineWidth: number;
        radius: number;
        strokeColor: string;
    };
    context: CircleContext;
    private circle;
    componentWillReceiveProps(nextProps: CircleProps): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
    private addCircleToMap();
    private setCenter(point);
    private setRadius(radius);
}
export default Circle;
