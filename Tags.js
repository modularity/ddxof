'use strict';
import React, { Component } from 'react';
import { FlatList, View, Text } from 'react-native';
import { TabNavigator, NavigationActions } from 'react-navigation';
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
    };
    console.log("tag props", props);

    realm.addListener('change', () => {
      this.setState({tags: realm.objects('Tag')}); // Update state instead of using this.forceUpdate()
    });

  }
  static navigationOptions = {
      header: null
  };

  componentWillMount() {
    firebase.analytics().setCurrentScreen('Tags');
  }

  componentWillUnMount() {
    realm.removeAllListeners();
  }

  routeToContent(_item) {
    const routeToSelection = NavigationActions.navigate({
      routeName: 'TagSelection',
      params: { tagItem: _item }
    });

    console.log("item " + _item);
    this.props.navigation.dispatch(routeToSelection);
  }

// {realm.objects('Post').filtered('categories == $0', item).length}
  renderItem = ({item, i}) => (
    <ListItem
      onPress={ () => this.routeToContent(item) }
      title={item.name}
      titleStyle={{color: '#E00000'}}
      badge={{ value: item.count, textStyle: { color: '#979797' }, containerStyle: { backgroundColor: '#fff' } }}
    />
);

//  _keyExtractor = (item, index) => item.id;
  _keyExtractor = (item) => item.name.toString();

  render() {
      console.log("len tags", this.state.tags.length);
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
              renderItem={ this.renderItem }
              keyExtractor={ this._keyExtractor } />
          </List>
  </View>
    );
  }
}
