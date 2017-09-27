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
