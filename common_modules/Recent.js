/*
    This page is the first tab to be rendered when the user opens the app.
    It handles the logic and UI for the Posts listed in a descending date format.
    The data is pulled from the realm storage on the users device.
*/
'use strict';
import React, { Component } from 'react';
import { View, Text, Image, Alert, StyleSheet, Dimensions, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TabNavigator, NavigationActions } from 'react-navigation';
// UI imports
import Icon from 'react-native-vector-icons/FontAwesome';
import StatusBarBackground from './StatusBarBackground';
import PhotoView from 'react-native-photo-view';
import { List, ListItem, Badge } from 'react-native-elements';
// storage import
import realm from './Realm';
// firebase analytics import
import firebase from './Firebase';

export default class Recent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recent: realm.objects('Post'),
      isLoading: true,
    }
    // put a listener on realm, so that the page can render again as updates happen to the store
    realm.addListener('change', () => {
      this.setState({recent: realm.objects('Post'), isLoading: false});
    });
  }

  // when the page is ready to render, send update to firebase
  componentWillMount() {
    firebase.analytics().setCurrentScreen('Recent');
  }

  // remove realm listener when the page is done
  componentWillUnMount() {
    realm.removeAllListeners();
  }

  // router for navigation to SingleView via Recent StackNavigator with selected item parameter
  routeToContent(_item) {
    const routeToSelection = NavigationActions.navigate({
      routeName: 'SingleView',
      params: { item: _item}
    });
    this.props.navigation.dispatch(routeToSelection);
  }

  //map over post object: id, title, date, modified, categories, tags
  //need to map over each category: find if parent exists and render that
  itemHeader(postItem) {
    // check to see if parent exists and render that
    var parentText = '';
    postItem.categories.map((catItem) => {
      //console.log("catItem in recent for item header", catItem);
      var parentId = catItem.parent;
      //console.log("parent id ", parentId);
      if (parentId != 0) {
        var parent = realm.objects('Category').filtered('id == $0', parentId)[0];
        var text = parent.name.toUpperCase();
        //console.log("catItem filtered parent", text);
        parentText = parentText + text + ' | ';
      }
    });
    //console.log("parentCat", parentText);
    // map over item tags and render comma delimited values
    // tag ids available and need to print name of each with comma between
    var tagText = '';
    var tagLen = postItem.tags.length;
    postItem.tags.map((_tagItem, i) => {
      var name = _tagItem.name.toUpperCase();
      tagText = tagText + name;
      if (i > 1 && i !== tagLen) { //if more than 1 but not the last item
        tagText = tagText + ', ';
      }
    })
    var headerText = "";
    //console.log("tag listing per item", tagText);
    if (parentText !== '') {
        headerText = parentText + tagText;
    } else {
        headerText = tagText;
    }
    //console.log("return for itemHeader", headerText );
    return headerText
  }

  // creates a unique key for each item in the FlatList/VirtualizedList
  _keyExtractor = (item) => item.title.toString();

  // handle image errors for Image Component via onError callback
  // utitlize image cache busting technique of appending time param to the image url
  // to have it trigger render need to update realm storage with the change
  // then the realm listener will trigger render to run again since state changed
  // add to Image in render(): onError={(error) => this.imageError(error, item) }
  imageError(error, item) {
    // FLAG console.log("recent image error ", error); console.log("recent image ref", item);
    //update url with cache busting technique
    var src = item.algorithm_url + "?" + new Date().getTime();
    //console.log("update source", src);
    realm.write(() => {
        item.algorithm_url = src;
    });
  }

  // has padding at page top for iOS: StatusBarBackground
  // includes ActivityIndicator when content isn't ready to be rendered yet
  // FlatList is organized by date of post, badges are added to posts with mulitple algorithm images
  // header added to each post in the FlatList with relevant tags and categories
  // posts with multiple algorithm images have badge overlay
  render() {
    // { this.state.isLoading ? <ActivityIndicator style={{padding: 20}} /> : null }
    var _width = Dimensions.get('window').width*.9;
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
          <StatusBarBackground />
          <View style={{paddingLeft: 20, backgroundColor: 'white'}}>
            <Text style={{padding: 2, width: 48, backgroundColor: 'black', color: 'white', fontSize: 14}}>ddxof:</Text>
            <Text style={{fontSize: 30}}>Recent</Text>
          </View>

          <List>
            <FlatList
              data={ this.state.recent }
              keyExtractor={ this._keyExtractor}
              renderItem={({item}) => (
                <View style={{justifyContent: 'center', alignItems: 'center', padding: 20}}>
                  <Text style={{color: '#979797', fontSize: 12}}>{ this.itemHeader(item) }</Text>
                  <Text style={{color: '#E00000', fontSize: 20}}>{item.title}</Text>
                  <TouchableOpacity onPress={ () => this.routeToContent(item) }>
                    <Image style={{width: _width, height: 250, borderWidth: 5, borderRadius: 5, borderColor: '#979797'}}
                           source={{uri: item.algorithm_url}} />
                   {item.algCount > 1 ? <View style={{marginTop: -30, justifyContent: 'flex-start', alignItems: 'center'}}>
                                        <Badge containerStyle={{width: 35, backgroundColor: '#3678a0'}}
                                          value={item.algCount}
                                          textStyle={{ color: 'white' }}/>
                                        </View>
                                        : null}
                  </TouchableOpacity>
                </View>
              )}
            />
          </List>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});
