/*
    This file is the entry point of the ddxof application.
    It configures Navigation objects.
    It handles logic for pulling content from the WP REST API.
    After pulling content from the API, it saves a pruned verison to the users device.
*/

'use strict';
import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
// navigation imports
import { TabNavigator, StackNavigator } from 'react-navigation';
// include layout files to integrate with the navigation objects
import Recent from './Recent';
import Categories from './Categories';
import CategorySelection from './CategorySelection';
import TagSelection from './TagSelection';
import SingleView from './SingleView';
import Tags from './Tags';
import Search from './Search';
import Favorites from './Favorites';
// UI import for navigation objects
import Icon from 'react-native-vector-icons/FontAwesome';
// axios import for wp api call
import axios from 'axios';
// realm import for json storage and use
import realm from './Realm';
// import for date comparison in timestamp for api calls
import moment from 'moment';

export default class App extends Component {
  constructor(props) {
    super(props);
    console.log('create db', realm.path);

    this.state = {
      post_json: {}, totalPostNum: 0, realmPost: [],
      category_json: {}, totalCatNum: 0, realmCat: [],
      tag_json: {}, totalTagNum: 0, realmTag: [],
    }

    // check the initialization requirements for app when it loads
    this.checkInit();

/*
    // FLAG
    // hide yellow warning errors
    console.ignoredYellowBox = ["Warning: flattenChildren",
                                "source.uri should not be an empty string",
                                "Warning: Failed prop type: Invalid prop "];

    // FLAG
    // add to temporarily remove console statements from being run
    // will clean up and remove this and all console statements when actually ready to ship
    if((process.env.NODE_ENV || '').toLowerCase() === 'production'){
      // disable console. log in production
      console.log = function () {};
      console.info = function () {};
      console.warn = function () {};
      console.error = function () {}
      console.debug = function () {}
    }
    */
  }

  // this function evaluates if the app needs initialization data from the WP REST API
  // if it does, it creates a timestamp to log this initialization and then calls the relevant APIs to gather app data and save to device storage
  // if the app already has content, it checks the last timestamp
  // if two weeks have passed since the last timestamp, it will delete the old content and timestamp and generate new ones in their place
 checkInit() {
    var timestamps = realm.objects('Timestamp');
    var posts = realm.objects('Post');
    // verifies if the timestamp has been created before and if posts are empty
    if (timestamps.length == 0 || posts.length == 0) {
      realm.write(() => {
        realm.create('Timestamp', {
          date: new Date(),
        });
      })
      var time = realm.objects('Timestamp');
      // FLAG first instance of application console.log("init of application, timestamp len", time.length);
      this.getCategoryjson(1, 100);
      this.getTagjson(1, 100);
      this.getPOSTjson(1, 100);
    } else {
      var lastCheck = realm.objects('Timestamp')[0].date;
      // FLAG not the first instance of the application console.log("not app init, last timestamp", lastCheck);
      // check if two weeks since last api pull, if so update db
      var today = moment();
      var timeBtw = Math.abs(today.diff(lastCheck, 'days'));
      if ( timeBtw > 14 ) {
        // FLAG console.log("old cache, update content");
        realm.write(() => {
          // delete old storage
          let allPosts = realm.objects('Post');
          realm.delete(allPosts); // Deletes all posts
          let allTags = realm.objects('Tag');
          realm.delete(allTags);
          let allCat = realm.objects('Category');
          realm.delete(allCat);
          let stamp = realm.objects('Timestamp');
          realm.delete(stamp);

          // create new timestamp
          realm.create('Timestamp', {
            date: new Date(),
          });
        });
        // //pull updates and create new storage
        this.getCategoryjson(1, 100);
        this.getTagjson(1, 100);
        this.getPOSTjson(1, 100);
      }
    }
  }

