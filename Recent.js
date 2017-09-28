'use strict';
import React, { Component } from 'react';
import { View, Text, Image, Alert, StyleSheet, Dimensions, FlatList, TouchableOpacity } from 'react-native';
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
    }

    realm.addListener('change', () => {
      this.setState({recent: realm.objects('Post')}); // Update state instead of using this.forceUpdate()
    });

  }

  componentWillMount() {
    firebase.analytics().setCurrentScreen('Recent');
  }

  componentWillUnMount() {
    realm.removeAllListeners();
  }

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

    //_keyExtractor = (item) => item.toString();
    _keyExtractor = (item) => item.title.toString();

    checkImageLinks(item) {
      if (item.algorithm_url === '') {
        console.log("empty url string for "+item.title+" "+item.algorithm_url+" "+item.id, item);
      }
    }

    imageError(error, item) {
      //var url = src.uri;
      console.log("recent image error ", error);
      console.log("recent image ref", item);
      //update url with cache busting technique
      var src = item.algorithm_url + "?" + new Date().getTime();
      console.log("update source", src);
      // need to update state to trigger render with the new value
      // can't update state object and realm query by reference
      // need to directly update the image source
      realm.write(() => {
          item.algorithm_url = src;
      });
    }
    render() {
      console.log("lenPosts", this.state.recent.length);

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
                    { this.checkImageLinks(item) }
                    <TouchableOpacity onPress={ () => this.routeToContent(item) }>
                      <Image style={{width: _width, height: 250, borderWidth: 5, borderRadius: 5, borderColor: '#979797'}}
                             source={{uri: item.algorithm_url}}
                             onError={(error) => this.imageError(error, item) }/>
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

/*
<View style={{justifyContent: 'center', alignItems: 'center', alignSelf: 'center'}}>
  <PhotoView
    source={{uri: 'https://www.rover.com/blog/wp-content/uploads/2017/06/corgi-flowers.jpg'}}
    minimumZoomScale={0.5}
    maximumZoomScale={3}
    androidScaleType="center"
    onLoad={() => console.log("Image loaded!")}
    style={{width: 300, height: 300}} />
  <Text style={{textAlign: 'center'}}>placeholder</Text>
</View>

return (
<View style={{flex: 1, backgroundColor: 'white'}}>
  <StatusBarBackground />
  <View style={{paddingLeft: 20, paddingTop: 5, backgroundColor: 'white'}}>
    <Text style={{padding: 2, width: 48, backgroundColor: 'black', color: 'white', fontSize: 14}}>ddxof:</Text>
    <Text style={{fontSize: 30}}>Recent</Text>
  </View>
  <List>
    <FlatList
      data={ this.state.recent }
      keyExtractor={ this._keyExtractor}
      renderItem={({item}) => (
        <View style={{justifyContent: 'center', alignItems: 'center', padding: 20}}>
          <Text style={{color: '#979797', fontSize: 12}}>{
            this.state.recent.filtered('parent == $0', item.id).map((_item) => {
              item.category.toUpperCase() + " "
            })
          } | {
            this.state.recent.filtered('parent == $0', item.id).map((_item) => {
              item.tags.toUpperCase() + " "
            })
          }</Text>
          <Text style={{color: '#E00000', fontSize: 20}}>{item.title}</Text>
          <TouchableOpacity onPress={ () => this.routeToContent(item, i) }>
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
}
}

var parentCategory = this.state.recent.categories.filtered('parent == $0', item.id).map((_item) => {
item.category.name.toUpperCase() + " "
})


*/
