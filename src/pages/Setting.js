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
    FlatList,
    StatusBar,
    Linking,
    ImageBackground
} from 'react-native';

import 'whatwg-fetch'
import Global from '../Global/Global';


import { BallIndicator } from 'react-native-indicators';

import PhoneInput from '../components/PhoneNumberInput';
import ModalPickerImage from '../components/ModalPickerImage';


var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var topSectionHeight = 120;
var bannerHeight = deviceHeight * 0.1;
// var mainSectionHeight = deviceHeight - (bannerHeight + topSectionHeight);
var bannerHeight = deviceHeight * 0.1;
var mainSectionHeight = Platform.OS === 'android' ? deviceHeight - (bannerHeight + topSectionHeight + StatusBar.currentHeight) : deviceHeight - (bannerHeight + topSectionHeight);

const DismissKeyboard = ({children}) => (
    <TouchableWithoutFeedback onPress = {() => Keyboard.dismiss()}>
        {children}
    </TouchableWithoutFeedback>
);

const renderPagination = (index, total, context) => {
    return (
      <View style={styles.paginationStyle}>
        <Text style={{ color: 'grey' }}>
          <Text style={styles.paginationText}>{index + 1}</Text>/{total}
        </Text>
      </View>
    )
  }


export default class Setting extends Component {
    static navigationOptions = {
		header: null,
    };
    
    constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,
            phone_number: '',
            phone_number_verification_code: '',
            phone_number_verify_show: false,
            email: '',
            email_verification_code: '',
            email_verify_show: false,

            showIndicator: false,

