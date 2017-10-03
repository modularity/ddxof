/*
    This file handles logic and UI for a selected category item from Categories.
    The UI is a FlatList of relevant results for the selected item.
    The data is pulled from the realm storage on the user's device.
*/
'use strict';
import React, { Component } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { TabNavigator, NavigationActions } from 'react-navigation';
// UI imports
import Icon from 'react-native-vector-icons/FontAwesome';
import { List, ListItem, Badge } from 'react-native-elements';
import StatusBarBackground from './StatusBarBackground';
// realm import for json storage and use
import realm from './Realm';

export default class CategorySelection extends Component {
  constructor(props) {
    super(props);
    // recieve navigation param of selected item
    var page_obj = this.props.navigation.state.params.catItem;
    this.state = {
      catObj: page_obj,
      posts: realm.objects('Post'),
    };
  }

  // configuration needed for StackNavigator navigation object
  static navigationOptions = ({ navigation }) => {
    const {state, setParams} = navigation;
      return {
      title: `${navigation.state.params.catItem.name}`,
      headerMode: 'none'
    };
  };

  // router for navigation to SingleView via Categories StackNavigator with selected item parameter
  routeToContent(_item) {
    const routeToSelection = NavigationActions.navigate({
      routeName: 'SingleView',
      params: { item: _item }
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

  // create a unique key for each item in the FlatList/VirtualizedList
  _keyExtractor = (item) => item.title.toString();

  // handle image errors for Image Component via onError callback
  // utitlize image cache busting technique of appending time param to the image url
  imageError(error, item) {
    // FLAG console.log("cat image error ", error); console.log("cat image ref", item);
    //update url with cache busting technique
    var src = item.algorithm_url + "?" + new Date().getTime();
    // console.log("update cat img source", src);
    realm.write(() => {
        item.algorithm_url = src;
    });
  }

  // has padding at page top for iOS: StatusBarBackground
  // FlatList is list of posts related to the selected category
  // header added to each post in the FlatList with relevant tags and categories
  // posts with multiple algorithm images have badge overlay
  render() {
    var results = realm.objects('Post').filtered('categories == $0', this.state.catObj);
    // FLAG console.log("render results", results[0]); console.log("render results len", results.length);
    var _width = Dimensions.get('window').width*.9;
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
          <StatusBarBackground />
          <List>
            <FlatList
              data={ results }
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
