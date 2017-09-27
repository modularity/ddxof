'use strict';
import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
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
    };
    console.log("cat props", props);

    realm.addListener('change', () => {
      this.setState({cat: realm.objects('Category')});
      this.sortCatList();
    });

  }
  static navigationOptions = {
      header: null
  };

  componentWillMount() {
    firebase.analytics().setCurrentScreen('Categories');
    this.sortCatList();
  }

  componentWillUnMount() {
    realm.removeAllListeners();
  }

  sortCatList() {
    // have list with properties: id, name, count, parent
    // need to reorder with the hierarchy structure to display and format
    // can check if parent: 0 then it's a main cat
    // then need to group children with that main cat
    var sortedCat = [];

    console.log("len cat", this.state.cat.length);
    this.state.cat.map((item) => {
      if (item.parent === 0) {
        sortedCat.push(item);
        this.state.cat.filtered('parent == $0', item.id).map((_item) => {
          sortedCat.push(_item);
        })
      }
    })
    this.setState({ catSorted: sortedCat });

  }

  routeToContent(_item) {
    const routeToSelection = NavigationActions.navigate({
      routeName: 'CategorySelection',
      params: { catItem: _item }
    });

    console.log(_item);
    this.props.navigation.dispatch(routeToSelection);
  }

  renderItem = ({item, i}) => (
    <ListItem
      onPress={ () => this.routeToContent(item) }
      title={ item.parent === 0 ? item.name : "    " + item.name }
      titleStyle={{color: '#E00000'}}
      badge={{ value: item.count, textStyle: { color: '#979797' }, containerStyle: { backgroundColor: '#fff' } }}
    />
  );

  _keyExtractor = (item) => item.name.toString();

  render() {
    /*
    //<SpinnerOverlay text={'Loading...'}/>
    if (!this.state.catSorted) {
      return <Text> Loading ... </Text>
    }
    */
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
          <StatusBarBackground />
          <View style={{paddingLeft: 20, paddingTop: 5, backgroundColor: 'white'}}>
            <Text style={{padding: 2, width: 48, backgroundColor: 'black', color: 'white', fontSize: 14}}>ddxof:</Text>
            <Text style={{fontSize: 30}}>Categories</Text>
          </View>
          <List>
            <FlatList
              data={ this.state.catSorted }
              renderItem = { this.renderItem }
              keyExtractor={ this._keyExtractor }
              />
          </List>
      </View>
    );
  }
}
