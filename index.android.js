import React, { Component } from 'react';
import { AppRegistry, View, Text, } from 'react-native';

import moment from 'moment';
import axios from 'axios';
import { TabNavigator } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import realm from 'realm';
import PhotoView from 'react-native-photo-view';
import RNFetchBlob from 'react-native-fetch-blob';
import { List, ListItem } from 'react-native-elements';
import App from './common_modules/App';

class ddxof extends Component {
  render() {
    return (
      <App />
    );
  }
}

AppRegistry.registerComponent('ddxof', () => ddxof);
