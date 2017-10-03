/*
Implement Firebase for automatically collected events and by manual events:
  1) Event triggered for each screen (Categories, Tags, Search, Favorites)
  2) Event triggered for algorithm view options (Sharing, Favorite, Full-text)
*/

import RNFirebase from 'react-native-firebase';

const configurationOptions = {
  debug: true
};

const firebase = RNFirebase.initializeApp(configurationOptions);

export default firebase;
