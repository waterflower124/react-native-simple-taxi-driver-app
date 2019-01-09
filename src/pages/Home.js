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
    Linking,
    StatusBar,
    ImageBackground
} from 'react-native';
import 'whatwg-fetch'
import Global from '../Global/Global';


import MapView from 'react-native-maps';
import { BallIndicator } from 'react-native-indicators';
import Modal from 'react-native-modal';
import MapViewDirections from 'react-native-maps-directions';
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;
var topSectionHeight = 120;
var bannerHeight = deviceHeight * 0.1;
var mainSectionHeight = Platform.OS === 'android' ? deviceHeight - (bannerHeight + topSectionHeight + StatusBar.currentHeight) : deviceHeight - (bannerHeight + topSectionHeight);

var APIkey = "AIzaSyBQFCqY7afcjleEKi0YRlv1XHBKRxn8pxE";
// var APIkey = "AIzaSyDRZH0CebAvVYviNiZUCBNqi1OqR3eicMs";

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


export default class Home extends Component {
    static navigationOptions = {
		header: null,
    };
    
    constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,

            showIndicator: false,

            // region: {},

            // latitude: 0.0,
            // longitude: 0.0

            firsttLat: 0.0,
            firstLng: 0.0,

            currentLat: 0.0,
            currentLng: 0.0,

            mapRegion: null,
            lastLat: null,
            lastLong: null,

            searchPlacetxt: '',

            searchPlacesName: [],
            searchPlacesAddress: [],
            searchPlacesLatLng: [],

            destLat: 0.0,
            destLng: 0.0,
            destPlaceName: '',
            destPlaceAddress:'',

            route_source: null,
            rout_destination: null,


            showModal: false,

            ////  varibles for BackgroundGeolocation
            region: null,
            locations: [],
            stationaries: [],
            isRunning: false,


