/*
    This file handles the logic and UI for the Catgories page.
    The UI is a FlatList of category names and a badge with it's count.
    The data is pulled from the realm storage on the user's device.
*/
'use strict';
import React, { Component } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { TabNavigator, NavigationActions } from 'react-navigation';
// UI imports
import Icon from 'react-native-vector-icons/FontAwesome';
import { List, ListItem } from 'react-native-elements';
import StatusBarBackground from './StatusBarBackground';
// realm import for json storage and use
import realm from './Realm';
// firebase analytics import
import firebase from './Firebase';

export default class Categories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cat: realm.objects('Category'),
      catSorted: [],
      realmCat: 0,
      isLoading: true,
    };

    // put a listener on realm, so that the page can render again as updates happen to the store
    realm.addListener('change', () => {
      this.setState({cat: realm.objects('Category')});
      this.sortCatList();
    });

  }
  // configuration needed for the TabNav navigation object
  static navigationOptions = {
      header: null
  };

  // when the page is ready to render, send update to firebase and sort the realm storage
  componentWillMount() {
    firebase.analytics().setCurrentScreen('Categories');
    this.sortCatList();
  }

  // remove realm listener when the page is done
  componentWillUnMount() {
    realm.removeAllListeners();
  }

  // have list with properties: id, name, count, parent
  // need to reorder with a hierarchy structure(parent and child categories) to format and display
  // can check if parent: 0 then it's a main cat, then need to group children with that main cat
  sortCatList() {
    var sortedCat = [];
    this.state.cat.map((item) => {
      if (item.parent === 0) {
        sortedCat.push(item);
        this.state.cat.filtered('parent == $0', item.id).map((_item) => {
          sortedCat.push(_item);
        })
      }
    })
    this.setState({ catSorted: sortedCat, isLoading: false });
  }

  // router for navigation to subCategory page: CategorySelection via StackNavigator with selected item parameter
  routeToContent(_item) {
    const routeToSelection = NavigationActions.navigate({
      routeName: 'CategorySelection',
      params: { catItem: _item }
    });
    // console.log(_item);
    this.props.navigation.dispatch(routeToSelection);
  }

  // creates a unique key for each item in the FlatList/VirtualizedList
  _keyExtractor = (item) => item.name.toString();

  // has padding at page top for iOS: StatusBarBackground
  // includes ActivityIndicator when content isn't ready to be rendered yet
  // FlatList is organized by parent and child categories with badge counts
  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
          <StatusBarBackground />
          <View style={{paddingLeft: 20, paddingTop: 5, backgroundColor: 'white'}}>
            <Text style={{padding: 2, width: 48, backgroundColor: 'black', color: 'white', fontSize: 14}}>ddxof:</Text>
            <Text style={{fontSize: 30}}>Categories</Text>
          </View>
          { this.state.isLoading ?  <ActivityIndicator style={{padding: 20}} /> : null }
          <List>
            <FlatList
              data={ this.state.catSorted }
              keyExtractor={ this._keyExtractor }
              renderItem = { this.renderItem }
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
