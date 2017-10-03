/*
    This file handles the logic and UI for the Tags page.
    The UI is a Flatlist of tag names and a badge with it's count.
    The data is pulled from the realm storage on the user's device.
*/
'use strict';
import React, { Component } from 'react';
import { FlatList, View, Text } from 'react-native';
import { TabNavigator, NavigationActions, ActivityIndicator } from 'react-navigation';
// UI imports
import Icon from 'react-native-vector-icons/FontAwesome';
import { List, ListItem } from 'react-native-elements';
import StatusBarBackground from './StatusBarBackground';
// realm import for json storage and use
import realm from './Realm';
// firebase analytics import
import firebase from './Firebase';

export default class Tags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: realm.objects('Tag'),
      isLoading: true,
    };
    // put a listener on realm, so that the page can render again as updates happen to the store
    realm.addListener('change', () => {
      this.setState({tags: realm.objects('Tag'), isLoading: false});
    });

  }
  // configuration needed for the TabNav navigation object
  static navigationOptions = {
      header: null
  };

  // when the page is ready to render, send update to firebase
  componentWillMount() {
    firebase.analytics().setCurrentScreen('Tags');
  }

  // remove realm listener when the page is done
  componentWillUnMount() {
    realm.removeAllListeners();
  }

  // router for navigation to TagSelection via StackNavigator with selected item parameter
  routeToContent(_item) {
    const routeToSelection = NavigationActions.navigate({
      routeName: 'TagSelection',
      params: { tagItem: _item }
    });
    this.props.navigation.dispatch(routeToSelection);
  }

  // creates a unique key for each item in the FlatList/VirtualizedList
  _keyExtractor = (item) => item.name.toString();

  // has padding at the page top for iOS: StatusBarBackground
  // includes ActivityIndicator when content isn't ready to be rendered yet
  // FlatList is organized by parent and child categories with badge counts
  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
          <StatusBarBackground />
          <View style={{paddingLeft: 20, paddingTop: 5, backgroundColor: 'white'}}>
            <Text style={{padding: 2, width: 48, backgroundColor: 'black', color: 'white', fontSize: 14}}>ddxof:</Text>
            <Text style={{fontSize: 30}}>Tags</Text>
          </View>
        <List>
          <FlatList
            data={ this.state.tags }
            keyExtractor={ this._keyExtractor }
            renderItem={({item}) => (
              <ListItem
                onPress={ () => this.routeToContent(item) }
                title={ item.parent === 0 ? item.name : "    " + item.name }
                titleStyle={{color: '#E00000'}}
                badge={{ value: item.count, textStyle: { color: '#979797' }, containerStyle: { backgroundColor: '#fff' } }}
                />
              )}
            />
          </List>
      </View>
    );
  }
}
