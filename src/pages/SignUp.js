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
    ImageBackground,
    StatusBar
} from 'react-native';

import 'whatwg-fetch'
import Global from '../Global/Global';

import { BallIndicator } from 'react-native-indicators';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';


var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var topSectionHeight = 120;
var mainSectionHeight = deviceHeight - (120 + 20);
var statuBarHeight = (Platform.OS === 'ios') ? 0 : StatusBar.currentHeight;

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

export default class SignUp extends Component {
    static navigationOptions = {
		header: null,
    };
    
    constructor(props) {
        super(props);
        
        this.state = {
            showIndicator: false,
            isReady: false,
            email: '',
            password: '',
            confirm_password: '',
            first_name: '',
            last_name: '',
            driverID: '',
            verification_code: '',

            avatar_uri: '',

            taxi_picture_array: [],
            taxi_picture_ratio_array: [],

            // register_check: false,/// first register then sign up
        };
    };

    handleFirstName = (typedText) => {
        this.setState({
            first_name: typedText
        });
    };

    handleLastName = (typedText) => {
        this.setState({
            last_name: typedText
        });
    };

    handleEmail = (typedText) => {
        this.setState({
            email: typedText
        });
    };

    handleDriverID = (typedText) => {
        this.setState({
            driverID: typedText
        });
    };

    handlePassword = (typedText) => {
        this.setState({
            password: typedText
        });
    };

    handleConfirmPassword = (typedText) => {
        this.setState({
            confirm_password: typedText
        });
    };

    handleVerificationCode = (typedText) => {
        this.setState({
            verification_code: typedText
        });
    };

    takePhotoFromGallery = async(type) => {
        ImagePicker.launchImageLibrary(options, (response) => {
            const {error, uri, originalRotation} = response;
            if (response.didCancel) {
                console.log('image picker cancelled');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                if(Platform.OS === 'android') {
                    var imageWidth = 0;
                    var imageHeight = 0;
                    if ( originalRotation === 90 ) {
                        rotation = 0;
                        imageWidth = response.height;
                        imageHeight = response.width;
                    } else if ( originalRotation === 270 ) {
                        rotation = 0;
                        imageWidth = response.height;
                        imageHeight = response.width;
                    } else {
                        rotation = 0;
                        imageWidth = response.width;
                        imageHeight = response.height;
                    }
                    ImageResizer.createResizedImage(response.uri, imageWidth, imageHeight, 'JPEG', 80, rotation)
                        .then((newResponse) => {
                            // alert(JSON.stringify(newResponse.size) + '  ' + newResponse.uri);
                            if(type === 'picture') {
                                var ratio = imageWidth / imageHeight;
                                this.setState({
                                    taxi_picture_array: [...this.state.taxi_picture_array, newResponse.uri],
                                    taxi_picture_ratio_array: [...this.state.taxi_picture_ratio_array, ratio], 
                                });
                            } else if(type === 'avatar') {
                                this.setState({avatar_uri: newResponse.uri});
                            }
                        })
                        .catch(error => {
                            alert(error);
                            console.log(error);
                        });
                } else {
                    if(type === 'picture') {
                        var ratio = response.width / response.height;
                        this.setState({
                            taxi_picture_array: [...this.state.taxi_picture_array, response.uri],
                            taxi_picture_ratio_array: [...this.state.taxi_picture_ratio_array, ratio], 
                        });
                    } else if(type === 'avatar') {
                        this.setState({avatar_uri: response.uri});
                    }
                }
            }
        });
    };

    takePhotoFromCamera = async(type) => {
        ImagePicker.launchCamera(options, (response) => {
            const {error, uri, originalRotation} = response;
            if (response.didCancel) {
                console.log('image picker cancelled');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                if(Platform.OS === 'android') {
                    var imageWidth = 0;
                    var imageHeight = 0;
                    if ( originalRotation === 90 ) {
                        rotation = 90;
                        imageWidth = response.height;
                        imageHeight = response.width;
                    } else if ( originalRotation === 270 ) {
                        rotation = -90;
                        imageWidth = response.height;
                        imageHeight = response.width;
                    } else {
                        rotation = 0;
                        imageWidth = response.width;
                        imageHeight = response.height;
                    }
                    ImageResizer.createResizedImage(response.uri, imageWidth, imageHeight, 'JPEG', 80, rotation)
                        .then((newResponse) => {
                            // alert(JSON.stringify(newResponse.size) + '  ' + newResponse.uri);
                            if(type === 'picture') {
                                var ratio = imageWidth / imageHeight;
                                this.setState({
                                    taxi_picture_array: [...this.state.taxi_picture_array, newResponse.uri],
                                    taxi_picture_ratio_array: [...this.state.taxi_picture_ratio_array, ratio], 
                                });
                            } else if(type === 'avatar') {
                                this.setState({avatar_uri: newResponse.uri});
                            }
                        })
                        .catch(error => {
                            alert(error);
                            console.log(error);
                        });
                } else {
                    if(type === 'picture') {
                        var ratio = response.width / response.height;
                        this.setState({
                            taxi_picture_array: [...this.state.taxi_picture_array, response.uri],
                            taxi_picture_ratio_array: [...this.state.taxi_picture_ratio_array, ratio], 
                        });
                    } else if(type === 'avatar') {
                        this.setState({avatar_uri: response.uri});
                    }
                }
            }
        });
    };

