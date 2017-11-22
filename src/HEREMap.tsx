import { debounce, uniqueId } from "lodash";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as PropTypes from "prop-types";

import HMapMethods from "./mixins/h-map-methods";
import cache, { onAllLoad } from "./utils/cache";
import getLink from "./utils/get-link";
import getPlatform from "./utils/get-platform";
import getScriptMap from "./utils/get-script-map";
import {boxIconSVG, truckIconSVG} from './utils/icons'

// declare an interface for a simple location object
export interface HERELocation {
  lat: number;
  lon: number;
}

// declare an interface containing the required and potential
// props that can be passed to the HEREMap component
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

// declare an interface containing the potential state flags
export interface HEREMapState {
  map?: H.Map;
  behavior?: H.mapevents.Behavior;
  ui?: H.ui.UI;
  router?: H.service.RoutingService;
  startMarker?: H.map.Marker;
  endMarker?: H.map.Marker;
  route?: any;
}

// declare an interface containing the context to be passed through the heirarchy
export interface HEREMapChildContext {
  map: H.Map;
}

// export the HEREMap React Component from this module
@HMapMethods
export class HEREMap
  extends React.Component<HEREMapProps, HEREMapState>
  implements React.ChildContextProvider<HEREMapChildContext> {
  public static childContextTypes = {
    map: PropTypes.object,
  };

  // add typedefs for the HMapMethods mixin
  public getElement: () => Element;
  public getMap: () => H.Map;
  public setCenter: (point: H.geo.IPoint) => void;
  public setZoom: (zoom: number) => void;

  // add the state property
  public state: HEREMapState = {};

  private debouncedResizeMap: any;

  constructor(props: HEREMapProps, context: object) {
    super(props, context);

    // bind all event handling methods to this
    this.resizeMap = this.resizeMap.bind(this);
    this.addRoute = this.addRoute.bind(this);
    this.onRouteSuccess = this.onRouteSuccess.bind(this);
    this.onRouteError = this.onRouteError.bind(this);
    this.addRouteShapeToMap = this.addRouteShapeToMap.bind(this);
    this.removeRouteShapeFromMap = this.removeRouteShapeFromMap.bind(this);
    this.addMarkerToMap = this.addMarkerToMap.bind(this);
    this.setStartIcon = this.setStartIcon.bind(this);
    this.setEndIcon = this.setEndIcon.bind(this);
    this.removeStartIcon = this.removeStartIcon.bind(this);
    this.removeEndIcon = this.removeEndIcon.bind(this);

    // debounce the resize map method
    this.debouncedResizeMap = debounce(this.resizeMap, 200);
  }

  public getChildContext() {
    const {map} = this.state;
    return {map};
  }

  public componentDidMount() {
    onAllLoad(() => {
      const {
        appId,
        appCode,
        center,
        hidpi,
        interactive,
        controlsVisible,
        secure,
        zoom,
        start,
        end,
      } = this.props;

      // get the platform to base the maps on
      const platform = getPlatform({
        app_code: appCode,
        app_id: appId,
        useHTTPS: secure === true,
      });

      const defaultLayers = platform.createDefaultLayers({
        ppi: hidpi ? 320 : 72,
      });

      const hereMapEl = ReactDOM.findDOMNode(this);

      const map = new H.Map(
        hereMapEl.querySelector(".map-container"),
        defaultLayers.normal.map,
        {
          center,
          pixelRatio: hidpi ? 2 : 1,
          zoom,
          imprint: null
        },
      );

      const mapTileService = platform.getMapTileService({ 'type': 'base' });
      const fleetStyleLayer = mapTileService.createTileLayer(
        'maptile',
        'normal.day',
        256,
        'png8',
        { 'style': 'flame' }
      );

      map.setBaseLayer(fleetStyleLayer);

      // configure router
      const router = platform.getRoutingService();
      this.setState({
        router
      });

      console.log(this.props);

      // add markers and route if already given
      if (start) {
        console.log('TRYING TO SET START')
        this.setStartIcon(map, start, false);
      }
      if (end) {
        this.setEndIcon(map, end, false);
      }

      if (interactive !== false) {
        // make the map interactive
        // MapEvents enables the event system
        // Behavior implements default interactions for pan/zoom
        const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

        // create the default UI for the map
        const ui = H.ui.UI.createDefault(map, defaultLayers);

        if (controlsVisible === false) {
          ui.getControl('mapsettings').setVisibility(false)
          ui.getControl('scalebar').setVisibility(false)
          ui.getControl('zoom').setVisibility(false)
        }

        this.setState({
          behavior,
          ui,
        });
      }
      // make the map resize when the window gets resized
      window.addEventListener("resize", this.debouncedResizeMap);

      // attach the map object to the component"s state
      this.setState({ map });
    });
  }

  public componentWillMount() {
    const {
      secure,
    } = this.props;

    cache(getScriptMap(secure === true));
    const stylesheetUrl = `${secure === true ? "https:" : ""}//js.api.here.com/v3/3.0/mapsjs-ui.css`;
    getLink(stylesheetUrl, "HERE Maps UI");
  }

  public componentWillUnmount() {
    // make the map resize when the window gets resized
    window.removeEventListener("resize", this.debouncedResizeMap);
  }

  public componentWillUpdate(nextProps: HEREMapProps, nextState: HEREMapState, nextContext: object) {

    if (this.props.start !== nextProps.start) {
      // something has changed with the start position
      const {map} = this.state;
      if (map) {
        if (!this.props.start && nextProps.start) {
          this.setStartIcon(map, nextProps.start, true);
        } else if (this.props.start && !nextProps.start) {
          this.removeStartIcon(map);
        } else if (this.props.start && nextProps.start && this.props.start !== nextProps.start) {
          this.removeStartIcon(map);
          this.setStartIcon(map, nextProps.start, true);
        }
      }
    }

    if (this.props.end !== nextProps.end) {
      const {map} = this.state;
      if (map) {
        if (!this.props.end && nextProps.end) {
            this.setEndIcon(map, nextProps.end, false);
        } else if (this.props.end && !nextProps.end) {
          this.removeEndIcon(map);
        } else if (this.props.end && nextProps.end && this.props.end !== nextProps.end) {
          this.removeEndIcon(map);
          this.setEndIcon(map, nextProps.end, false);
        }
      }
    }

    if (nextProps.start && nextProps.end) {
      // we can draw a route, check if we should update
      if ((this.props.start !== nextProps.start) || (this.props.end !== nextProps.end)) {
        this.removeRouteShapeFromMap()
        this.addRoute(nextProps.start, nextProps.end);
      }
    } else {
      // nor oute to draw, remove if possibe
      this.removeRouteShapeFromMap()
    }
  }

  private setStartIcon(map: H.Map, location: HERELocation, shouldZoomIntoView: boolean) {
    const size = new H.math.Size(144, 100);
    const truckIcon = new H.map.Icon(truckIconSVG(), {size: size, crossOrigin: false});
    const startMarker = this.addMarkerToMap(map, location, truckIcon, shouldZoomIntoView);
    this.setState({startMarker: startMarker});
  }

  private removeStartIcon(map: H.Map) {
    const {startMarker} = this.state;
    if (startMarker) {
      map.removeObject(startMarker);
    }
    this.setState({startMarker: null});
  }

  private setEndIcon(map: H.Map, location: HERELocation, shouldZoomIntoView: boolean) {
    const size = new H.math.Size(115, 80);
    const boxIcon = new H.map.Icon(boxIconSVG(), {size: size, crossOrigin: false});
    const endMarker = this.addMarkerToMap(map, location, boxIcon, false)
    this.setState({endMarker: endMarker});
  }

  private removeEndIcon(map: H.Map) {
    const {endMarker} = this.state;
    if (endMarker) {
      map.removeObject(endMarker);
    }
    this.setState({endMarker: null});
  }

  public render() {
    const { children } = this.props;

    return (
      <div className="map-root-wrapper">
        <div
          className="map-container"
          id={`map-container-${uniqueId()}`}
          style={{height: "100%"}}
        >
          {children}
        </div>
      </div>
    );
  }

  private resizeMap() {
    const {
      map,
    } = this.state;

    if (map) {
      map.getViewPort().resize();
    }
  }

  private removeRouteShapeFromMap() {
    const { map, route } = this.state;

    if (map && route) {
      map.removeObject(route);
      this.setState({
        route: null
      });
    }
  }

  private addRoute(start: HERELocation, end: HERELocation) {
    const { router } = this.state;

    if (router) {
      const routeRequestParams = {
        mode: 'fastest;car',
        representation: 'display',
        routeattributes : 'waypoints,summary,shape,legs',
        maneuverattributes: 'direction,action',
        waypoint0: `${start.lat},${start.lon}`,
        waypoint1: `${end.lat},${end.lon}`
      };

      router.calculateRoute(
        routeRequestParams,
        this.onRouteSuccess,
        this.onRouteError
      );
    }
  }

  private onRouteSuccess(result: any) {
    const route = result.response.route[0];
    this.addRouteShapeToMap(route);
  }

  private onRouteError(error: Error) {
    console.error(error);
    alert(error);
  }

  private addRouteShapeToMap(route: any) {
    const lineString = new H.geo.LineString();
    const routeShape = route.shape;

    routeShape.forEach(function(point: any) {
      const parts = point.split(',');
      lineString.pushLatLngAlt(parts[0], parts[1]);
    });

    const polyline = new H.map.Polyline(lineString, {
      style: {
        lineWidth: 4,
        strokeColor: '#fa8872'
      }
    });

    this.setState({
      route: polyline
    });

    const { map } = this.state;

    if (map) {
      // Add the polyline to the map
      map.addObject(polyline);
      // And zoom to its bounding rectangle
      const lineBounds = polyline.getBounds();
      const factor = 1.5;
      const widthDeltaPerSide = lineBounds.getWidth() * factor / 2;
      const heightDeltaPerSide = lineBounds.getHeight() * factor / 2;
      const newBounds = new H.geo.Rect(lineBounds.getTop() - heightDeltaPerSide, lineBounds.getLeft() - widthDeltaPerSide, lineBounds.getBottom() + heightDeltaPerSide, lineBounds.getRight() + widthDeltaPerSide);
      map.setViewBounds(newBounds, true);
    }
  }

  private addMarkerToMap(map: H.Map, location: HERELocation, icon: H.map.Icon, shouldZoomToMarker: boolean): H.map.Marker {

    const hereLocation = {lat: location.lat, lng: location.lon};
    const marker = new H.map.Marker(hereLocation, {icon: icon});

      map.addObject(marker);
      if (shouldZoomToMarker) {
        map.setCenter(hereLocation, true);
        map.setZoom(17, true);
      }
      return marker
  }
}

// make the HEREMap component the default export
export default HEREMap;
