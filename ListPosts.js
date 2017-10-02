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

export default class ListPosts extends Component {

  routeToContent(_item) {
    const routeToSelection = NavigationActions.navigate({
      routeName: 'SingleView',
      params: { item: _item}
    });

    this.props.navigation.dispatch(routeToSelection);
  }

  checkImageLinks(item) {
    if (item.algorithm_url === '') {
      console.log("empty url string for "+item.title+" "+item.algorithm_url+" "+item.id, item);
    }
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

  _keyExtractor = (item) => item.title.toString();

  export default renderList(results) {
    var _width = Dimensions.get('window').width*.9;
    return (<List>
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
                       source={{uri: item.algorithm_url}}/>
               {item.algCount > 1 ? <View style={{alignItems: 'flex-end'}}>
                                    <Badge containerStyle={{width: 40, backgroundColor: '#3678a0'}}
                                      value={item.algCount}
                                      textStyle={{ color: 'white' }}/>
                                    </View>
                                    : null}
              </TouchableOpacity>
            </View>
          )}
        />
      </List>
    )
  }

}
