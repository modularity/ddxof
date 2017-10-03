/*
    This file manages logic and UI for image algorithm views.
    PhotoView allows the user to pan and zoom the image.
    The TabNav is hidden on this page to facilitate a custom page tab bar added to the bottom of the page.
    The tab bar includes: Share, Favorite and Full Text.
    Share is implemented via RN's Share Component and will integrate with relevant apps that the user has installed on their device.
    Favorite will update the realm storage with this post(add or remove), send info to firebase and toggle button.
    Full Text will link the user via WebView to the affliate Wordpress post for the selected algorithm set.
*/
'use strict';
import React, { Component } from 'react';
import { View, Text, FlatList, Image, ScrollView, Alert, Share, WebView, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { TabNavigator, NavigationActions } from 'react-navigation';
// UI imports
import Icon from 'react-native-vector-icons/FontAwesome';
import PhotoView from 'react-native-photo-view';
import { List, ListItem } from 'react-native-elements';
import StatusBarBackground from './StatusBarBackground';
// realm import for json storage and use
import realm from './Realm';
// import for image caching
import RNFetchBlob from 'react-native-fetch-blob';
// firebase analytics import
import firebase from './Firebase';

// will pass reference to list to render via props: categoryName
export default class CategorySelection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      postObj: {},
      postLink: '',
      favIcon: 'star-o',
      renderWebView: false,
      renderImageError: false,
      renderMultiTab: false,
      imageSrc: '',
      imageIndex: 0,
      imageLinks: [],
      imageCacheCount: 0,
    };
  }

  // configuration needed for StackNavigator navigation object
  static navigationOptions = ({ navigation }) => {
    const {state, setParams} = navigation;
    return {
      title: `${navigation.state.params.item.title}`,
      tabBarVisible: false,
    };
  };

  componentDidMount() {
    this.init();
  }

  // when the page is ready to render, send updates to firebase
  componentWillMount() {
    firebase.analytics().setCurrentScreen('algorithm view');
    var _id = this.props.navigation.state.params.item.id;
    firebase.analytics().logEvent('algorithm_view', { id: _id });
  }

  // when page loads, parse images of the selected post and save default values to state
  // for posts with multiple images, dynamically add another TabNavigator object w links to content
  // if post is saved as fav, load images from storage
  init() {
    // parse category object from props
    var postItem = this.props.navigation.state.params.item;
    var postURL = 'https://ddxof.com/?p='+postItem.id.toString();

    // check if there are multiple algorithm images to display, if so create a new TabNavigator object
    var multiTabs = [];
    multiTabs.push(postItem.algorithm_url);
    if (postItem.algorithm_url6 !== '') {
      multiTabs.push(postItem.algorithm_url2);
      multiTabs.push(postItem.algorithm_url3);
      multiTabs.push(postItem.algorithm_url4);
      multiTabs.push(postItem.algorithm_url5);
      multiTabs.push(postItem.algorithm_url6);
    } else if (postItem.algorithm_url5 !== '') {
      multiTabs.push(postItem.algorithm_url2);
      multiTabs.push(postItem.algorithm_url3);
      multiTabs.push(postItem.algorithm_url4);
      multiTabs.push(postItem.algorithm_url5);
    } else if (postItem.algorithm_url4 !== '') {
      multiTabs.push(postItem.algorithm_url2);
      multiTabs.push(postItem.algorithm_url3);
      multiTabs.push(postItem.algorithm_url4);
    } else if (postItem.algorithm_url3 !== '') {
      multiTabs.push(postItem.algorithm_url2);
      multiTabs.push(postItem.algorithm_url3);
    } else if (postItem.algorithm_url2 !== '') {
      multiTabs.push(postItem.algorithm_url2);
    }
    var lenImg = multiTabs.length;
    var _renderMultiTab = (lenImg > 1);
    var currentImgLink = {uri: postItem.algorithm_url};

    // check if post is a favorite
    // need to query Favorite schema and check for current Post
    var _favIcon = 'star-o';
    var fav = realm.objects('Favorite').filtered('posts == $0', postItem)[0];

    if (fav !== undefined) {
      _favIcon = 'star';
      // pull images from storage, override the url links
      // currently saves correctly but need to modify the format to pull images
      // different formatting needed to support image source from uri and local storage
  /*  // bug : issue with offline images(image caching)
      // need a flag/callback to signify completion of caching all images for the selected post
      // react-native-fetch-blob didn't offer a done() or finish() callback when this app was made
      multiTabs[0] = fav.algorithm_url;
      //currentImgLink = require("'"+multiTabs[0]"'")}
      currentImgLink = {uri: fav.algorithm_url};
      if (lenImg > 1) {
        multiTabs[1] = fav.algorithm_url2;
      }
      if (lenImg > 2) {
        multiTabs[2] = fav.algorithm_url3;
      }
      if (lenImg > 3) {
        multiTabs[3] = fav.algorithm_url4;
      }
      if (lenImg > 4) {
        multiTabs[4] = fav.algorithm_url5;
      }
      if (lenImg == 6) {
        multiTabs[5] = fav.algorithm_url6;
      }
  */
    }
    // save init values to state
    this.setState({ postObj: postItem,
                    postLink: postURL,
                    favIcon: _favIcon,
                    imageSrc: currentImgLink,
                    imageLinks: multiTabs,
                    renderMultiTab: _renderMultiTab });
  }

  // saves post as favorite to realm: Favorite
  // algorithm url are optional(type: data)
  // need to ensure that algorithm_url* are saved as png format to render properly
  checkandupdatefavorite() {
      var savedImages = this.state.imageLinks;
      var fav = {
          id: this.state.postObj.id,
          posts: this.state.postObj,
    /*      algorithm_url: savedImages[0],
          algorithm_url2: savedImages[1],
          algorithm_url3: savedImages[2],
          algorithm_url4: savedImages[3],
          algorithm_url5: savedImages[4],
          algorithm_url6: savedImages[5] */
      }
      realm.write(() => {
          realm.create('Favorite', fav);
      })
      // FLAG
      console.log("save fav ",fav);
  }

  // check if the current post is already a fav
  // if so, will toggle the heart icon
  // if offline content was configured, then it would update image source from url to user's device storage
  checkIfFav() {
    var isFav = false;
    var fav = realm.objects('Favorite').filtered('id == $0', this.state.postObj.id)[0];
    if ( fav !== undefined ) {
      var img = fav.image;
      isFav = true;
    }
    return isFav;
  }

  // when an image tab is pressed, update state with new index and imageSrc to trigger render()
  pressMultiTab(link, i) {
    var _i = i+1;
    var imgSrc = this.state.imageLinks[i];
    var updateImg = {uri: imgSrc};

    // FLAG console.log("selected multitab image index", _i); console.log("update image link", imgSrc);
    this.setState({imageIndex: i, imageSrc: updateImg});
  }

  // going to create the greatest fake tabs ever, they're just great
  // basically they are a set of button nested about the bottom toolbar
  // each number will correspond to an alternative content
  // where onPress will update the state variable that renders the main image
  createMultiTab() {
    var render = null;
    if (this.state.renderMultiTab) {
       render = (
          <View style={{flexDirection: 'row', alignItems: 'stretch'}}>
            {this.state.imageLinks.map((link, i) => {
              return (
                <View key={i}>
                  <TouchableOpacity onPress={ () => this.pressMultiTab(link, i) }>
                    <Text style={{color: '#979797', alignSelf: 'center', textAlign: 'center'}}> Image{ i+1 } </Text>
                  </TouchableOpacity>
                </View>
              )
              })
             }
          </View>
       )
     }
     return render;
  }

  // calls firebase to log event for sharing, favorite, full-text
  firebaseAnalytics(_event) {
    // send firebase event to log user intent to share
    var _id = this.state.postObj.id;
    firebase.analytics().logEvent(_event, { id: _id });
  }

  // utilizes RN Share to integrate with app on the user's device: mail, fb, twitter, etc
  shareContent() {
    this.firebaseAnalytics('Share_content');
    // open ui module to allow user to share content via installed apps on their device
    Share.share({
      message: 'ddxof: Less mnemonics, more flowcharts',
      url: this.state.postLink,
      title: this.state.postObj.title
    }, {
      // Android only:
      dialogTitle: 'ddxof',
      // iOS only:
      excludedActivityTypes: [
        //'com.apple.UIKit.activity.PostToTwitter'
      ]
    })
  }

  // adds and removes favorites from the Favorite schema
  favoriteUpdate() {
    var favList = realm.objects('Favorite');
    if (this.state.favIcon === 'star') {
      // remove favorite
      this.setState({favIcon: 'star-o'});
      var starItem = realm.objects('Favorite').filtered('id == $0', this.state.postObj.id);
      realm.write(() => {
        realm.delete(starItem);
      })
    } else {
      this.firebaseAnalytics('Add_favorite');
      // update value to state to render the new fav icon
      this.setState({favIcon: 'star'});
      // image cache for post added to favorites list, makes local files for each png and saves to state asynchronously
      this.saveImagesToFile();
    }
  }

  // async api calls to save algorithm images to device storage
  // then update state with the new file location
  saveImagesToFile() {
    var imgs = this.state.imageLinks;
    // console.log("image link state", imgs);
    var cacheCount = this.state.imageCacheCount;
    //var img = this.state.imageLinks[i];
    //console.log("image link state", img);
    this.state.imageLinks.map((url, i) => {
        RNFetchBlob
          .config({
            fileCache : true,
            appendExt : 'png'
          })
          .fetch('GET', url, {
            //some headers ..
          })
          .progress((received, total) => {
              //console.log('progress', received / total);
          })
          .then((res) => {
            // the temp file path with file extension `png`
            // note that when using a file path as Image source on Android, must prepend "file://"" before the file path
            if (res.info().status == 200) {
              imgs[i] = Platform.OS === 'android' ? 'file://' + res.path() : '' + res.path()
              //console.log("file saved to ", imgs[i]);
              // increment image cache count, flag for tracking completion of caching all images
              cacheCount = cacheCount+1;
              //console.log("cacheCount", cacheCount);
            }
            this.setState({imageLinks: imgs, imageCacheCount: cacheCount});
          })
          .catch((errorMessage, statusCode) => {
            //console.log("error for "+url+" with code "+ statusCode);
            //console.log("error msg", errorMessage);
        })
    })
    this.checkandupdatefavorite();
  }

  // handler for cases where the image doesn't load, especially api calls to LucidChart images which are known to fail even in the browser
  // pass image source as a parameter because some pages render multiple images per post and so the state variable for source can change
  // display an error message to the user and render a button for them to retry the image
  imageError(src) {
      //console.log("image error for ", src);
      this.setState({ renderImageError: true });
  }

  reloadImage() {
      var src = this.state.imageSrc + "?" + new Date().getTime();
      //console.log("reload the image to ", src);
      this.setState({ renderImageError: false, imageSrc: src });
  }

  // loads full screen image with pan and zoom functionality
  // bottom tab bar to share, favorite and view full text
  // for posts with mulitiple algorithm images: there is a set of buttons to toggle between them
  render() {
    var images = this.state.imageLinks;
    var _width = Dimensions.get('window').width;
    var _height = Dimensions.get('window').height;
    if (this.state.renderWebView) {
      var _url = 'https://ddxof.com/?p='+this.state.postObj.id;
      this.firebaseAnalytics('Full_text');
      return(
        <WebView source={{ uri: _url }}
                 style={{marginTop: 20}}
        />
      );
    } else if (!this.state.renderImageError) {
      // FLAG console.log("image src", this.state.imageSrc);
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <StatusBarBackground style={{backgroundColor: 'transparent'}} />
            <View>
            <PhotoView
              source={this.state.imageSrc}
              key={this.state.imageSrc}
              minimumZoomScale={1}
              maximumZoomScale={7}
              androidScaleType="center"
              onError={ () => this.imageError(this.state.imageSrc) }
              style={{width: _width, height: _height }} />
            </View>
          <View style={{position: 'absolute', bottom: 40, backgroundColor: 'transparent'}}>
            { this.createMultiTab() }
          </View>
          <View style={{position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between'}}>
            <Icon.Button name="share" backgroundColor='transparent' color="#979797"
                         onPress={() => this.shareContent()}>
              Share
            </Icon.Button>
            <Icon.Button name={this.state.favIcon} backgroundColor='transparent' color="#979797"
                         onPress={() => this.favoriteUpdate()}>
              Favorite
            </Icon.Button>
            <Icon.Button name="file-text-o" backgroundColor='transparent' color="#979797"
                         onPress={() => this.setState({renderWebView: true})}>
              Full Text
            </Icon.Button>
          </View>
        </View>
      );
    } else {
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <StatusBarBackground style={{backgroundColor: 'transparent'}} />
          <View>
            <Icon.Button name="refresh" backgroundColor="#3b5998" onPress={ () => this.reloadImage() }>
              The image failed to load
            </Icon.Button>
          </View>
        <View style={{position: 'absolute', bottom: 40, backgroundColor: 'transparent'}}>
          { this.createMultiTab() }
        </View>
        <View style={{position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between'}}>
          <Icon.Button name="share" backgroundColor='transparent' color="#979797"
                       onPress={() => this.shareContent()}>
            Share
          </Icon.Button>
          <Icon.Button name={this.state.favIcon} backgroundColor='transparent' color="#979797"
                       onPress={() => this.favoriteUpdate()}>
            Favorite
          </Icon.Button>
          <Icon.Button name="file-text-o" backgroundColor='transparent' color="#979797"
                       onPress={() => this.setState({renderWebView: true})}>
            Full Text
          </Icon.Button>
        </View>
      </View>
    }
  }
}