    deletePictureFromPictureURIs = (index) => {
        var picture_array = [...this.state.taxi_picture_array];
        picture_array.splice(index, 1);
        this.setState({
            taxi_picture_array: picture_array
        });

        var picture_ratio_array = [...this.state.taxi_picture_ratio_array];
        picture_ratio_array.splice(index, 1);
        this.setState({
            taxi_picture_ratio_array: picture_ratio_array
        });
    };

    signIn = async() => {
        this.props.navigation.navigate('SignIn');
    };

    signUp = async() => {

        // this.props.navigation.navigate('Verification', {email: 'self.state.email'})

        if(this.state.first_name === '') {
            Alert.alert("Warning!", 'Please input First Name');
            return;
        };
        if(this.state.last_name === '') {
            Alert.alert("Warning!", 'Please input Last Name');
            return;
        };
        if(this.state.email === '') {
            Alert.alert("Warning!", 'Please input Email Address');
            return;
        };
        let regExpression = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
        if(regExpression.test(this.state.email) === false) {
            Alert.alert("Warning!", 'Please input valid Email Address');
            return;
        }
        if(this.state.password === '') {
            Alert.alert("Warning!", 'Please input password');
            return;
        };
        if(this.state.password.length < 6) {
            Alert.alert("Warning!", 'The Password must be at least 6 characters.');
            return;
        };
        if(this.state.password !== this.state.confirm_password) {
            Alert.alert("Warning!", 'Password does not match.');
            return;
        };

        var formData = new FormData();
        // if(this.state.avatar_uri !== '') {
        //     let avatarUri = this.state.avatar_uri;
        //     let avatarUriNamePart = avatarUri.split('/');
        //     const avatarfileName = avatarUriNamePart[avatarUriNamePart.length - 1];
        //     let avatarUriTypePart = avatarUri.split('.');
        //     const avatarfileType = avatarUriTypePart[avatarUriTypePart.length - 1];

        //     formData.append('avatar', {
        //         uri: this.state.avatar_uri,
        //         name: avatarfileName,
        //         type: `image/${avatarfileType}`,
        //     })
        // };

        if(this.state.taxi_picture_array.length > 0) {
            this.state.taxi_picture_array.forEach((element, index) => {
                // console.log(element);
                var localUriNamePart = element.split('/');
                var fileName = localUriNamePart[localUriNamePart.length - 1];
                var localUriTypePart = element.split('.');
                var fileType = localUriTypePart[localUriTypePart.length - 1];

                const newImage = {
                   uri: element,
                   name: fileName,
                   type: `image/${fileType}`,
                }
                formData.append('images[]', newImage);
            });
        };
        formData.append('type', 'driver');
        formData.append('first_name', this.state.first_name);
        formData.append('last_name', this.state.last_name);
        formData.append('email', this.state.email);
        formData.append('driver_id', this.state.driver_id);
        formData.append('password', this.state.password);
        formData.append('confirm_password', this.state.confirm_password);

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://cabgomaurice.com/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('111111: signuporeponse' + JSON.stringify(data));
                if(data.status === 'fail') {
                    if(data.error_type === 'registered') {
                        Alert.alert('Warning!', 'Your Email has already registered. Please use another Email.');
                    } else if(data.error_type === 'image_type_error') {
                        Alert.alert('Warning!', "Please use image one of the follwing types: 'jpeg', 'png', 'jpg', 'gif', 'bmp'");
                    } else {
                        Alert.alert('Warning!', 'There is something wrong in server. Please try again.');
                        // Alert.alert('Warning!', data.error_type);
                    }
                    self.setState({password: ''});
                } else if(data.status === 'success'){
                    Global.user_id = data.id;
                    Global.email = self.state.email;
                    Global.password = self.state.password;
                    // Alert.alert('Notice!', 'We have sent verification code to your email. Please check your email inbox.');
                    Alert.alert('Notice!', 'We have sent verification code to your email. Please check your email inbox.',
                        [
                            {text: 'OK', onPress: () => this.props.navigation.navigate('Verification', {email: self.state.email})}
                        ],
                        {cancelable: true}
                    );
                }
                
            })
            .catch(function(error) {
                console.log('111111: signiup eroror' + JSON.stringify(error));
                Alert.alert('Warning!', 'Network error.');
            })
        
        this.setState({showIndicator: false});
    };

    scrollToText = (index) => {
        this.mainScrollView.scrollTo({y: 60 * index});
    };

    render() {
        return (
            // <DismissKeyboard>
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
                        <Text style = {{fontSize: 25}}> Register User </Text>
                        <TouchableOpacity style = {{position: 'absolute', top: 30, left: 20}} onPress = {() => this.props.navigation.navigate('SignIn')}>
                            <Image style = {{width: 15, height: 15}} resizeMode = 'contain' source = {require('../assets/images/left_arrow.png')}/>
                        </TouchableOpacity>
                    </View>
                    {/* <View style = {styles.avatar_view}>
                    {
                        (this.state.avatar_uri === '') &&
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/empty_user.png')}/>
                    }
                    {
                        (this.state.avatar_uri !== '') &&
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'cover'} source = {{uri: this.state.avatar_uri}}/>
                    }    
                    </View>
                    <TouchableOpacity style = {styles.gallery_view} onPress = {() => this.takePhotoFromGallery('avatar')}>
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/signup_gallery.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity style = {styles.camera_view} onPress = {() => this.takePhotoFromCamera('avatar')}>
                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/signup_camera.png')}/>
                    </TouchableOpacity> */}
                    <View style = {styles.main_part}>
                        <ScrollView style = {{width: deviceWidth}} showsVerticalScrollIndicator = {false} keyboardShouldPersistTaps='handled' ref={ref => this.mainScrollView = ref}>
                            {/* <KeyboardAvoidingView> */}
                                <View style = {styles.component_input}>
                                    <View style = {styles.title_view}>
                                        <Text style = {styles.title_text}> Fist Name </Text>
                                    </View>
                                    <View style = {styles.input_view}>
                                        <TextInput onTouchStart = {() => this.scrollToText(0)} underlineColorAndroid = 'transparent' style = {styles.input_text} onChangeText = {this.handleFirstName}>{this.state.first_name}</TextInput>
                                    </View>
                                </View>
                                <View style = {styles.component_input}>
                                    <View style = {styles.title_view}>
                                        <Text style = {styles.title_text}> Last Name </Text>
                                    </View>
                                    <View style = {styles.input_view}>
                                        <TextInput onTouchStart = {() => this.scrollToText(1)} underlineColorAndroid = 'transparent' style = {styles.input_text} onChangeText = {this.handleLastName}>{this.state.last_name}</TextInput>
                                    </View>
                                </View>
                                <View style = {styles.component_input}>
                                    <View style = {styles.title_view}>
                                        <Text style = {styles.title_text}> Email </Text>
                                    </View>
                                    <View style = {styles.input_view}>
                                        <TextInput onTouchStart = {() => this.scrollToText(2)} underlineColorAndroid = 'transparent' style = {styles.input_text} onChangeText = {this.handleEmail}>{this.state.email}</TextInput>
                                    </View>
                                </View>
                                <View style = {styles.component_input}>
                                    <View style = {styles.title_view}>
                                        <Text style = {styles.title_text}> Driver ID </Text>
                                    </View>
                                    <View style = {styles.input_view}>
                                        <TextInput onTouchStart = {() => this.scrollToText(3)} underlineColorAndroid = 'transparent' style = {styles.input_text} onChangeText = {this.handleDriverID}>{this.state.driverID}</TextInput>
                                    </View>
                                </View>
                                <View style = {styles.component_input}>
                                    <View style = {styles.title_view}>
                                        <Text style = {styles.title_text}> Password </Text>
                                    </View>
                                    <View style = {styles.input_view}>
                                        <TextInput onTouchStart = {() => this.scrollToText(4)} underlineColorAndroid = 'transparent' secureTextEntry={true} style = {styles.input_text} onChangeText = {this.handlePassword}>{this.state.password}</TextInput>
                                    </View>
                                </View>
                                <View style = {styles.component_input}>
                                    <View style = {styles.title_view}>
                                        <Text style = {styles.title_text}> Confirm Password </Text>
                                    </View>
                                    <View style = {styles.input_view}>
                                        <TextInput onTouchStart = {() => this.scrollToText(5)} underlineColorAndroid = 'transparent' secureTextEntry={true} style = {styles.input_text} onChangeText = {this.handleConfirmPassword}>{this.state.confirm_password}</TextInput>
                                    </View>
                                </View>
                                <View style = {{width: '100%', height: 150, justifyContent: 'flex-start', alignItems: 'center'}}>
                                    <View style = {{width: '90%', height: 30, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
                                        <Text style = {styles.title_text}> Pictures of Taxi </Text>
                                        <TouchableOpacity onPress = {() => this.takePhotoFromCamera('picture')}>
                                            <Image style = {{width: 25, height: 25, marginLeft: 50}} resizeMode = {'contain'} source = {require('../assets/images/signup_camera.png')}/>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress = {() => this.takePhotoFromGallery('picture')}>
                                            <Image style = {{width: 25, height: 25, marginLeft: 20}} resizeMode = {'contain'} source = {require('../assets/images/signup_gallery.png')}/>
                                        </TouchableOpacity>
                                    </View>
                                    <ScrollView style = {{width: '90%', height: 120, borderBottomColor: '#6e1ced', borderBottomWidth: 1,}} horizontal = {true} showsHorizontalScrollIndicator = {false}>
                                        <View style = {{height: '95%', flexDirection: 'row', alignItems: 'center'}}>
                                        {
                                            (this.state.taxi_picture_array.length !== 0) && 
                                            this.state.taxi_picture_array.map((item, index) => 
                                                <ImageBackground key = {index} source = {{uri: item}} resizeMode = {'contain'} style = {{height: '100%', aspectRatio: this.state.taxi_picture_ratio_array[index], flex: 1, marginRight: 5, borderRadius: 10, overflow: 'hidden'}}>
                                                    <TouchableOpacity style = {{right: 5, top: 5, width: 20, height: 20, position: 'absolute'}} onPress = {() => this.deletePictureFromPictureURIs(index)}>
                                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/cancel.png')}/>
                                                    </TouchableOpacity>
                                                </ImageBackground>
                                            )
                                        }
                                        </View>
                                    </ScrollView>
                                </View>
                                <View style = {styles.button_view}>
                                    <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center'}}>
                                        <TouchableOpacity style = {{width: '40%', height: '80%', backgroundColor: '#ff4858', borderRadius: 40, justifyContent: 'center', alignItems: 'center'}} onPress = {() => this.signUp()}>
                                                <Text style = {{fontSize: 15, color: '#ffffff'}}> Next </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style = {{width: '100%', height: '50%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
                                        <Text style = {{fontSize: 13, color: '#000000'}}> Already have an account? </Text>
                                        <TouchableOpacity onPress = {() => this.signIn()}>
                                            <Text style = {{fontSize: 15, color: '#ff4858', marginLeft: 15}}> Sign In </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style = {{width: '100%', height: 20}}>
                                </View>
                            {/* </KeyboardAvoidingView> */}
                            <View style = {{width: '100%', height: 250}}></View>
                        </ScrollView>
                    </View>
                </View>
            // </DismissKeyboard>
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
    },
    avatar_view: {
        position: 'absolute',
        width: 80,
        height: 80,
        left: deviceWidth / 2 - 40,
        top: 80 - 10,
        overflow: 'hidden',
        borderRadius: 10,
    },
    camera_view: {
        width: 30,
        height: 30,
        backgroundColor: '#ffffff',
        borderRadius: 30,
        overflow: 'hidden',
        position: 'absolute',
        left: deviceWidth / 2 - 70,
        top: topSectionHeight - 15 - 10,
    },
    gallery_view: {
        width: 30,
        height: 30,
        backgroundColor: '#ffffff',
        borderRadius: 30,
        overflow: 'hidden',
        position: 'absolute',
        left: deviceWidth / 2 + 40,
        top: topSectionHeight - 15 - 10,
    },
    main_part: {
        width: '100%',
        height: mainSectionHeight,
        // justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    component_input: {
        width: '100%',
        height: 60,
        justifyContent: 'flex-start',
        alignItems: 'center',
        // marginBottom: 20,
    },
    title_view: {
        width: '90%',
        height: '50%',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    title_text: {
        color: '#000000', 
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
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    button_view: {
        width: '100%',
        height: 80,
        // borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        // marginTop: 40
    },
    
});
