# react-here-maps
> React Wrapper for the HERE Maps API for JavaScript (v3.0.12.4)

## Information

This module is still under active development. It is very basic in its current state and is subject to significant change at this time.

## Dependencies

The module will automatically load the HERE Maps API scripts and stylesheets for you. We follow this practice because the scripts themselves are split into multiple modules and we hope to conditionally load these scripts at some point in the future based on the features that the user of the module wishes to use.

## Quick Start

Declare your HERE Maps component using the following React syntax:

```js
import React, { Component } from 'react';
import { HEREMap } from 'react-here-maps';

export default class Map extends Component {
    render() {
        return (
            <HEREMap appId="{your app_id}"
                     appCode="{your app_code}"
                     center={{ lat: 0, lng: 0 }}
                     zoom={14} />
        )
    }
}
```