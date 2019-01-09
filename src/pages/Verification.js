/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, 
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
    ImageBackground
} from 'react-native';

import 'whatwg-fetch'
import Global from '../Global/Global';


import { BallIndicator } from 'react-native-indicators';
// import { ImagePicker, Permissions, ImageManipulator, FileSystem } from 'expo';

import PhoneInput from '../components/PhoneNumberInput';
import ModalPickerImage from '../components/ModalPickerImage';
import KeyboardShift from '../components/KeyboardShift/KeyboardShift'

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var topSectionHeight = 120;
var mainSectionHeight = deviceHeight - (120 + 40);

const DismissKeyboard = ({children}) => (
    <TouchableWithoutFeedback onPress = {() => Keyboard.dismiss()}>
        {children}
    </TouchableWithoutFeedback>
);

const options = {
    title: 'Select Picture...',
    // customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

export default class Verification extends Component {
    static navigationOptions = {
		header: null,
    };
    
    constructor(props) {
        super(props);
        
        this.state = {
            showIndicator: false,
            isReady: false,
            email: this.props.navigation.state.params.email,
            emailVerificationCode: '',
            boolean_emailverify: false, ///if email is verified the true, else false

            phone_number: '',
            send_phonenumber: false, ////  if send phone number is success the true, else false
            phoneVerificationCode: '',
            boolean_phonenumber: false,  ///if phone is verifies then true, lese false

            pickerCountry: null,

        };

        this.onPressFlag = this.onPressFlag.bind(this);
        this.selectCountry = this.selectCountry.bind(this);
    };

    componentDidMount() {
        // this.setState({
        //     pickerCountry: this.phone.getPickerData(),
        // });
    }

    onPressFlag() {
        this.myCountryPicker.open();
    }

    selectCountry(country) {
        this.phone.selectCountry(country.iso2);
    }

    emailVerification = async() => {
        if(this.state.emailVerificationCode === '') {
            Alert.alert('Warning!', 'Please input email verification code');
            return;
        };

        var formData = new FormData();
        formData.append('type', 'driver');
        formData.append('email', this.state.email);
        formData.append('code', this.state.emailVerificationCode);

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://cabgomaurice.com/api/email_verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('111111: email response' + JSON.stringify(data));
                if(data.status === 'fail') {
                    Alert.alert('Warning!', 'Your verification code is incorrect. Please try again.')
                } else if(data.status === 'success'){
                    self.setState({
                        boolean_emailverify: true,
                    }, () => {self.setState({pickerCountry: self.phone.getPickerData()})});
                }
            })
            .catch(function(error) {
                Alert.alert('Warning!', 'Network error.');
            })

        this.setState({showIndicator: false});

    };

    sendPhoneNumber = async() => {
        
        var phone_number = this.phone.getValue();
        if(!this.phone.isValidNumber()) {
            Alert.alert('Warning!', 'Please input valid phone number');
            return;
        }
       
        // if(phone_number.length < 3) {
        //     Alert.alert('Warning!', 'Please input your phone number');
        //     return;
        // };
        this.setState({phone_number: phone_number});

        formData = new FormData();
        formData.append('type', 'driver');
        formData.append('email', this.state.email);
        formData.append('phone_number', phone_number);
        
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://cabgomaurice.com/api/sms_verify_code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
        
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('111111: phone verification code' + JSON.stringify(data));
                if(data.status === 'fail') {
                    Alert.alert('Warning!', 'There is something wrong in server. Please try again.');
                } else if(data.status === 'success'){
                    self.setState({send_phonenumber: true});
                    // Alert.alert('rrrrrr', JSON.stringify(data));
                    Alert.alert('Notice!', 'We sent verification code to your phone SMS. Please check your phone SMS.');
                }
            })
            .catch(function(error) {
                Alert.alert('Warning!', 'Network error.');
            })

        this.setState({showIndicator: false});
        
    };

    verifyPhoneNumber = async() => {
        Keyboard.dismiss();
        if(this.state.phoneVerificationCode === '') {
            Alert.alert('Warning!', 'Please input your phone verification code.');
            return;
        };

        formData = new FormData();
        formData.append('type', 'driver');
        formData.append('email', this.state.email);
        formData.append('phone_number', this.state.phone_number);
        formData.append('code', this.state.phoneVerificationCode);

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://cabgomaurice.com/api/sms_verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                
                if(data.status === 'fail') {
                    Alert.alert('Warning!', 'Your verification code is incorrect. Please try again');
                } else if(data.status === 'success'){
                    self.setState({boolean_phonenumber: true});
                    // Alert.alert('Welcome!!!', 'Registration Successful!!!',
                    //     [
                    //         // {text: 'Cancel', onPress: () => this.props.navigation.navigate('SignIn')},
                    //         // {text: 'Login', onPress: () => this.logInApp()}
                    //         {text: 'OK', onPress: () => this.gotoSignIn()}
                    //     ],
                    //     {cancelable: true}
                    // );
                    this.props.navigation.navigate('DriverPicture', {email: self.state.email});
                }
            })
            .catch(function(error) {
                Alert.alert('Warning!', 'Network error.');
            })

        this.setState({showIndicator: false});
        
    };

    gotoSignIn = async() => {

       this.props.navigation.navigate('SignIn', {email: Global.email, password: Global.password});

    }

    render() {
        return (
            <DismissKeyboard>
                <View style={styles.container}>
                    {
                        this.state.showIndicator &&
                        <View style = {{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', opacity: 0.5, zIndex: 100}}>
                            <View style = {{flex: 1}}>
                                <BallIndicator color = '#ffffff' size = {50} count = {8}/>
                            </View>
                        </View>
                    }
                    <View style = {styles.pagetitle_part}>
                        <Text style = {{fontSize: 25,}}> Register User </Text>
                        <TouchableOpacity style = {{position: 'absolute', top: 30, left: 20}} onPress = {() => this.props.navigation.navigate('SignUp')}>
                            <Image style = {{width: 15, height: 15}} resizeMode = 'contain' source = {require('../assets/images/left_arrow.png')}/>
                        </TouchableOpacity>
                        <TouchableOpacity style = {{position: 'absolute', top: 30, right: 20}} onPress = {() => this.props.navigation.navigate('SignIn')}>
                            <Text style = {{fontSize: 13}}>SingIn</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {styles.main_part}>
                        <KeyboardShift>
                        {() => (
                            <View >
                                    {/* <KeyboardAvoidingView behavior = 'padding' enabled>
                                    <ScrollView style = {{width: deviceWidth}} keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator = {false}> */}
                                        <View style = {styles.component_input}>
                                            <View style = {styles.title_view}>
                                                <Text style = {styles.title_text}>Your Registered Email Address</Text>
                                            </View>
                                            <View style = {styles.input_view}>
                                                <Text style = {[styles.input_text, {color: '#808080'}]}>{this.state.email}</Text>
                                            </View>
                                        </View>
                                        <View style = {styles.component_input}>
                                            <View style = {styles.title_view}>
                                                <Text style = {styles.title_text}>Please input email verification code</Text>
                                            </View>
                                            <View style = {styles.input_view}>
                                                <TextInput style = {styles.input_text} onChangeText = {(typedText) => {this.setState({emailVerificationCode: typedText})}}/>
                                            </View>
                                        </View>
                                        <View style = {styles.button_view}>
                                            <TouchableOpacity style = {[styles.button_style, this.state.boolean_emailverify ? {opacity: 0.7} : {opacity: 1}]} disabled = {this.state.boolean_emailverify} onPress = {() => this.emailVerification()}>
                                                <Text style = {styles.button_text}>Email Verify</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {
                                            this.state.boolean_emailverify &&
                                            <View style = {styles.component_input}>
                                                <View style = {styles.title_view}>
                                                    <Text style = {styles.title_text}>Please input your phone number</Text>
                                                </View>
                                                <View style = {styles.input_view}>
                                                    {/* <TextInput style = {styles.input_text} keyboardType={'phone-pad'} onChangeText = {(typedText) => {this.setState({phone_number: typedText})}}/> */}
                                                    <PhoneInput
                                                        ref={(ref) => {
                                                            this.phone = ref;
                                                        }}
                                                        onPressFlag={this.onPressFlag}
                                                        initialCountry = {'mu'}
                                                    />

                                                    <ModalPickerImage
                                                        ref={(ref) => {
                                                            this.myCountryPicker = ref;
                                                        }}
                                                        data={this.state.pickerCountry}
                                                        onChange={(country) => {
                                                            this.selectCountry(country);
                                                        }}
                                                        cancelText="Cancel"
                                                    />
                                                </View>
                                            </View>
                                        }
                                        {
                                            this.state.boolean_emailverify &&
                                            <View style = {styles.button_view}>
                                                <TouchableOpacity style = {[styles.button_style, this.state.send_phonenumber ? {opacity: 0.7} : {opacity: 1}]} disabled = {this.state.send_phonenumber} onPress = {() => this.sendPhoneNumber()}>
                                                    <Text style = {styles.button_text}>Continue</Text>
                                                </TouchableOpacity>
                                            </View>
                                        }
                                        {
                                            this.state.send_phonenumber &&
                                            <View style = {styles.component_input}>
                                                <View style = {styles.title_view}>
                                                    <Text style = {styles.title_text}>Please input your phone verification code</Text>
                                                </View>
                                                <View style = {styles.input_view}>
                                                    <TextInput style = {styles.input_text} onChangeText = {(typedText) => {this.setState({phoneVerificationCode: typedText})}}/>
                                                </View>
                                            </View>
                                        }
                                        {
                                            this.state.send_phonenumber &&
                                            <View style = {styles.button_view}>
                                                <TouchableOpacity style = {[styles.button_style, this.state.boolean_phonenumber ? {opacity: 0.7} : {opacity: 1}]} disabled = {this.state.boolean_phonenumber} onPress = {() => this.verifyPhoneNumber()}>
                                                    <Text style = {styles.button_text}>Phone Verificy</Text>
                                                </TouchableOpacity>
                                            </View>
                                        }
                                        {/* </ScrollView>
                                    </KeyboardAvoidingView> */}
                            </View>
                        )}
                        </KeyboardShift>
                    </View>
                </View>
            </DismissKeyboard>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    pagetitle_part: {
        width: '100%',
        height: topSectionHeight,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7b731',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        zIndex: 100,
    },
    main_part: {
        width: '100%',
        height: mainSectionHeight,
        // justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    component_input: {
        width: '100%',
        height: mainSectionHeight * 0.16,
        justifyContent: 'flex-start',
        alignItems: 'center',
        // marginBottom: 20,
    },
    title_view: {
        width: '90%',
        height: '50%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        
    },
    title_text: {
        color: '#808080', 
        fontSize: 15, 
        // fontFamily: 'coreSansBold', 
        // paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    input_view: {
        width: '90%',
        height: '50%',
        borderBottomColor: '#000000',
        borderBottomWidth: 1,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    input_text: {
        width: '100%',
        height: '100%',
        color: '#000000', 
        fontSize: 15, 
        // fontFamily: 'coreSansBold', 
        // paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    button_view: {
        width: '100%',
        height: mainSectionHeight * 0.12,
        // borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        // marginTop: 40
    },
    button_style: {
        width: '50%',
        height: '70%',
        borderRadius: 40,
        backgroundColor: '#ff4858',
        alignItems: 'center',
        justifyContent: 'center'
    },
    button_text: {
        color: '#ffffff', 
        fontSize: 15
    }
});