  // calls WP API in batched requests via parameters: page(integers starting with 1), per_page(entries per page from 1-100)
  // checkInit() calls this with page=1 and per_page=100
  // each call compares the total number of categories(via response header 'x-wp-total') and the number it's retreived so far
  // if the number retreived < total number available, it will call the api again with updated parameters
  getCategoryjson(pages, perPage) {
    var pageParam = 'page='+pages;
    var perPageParam = 'per_page='+perPage;
    var _url = 'https://ddxof.com/wp-json/wp/v2/categories/?'+pageParam+'&'+perPageParam;
    axios({
      url: _url,
      method: 'get',
      headers: { 'Content-Type': 'application/json'}
    })
    .then((response) => {
      if (response.status === 200) {
        //FLAG save json to state
        console.log("total number of categories", response.headers['x-wp-total']);
        this.setState({
          category_json: response.data,
          totalCatNum: response.headers['x-wp-total'],
        });
      }
    })
    .catch(function(error) {
      Alert.alert("Error", "There was an error loading category content.");
    })
    .done(() => {
      // FLAG check X-WP-TOTAL in header to get total # of categories console.log("state numCats", this.state.numCats);
      if (this.state.numCats > pages*perPage) {
        var updatePage = Number(pages)+1;
        // FLAG call api again if needed to pull more in a seperate batch request console.log("call cat again", updatePage);
        this.getCategoryjson(updatePage, perPage);
      }
      this.saveCattoRealm();
    })
  }

  // this function maps over the category collection retrieved via the WP api for categories(getCategoryjson)
  // it prunes the original json response and saves relevant app information into local storage via Realm( see ./Realm for full schema)
  saveCattoRealm() {
    var catList = [];
    this.state.category_json.map((item) => {
      var cat = {
          id: item.id,
          name: item.name,
          count: item.count,
          parent: item.parent,
      };
      catList.push(cat);
      realm.write(() => { realm.create('Category', cat) })
    });
    this.setState({realmCat: realm.objects('Category')});
    // console.log("post save to realm catList", catList);
  }

  // calls WP API in batched requests via parameters: page(integers starting with 1), per_page(entries per page from 1-100)
  // checkInit() calls this with page=1 and per_page=100
  // each call compares the total number of tags(via response header 'x-wp-total') and the number it's retreived so far
  // if the number retreived < total number available, it will call the api again with updated parameters
  getTagjson(pages, perPage) {
    var pageParam = 'page='+pages;
    var perPageParam = 'per_page='+perPage;
    var _url = 'https://ddxof.com/wp-json/wp/v2/tags/?'+pageParam+'&'+perPageParam;
    axios({
      url: _url,
      method: 'get',
      headers: { 'Content-Type': 'application/json'}
    })
    .then((response) => {
      if (response.status === 200) {
        //save json to state
        this.setState({
          tag_json: response.data,
          totalTagNum: response.headers['x-wp-total'],
        });
      }
    })
    .catch(function(error) {
      Alert.alert("Error", "There was an error loading Tag content");
    })
    .done(() => {
      // FLAG check X-WP-TOTAL in header to get total # of tags console.log("state numTags", this.state.numTags);
      if (this.state.numTags > pages*perPage) {
        var updatePage = Number(pages)+1;
        // FLAG call api again if needed to pull more in a seperate batch request console.log("call tag again", updatePage);
        this.getTagjson(updatePage, perPage);
      }
      this.saveTagtoRealm();
    })
  }

  // this function maps over the tag collection retrieved via the WP api for tags(getTagjson)
  // it prunes the original json response and saves relevant app information into local storage via Realm( see ./Realm for full schema)
  saveTagtoRealm() {
    var tagList = [];
    this.state.tag_json.map((item) => {
      var tag = {
          id: item.id,
          name: item.name,
          count: item.count,
      };
      tagList.push(tag);
      realm.write(() => { realm.create('Tag', tag) })
    });
    this.setState({realmTag: realm.objects('Tag')});
    //console.log("post save to realm tagList", tagList);
  }

