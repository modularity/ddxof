# ddxof

ddxof (Differential Diagnosis of) is a library of emergency medicine decision support algorithms and the official companion mobile application to ddxof.com. Explore hundreds of carefully-curated diagnostic and management algorithms for common presentations in the emergency department.

ddxof algorithms are intended to serve as rapid evaluation tools for all providers in the emergency department including physicians, advanced practice providers, nurses and ancillary staff. The broad range of presenting complaints to the emergency department means that ddxof algorithms cover topics in internal medicine (including cardiology, endocrinology, pulmonary critical care), neurology, obstetrics and gynecology, pediatrics, surgery and more.

ddxof algorithms are also simple and accessible rapid teaching instruments for resident physicians, medical students and other learners - guiding trainees with the development of reusable cognitive constructs for critical emergency medicine topics.

App Features:
- Browse algorithms by specialty or signs and symptoms
- Search by keywords
- Save frequently-used algorithms for offline use with "Favorites"
- Share algorithms with friends and coworkers

Description Short: ddxof (Differential Diagnosis of) is a library of emergency medicine algorithms.

Keywords: Emergency Medicine, Clinical Decision Support, Medicine, Algorithm

Categories: Medical

Support URL: https://ddxof.com/app/

Copyright: Dr. Tom Fadial

App Developer: Lauren Dunlap, Programmer Analyst III, CTRL | DGIT | David Geffen School of Medicine at UCLA

<<<<<<< HEAD
#INSTALLATION:

=======


## INSTALLATION:

>>>>>>> 27cc64811044a7d33bf293d018fd919bc5cf7e12
1. Follow [instructions](https://facebook.github.io/react-native/docs/getting-started.html) to setup a React-Native project environment with Native Code.

2. Add existing project files to your local copy and overwrite configuration files.

3. Run 'npm install' to get project dependencies listed in package.json

4. Run 'react-native link'

5. Run 'react-native unlink react-native-firebase' because Firebase@2.x.x requires manual configuration.

6. Configure [Firebase](https://invertase.io/react-native-firebase/#/v2/initial-setup) within the project. This includes configuring cocoapods for iOS. Note that the Xcode project should now be opened under the .xcworkspace extension file

7. Add project configurations: iOS certificates, firebase files: google-services.json and googleservice-info.plist

7. Connect a physical device via USB or open an emulator, then run either 'react-native run-android' or 'react-native run-ios' to run on an emulator or device.

8. To trail device logs, run 'react-native log-android' or 'react-native log-ios'


<<<<<<< HEAD
#BUILD OFFLINE BUNDLE FOR iOS:

=======

## BUILD OFFLINE BUNDLE FOR iOS:
>>>>>>> 27cc64811044a7d33bf293d018fd919bc5cf7e12
      This will allow for testing on actual iPhones and iPads without TestFlight or the App Store

1. Update Xcode scheme for project
       Product -> Scheme -> Edit Scheme -> Run -> Info -> Build Configuration -> Release

2. Ensure certificates are set for Development

3. Finally clean and rebuild the project. A node server will still open up to build the project.
        Note can also run 'react-native run-ios --variant=release'


<<<<<<< HEAD
#SUBMIT RELEASE BUILD TO APP STORE:

=======

## SUBMIT RELEASE BUILD TO APP STORE:
>>>>>>> 27cc64811044a7d33bf293d018fd919bc5cf7e12

1. Update Xcode scheme for project
       Product -> Scheme -> Edit Scheme -> Run -> Info -> Build Configuration -> Release

2. Ensure certificates are set for Distribution

3. Each new archive sent to the App Store must have an incremental version number e.g. 1.0 -> 1.01
        Target ddxof -> General -> Identity -> Version

4. Update platform to 'Generic iOS Device'

5. Clean the project

6. Product -> Archive

7. Window -> Organizer -> Archives -> ddxof -> select version -> Upload to App store
      The process may take a few minutes to complete.

8. The new binary will become available in iTunesConnect.


<<<<<<< HEAD
#BUILD OFFLINE BUNDLE FOR ANDROID(Signed APK):


=======

## BUILD OFFLINE BUNDLE FOR ANDROID(Signed APK):

>>>>>>> 27cc64811044a7d33bf293d018fd919bc5cf7e12
1. Follow [guidelines](https://facebook.github.io/react-native/docs/signed-apk-android.html) for generating a signing key, setting up gradle variables and add signing config to gradle

2. Generate the release APK by running 'cd android && ./gradlew assembleRelease'
      Note that it is beneficial to run './gradlew clean' first to ensure a clean build

3. Run 'react-native run-android --variant=release'


<<<<<<< HEAD
#SUBMIT SIGNED APK TO GOOGLE PLAY CONSOLE:

=======

## SUBMIT SIGNED APK TO GOOGLE PLAY CONSOLE:
>>>>>>> 27cc64811044a7d33bf293d018fd919bc5cf7e12

1. Generate signed APK file

2. The generated APK is found under android/app/build/outputs/apk/app-release.apk

3. Upload this file to Google Play Console.
