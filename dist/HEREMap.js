"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
var lodash_1 = require("lodash");
var React = require("react");
var ReactDOM = require("react-dom");
var PropTypes = require("prop-types");
var h_map_methods_1 = require("./mixins/h-map-methods");
var cache_1 = require("./utils/cache");
var get_link_1 = require("./utils/get-link");
var get_platform_1 = require("./utils/get-platform");
var get_script_map_1 = require("./utils/get-script-map");
var icons_1 = require("./utils/icons");
// export the HEREMap React Component from this module
var HEREMap = /** @class */ (function (_super) {
    __extends(HEREMap, _super);
    function HEREMap(props, context) {
        var _this = _super.call(this, props, context) || this;
        // add the state property
        _this.state = {};
        // bind all event handling methods to this
        _this.resizeMap = _this.resizeMap.bind(_this);
        _this.addRoute = _this.addRoute.bind(_this);
        _this.onRouteSuccess = _this.onRouteSuccess.bind(_this);
        _this.onRouteError = _this.onRouteError.bind(_this);
        _this.addRouteShapeToMap = _this.addRouteShapeToMap.bind(_this);
        _this.removeRouteShapeFromMap = _this.removeRouteShapeFromMap.bind(_this);
        _this.addMarkerToMap = _this.addMarkerToMap.bind(_this);
        _this.setStartIcon = _this.setStartIcon.bind(_this);
        _this.setEndIcon = _this.setEndIcon.bind(_this);
        _this.removeStartIcon = _this.removeStartIcon.bind(_this);
        _this.removeEndIcon = _this.removeEndIcon.bind(_this);
        // debounce the resize map method
        _this.debouncedResizeMap = lodash_1.debounce(_this.resizeMap, 200);
        return _this;
    }
    HEREMap.prototype.getChildContext = function () {
        var map = this.state.map;
        return { map: map };
    };
    HEREMap.prototype.componentDidMount = function () {
        var _this = this;
        cache_1.onAllLoad(function () {
            var _a = _this.props, appId = _a.appId, appCode = _a.appCode, center = _a.center, hidpi = _a.hidpi, interactive = _a.interactive, controlsVisible = _a.controlsVisible, secure = _a.secure, zoom = _a.zoom, start = _a.start, end = _a.end;
            // get the platform to base the maps on
            var platform = get_platform_1["default"]({
                app_code: appCode,
                app_id: appId,
                useHTTPS: secure === true
            });
            var defaultLayers = platform.createDefaultLayers({
                ppi: hidpi ? 320 : 72
            });
            var hereMapEl = ReactDOM.findDOMNode(_this);
            var map = new H.Map(hereMapEl.querySelector(".map-container"), defaultLayers.normal.map, {
                center: center,
                pixelRatio: hidpi ? 2 : 1,
                zoom: zoom,
                imprint: null
            });
            var mapTileService = platform.getMapTileService({ 'type': 'base' });
            var fleetStyleLayer = mapTileService.createTileLayer('maptile', 'normal.day', 256, 'png8');
            map.setBaseLayer(fleetStyleLayer);
            // configure router
            var router = platform.getRoutingService();
            _this.setState({
                router: router
            });
            // add markers and route if already given
            if (start) {
                _this.setStartIcon(map, start, false);
            }
            if (end) {
                _this.setEndIcon(map, end, false);
            }
            if (interactive !== false) {
                // make the map interactive
                // MapEvents enables the event system
                // Behavior implements default interactions for pan/zoom
                var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
                // create the default UI for the map
                var ui = H.ui.UI.createDefault(map, defaultLayers);
                if (controlsVisible === false) {
                    ui.getControl('mapsettings').setVisibility(false);
                    ui.getControl('scalebar').setVisibility(false);
                    ui.getControl('zoom').setVisibility(false);
                }
                _this.setState({
                    behavior: behavior,
                    ui: ui
                });
            }
            // make the map resize when the window gets resized
            window.addEventListener("resize", _this.debouncedResizeMap);
            // attach the map object to the component"s state
            _this.setState({ map: map });
        });
    };
    HEREMap.prototype.componentWillMount = function () {
        var secure = this.props.secure;
        cache_1["default"](get_script_map_1["default"](secure === true));
        var stylesheetUrl = (secure === true ? "https:" : "") + "//js.api.here.com/v3/3.0/mapsjs-ui.css";
        get_link_1["default"](stylesheetUrl, "HERE Maps UI");
    };
    HEREMap.prototype.componentWillUnmount = function () {
        // make the map resize when the window gets resized
        window.removeEventListener("resize", this.debouncedResizeMap);
    };
    HEREMap.prototype.componentWillUpdate = function (nextProps, nextState, nextContext) {
        if (this.props.start !== nextProps.start) {
            // something has changed with the start position
            var map = this.state.map;
            if (map) {
                if (!this.props.start && nextProps.start) {
                    this.setStartIcon(map, nextProps.start, true);
                }
                else if (this.props.start && !nextProps.start) {
                    this.removeStartIcon(map);
                }
                else if (this.props.start && nextProps.start && this.props.start !== nextProps.start) {
                    this.removeStartIcon(map);
                    this.setStartIcon(map, nextProps.start, true);
                }
            }
        }
        if (this.props.end !== nextProps.end) {
            var map = this.state.map;
            if (map) {
                if (!this.props.end && nextProps.end) {
                    this.setEndIcon(map, nextProps.end, false);
                }
                else if (this.props.end && !nextProps.end) {
                    this.removeEndIcon(map);
                }
                else if (this.props.end && nextProps.end && this.props.end !== nextProps.end) {
                    this.removeEndIcon(map);
                    this.setEndIcon(map, nextProps.end, false);
                }
            }
        }
        if (nextProps.start && nextProps.end) {
            // we can draw a route, check if we should update
            if ((this.props.start !== nextProps.start) || (this.props.end !== nextProps.end)) {
                this.removeRouteShapeFromMap();
                this.addRoute(nextProps.start, nextProps.end);
            }
        }
        else {
            // nor oute to draw, remove if possibe
            this.removeRouteShapeFromMap();
        }
    };
    HEREMap.prototype.setStartIcon = function (map, location, shouldZoomIntoView) {
        var size = new H.math.Size(144, 100);
        var truckIcon = new H.map.Icon(icons_1.truckIconSVG(), { size: size, crossOrigin: false });
        var startMarker = this.addMarkerToMap(map, location, truckIcon, shouldZoomIntoView);
        this.setState({ startMarker: startMarker });
    };
    HEREMap.prototype.removeStartIcon = function (map) {
        var startMarker = this.state.startMarker;
        if (startMarker) {
            map.removeObject(startMarker);
        }
        this.setState({ startMarker: null });
    };
    HEREMap.prototype.setEndIcon = function (map, location, shouldZoomIntoView) {
        var size = new H.math.Size(115, 80);
        var boxIcon = new H.map.Icon(icons_1.boxIconSVG(), { size: size, crossOrigin: false });
        var endMarker = this.addMarkerToMap(map, location, boxIcon, false);
        this.setState({ endMarker: endMarker });
    };
    HEREMap.prototype.removeEndIcon = function (map) {
        var endMarker = this.state.endMarker;
        if (endMarker) {
            map.removeObject(endMarker);
        }
        this.setState({ endMarker: null });
    };
    HEREMap.prototype.render = function () {
        var children = this.props.children;
        return (React.createElement("div", { className: "map-root-wrapper" },
            React.createElement("div", { className: "map-container", id: "map-container-" + lodash_1.uniqueId(), style: { height: "100%" } }, children)));
    };
    HEREMap.prototype.resizeMap = function () {
        var map = this.state.map;
        if (map) {
            map.getViewPort().resize();
        }
    };
    HEREMap.prototype.removeRouteShapeFromMap = function () {
        var _a = this.state, map = _a.map, route = _a.route;
        if (map && route) {
            map.removeObject(route);
            this.setState({
                route: null
            });
        }
    };
    HEREMap.prototype.addRoute = function (start, end) {
        var router = this.state.router;
        if (router) {
            var routeRequestParams = {
                mode: 'fastest;car',
                representation: 'display',
                routeattributes: 'waypoints,summary,shape,legs',
                maneuverattributes: 'direction,action',
                waypoint0: start.lat + "," + start.lon,
                waypoint1: end.lat + "," + end.lon
            };
            router.calculateRoute(routeRequestParams, this.onRouteSuccess, this.onRouteError);
        }
    };
    HEREMap.prototype.onRouteSuccess = function (result) {
        var route = result.response.route[0];
        this.addRouteShapeToMap(route);
    };
    HEREMap.prototype.onRouteError = function (error) {
        console.error(error);
        alert(error);
    };
    HEREMap.prototype.addRouteShapeToMap = function (route) {
        var lineString = new H.geo.LineString();
        var routeShape = route.shape;
        routeShape.forEach(function (point) {
            var parts = point.split(',');
            lineString.pushLatLngAlt(parts[0], parts[1]);
        });
        var polyline = new H.map.Polyline(lineString, {
            style: {
                lineWidth: 4,
                strokeColor: '#fa8872'
            }
        });
        this.setState({
            route: polyline
        });
        var map = this.state.map;
        if (map) {
            // Add the polyline to the map
            map.addObject(polyline);
            // And zoom to its bounding rectangle
            var lineBounds = polyline.getBounds();
            var factor = 1.5;
            var widthDeltaPerSide = lineBounds.getWidth() * factor / 2;
            var heightDeltaPerSide = lineBounds.getHeight() * factor / 2;
            var newBounds = new H.geo.Rect(lineBounds.getTop() - heightDeltaPerSide, lineBounds.getLeft() - widthDeltaPerSide, lineBounds.getBottom() + heightDeltaPerSide, lineBounds.getRight() + widthDeltaPerSide);
            map.setViewBounds(newBounds, true);
        }
    };
    HEREMap.prototype.addMarkerToMap = function (map, location, icon, shouldZoomToMarker) {
        var hereLocation = { lat: location.lat, lng: location.lon };
        var marker = new H.map.Marker(hereLocation, { icon: icon });
        map.addObject(marker);
        if (shouldZoomToMarker) {
            map.setCenter(hereLocation, true);
            map.setZoom(17, true);
        }
        return marker;
    };
    HEREMap.childContextTypes = {
        map: PropTypes.object
    };
    HEREMap = __decorate([
        h_map_methods_1["default"]
    ], HEREMap);
    return HEREMap;
}(React.Component));
exports.HEREMap = HEREMap;
// make the HEREMap component the default export
exports["default"] = HEREMap;