            ///  variables for ads
            ads_image: '',
            ads_link: '',
            ads_id: -1,

        };

        this.onPressFlag = this.onPressFlag.bind(this);
        this.selectCountry = this.selectCountry.bind(this);
    };

    initialSetting() {
        var formData = new FormData();
        formData.append('type', 'driver');
        formData.append('token', Global.token);
        self = this;
        fetch('https://cabgomaurice.com/api/get_ad', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                if(data.status === 'fail') {
                } else if(data.status === 'success') {
                    if(data.data === null) {
                        self.setState({
                            ads_image: '',
                            ads_link: '',
                            ads_id: -1,
                        });
                    } else {
                        self.setState({
                            ads_image: 'http://cabgomaurice.com/public/images/ads/' + data.data.image,
                            ads_link: data.data.link,
                            ads_id: data.data.id,
                        });
                    }
                } else if(data.message === 'token_error') {
                    // Alert.alert('Please notice!', 'Please signin again.');
                }               
            })
            .catch(function(error) {
            });
    }

    componentDidMount() {

        this.props.navigation.addListener('willFocus', this.initialSetting.bind(this));

        this.setState({
            pickerCountry: this.phone.getPickerData(),
        });
    };

    onPressFlag() {
        this.myCountryPicker.open();
    }

    selectCountry(country) {
        this.phone.selectCountry(country.iso2);
    }

    sendPhone_Number = async() => {
        // if(this.state.phone_number === '') {
        //     Alert.alert('Warning!', 'Please input your phone number.');
        //     return;
        // };
        var phone_number = this.phone.getValue();
        if(!this.phone.isValidNumber()) {
            Alert.alert('Warning!', 'Please input valid phone number');
            return;
        };

        this.setState({phone_number: phone_number});

        formData = new FormData();
        formData.append('type', 'driver');
        formData.append('token', Global.token);
        formData.append('phone_number', phone_number);
        
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://cabgomaurice.com/api/change_sms_code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
        
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                if(data.status === 'fail') {
                    if(data.error_type === 'registered') {
                        Alert.alert('Warning!', 'Your phone number is already registered. Please try again with other email.');
                    } else if(data.error_type === 'token_error') {
                        Alert.alert('Warning!', 'Your account is expired. Please signin again',
                            [
                                {text: 'OK', onPress: () => this.props.navigation.navigate('SignIn')}
                            ],
                            {cancelable: true}
                        );
                    } else {
                        Alert.alert('Warning!', 'There is something wrong in server. Please try again.');
                    }
                } else if(data.status === 'success'){
                    self.setState({phone_number_verify_show: true});
                }
            })
            .catch(function(error) {
                console.log('11111' + error);
                Alert.alert('Warning!', 'Network error.');
            })

        this.setState({showIndicator: false});
        // this.setState({
        //     phone_number_verify_show: true,
        // });
    };

    sendPhoneNumberVerificationCode = async() => {
        if(this.state.phone_number_verification_code === '') {
            Alert.alert('Warning!', 'Please input your phone number.');
            return;
        };

        formData = new FormData();
        formData.append('type', 'driver');
        formData.append('token', Global.token);
        formData.append('phone_number', this.state.phone_number);
        formData.append('code', this.state.phone_number_verification_code);
        
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://cabgomaurice.com/api/change_sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
        
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                if(data.status === 'fail') {
                    if(data.error_type === 'error_code') {
                        Alert.alert('Warning!', 'Phone number verification code is incorrect. Please try again.')
                    } else if(data.error_type === 'token_error') {
                        Alert.alert('Warning!', 'Your account is expired. Please signin again',
                            [
                                {text: 'OK', onPress: () => this.props.navigation.navigate('SignIn')}
                            ],
                            {cancelable: true}
                        );
                    } else {
                        Alert.alert('Warning!', 'There is something wrong in server. Please try again.');
                    }
                } else if(data.status === 'success'){
                    Alert.alert('Notice!', 'Phone number is changed.')
                }
            })
            .catch(function(error) {
                console.log('11111' + error);
                Alert.alert('Warning!', 'Network error.');
            })

        this.setState({showIndicator: false});
    };

    sendEmailAddress = async() => {
        if(this.state.email === '') {
            Alert.alert('Warning!', 'Please input your email address.');
            return;
        };
        let regExpression = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
        if(regExpression.test(this.state.email) === false) {
            Alert.alert("Warning!", 'Please input valid email address');
            return;
        };

        formData = new FormData();
        formData.append('type', 'driver');
        formData.append('email', this.state.email);
        formData.append('token', Global.token);

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://cabgomaurice.com/api/change_email_code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
        
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                if(data.status === 'fail') {
                    if(data.error_type === 'registered') {
                        Alert.alert('Warning!', 'Your email address is already registered. Please try again with other email.');
                    } else if(data.error_type === 'token_error') {
                        Alert.alert('Warning!', 'Your account is expired. Please signin again',
                            [
                                {text: 'OK', onPress: () => this.props.navigation.navigate('SignIn')}
                            ],
                            {cancelable: true}
                        );
                    } else {
                        Alert.alert('Warning!', 'There is something wrong in server. Please try again.');
                    }
                } else if(data.status === 'success'){
                    self.setState({
                        email_verify_show: true,
                    });
                }
            })
            .catch(function(error) {
                console.log('11111' + error);
                Alert.alert('Warning!', 'Network error.');
            })

        this.setState({showIndicator: false});
        // this.setState({
        //     email_verify_show: true,
        // })
    };

    sendEmailAddressVerificationCode = async() => {
        if(this.state.email_verification_code === '') {
            Alert.alert('Warning!', 'Please input your email verification code.');
            return;
        };
        formData = new FormData();
        formData.append('type', 'driver');
        formData.append('email', this.state.email);
        formData.append('token', Global.token);
        formData.append('code', self.state.email_verification_code);

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://cabgomaurice.com/api/change_email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
        
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                if(data.status === 'fail') {
                    if(data.error_type === 'error_code') {
                        Alert.alert('Warning!', 'Verification code is incorrect. Please try again.');
                    } else if(data.error_type === 'token_error') {
                        Alert.alert('Warning!', 'Your account is expired. Please signin again',
                            [
                                {text: 'OK', onPress: () => this.props.navigation.navigate('SignIn')}
                            ],
                            {cancelable: true}
                        );
                    } else {
                        Alert.alert('Warning!', 'There is something wrong in server. Please try again.');
                    }
                } else if(data.status === 'success'){
                    Alert.alert('Notice!', 'Email address is changed.');
                }
            })
            .catch(function(error) {
                console.log('11111' + error);
                Alert.alert('Warning!', 'Network error.');
            })

        this.setState({showIndicator: false});
    };

    onClickAds = () => {
        if(this.state.ads_link !== '') {
            Linking.canOpenURL(this.state.ads_link).then(supported => {
                if(supported) {
                    Linking.openURL(this.state.ads_link); 
                } else {
                        Alert.alert('Warning!', 'Can not open this Ads.');
                    }
                });
        }
    }

    render() {
        return (
            <DismissKeyboard>
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
                        <Text style = {{fontSize: 25}}> Setting </Text>
                        <TouchableOpacity style = {{position: 'absolute', top: 30, left: 20}} onPress = {() => this.props.navigation.navigate('Home')}>
                            <Image style = {{width: 15, height: 15}} resizeMode = 'contain' source = {require('../assets/images/left_arrow.png')}/>
                        </TouchableOpacity>
                    </View>
                    {
                        Platform.OS === 'ios' &&
                        <KeyboardAvoidingView style = {{width: '100%', height: mainSectionHeight + bannerHeight}} behavior = 'padding'>
                            <ScrollView style = {{width: '100%', height: '100%'}} keyboardShouldPersistTaps = 'handled' showsVerticalScrollIndicator = {false}>
                                <View style = {styles.main_part}>
                                    <View style = {styles.component_view}>
                                        <View style = {styles.component_title_view}>
                                            <Text style = {{fontSize: 15, color: '#ffffff'}}>Change Phone Number</Text>
                                        </View>
                                        <View style = {styles.component_input_view}>
                                            <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#000000',}}>
                                                {/* <TextInput style = {{fontSize: 13, color: '#ffffff', width: '100%'}} keyboardType={'phone-pad'} placeholder = {'Phone Number'} placeholderTextColor = '#808080' onChangeText = {(typedText) => this.setState({phone_number: typedText})}/> */}
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
                                            <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center'}}>
                                                <TouchableOpacity style = {styles.button_style} onPress = {() => this.sendPhone_Number()}>
                                                    <Text style = {{fontSize: 14, color: '#ffffff'}}>Continue</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {
                                            this.state.phone_number_verify_show &&
                                            <View style = {styles.component_input_view}>
                                                <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#000000',}}>
                                                    <TextInput style = {{fontSize: 13, color: '#ffffff', width: '100%'}} keyboardType='numeric' placeholder = {'Verification Code'} placeholderTextColor = '#808080' onChangeText = {(typedText) => this.setState({phone_number_verification_code: typedText})}>{this.state.phone_number_verification_code}</TextInput>
                                                </View>
                                                <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center'}}>
                                                    <TouchableOpacity style = {styles.button_style}>
                                                        <Text style = {{fontSize: 14, color: '#ffffff'}}>Change</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        }
                                        
                                    </View>
                                    <View style = {styles.component_view}>
                                        <View style = {styles.component_title_view}>
                                            <Text style = {{fontSize: 15, color: '#ffffff'}}>Change Email Address</Text>
                                        </View>
                                        <View style = {styles.component_input_view}>
                                            <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#000000',}}>
                                                <TextInput style = {{fontSize: 13, color: '#ffffff', width: '100%'}} placeholder = {'Email Address'} placeholderTextColor = '#808080' onChangeText = {(typedText) => this.setState({email: typedText})}>{this.state.email}</TextInput>
                                            </View>
                                            <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center'}}>
                                                <TouchableOpacity style = {styles.button_style} onPress = {() => this.sendEmailAddress()}>
                                                    <Text style = {{fontSize: 14, color: '#ffffff'}}>Continue</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        {
                                            this.state.email_verify_show &&
                                            <View style = {styles.component_input_view}>
                                                <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#000000',}}>
                                                    <TextInput style = {{fontSize: 13, color: '#ffffff', width: '100%'}} keyboardType='numeric' placeholder = {'Verification Code'} placeholderTextColor = '#808080' onChangeText = {(typedText) => this.setState({phone_number_verification_code: typedText})}>{this.state.phone_number_verification_code}</TextInput>
                                                </View>
                                                <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center'}}>
                                                    <TouchableOpacity style = {styles.button_style} onPress = {() => this.sendEmailAddressVerificationCode()}>
                                                        <Text style = {{fontSize: 14, color: '#ffffff'}}>Change</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        }
                                    </View>
                                </View>
                                <TouchableOpacity style = {styles.banner_section} onPress = {() => this.onClickAds()}>
                                {
                                    (this.state.ads_image !== '')&&
                                    <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {{uri: this.state.ads_image}}/>
                                }
                                </TouchableOpacity>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    }
                    {
                        Platform.OS === 'android' &&
                        <ScrollView style = {{width: '100%', height: '100%'}} keyboardShouldPersistTaps = 'always'>
                            <View style = {styles.main_part}>
                                <View style = {styles.component_view}>
                                    <View style = {styles.component_title_view}>
                                        <Text style = {{fontSize: 15, color: '#ffffff'}}>Change Phone Number</Text>
                                    </View>
                                    <View style = {styles.component_input_view}>
                                        <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#000000',}}>
                                            {/* <TextInput style = {{fontSize: 13, color: '#ffffff', width: '100%'}} keyboardType={'phone-pad'} placeholder = {'Phone Number'} placeholderTextColor = '#808080' onChangeText = {(typedText) => this.setState({phone_number: typedText})}/> */}
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
                                        <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center'}}>
                                            <TouchableOpacity style = {styles.button_style} onPress = {() => this.sendPhone_Number()}>
                                                <Text style = {{fontSize: 14, color: '#ffffff'}}>Continue</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    {
                                        this.state.phone_number_verify_show &&
                                        <View style = {styles.component_input_view}>
                                            <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#000000',}}>
                                                <TextInput style = {{fontSize: 13, color: '#ffffff', width: '100%'}} keyboardType='numeric' placeholder = {'Verification Code'} placeholderTextColor = '#808080' onChangeText = {(typedText) => this.setState({phone_number_verification_code: typedText})}>{this.state.phone_number_verification_code}</TextInput>
                                            </View>
                                            <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center'}}>
                                                <TouchableOpacity style = {styles.button_style} onPress = {() => this.sendPhoneNumberVerificationCode()}>
                                                    <Text style = {{fontSize: 14, color: '#ffffff'}}>Change</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    }
                                    
                                </View>
                                <View style = {styles.component_view}>
                                    <View style = {styles.component_title_view}>
                                        <Text style = {{fontSize: 15, color: '#ffffff'}}>Change Email Address</Text>
                                    </View>
                                    <View style = {styles.component_input_view}>
                                        <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#000000',}}>
                                            <TextInput style = {{fontSize: 13, color: '#ffffff', width: '100%'}} placeholder = {'Email Address'} placeholderTextColor = '#808080' onChangeText = {(typedText) => this.setState({email: typedText})}>{this.state.email}</TextInput>
                                        </View>
                                        <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center'}}>
                                            <TouchableOpacity style = {styles.button_style} onPress = {() => this.sendEmailAddress()}>
                                                <Text style = {{fontSize: 14, color: '#ffffff'}}>Continue</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    {
                                        this.state.email_verify_show &&
                                        <View style = {styles.component_input_view}>
                                            <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#000000',}}>
                                                <TextInput style = {{fontSize: 13, color: '#ffffff', width: '100%'}} keyboardType='numeric' placeholder = {'Verification Code'} placeholderTextColor = '#808080' onChangeText = {(typedText) => this.setState({phone_number_verification_code: typedText})}>{this.state.phone_number_verification_code}</TextInput>
                                            </View>
                                            <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center'}}>
                                                <TouchableOpacity style = {styles.button_style} onPress = {() => this.sendEmailAddressVerificationCode()}>
                                                    <Text style = {{fontSize: 14, color: '#ffffff'}}>Change</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    }
                                </View>
                            </View>
                            <TouchableOpacity style = {styles.banner_section} onPress = {() => this.onClickAds()}>
                            {
                                (this.state.ads_image !== '')&&
                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {{uri: this.state.ads_image}}/>
                            }
                            </TouchableOpacity>
                        </ScrollView>
                    }
                    
                </ImageBackground>
            </DismissKeyboard>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    component_view: {
        // backgroundColor: '#0a0f2c',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '90%',
        height: '50%',
    },
    component_title_view: {
        width: '100%',
        height: '20%',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    component_input_view: {
        width: '100%',
        height: '40%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button_style: {
        width: '60%',
        height: '70%',
        backgroundColor: '#ff4858',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    banner_section: {
        // position: 'absolute',
        width: '100%',
        height: bannerHeight,
        bottom: 0,
        // backgroundColor: '#392b59',
    },
});
