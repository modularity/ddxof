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

// will pass reference to list to render via props: categoryName
export default class TagSelection extends Component {
  constructor(props) {
    super(props);
    var page_obj = this.props.navigation.state.params.tagItem;
    this.state = {
      // placeholder but will need to parse categoryName from props
      pageName: 'placeholder',
      tagObj: page_obj,
      post: realm.objects('Tag'),
    };
  }

  static navigationOptions = ({ navigation }) => {
    const {state, setParams} = navigation;
    return {
      title: `${navigation.state.params.tagItem.name}`,
      headerMode: 'none'
    };
  };


  componentWillMount() {
    // placeholder
  }


  // reference to item and index
  // routes to SingleView with these params to render the right item

  routeToContent(_item) {
    console.log("selection made");

    const routeToSelection = NavigationActions.navigate({
      routeName: 'SingleView',
      params: { item: _item }
    });

    console.log("TagSelection route item " + _item );
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

  _keyExtractor = (item) => item.toString();

  checkImageLinks(item) {
    if (item.algorithm_url === '') {
      console.log("empty url string for "+item.title+" "+item.algorithm_url+" "+item.id, item);
    }
  }

  imageError(error, src) {
    //var url = src.uri;
    console.log("recent image "+src+" error "+ error);
    //this.setState({uri: url});
  }

  render() {
    var item = this.state.tagObj;
    var results = realm.objects('Post').filtered('tags == $0', item);
    console.log("num of results by tag", results.length);
    var _width = Dimensions.get('window').width*.9;
// need to change the approach for queries
// initially have category object: id, name, count, parent
// need to find posts related to results
// quick implementation would be to query https://ddxof.com/wp-json/wp/v2/posts?categories=103
// parse response of item: title, category(id), tag(id)

// alt approach: parse existing store, check all posts with category.id match

/*
  start with tagObj then find posts with tag id
*/

    return (
      <View>
          <StatusBarBackground style={{backgroundColor: 'transparent'}} />
          <List>
            <FlatList
              data={ results }
              keyExtractor={ this._keyExtractor}
              renderItem={({item}) => (
                <View style={{justifyContent: 'center', alignItems: 'center', padding: 20}}>
                  <Text style={{color: '#979797', fontSize: 12}}>{ this.itemHeader(item) }</Text>
                  <Text style={{color: '#E00000', fontSize: 20}}>{item.title}</Text>
                  { this.checkImageLinks(item) }
                  <TouchableOpacity onPress={ () => this.routeToContent(item) }>
                    <Image style={{width: _width, height: 250, borderWidth: 5, borderRadius: 5, borderColor: '#979797'}}
                           source={{uri: item.algorithm_url}}
                           onError={ (error, source) => this.imageError(error, source) }/>
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

/*

// render items related to category
// top line text(grey): child categories | tag1, tag2 ...
// second line text(red): name of item
// image with grey border width 2
renderItem( _item) {
  var subCategory = "subCategory";
  var tag1 = "tag1";
  var tag2 = "tag2";
  console.log("item", _item);
  return (
    <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <Text style={{color: '#979797', fontSize: 12}}>{subCategory.toUpperCase()} | {tag1.toUpperCase()}, {tag2.toUpperCase()}</Text>
      <Text style={{color: '#E00000', fontSize: 20}}>Selected Category</Text>
      <TouchableOpacity onPress={ () => console.log("okay") }>
        <Image
          style={{width: 350, height: 250, borderWidth: 5, borderRadius: 5, borderColor: '#979797'}}
          source={{uri: 'https://facebook.github.io/react/img/logo_og.png'}}
        />
      </TouchableOpacity>
    </View>
  );
}
*/
