'use strict';
import React, { Component } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, Image, Dimensions } from 'react-native';
import { TabNavigator, NavigationActions } from 'react-navigation';
// UI imports
import Icon from 'react-native-vector-icons/FontAwesome';
import { List, ListItem, SearchBar, Badge } from 'react-native-elements';
import StatusBarBackground from './StatusBarBackground';
// realm import for json storage and use
import realm from './Realm';
// firebase analytics import
import firebase from './Firebase';

export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
    };
  }

  static navigationOptions = {
      header: null
  };

  componentWillMount() {
    firebase.analytics().setCurrentScreen('Tags');
  }

  routeToContent(_item) {
    console.log("route search result to view");
    const routeToSelection = NavigationActions.navigate({
      routeName: 'SingleView',
      params: { item: _item}
    });
    this.props.navigation.dispatch(routeToSelection);
  }

  routeToPage(route) {
    const routeToSelection = NavigationActions.navigate({
      routeName: route,
    });

    this.props.navigation.dispatch(routeToSelection);
  }

  checkForPage(text) {
    var postResult = realm.objects('Post').filtered('title CONTAINS $0', text);
    console.log("post result", postResult[0]);
    console.log("post len", postResult.length);
/*    var catResult = realm.objects('Category').filtered('name == $0', text);
    var tagResult = realm.objects('Tag').filtered('name == $0', text);
    console.log("post result", postResult[0]);
    console.log("post len", postResult.length);
    console.log("cat len", catResult.length);
    console.log("tag result", tagResult[0]);
    console.log("type of result", typeof(postResult));
    var result = [];
    // verify each query before consolidating the set
    if (postResult.length > 0) {
      postResult.map((item) => {
        result.push(postResult);
      })
    }
    if (catResult.length > 0) {
      result.push(catResult);
    }
    if (tagResult.length > 0) {
      result.push(tagResult);
    }
*/
    // push relevant results to state to be rendered
    if (postResult[0] !== undefined && postResult.length > 0) {
      console.log("saving query result to state", postResult);
      this.setState({results: postResult});
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

  renderItem = ({item, i}) => (
    <ListItem
      onPress={ () => this.routeToContent(item) }
      title={item}
    />
  );

  _keyExtractor = (item) => item.title.toString();

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
    var _width = Dimensions.get('window').width*.9;
    return (
      <View style={{flex: 1, backgroundColor: 'white',}}>
          <StatusBarBackground />
          <View style={{paddingLeft: 20, paddingTop: 5, backgroundColor: 'white'}}>
            <Text style={{padding: 2, width: 48, backgroundColor: 'black', color: 'white', fontSize: 14}}>ddxof:</Text>
            <Text style={{fontSize: 30}}>Search</Text>
          </View>
        <SearchBar
            round
            lightTheme
            inputStyle={{backgroundColor: 'white'}}
            onChangeText={ (text) => this.checkForPage(text) }
            placeholder='Type Here...' />
            <List>
              <FlatList
                data={ this.state.results }
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