  // calls WP API in batched requests via parameters: page(integers starting with 1), per_page(entries per page from 1-100)
  // checkInit() calls this with page=1 and per_page=100
  // each call compares the total number of tags(via response header 'x-wp-total') and the number it's retreived so far
  // if the number retreived < total number available, it will call the api again with updated parameters
  getPOSTjson(pages, perPage) {
    var pageParam = 'page='+pages;
    var perPageParam = 'per_page='+perPage; //as of 9/11 there are 114 posts
    var _url = 'https://ddxof.com/wp-json/wp/v2/posts/?'+pageParam+'&'+perPageParam;
    axios({
      url: _url,
      method: 'get',
      headers: { 'Content-Type': 'application/json'}
    })
    .then((response) => {
      //save json to state
      this.setState({
        post_json: response.data,
        numPosts: response.headers['x-wp-total'],
      });
    })
    .catch(function(error) {
      Alert.alert("Error", "There was an error loading Post content");
    })
    .done(() => {
      // FLAG check X-WP-TOTAL in header to get total # of posts console.log("state numPosts", this.state.numPosts);
      if (this.state.numPosts > pages*perPage) {
        var updatePage = Number(pages)+1;
        // FLAG call api again if needed to pull more in a seperate batch request console.log("call post again", updatePage);
        this.getPOSTjson(updatePage, perPage);
      }
      this.savePosttoRealm();
    });
  }

  // generate total number of algorithms for this post
  // most posts only have one algorithm image, but some have up to six images
  // posts with multiple algorithms require different ui rendering, so the value is saved in the Post schema for Realm
  countAlgorithms(postItem) {
    var algCount = 1; //default: at least one, check descending
    if (postItem.algorithm_url6 !== '') {
      algCount = 6;
    } else if (postItem.algorithm_url5 !== '') {
      algCount = 5;
    } else if (postItem.algorithm_url4 !== '') {
      algCount = 4;
    } else if (postItem.algorithm_url3 !== '') {
      algCount = 3;
    } else if (postItem.algorithm_url2 !== '') {
      algCount = 2;
    } else if (postItem.algorithm_url === '') {
      algCount = 0
    }
    return algCount;
  }

  // some post titles have html string entities and need to be decoded e.g. &#8220; converts to "
  parseHtmlString(str) {
    return str.replace(/&#([0-9]{1,3});/gi, function(match, numStr) {
        var num = parseInt(numStr, 10); // read num as normal number
        return String.fromCharCode(num);
    });
  }

  // IMPORTANT: this function needs be called AFTER saving Tag and Category schemas, because we want to integrate these items into the Post schema
  // directly integrating Tag and Category objects allows us to easily query related information that important for UI, especially on the Search page
  // the function maps over the Post collection retrieved via the WP api for posts(getPOSTjson)
  // it prunes the original json response and saves relevant app information into local storage via Realm( see ./Realm for full schema)
  savePosttoRealm() {
    if (this.state.post_json !== undefined) {
      this.state.post_json.map((item) => {
        // WP API: 2017-08-14T08:00:32
        // Date(): Mon Aug 14 2017 08:00:32 GMT-0700 (PDT)
        var _date = new Date(item.date);
        var _mod = new Date(item.modified);

        // have post item(from json) it's related category and tag ids(array of ints for each)
        // need to access schema object for each category in item.categories && tag in item.tags
        var catList = [];
        item.categories.map((id) => {
          var cat = realm.objects('Category').filtered('id == $0', id);
          catList.push(cat[0]);
        })
        if (typeof(catList) === "undefined") {
          catList = [];
        }
        var tagList = [];
        item.tags.map((id) => {
          var tag = realm.objects('Tag').filtered('id == $0', id);
          if (tag[0] != null) {
            tagList.push(tag[0]);
          }
        })
        if (typeof(tagList) === "undefined") {
          tagList = [];
        }

        // generate total number of algorithms for this post
        var numAlgorithms = this.countAlgorithms(item);

        // create the schema and add the new post item to storage
        var post = {
            id: item.id,
            title: this.parseHtmlString(item.title.rendered),
            date: _date,
            modified: _mod,
            categories: catList,
            tags: tagList,
            algCount: numAlgorithms,
            algorithm_url: item.algorithm_url,
            algorithm_url2: item.algorithm_url2,
            algorithm_url3: item.algorithm_url3,
            algorithm_url4: item.algorithm_url4,
            algorithm_url5: item.algorithm_url5,
            algorithm_url6: item.algorithm_url6
        }

        // filter check to only save posts that have algorithm_url
        // some posts have text and image content, but don't have any algorithm images
        if (item.algorithm_url !== '') {
          realm.write(() => {
              realm.create('Post', post);
          })
        }
      })
      // after all records have been created, update state with the results
      this.setState({realmPost: realm.objects('Post')});
    }
  }

  render() {
    return <TabNav navigator = {this.props.navigation} />
  }
}

