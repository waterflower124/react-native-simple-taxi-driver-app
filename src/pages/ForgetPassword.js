/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {
    Platform, 
    StyleSheet, 
    Text, 
    View,
    Image,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Keyboard,
    Dimensions,
    TouchableWithoutFeedback,
    ScrollView,
    Alert,
    FlatList,
    StatusBar,
    ImageBackground
} from 'react-native';

import 'whatwg-fetch'
import Global from '../Global/Global';


import { BallIndicator } from 'react-native-indicators';


var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var topSectionHeight = 120;
// var mainSectionHeight = deviceHeight - (120 + 40);
var mainSectionHeight = Platform.OS === 'android' ? deviceHeight - (topSectionHeight + StatusBar.currentHeight + 40) : deviceHeight - (topSectionHeight + 40);


const DismissKeyboard = ({children}) => (
    <TouchableWithoutFeedback onPress = {() => Keyboard.dismiss()}>
        {children}
    </TouchableWithoutFeedback>
);

export default class ForgetPassword extends Component {
    static navigationOptions = {
		header: null,
    };
    
    constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,

            emailSendButtonDisable: false,
            newPassword_view: false,

            verificationCode: '',
            newPassword: '',
            confirmPassword: '',

            showIndicator: false,
        };

    };


    sendEmail = async() => {
        if(this.state.email === '') {
            Alert.alert('Warning!', 'Please input your email address.');
            return;
        };
        let regExpression = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
        if(regExpression.test(this.state.email) === false) {
            Alert.alert("Warning!", 'Please input valid email address');
            return;
        };

        var formData = new FormData();
        formData.append('type', 'driver');
        formData.append('email', this.state.email);

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://cabgomaurice.com/api/forgot_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('11111  111111' + JSON.stringify(data));
                if(data.status === 'fail') {
                    if(data.error_type === 'no_user') {
                        Alert.alert('Warning!', 'Email address does not exist. Please try again.');
                    } else {
                        Alert.alert('Warning!', 'There is something wrong in server. Please try again.');
                    }
                } else if(data.status === 'success'){
                    Alert.alert('Notice!', 'We have sent verification code to your email. Please check your email inbox.');
                    self.setState({
                        emailSendButtonDisable: true,
                        newPassword_view: true,
                    });
                }
            })
            .catch(function(error) {
                console.log('11111  222222' + JSON.stringify(error));
                Alert.alert('Warning!', 'Network error.');
            })

        this.setState({showIndicator: false});

        // this.setState({
        //     emailSendButtonDisable: true,
        //     newPassword_view: true,
        // });
        // Alert.alert('Notice!', 'Verification code has sent to your email. Please check your email inbox.');
    };

    setNewPassword = async() => {
        if(this.state.verificationCode === '') {
            Alert.alert('Warning!', 'Please input verification code');
            return;
        };
        if(this.state.newPassword === '') {
            Alert.alert('Warning!', 'Please input new password');
            return;
        };
        if(this.state.newPassword !== this.state.confirmPassword) {
            Alert.alert('Warning!', 'Please does not match');
            return;
        };
        if(this.state.newPassword.length < 6) {
            AAlert.alert("Warning!", 'The Password must be at least 6 characters.');
            return;
        };

        var formData = new FormData();
        formData.append('type', 'driver');
        formData.append('email', this.state.email);
        formData.append('password', this.state.newPassword);
        formData.append('code', this.state.verificationCode);

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://cabgomaurice.com/api/change_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('11111  333333' + JSON.stringify(data));
                if(data.status === 'fail') {
                    if(data.error_type === 'no_user') {
                        Alert.alert('Warning!', 'Email address does not exist. Please try again.');
                    } else if(data.error_type === 'error_code') {
                        Alert.alert('Warning!', 'Verification code is incorrect. Please try again.');
                    } else {
                        Alert.alert('Warning!', 'There is something wrong in server. Please try again.');
                    }
                } else if(data.status === 'success'){
                    // Alert.alert('Notice!', 'Password is changed succefully.');
                    Alert.alert('Notice!', 'Password is changed succefully.',
                        [
                            // {text: 'Cancel', onPress: () => null},
                            // {text: 'Login', onPress: () => this.logInApp()}
                            {text: 'OK', onPress: () => this.gotoSignIn()}
                        ],
                        {cancelable: true}
                    );
                }
            })
            .catch(function(error) {
                console.log('11111  444444' + JSON.stringify(error));
                Alert.alert('Warning!', 'Network error.');
            })

        this.setState({showIndicator: false});

    };

    gotoSignIn = async() => {

        /*
        save account information to sqlite
        */
       this.props.navigation.navigate('SignIn', {email: this.state.email, password: this.state.password});


        // formData = new FormData();
        // formData.append('type', 'driver');
        // formData.append('email', this.state.email);
        // formData.append('password', this.state.newPassword);

        // this.setState({showIndicator: true});
        // self = this;
        // await fetch('https://cabgomaurice.com/api/login', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'multipart/form-data'
        //         },
        //         body: formData
        //     })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log('11111' + JSON.stringify(data));
        //         if(data.status === 'fail') {
        //             if(data.error_type === 'password_wrong') {
        //                 Alert.alert('Warning!', 'Password is incorrect. Please try again.')
        //             } else if(data.error_type === 'no_user') {
        //                 Alert.alert('Warning!', 'Email is incorrect. Please try again.')
        //             } else if(data.error_type === 'no_activated') {
        //                 Alert.alert('Warning!', 'Your account is not activated. Please verify your email and phone number',
        //                     [
        //                         {text: 'Cancel', onPress: () => null},
        //                         {text: 'OK', onPress: () => this.props.navigation.navigate('Verification', {email: self.state.email})}
        //                     ],
        //                     {cancelable: true}
        //                 );
        //             } else {
        //                 Alert.alert('Warning!', 'There is something wrong in server. Please try again.');
        //             }
        //         } else if(data.status === 'success') {
        //             Global.token = data.data;
        //             Global.email = self.state.email;
        //             Global.password = self.state.password;
        //             this.props.navigation.navigate('Home');
        //         }
        //     })
        //     .catch(function(error) {
        //         Alert.alert('Warning!', 'Network error.')
        //     })

        // this.setState({showIndicator: false});
    };


    render() {
        return (
            // <DismissKeyboard>
                <ImageBackground style={styles.container} source = {require('../assets/images/background.jpg')}>
                {
                    this.state.showIndicator &&
                    <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.5, zIndex: 100}}>
                        <View style = {{flex: 1}}>
                            <BallIndicator color = '#ffffff' size = {50} count = {8}/>
                        </View>
                    </View>
                }
                    <View style = {styles.pagetitle_part}>
                        <Text style = {{fontSize: 25}}> Forget Password </Text>
                        <TouchableOpacity style = {{position: 'absolute', top: 30, left: 20}} onPress = {() => this.props.navigation.navigate('SignIn')}>
                            <Image style = {{width: 15, height: 15}} resizeMode = 'contain' source = {require('../assets/images/left_arrow.png')}/>
                        </TouchableOpacity>
                    </View>
                    {
                        Platform.OS === 'ios' &&
                        <KeyboardAvoidingView style = {{width: '100%', height: mainSectionHeight}} behavior = 'padding'>
                            <ScrollView style = {{width: '100%', height: '100%'}} keyboardShouldPersistTaps = 'handled' showsVerticalScrollIndicator = {false}>
                                <View style = {styles.main_part}>
                                    <View style = {styles.component_view}>
                                        <View style = {[styles.component_titleview, {height: '30%'}]}>
                                            <Text style = {styles.component_titletext}>Please input your email</Text>
                                        </View>
                                        <View style = {[styles.component_inputview, {height: '30%'}]}>
                                            <TextInput style = {styles.component_inputtext} underlineColorAndroid = 'transparent' onChangeText = {(typedText) => {this.setState({email: typedText})}}/>
                                        </View>
                                        <View style = {{width: '100%', height: '10%'}}></View>
                                        <View style = {[styles.component_buttonview, {height: '30%'}]}>
                                            <TouchableOpacity style = {[styles.component_button, {width: '50%', opacity: this.state.emailSendButtonDisable ? 0.7 : 1}]} disabled = {this.state.emailSendButtonDisable} onPress = {() => this.sendEmail()}>
                                                <Text style = {styles.component_buttontext}>Continue</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style = {{width: '100%', height: '5%'}}></View>
                                {
                                    this.state.newPassword_view &&
                                    <View style = {{width: '95%', height: '65%'}}>
                                        <View style = {styles.component_titleview}>
                                            <Text style = {styles.component_titletext}>Please input your verification code.</Text>
                                        </View>
                                        <View style = {styles.component_inputview}>
                                            <TextInput style = {styles.component_inputtext} underlineColorAndroid = 'transparent' onChangeText = {(typedText) => {this.setState({verificationCode: typedText})}}/>
                                        </View>
                                        <View style = {styles.component_titleview}>
                                            <Text style = {styles.component_titletext}>Please input your new password.</Text>
                                        </View>
                                        <View style = {styles.component_inputview}>
                                            <TextInput style = {styles.component_inputtext} underlineColorAndroid = 'transparent'secureTextEntry={true} onChangeText = {(typedText) => {this.setState({newPassword: typedText})}}/>
                                        </View>
                                        <View style = {styles.component_titleview}>
                                            <Text style = {styles.component_titletext}>Please confirm password.</Text>
                                        </View>
                                        <View style = {styles.component_inputview}>
                                            <TextInput style = {styles.component_inputtext} underlineColorAndroid = 'transparent'secureTextEntry={true} onChangeText = {(typedText) => {this.setState({confirmPassword: typedText})}}/>
                                        </View>
                                        <View style = {{width: '100%', height: '9%'}}></View>
                                        <View style = {styles.component_buttonview}>
                                            <TouchableOpacity style = {[styles.component_button, {width: '50%'}]} onPress = {() => this.setNewPassword()}>
                                                <Text style = {styles.component_buttontext}>Set Password</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                }
                                </View>
                            </ScrollView> 
                        </KeyboardAvoidingView>
                    }
                    {
                        Platform.OS === 'android' &&
                        <ScrollView style = {{width: '100%', height: '100%'}} keyboardShouldPersistTaps = 'always'>
                            <View style = {styles.main_part}>
                                <View style = {styles.component_view}>
                                    <View style = {[styles.component_titleview, {height: '30%'}]}>
                                        <Text style = {styles.component_titletext}>Please input your email</Text>
                                    </View>
                                    <View style = {[styles.component_inputview, {height: '30%'}]}>
                                        <TextInput style = {styles.component_inputtext} underlineColorAndroid = 'transparent' onChangeText = {(typedText) => {this.setState({email: typedText})}}/>
                                    </View>
                                    <View style = {{width: '100%', height: '10%'}}></View>
                                    <View style = {[styles.component_buttonview, {height: '30%'}]}>
                                        <TouchableOpacity style = {[styles.component_button, {width: '50%', opacity: this.state.emailSendButtonDisable ? 0.7 : 1}]} disabled = {this.state.emailSendButtonDisable} onPress = {() => this.sendEmail()}>
                                            <Text style = {styles.component_buttontext}>Continue</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style = {{width: '100%', height: '5%'}}></View>
                            {
                                this.state.newPassword_view &&
                                <View style = {{width: '95%', height: '65%'}}>
                                    <View style = {styles.component_titleview}>
                                        <Text style = {styles.component_titletext}>Please input your verification code.</Text>
                                    </View>
                                    <View style = {styles.component_inputview}>
                                        <TextInput style = {styles.component_inputtext} underlineColorAndroid = 'transparent'secureTextEntry={true} onChangeText = {(typedText) => {this.setState({verificationCode: typedText})}}/>
                                    </View>
                                    <View style = {styles.component_titleview}>
                                        <Text style = {styles.component_titletext}>Please input your new password.</Text>
                                    </View>
                                    <View style = {styles.component_inputview}>
                                        <TextInput style = {styles.component_inputtext} underlineColorAndroid = 'transparent'secureTextEntry={true} onChangeText = {(typedText) => {this.setState({newPassword: typedText})}}/>
                                    </View>
                                    <View style = {styles.component_titleview}>
                                        <Text style = {styles.component_titletext}>Please confirm password.</Text>
                                    </View>
                                    <View style = {styles.component_inputview}>
                                        <TextInput style = {styles.component_inputtext} underlineColorAndroid = 'transparent'secureTextEntry={true} onChangeText = {(typedText) => {this.setState({confirmPassword: typedText})}}/>
                                    </View>
                                    <View style = {{width: '100%', height: '9%'}}></View>
                                    <View style = {styles.component_buttonview}>
                                        <TouchableOpacity style = {[styles.component_button, {width: '50%'}]} onPress = {() => this.setNewPassword()}>
                                            <Text style = {styles.component_buttontext}>Set Password</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            }
                            </View>
                        </ScrollView> 
                    }
                </ImageBackground>
            // </DismissKeyboard>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        resizeMode: 'cover',
        backgroundColor: '#000000',
    },
    pagetitle_part: {
        width: '100%',
        height: topSectionHeight,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7b731',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    main_part: {
        width: '100%',
        height: mainSectionHeight,
        // justifyContent: 'center',
        alignItems: 'center',
    },
    component_view: {
        width: '95%',
        height: '30%',
    },
    component_titleview: {
        width: '100%', 
        height: '13%', 
        justifyContent: 'center'
    },
    component_titletext: {
        fontSize: 15, 
        color: '#ffffff', 
  
    },
    component_inputview: {
        width: '100%', 
        height: '13%', 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderBottomWidth: 1, 
        borderBottomColor: '#000000'
    },
    component_inputtext: {
        width: '100%', 
        height: '100%', 
        color: '#ffffff', 
        fontSize: 15, 

    },
    component_buttonview: {
        width: '100%', 
        height: '13%', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    component_button: {
        // width: '50%', 
        height: '80%', 
        backgroundColor: '#ff4858', 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderRadius: 10
    },
    component_buttontext: {
        fontSize: 15, 
        color: '#ffffff', 

    },
});
