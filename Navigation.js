'use strict';
import React, { Component } from 'react';
// navigation imports
import { TabNavigator, StackNavigator } from 'react-navigation';
// include layout files
import Recent from './Recent';
import Categories from './Categories';
import CategorySelection from './CategorySelection';
import TagSelection from './TagSelection';
import SingleView from './SingleView';
import Tags from './Tags';
import Search from './Search';
import Favorites from './Favorites';

export const RecentNav = StackNavigator({
  Recent: { screen: Recent },
  SingleView: { screen: SingleView },
},{
  headerMode: 'screen'
});

export const CategoryNav = StackNavigator({
  Categories: { screen: Categories },
  CategorySelection: { screen: CategorySelection },
  SingleView: { screen: SingleView },
},{
  headerMode: 'screen'
});

export const TagNav = StackNavigator({
  Tags: { screen: Tags },
  TagSelection: { screen: TagSelection },
  SingleView: { screen: SingleView },
},{
  headerMode: 'screen'
});

export const FavNav = StackNavigator({
  Favorites: { screen: Favorites },
  SingleView: { screen: SingleView },
},{
  headerMode: 'screen'
})

export const SearchNav = StackNavigator({
  Search: { screen: Search },
  CategorySelection: { screen: CategorySelection },
  SingleView: { screen: SingleView },
},{
  headerMode: 'screen'
});

// navigation objects
export const TabNav = TabNavigator({
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
