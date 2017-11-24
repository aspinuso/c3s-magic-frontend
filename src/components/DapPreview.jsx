import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Draggable from './Draggable';
import { config } from '../static/config.js';
import { Row, Col, Button } from 'reactstrap';
import Icon from 'react-fa';
export default class BasketComponent extends Component {
  constructor (props) {
    super(props);
    this.state = {
      wmsLayers: []
    };
    this.getLayersForService = this.getLayersForService.bind(this);
    this.getLayersForService(props.dapurl);
  }

  // componentWillReceiveProps (nextprops) {
  //   // this.getLayersForService(nextprops.dapurl);
  // };

  getLayersForService (dapurl) {
    this.setState({ wmsLayers:[] });
    let WMSGetCapabiltiesURL = config.backendHost + '/wms?source=' + encodeURIComponent(dapurl);
    console.log(WMSGetCapabiltiesURL);

    // eslint-disable-next-line no-undef
    var service = WMJSgetServiceFromStore(WMSGetCapabiltiesURL);

    let httpCallbackWMSCapabilities = (_layerNames, serviceURL) => {
      if (_layerNames.error) {
        console.log('error');
        return;
      }
      let wmsLayers = [];
      for (let j = 0; j < _layerNames.length; j++) {
        if (_layerNames[j].indexOf('baselayer') === -1 &&
            _layerNames[j].indexOf('overlay') === -1 &&
            _layerNames[j].indexOf('grid') === -1
            ) {
          // eslint-disable-next-line
          new WMJSLayer({
            service:WMSGetCapabiltiesURL,
            name:_layerNames[j],
            onReady: (callbackLayer) => {
              wmsLayers.push(callbackLayer);
            }
          });
        }
      }
      console.log('layerNames', wmsLayers);
      this.setState({ wmsLayers:wmsLayers });
    };
    service.getCapabilities(
      () => {
        service.getLayerNames(
          (data) => { httpCallbackWMSCapabilities(data, WMSGetCapabiltiesURL); },
          (error) => { console.log(error); });
      },
      (error) => { console.log(error); },
      true
    );
  }

  render () {
    const { closeCallback } = this.props;
    return (<div>
      { this.state.wmsLayers.map((wmjslayer, index) => {
        var wmsgetmap = wmjslayer.service +
              '&service=WMS&request=getmap&format=image/png&layers=' + encodeURIComponent(wmjslayer.name) +
              '&width=880&CRS=EPSG:4326&STYLES=&EXCEPTIONS=INIMAGE&showlegend=true';
        return (
          <div key={index} style={{ margin:'5px' }}>
            <p>{wmjslayer.name} - {wmjslayer.title}</p>
            <img
              width='380'
              height='300'
              src={wmsgetmap}
            />
          </div>);
      })}
    </div>);
  }
}

BasketComponent.propTypes = {
  dapurl: PropTypes.string,
  closeCallback: PropTypes.func
};