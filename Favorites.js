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

    realm.addListener('change', () => {
      this.setState({favs: realm.objects('Favorite')}); // Update state instead of using this.forceUpdate()
    });

  }
  static navigationOptions = {
      header: null
  };

  componentWillMount() {
    firebase.analytics().setCurrentScreen('Favorites');
  }

  componentWillUnMount() {
    realm.removeAllListeners();
  }

  routeToContent(_item) {
    const routeToSelection = NavigationActions.navigate({
      routeName: 'SingleView',
      params: { item: _item.posts }
    });

    console.log("route fav item", _item);
    this.props.navigation.dispatch(routeToSelection);
  }

  renderItem = ({item, i}) => (
    <ListItem
      onPress={ () => this.routeToContent() }
      title="okay"
    />
  );

  _keyExtractor = (item) => item.posts.title.toString();

  render() {
    var list = ["Hey", "Hello", "Goedemorgan", "Hallo" ];
    var subCategory = "subCategory";
    var tag1 = "tag1";
    var tag2 = "tag2";
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

/* demo ui render return
render() {
  var list = ["Hey", "Hello", "Goedemorgan", "Hallo" ];
  var subCategory = "subCategory";
  var tag1 = "tag1";
  var tag2 = "tag2";
  return (
    <View style={{backgroundColor: 'white'}}>
        <StatusBarBackground />
        <View style={{paddingLeft: 20, paddingTop: 5, backgroundColor: 'white'}}>
          <Text style={{padding: 2, width: 48, backgroundColor: 'black', color: 'white', fontSize: 14}}>ddxof:</Text>
          <Text style={{fontSize: 30}}>Favorites</Text>
        </View>
        <List>
          <FlatList
            data={ list }
            keyExtractor={ this._keyExtractor}
            renderItem={({item, separators}) => (
              <View style={{justifyContent: 'center', alignItems: 'center', padding: 20}}>
                <Text style={{color: '#979797', fontSize: 12}}>{subCategory.toUpperCase()} | {tag1.toUpperCase()}, {tag2.toUpperCase()}</Text>
                <Text style={{color: '#E00000', fontSize: 20}}>Selected Category</Text>
                <TouchableOpacity onPress={ () => this.routeToContent(item) }>
                  <Image style={{width: 350, height: 250, borderWidth: 5, borderRadius: 5, borderColor: '#979797'}}
                         source={{uri: 'https://facebook.github.io/react/img/logo_og.png'}}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        </List>
  </View>
  );
  */
