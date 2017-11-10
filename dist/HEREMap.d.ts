/// <reference types="heremaps" />
/// <reference types="react" />
import * as React from "react";
export interface HERELocation {
    lat: number;
    lon: number;
}
export interface HEREMapProps extends H.Map.Options {
    appId: string;
    appCode: string;
    animateCenter?: boolean;
    animateZoom?: boolean;
    hidpi?: boolean;
    interactive?: boolean;
    controlsVisible?: boolean;
    secure?: boolean;
    start?: HERELocation;
    end?: HERELocation;
}
export interface HEREMapState {
    map?: H.Map;
    behavior?: H.mapevents.Behavior;
    ui?: H.ui.UI;
    router?: H.service.RoutingService;
    startMarker?: H.map.Marker;
    endMarker?: H.map.Marker;
    route?: any;
}
export interface HEREMapChildContext {
    map: H.Map;
}
export declare class HEREMap extends React.Component<HEREMapProps, HEREMapState> implements React.ChildContextProvider<HEREMapChildContext> {
    static childContextTypes: {
        map: React.Requireable<any>;
    };
    getElement: () => Element;
    getMap: () => H.Map;
    setCenter: (point: H.geo.IPoint) => void;
    setZoom: (zoom: number) => void;
    state: HEREMapState;
    private debouncedResizeMap;
    constructor(props: HEREMapProps, context: object);
    getChildContext(): {
        map: H.Map;
    };
    componentDidMount(): void;
    componentWillMount(): void;
    componentWillUnmount(): void;
    componentWillUpdate(nextProps: HEREMapProps, nextState: HEREMapState, nextContext: object): void;
    private setStartIcon(map, location, shouldZoomIntoView);
    private removeStartIcon(map);
    private setEndIcon(map, location, shouldZoomIntoView);
    private removeEndIcon(map);
    render(): JSX.Element;
    private resizeMap();
    private removeRouteShapeFromMap();
    private addRoute(start, end);
    private onRouteSuccess(result);
    private onRouteError(error);
    private addRouteShapeToMap(route);
    private addMarkerToMap(map, location, icon, shouldZoomToMarker);
}
export default HEREMap;