            ///  variables for ads
            ads_image: '',
            ads_link: '',
            ads_id: -1,

        };
    };

    signOutAccount = async() => {
        var formData = new FormData();
        formData.append('type', 'driver');
        formData.append('token', Global.token);

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://cabgomaurice.com/api/logout', {
                method: 'POST',
                headers: {

                    'Content-Type': 'multipart/form-data'
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('111111: sendgeolocation errororor' + JSON.stringify(data));
                if(data.status === 'fail') {
                    if(data.error_type === 'password_wrong') {
                        Alert.alert('Warning!', 'There is something wrong in server. Please try again.');
                    }
                } else if(data.status === 'success') {
                    // Global.token = data.data;
                    // Global.email = self.state.email;
                    // Global.password = self.state.password;
                    BackgroundGeolocation.stop();
                    
                    this.props.navigation.navigate('SignIn');
                }
            })
            .catch(function(error) {
                console.log('111111: sendgeolocation errororor' + JSON.stringify(error));
                Alert.alert('Warning!', 'Network error.')
            })

        this.setState({showIndicator: false});
    };

    signOut = async() => {

        Alert.alert('Notice!', 'Do you really want to sign out?',
            [
                {text: 'Cancel', onPress: () => null},
                {text: 'OK', onPress: () => this.signOutAccount()}
            ],
            {cancelable: true}
        );

    };

    appSetting = () => {
        this.props.navigation.navigate('Setting');
    };

    onMapPress(e) {
        console.log(e.nativeEvent.coordinate.longitude);
        let region = {
          latitude:       e.nativeEvent.coordinate.latitude,
          longitude:      e.nativeEvent.coordinate.longitude,
          latitudeDelta:  0.00922*1.5,
          longitudeDelta: 0.00421*1.5
        }
        this.onRegionChange(region, region.latitude, region.longitude);
    }

    componentWillMount() {
        BackgroundGeolocation.checkStatus(({ isRunning, locationServicesEnabled, authorization }) => {
            // if (isRunning) {
            //   BackgroundGeolocation.stop();
            //   return false;
            // }
            if (isRunning) {
                return true;
              }
      
            // if (!locationServicesEnabled) {
            //   Alert.alert(
            //     'Location services disabled',
            //     'Would you like to open location settings?',
            //     [
            //       {
            //         text: 'Yes',
            //         onPress: () => BackgroundGeolocation.showLocationSettings()
            //       },
            //       {
            //         text: 'No',
            //         onPress: () => console.log('No Pressed'),
            //         style: 'cancel'
            //       }
            //     ]
            //   );
            //   return false;
            // }
      
            if (authorization == 99) {
              // authorization yet to be determined
              BackgroundGeolocation.start();
            } else if (authorization == BackgroundGeolocation.AUTHORIZED) {
              // calling start will also ask user for permission if needed
              // permission error will be handled in permisision_denied event
              BackgroundGeolocation.start();
            } else {
              Alert.alert(
                'Notice',
                'Cabgo Driver requires location tracking for share your location. Did you grant permission?',
                [
                  {
                    text: 'Ok',
                    onPress: () => BackgroundGeolocation.start()
                  }
                ]
              );
              // BackgroundGeolocation.start();
            }
        });
    }

    componentWillUnmount() {
        // navigator.geolocation.clearWatch(this.watchID);
        BackgroundGeolocation.events.forEach(event =>
            BackgroundGeolocation.removeAllListeners(event)
        );
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

    getCurrentLocation() {

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

        this.watchID = navigator.geolocation.getCurrentPosition(
            (position) => {
            //   console.log("wokeeey");
            //   console.log(position);
            //   this.setState({
            //     latitude: position.coords.latitude,
            //     longitude: position.coords.longitude,
            //     error: null,
            //   });
                let region = {
                    latitude:       position.coords.latitude,
                    longitude:      position.coords.longitude,
                    latitudeDelta:  0.00922*1.5,
                    longitudeDelta: 0.00421*1.5
                }
                // this.onRegionChange(region, region.latitude, region.longitude);
                this.setState({
                    mapRegion: region,
                    firstLat: position.coords.latitude,
                    firstLng: position.coords.longitude,
                });
                console.log(position.coords.latitude + ' +++ ' + position.coords.longitude);
                
            },
            (error) => this.setState({ error: error.message }),
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 },
          );
    };

    sendGeoLocation = async(latitude, longitude) => {
        var formData = new FormData();
        formData.append('type', 'driver');
        formData.append('token', Global.token);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);

        await fetch('https://cabgomaurice.com/api/update_position', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('111111: sendgeolocation' + JSON.stringify(data));
                if(data.status === 'fail') {
                    if(data.error_type === 'password_wrong') {
                        // Alert.alert('Warning!', 'There is something wrong in server. Please try again.');
                    }
                } else if(data.status === 'success') {
                    
                }
            })
            .catch(function(error) {
                console.log('111111: sendgeolocation errororor' + JSON.stringify(error));
                Alert.alert('Warning!', 'Network error.')
            })
    };


    componentDidMount() {

        this.props.navigation.addListener('willFocus', this.getCurrentLocation.bind(this));

          ////   BackgroundGeolocation   /////
          BackgroundGeolocation.getCurrentLocation(lastLocation => {
            this.setState({
                currentLat: lastLocation.latitude,
                currentLng: lastLocation.longitude,
            });
            // Alert.alert('current location', lastLocation.latitude + '  ' + lastLocation.longitude);
            let region = this.state.region;
            const latitudeDelta = 0.01;
            const longitudeDelta = 0.01;
            region = Object.assign({}, lastLocation, {
              latitudeDelta,
              longitudeDelta
            });
            this.setState({ locations: [lastLocation], region });
            this.sendGeoLocation(lastLocation.latitude, lastLocation.longitude);
          }, (error) => {
            setTimeout(() => {
              Alert.alert('Error obtaining current location', JSON.stringify(error));
            }, 100);
          });
      
          BackgroundGeolocation.on('start', () => {
            // service started successfully
            // you should adjust your app UI for example change switch element to indicate
            // that service is running
            console.log('[DEBUG] BackgroundGeolocation has been started');
            this.setState({ isRunning: true });
          });
      
          BackgroundGeolocation.on('stop', () => {
            console.log('[DEBUG] BackgroundGeolocation has been stopped');
            this.setState({ isRunning: false });
          });
      
          BackgroundGeolocation.on('authorization', status => {
            console.log(
              '[INFO] BackgroundGeolocation authorization status: ' + status
            );
            if (status !== BackgroundGeolocation.AUTHORIZED) {
              // we need to set delay after permission prompt or otherwise alert will not be shown
              setTimeout(() =>
                Alert.alert(
                  'App requires location tracking',
                  'Would you like to open app settings?',
                  [
                    {
                      text: 'Yes',
                      onPress: () => BackgroundGeolocation.showAppSettings()
                    },
                    {
                      text: 'No',
                      onPress: () => console.log('No Pressed'),
                      style: 'cancel'
                    }
                  ]
              ), 1000);
            }
          });
      
          BackgroundGeolocation.on('error', ({ message }) => {
            Alert.alert('BackgroundGeolocation error', message);
          });
      
          BackgroundGeolocation.on('location', location => {
            console.log('[DEBUG] BackgroundGeolocation location', location);
            BackgroundGeolocation.startTask(taskKey => {
                requestAnimationFrame(() => {
                //   alert(location.latitude + '   ' + location.longitude);
                // const longitudeDelta = 0.01;
                // const latitudeDelta = 0.01;
                // const region = Object.assign({}, location, {
                //   latitudeDelta,
                //   longitudeDelta
                // });
                // const locations = this.state.locations.slice(0);
                // locations.push(location);
                // this.setState({ locations, region });
                // BackgroundGeolocation.endTask(taskKey);
                });
            });
          });
      
        //   BackgroundGeolocation.on('stationary', (location) => {
        //     console.log('[DEBUG] BackgroundGeolocation stationary', location);
        //     BackgroundGeolocation.startTask(taskKey => {
        //       requestAnimationFrame(() => {
        //         alert('dddddddd');
        //         const stationaries = this.state.stationaries.slice(0);
        //         if (location.radius) {
        //           const longitudeDelta = 0.01;
        //           const latitudeDelta = 0.01;
        //           const region = Object.assign({}, location, {
        //             latitudeDelta,
        //             longitudeDelta
        //           });
        //           const stationaries = this.state.stationaries.slice(0);
        //           stationaries.push(location);
        //           this.setState({ stationaries, region });
        //         }
        //         BackgroundGeolocation.endTask(taskKey);
        //       });
        //     });
        //   });
      
          BackgroundGeolocation.on('foreground', () => {
            console.log('[INFO] App is in foreground');
          });
      
          BackgroundGeolocation.on('background', () => {
            console.log('[INFO] App is in background');
          });
      
          BackgroundGeolocation.checkStatus(({ isRunning }) => {
            this.setState({ isRunning });
          });


    };

    getInitialState() {
        return {
            region: {
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            },
        };
    };

    onRegionChange(region, lastLat, lastLong) {
        this.setState({
          mapRegion: region,
          // If there are no new values set the current ones
          lastLat: lastLat || this.state.lastLat,
          lastLong: lastLong || this.state.lastLong
        });
    };

    searchPlaces = async() => {
        Keyboard.dismiss();
        if(this.state.searchPlacetxt === '') {
            Alert.alert("Warning!", "Please input the place to search");
            return;
        }

        this.setState({
            searchPlacesName: [],
            searchPlacesAddress: [],
            searchPlacesLatLng: [],
        });

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + this.state.searchPlacetxt + '&location=' + this.state.currentLat + ',' + this.state.currentLng + '&radius=40000' + '&key=' + APIkey)
            .then(response => response.json())
            .then(data => {
                // alert(self.state.currentLat + '  ' + self.state.currentLng);
                // alert(data);
                var places = [];
                if(data.status === 'ZERO_RESULTS') {
                    Alert.alert("Notice!", "There is no search result!");
                } else {
                    places = data.results;
                    var placeName = '';
                    var placeAddress = '';
                    var placelatlng = [];
                    var placelat = 0.0;
                    var placelng = 0.0;
                    for (i = 0; i < places.length; i ++) {
                        placeName = places[i].name;
                        placeAddress = places[i].formatted_address;
                        placelat = places[i].geometry.location.lat;
                        placelng = places[i].geometry.location.lng;
                        placelatlng = [placelat, placelng];

                        self.setState({
                            searchPlacesName: [...self.state.searchPlacesName, placeName],
                            searchPlacesAddress: [...self.state.searchPlacesAddress, placeAddress],
                            searchPlacesLatLng: [...self.state.searchPlacesLatLng, placelatlng],
                        });

                        console.log(placeName + '::' + placeAddress + '::' + placelatlng[0] + '::' + placelatlng[1]);
                    }
                    
                    this.setState({showModal: true});
                }
            })
            .catch(function(error) {
                console.log(error);
                Alert.alert('Warning!', 'Network error!');
            });

        this.setState({showIndicator: false});
    };

    clearMap = () => {
        // console.log('                 ' + this.state.destPlaceName + '::' + this.state.destLat + '::' + this.state.destLng);
        this.setState({
            destPlaceName: '',
            destPlaceAddress: '',
            destLat: 0.0,
            destLng: 0.0,
        });

        var region = {
            latitude:       this.state.currentLat,
            longitude:      this.state.currentLng,
            latitudeDelta:  0.00922*1.5,
            longitudeDelta: 0.00421*1.5
        };

        this.setState({
            mapRegion: region,
        })
    };

    closeModal = () => {
        this.setState({showModal: false});
    };

    drawRoute = (index) => {
       
        this.setState({showModal: false});

        var region = {
            latitude:       this.state.searchPlacesLatLng[index][0],
            longitude:      this.state.searchPlacesLatLng[index][1],
            latitudeDelta:  0.00922*1.5,
            longitudeDelta: 0.00421*1.5
        }
        
        this.setState({
            destPlaceName: this.state.searchPlacesName[index],
            destPlaceAddress: this.state.searchPlacesAddress[index],
            destLat: this.state.searchPlacesLatLng[index][0],
            destLng: this.state.searchPlacesLatLng[index][1],
            mapRegion: region,
        });

    }

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
                        <Text style = {{fontSize: 25}}> Driver </Text>
                        <TouchableOpacity style = {{position: 'absolute', top: 30, left: 20}} onPress = {() => this.signOut()}>
                            <Text style = {{fontSize: 12, }}>Sign Out</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style = {{position: 'absolute', top: 30, right: 20}} onPress = {() => this.appSetting()}>
                            <Text style = {{fontSize: 12, }}>Setting</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style = {{width: '100%', height: mainSectionHeight}} keyboardShouldPersistTaps = 'always'>
                        <View style = {styles.main_part}>
                            <View style = {{width: '90%', height: '10%', justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
                                <View style = {{width: '70%', height: '80%', justifyContent: 'center', alignItems: 'center'}}>
                                    <TextInput style = {{ width: '100%', height: '100%', fontSize: 15, color: '#000000', backgroundColor: '#ffffff', paddingLeft: 5, paddingTop: 0, paddingBottom: 0}} underlineColorAndroid = 'transparent' placeholder = {'Search Place'} placeholderTextColor = {'#808080'} onChangeText = {(typedText) => this.setState({searchPlacetxt: typedText})}/>
                                </View>
                                <TouchableOpacity style = {{width: '25%', height: '60%', marginLeft: '5%', borderRadius: 10, backgroundColor: '#ff4858', alignItems: 'center', justifyContent: 'center'}} onPress = {() => this.searchPlaces()}>
                                    <Text style = {{fontSize: 17, color: '#ffffff'}}>Search</Text>
                                </TouchableOpacity>
                            </View>
                            <View style = {{width: '100%', height: '90%', justifyContent: 'center', alignItems: 'center'}}>
                                <View style = {{width: '90%', height: '100%'}}>
                                    <TouchableOpacity style = {{width: 20, height: 20, alignItems: 'center', justifyContent: 'center', position: 'absolute', zIndex: 100, left: 10, top: 10}} onPress = {() => this.clearMap()}>
                                        <Image style = {{width: '100%', height: '100%'}} resizeMode = 'contain' source = {require('../assets/images/clear.png')}/>
                                    </TouchableOpacity>
                                    <MapView
                                        style = {{...StyleSheet.absoluteFillObject,}}
                                        region={this.state.mapRegion}
                                        followUserLocation={true}
                                        showsMyLocationButton={true}
                                        // onRegionChange={this.onRegionChange.bind(this)}
                                        // onPress={this.onMapPress.bind(this)}
                                    >
                                    {
                                        (this.state.firstLat !== 0.0) && (this.state.firstLng !== 0.0) &&
                                        <MapView.Marker coordinate = {{"latitude": this.state.firstLat, "longitude": this.state.firstLng}}
                                            title = 'My Location'>
                                            <View style = {{width: 35, height: 35}}>
                                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/current_location.png')}/>
                                            </View>
                                        </MapView.Marker>
                                    }
                                    
                                    {
                                        (this.state.destLat !== 0.0) && (this.state.destLng !== 0.0) &&
                                        <MapView.Marker coordinate = {{"latitude": this.state.destLat, "longitude": this.state.destLng}}
                                            title = {this.state.destPlaceName} description = {this.state.destPlaceAddress}>
                                            <View style = {{width: 30, height: 30}}>
                                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/dest_location.png')}/>
                                            </View>
                                        </MapView.Marker>
                                    }
                                    {
                                        (this.state.destLat !== 0.0) && (this.state.destLng !== 0.0) &&
                                        <MapViewDirections
                                            origin={{latitude: this.state.currentLat, longitude: this.state.currentLng}}
                                            destination={{latitude: this.state.destLat, longitude: this.state.destLng}}
                                            apikey={APIkey}
                                            strokeWidth = {3}
                                            strokeColor = 'blue'
                                        />
                                    }
                                    </MapView>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity style = {styles.banner_section} onPress = {() => this.onClickAds()}>
                        {
                            (this.state.ads_image !== '')&&
                            <Image style = {{width: '100%', height: '100%'}} resizeMode = {'stretch'} source = {{uri: this.state.ads_image}}/>
                        }
                        </TouchableOpacity>
                    </ScrollView>
                    <Modal isVisible = {this.state.showModal} style = {styles.modal} onBackButtonPress = {() => this.setState({showModal: false})} avoidKeyboard = {false}>
                        <View style = {{width: 50, height: 50, top: 0, right: 0, position: 'absolute', zIndex: 10}}>
                            <TouchableOpacity style = {{width: '100%', height: '100%'}} onPress = {() => this.closeModal()}>
                                <Image style = {{width: '100%', height: '100%'}} resizeMode = {'contain'} source = {require('../assets/images/close_red.png')}/>
                            </TouchableOpacity>
                        </View>
                        <View style = {styles.modalContainer}>
                            <View style = {styles.modal_header}>
                                <Text style = {{fontSize: 25, color: '#ffffff'}}>Search Results</Text>
                            </View>
                            <View style = {styles.modal_body}>
                                <ScrollView style = {{width: '90%', height: '95%'}} showsVerticalScrollIndicator = {false}>
                                {
                                    this.state.searchPlacesName.map((item, index) => 
                                        <TouchableOpacity key = {index} style = {{width: '100%', height: 60, borderBottomColor: '#000000', borderBottomWidth: 1}} onPress = {() => this.drawRoute(index)}>
                                            <View style = {{width: '100%', height: '50%', alignItems: 'flex-start', justifyContent: 'center'}}>
                                                <Text style = {{fontSize: 20}} numberOfLines = {1} renderTruncatedFooter = {() => null}>{this.state.searchPlacesName[index]}</Text>
                                            </View>
                                            <View style = {{width: '100%', height: '50%', alignItems: 'flex-start', justifyContent: 'center'}}>
                                                <Text style = {{fontSize: 15}} numberOfLines = {1} renderTruncatedFooter = {() => null}>{this.state.searchPlacesAddress[index]}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
                    
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    components_container: {
        width: '90%',
        height: deviceWidth * 0.9,
        alignItems: 'center',
        justifyContent: 'center',
        // marginVertical: deviceWidth * 0.1 * 0.25,
    },
    component_view: {
        // backgroundColor: '#0a0f2c',
        alignItems: 'center',
        justifyContent: 'center',
        // width: deviceWidth * 0.9 * 0.3,
        height: deviceWidth * 0.9 * 0.3,
        borderWidth: 1,
        borderColor: '#ffffff'
    },
    modal: {
        // width: '100%',
        // height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        // width: deviceWidth * 0.9,
        // height: deviceHight * 0.9,
        width: '95%',
        height: '95%',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,

    },
    modal_header: {
        width: '100%',
        height: '17%',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        overflow: 'hidden',
        backgroundColor: '#3f39b6'
    },
    modal_body: {
        width: '100%',
        height: '83%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    banner_section: {
        // position: 'absolute',
        width: '100%',
        height: bannerHeight,
        bottom: 0,
        // backgroundColor: '#392b59',
    },

});
