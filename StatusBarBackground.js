/*
    This class allows iOS device to include padding at the top of each page rendered.
    This allows for the Carrier and battery information on their device not to interfer with UI in the app.
    It's imported in all pages that generate page UI.
*/
'use strict'
import React, {Component} from 'react';
import {View, Platform, StyleSheet} from 'react-native';

export default class StatusBarBackground extends Component {
  render() {
    return (
      <View style={ [styles.StatusBarBackground, this.props.style || {} ]} />
    )
  }
}
const styles = StyleSheet.create({
  StatusBarBackground: {
    height: (Platform.OS = 'ios') ? 20 : 0,
    backgroundColor: 'transparent',
  }
})