// navigation stack for the the Recent tab page
const RecentNav = StackNavigator({
  Recent: { screen: Recent },
  SingleView: { screen: SingleView },
},{
  headerMode: 'screen'
});

// navigation stack for the Categories page
const CategoryNav = StackNavigator({
  Categories: { screen: Categories },
  CategorySelection: { screen: CategorySelection },
  SingleView: { screen: SingleView },
},{
  headerMode: 'screen'
});

// navigation stack for the Tags page
const TagNav = StackNavigator({
  Tags: { screen: Tags },
  TagSelection: { screen: TagSelection },
  SingleView: { screen: SingleView },
},{
  headerMode: 'screen'
});

// navigation stack for the Favorites page
const FavNav = StackNavigator({
  Favorites: { screen: Favorites },
  SingleView: { screen: SingleView },
},{
  headerMode: 'screen'
})

// navigation stack for the Search page
const SearchNav = StackNavigator({
  Search: { screen: Search },
  CategorySelection: { screen: CategorySelection },
  SingleView: { screen: SingleView },
},{
  headerMode: 'screen'
});

// this is the main navigation system of the application
// it includes nested StackNavigator objects for each tab page
// IMPORTANT: this TabNavigator declaration must be listed below the stacked navigation objects it references
const TabNav = TabNavigator({
  Recent: { screen: Recent,
            navigationOptions: {
              tabBarLabel: 'Recent',
              tabBarIcon: ({ tintColor }) => <Icon name="clock-o" size={25} color={tintColor} />
            }
          },
  Categories: { screen: CategoryNav,
                navigationOptions: {
                    tabBarLabel: 'Categories',
                    tabBarIcon: ({ tintColor }) =>  <Icon name='folder-open' size={25} color={tintColor} />
                  }
                },
  Tags: { screen: TagNav,
          navigationOptions: {
            tabBarLabel: 'Tags',
            tabBarIcon: ({ tintColor }) => <Icon name="tag" size={25} color={tintColor} />
          }
        },
  Favorites: { screen: FavNav,
               navigationOptions: {
                 tabBarLabel: 'Favorites',
                 tabBarIcon: ({ tintColor }) => <Icon name="star-o" size={25} color={tintColor} />
               }
             },
  Search: { screen: SearchNav,
           navigationOptions: {
               tabBarLabel: 'Search',
               tabBarIcon: ({ tintColor }) => <Icon name="search" size={25} color={tintColor} />
            }
         },
}, {
  swipeEnabled: true,
  initialRouteName: 'Recent',
  tabBarOptions: {
    activeTintColor: '#E00000',
    inactiveTintColor: '#979797',
    labelStyle: { fontSize: 9, fontFamily: 'Arial' },
    tabStyle: { margin: 0, padding: 0 },
    showLabel: true,
    showIcon: true,
    style: {
      backgroundColor: 'white',
    },
    iconStyle: {
      height: 25, width: 25,
    },
  },
});
