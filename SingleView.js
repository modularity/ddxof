'use strict';
import React, { Component } from 'react';
import { View, Text, FlatList, Image, Alert, Share, WebView, Dimensions, TouchableOpacity, Platform } from 'react-native';
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
      // placeholder but will need to parse categoryName from props
      pageName: 'placeholder2',
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
    firebase.analytics().setCurrentScreen('algorithm view');
    var _id = this.props.navigation.state.params.item.id;
    firebase.analytics().logEvent('algorithm_view', { id: _id });
  }

  static navigationOptions = ({ navigation }) => {
    const {state, setParams} = navigation;
    return {
      title: `${navigation.state.params.item.title}`,
      tabBarVisible: false,
    };
  };

  componentWillMount() {
    this.checkandupdatefavorite();

  }

  componentDidMount() {
    this.init();
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
    }

    // save init values to state
    this.setState({ postObj: postItem,
                    postLink: postURL,
                    favIcon: _favIcon,
                    imageSrc: currentImgLink,
                    imageLinks: multiTabs,
                    renderMultiTab: _renderMultiTab });


  }

  checkandupdatefavorite() {
    // need to wait for async functions(image caching w react-native-fetch-blob)
    // will check if postObj.algCount equal flag(int) for image caching
    if (this.state.imageCacheCount == this.state.postObj.algCount) {
      // now that all images have been cached, add new favorite to storage
      var savedImages = this.state.imageLinks;
      var fav = {
          id: this.state.postObj.id,
          posts: this.state.postObj,
          algorithm_url: savedImages[0],
          algorithm_url2: savedImages[1],
          algorithm_url3: savedImages[2],
          algorithm_url4: savedImages[3],
          algorithm_url5: savedImages[4],
          algorithm_url6: savedImages[5]
      }
      realm.write(() => {
          realm.create('Favorite', fav);
      })
      console.log("save fav ",fav);
    }
  }

  // check if the current post is already a fav, then it will update image source to storage
  checkIfFav() {
    var isFav = false;
    // query Favorite schema set for a match with the current post id, either 0 or 1 response
    var fav = realm.objects('Favorite').filtered('id == $0', this.state.postObj.id)[0];
    if ( fav !== undefined ) {
      var img = fav.image;
      isFav = true;
    }
    return isFav;
  }

  // when an image tab is pressed, update state and trigger render()
  pressMultiTab(link, i) {
    var _i = i+1;
    console.log("selected image "+_i+" post id "+this.state.postObj.id);
    var updateImg = {uri: this.state.imageLinks[this.state.imageIndex]};
    console.log("image link", updateImg);
    this.setState({imageIndex: i, imageSrc: updateImg});
  }

  // going to create the greatest fake tabs ever, they're just great
  // basically they are a set of button nested about the bottom toolbar
  // each number will correspond to an alternative content
  // where onPress will update the state variable that renders the main image
  createMultiTab() {
    this.checkandupdatefavorite();
    console.log("renderMultiTab with ", this.state.imageLinks[this.state.imageIndex]);
    var render = null;
    if (this.state.renderMultiTab) {
       render = (
          <View style={{flexDirection: 'row', alignItems: 'stretch'}}>
            {this.state.imageLinks.map((altLink, i) => {
              return (
                <View key={i}>
                  <TouchableOpacity onPress={ () => this.pressMultiTab(altLink, i) }>
                    <Text style={{color: '#fff', alignSelf: 'center', textAlign: 'center'}}> Image{ i+1 } </Text>
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


  // call firebase to log event for sharing, favorite, full-text
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
      message: 'Less mnemonics, more flowcharts',
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
    console.log("image link state", imgs);
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
              console.log('progress', received / total);
          })
          .then((res) => {
            // the temp file path with file extension `png`
            // note that when using a file path as Image source on Android, must prepend "file://"" before the file path
            if (res.info().status == 200) {
              imgs[i] = Platform.OS === 'android' ? 'file://' + res.path() : '' + res.path()
              console.log("file saved to ", imgs[i]);
              // increment image cache count, flag for tracking completion of caching all images
              cacheCount = cacheCount+1;
              console.log("cacheCount", cacheCount);
            }
            this.setState({imageLinks: imgs, imageCacheCount: cacheCount});
          })
          .catch((errorMessage, statusCode) => {
            console.log("error for "+url+" with code "+ statusCode);
            console.log("error msg", errorMessage);

        })
    })
  }

  // handler for cases where the image doesn't load, especially api calls to LucidChart images which are known to fail even in the browser
  // pass image source as a parameter because some pages render multiple images per post and so the state variable for source can change
  // display an error message to the user and render a button for them to retry the image
  imageError(src) {
      console.log("image error for ", src);
      this.setState({ renderImageError: true });
  }

  reloadImage() {
      var src = this.state.imageSrc+" ";
      console.log("reload the image to ", src);
      this.setState({ renderImageError: false, imageSrc: src });
  }

  // returns either a pan/zoom of the current image(default or selected for multiple algorithms) or webview of the full post(wp)
  render() {
    var images = this.state.imageLinks;
    //console.log("image index "+this.state.imageIndex+" render image link "+images[this.state.imageIndex]);
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
      console.log("image src", this.state.imageSrc);
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
              onLoadEnd={ () => console.log("Image loaded!") }
              onError={ () => this.imageError(this.state.imageSrc) }
              style={{width: _width, height: _height }} />
            </View>
          <View style={{position: 'absolute', bottom: 40, backgroundColor: 'transparent'}}>{ this.createMultiTab() }</View>
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
        <View style={{position: 'absolute', bottom: 40, backgroundColor: 'transparent'}}>{ this.createMultiTab() }</View>
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
