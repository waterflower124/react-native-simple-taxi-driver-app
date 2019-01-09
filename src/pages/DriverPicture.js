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
var mainSectionHeight = Platform.OS === 'android' ? deviceHeight - (topSectionHeight + StatusBar.currentHeight) : deviceHeight - topSectionHeight;
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

export default class DriverPicture extends Component {
    static navigationOptions = {
		header: null,
    };
    
    constructor(props) {
        super(props);
        
        this.state = {
            showIndicator: false,
            isReady: false,
            
            avatar_uri: '',
            email: this.props.navigation.state.params.email,

        };
    };

    takePhotoFromGallery = async() => {
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
                            this.setState({avatar_uri: newResponse.uri});
                        })
                        .catch(error => {
                            alert(error);
                            console.log(error);
                        });
                } else {
                    this.setState({avatar_uri: response.uri});
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
                            
                                this.setState({avatar_uri: newResponse.uri});
                        })
                        .catch(error => {
                            alert(error);
                            console.log(error);
                        });
                } else {
                    
                        this.setState({avatar_uri: response.uri});
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

    gotoSignIn = async() => {
        this.props.navigation.navigate('SignIn', {email: Global.email, password: Global.password});
    };

    sendAvatar = async() => {
       
        var formData = new FormData();
        if(this.state.avatar_uri !== '') {
            let avatarUri = this.state.avatar_uri;
            let avatarUriNamePart = avatarUri.split('/');
            const avatarfileName = avatarUriNamePart[avatarUriNamePart.length - 1];
            let avatarUriTypePart = avatarUri.split('.');
            const avatarfileType = avatarUriTypePart[avatarUriTypePart.length - 1];

            formData.append('avatar', {
                uri: this.state.avatar_uri,
                name: avatarfileName,
                type: `image/${avatarfileType}`,
            })
        };
        formData.append('type', 'driver');
        formData.append('email', this.state.email);
       
        this.setState({showIndicator: true});
        self = this;
        await fetch('https://cabgomaurice.com/api/upload_avatar', {
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
                    } else if(data.error_type === 'image_error') {
                        Alert.alert('Warning!', "Please use image one of the follwing types: 'jpeg', 'png', 'jpg', 'gif', 'bmp'");
                    } else {
                        Alert.alert('Warning!', 'There is something wrong in server. Please try again.');
                        // Alert.alert('Warning!', data.error_type);
                    }
                    self.setState({password: ''});
                } else if(data.status === 'success'){

                    Alert.alert('Welcome!!!', 'Registration Successful!!!',
                        [
                            {text: 'OK', onPress: () => this.gotoSignIn()}
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
                        <Text style = {{fontSize: 25}}> Profile Picture </Text>
                        <TouchableOpacity style = {{position: 'absolute', top: 30, left: 20}} onPress = {() => this.props.navigation.navigate('Verification')}>
                            <Image style = {{width: 15, height: 15}} resizeMode = 'contain' source = {require('../assets/images/left_arrow.png')}/>
                        </TouchableOpacity>
                        <TouchableOpacity style = {{position: 'absolute', top: 30, right: 20}} onPress = {() => this.props.navigation.navigate('SignIn')}>
                            <Text style = {{fontSize: 13}}>SingIn</Text>
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
                        <View style = {{width: '90%', height: '10%', justifyContent: 'center', alignItems: 'center'}}>
                            <TouchableOpacity style = {{width: '70%', height: '90%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ff4858', borderRadius: 5}} onPress = {() => this.sendAvatar()}>
                                <Text style = {{fontSize: 20, color: '#ffffff'}}>Upload Picture</Text>
                            </TouchableOpacity>
                        </View>
                        <View style = {{width: '90%', height: '80%', justifyContent: 'center', alignItems: 'center'}}>
                        {
                            this.state.avatar_uri !== '' &&
                            <Image style = {{width: '95%', height: '95%'}} resizeMode = {'cover'} source = {{uri: this.state.avatar_uri}}></Image>
                        }
                        </View>
                        <View style = {{width: '90%', height: '10%', flexDirection: 'row'}}>
                            <View style = {{width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                                <TouchableOpacity style = {{width: '90%', height: '90%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ff4858', borderRadius: 5}} onPress = {() => this.takePhotoFromCamera()}>
                                    <Text style = {{fontSize: 20, color: '#ffffff'}}>Camera</Text>
                                </TouchableOpacity>
                            </View>
                            <View style = {{width: '50%', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                                <TouchableOpacity style = {{width: '90%', height: '90%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ff4858', borderRadius: 5}} onPress = {() => this.takePhotoFromGallery()}>
                                    <Text style = {{fontSize: 20, color: '#ffffff'}}>Gallery</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
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
        // marginTop: 20,
    }
    
});
