/*
    This file handles logic and UI for collection of posts that the user has selected as favorites.
    The UI is FlatList of these posts via name.
    The data is pulled from the realm storage on the user's device.
*/
'use strict';
import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { TabNavigator, NavigationActions } from 'react-navigation';
// UI imports
import Icon from 'react-native-vector-icons/FontAwesome';
import { List, ListItem } from 'react-native-elements';
import PhotoView from 'react-native-photo-view';
import StatusBarBackground from './StatusBarBackground';
// realm import for json storage
import realm from './Realm';
// firebase analytics import
import firebase from './Firebase';

export default class Favorites extends Component {
  constructor(props) {
    super(props);
    this.state = {
      favs: realm.objects('Favorite')
    }
    // put a listener on realm, so that the page can render again as updates happen to the store
    realm.addListener('change', () => {
      this.setState({favs: realm.objects('Favorite')}); // Update state instead of using this.forceUpdate()
    });
  }
  // configuration for TabNav navigation object
  static navigationOptions = {
      header: null
  };

  // when the page is ready to render, send update to firebase
  componentWillMount() {
    firebase.analytics().setCurrentScreen('Favorites');
  }

  // remove realm listener when the page is done
  componentWillUnMount() {
    realm.removeAllListeners();
  }

  // router for navigation to SingleView via Recent StackNavigator with selected item parameter
  routeToContent(_item) {
    const routeToSelection = NavigationActions.navigate({
      routeName: 'SingleView',
      params: { item: _item.posts }
    });
    this.props.navigation.dispatch(routeToSelection);
  }

  // creates a unique key for each item in the FlatList/VirtualizedList
  _keyExtractor = (item) => item.posts.title.toString();

  // has padding at page top for iOS: StatusBarBackground
  // FlatList is organized by date the post was saved as a favorite(oldest to most recent)
  // FlatList is a list of post titles
  render() {
    return (
      <View style={{backgroundColor: 'white'}}>
          <StatusBarBackground />
          <View style={{paddingLeft: 20, paddingTop: 5, backgroundColor: 'white'}}>
            <Text style={{padding: 2, width: 48, backgroundColor: 'black', color: 'white', fontSize: 14}}>ddxof:</Text>
            <Text style={{fontSize: 30}}>Favorites</Text>
          </View>
          <List>
            <FlatList
              data={ this.state.favs }
              keyExtractor={ this._keyExtractor }
              renderItem={({item}) => (
                <ListItem
                  onPress={ () => this.routeToContent(item) }
                  title={item.posts.title}
                />
              )}
            />
          </List>
    </View>
    );
  }
}
