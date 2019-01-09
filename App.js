/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TextInput, ScrollView, BackHandler, Alert} from 'react-native';

import { createStackNavigator, createAppContainer} from 'react-navigation';

import SignIn from './src/pages/SignIn';
import SignUp from './src/pages/SignUp';
import Home from './src/pages/Home';
import Setting from './src/pages/Setting';
import ForgetPassword from './src/pages/ForgetPassword';
import Verification from './src/pages/Verification';
import DriverPicture from './src/pages/DriverPicture';


const AppStackNavigation = createStackNavigator(
    {
        SignIn: {screen: SignIn},
        SignUp: {screen: SignUp},
        Home: {screen: Home},
        Setting: {screen: Setting},
        ForgetPassword: {screen: ForgetPassword},
        Verification: {screen: Verification},
        DriverPicture: {screen: DriverPicture},
    }
);

const AppContainer = createAppContainer(AppStackNavigation);

function getActiveRouteName(navigationState) {
    if (!navigationState) {
      return null;
    }
    const route = navigationState.routes[navigationState.index];
    // dive into nested navigators
    if (route.routes) {
      return getActiveRouteName(route);
    }
    return route.routeName;
} 

export default class App extends Component {

    constructor(props) {
        super(props);

    };

    componentDidMount() {
        this.backButtonListener = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    };

    handleBackButton = () => {
        Alert.alert('Notice!', 'Do you really want to exit?',
            [
                {text: 'Cancel', onPress: null},
                {text: 'Ok', onPress: () => BackHandler.exitApp()}
            ],
            { cancelable: true }
        );
        return true;
};

    render() {
        return(
            <AppContainer
                onNavigationStateChange={(prevState, currentState) => {
                    const currentScreen = getActiveRouteName(currentState);
                    if(currentScreen !== 'Home') {
                        this.backButtonListener.remove();
                    } else {
                        this.backButtonListener = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
                    }
                    // console.log(Global.currentScreen);
                }}
            />
        )
    }

}

// const AppContainer = createAppContainer(AppStackNavigation);

// export default AppContainer;
