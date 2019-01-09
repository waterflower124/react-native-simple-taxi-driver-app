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
    StatusBar,
    ImageBackground,
} from 'react-native';

import 'whatwg-fetch'
import Global from '../Global/Global';


import { BallIndicator } from 'react-native-indicators';

import { openDatabase } from 'react-native-sqlite-storage';

var accountDB = openDatabase({ name: 'account.db' });

var deviceWidth = Dimensions.get('window').width;
var deviceHeight = Dimensions.get('window').height;

const DismissKeyboard = ({children}) => (
    <TouchableWithoutFeedback onPress = {() => Keyboard.dismiss()}>
        {children}
    </TouchableWithoutFeedback>
);


export default class SignIn extends Component {
    static navigationOptions = {
		header: null,
    };
    
    constructor(props) {
        super(props);
        
        this.state = {
            isReady: false,
            email: '',
            password: '',
            // email: 0.0,
            // password: 0.0,
            checkRemember: false,
            showIndicator: false,

            
        };
    };

    componentWillMount() {
        // this.getCameraPermission();
        // StatusBar.setHidden(true);

        if(Platform.OS === 'android') {
            Global.statusBarheight = StatusBar.currentHeight;
        }

        accountDB.transaction(function(txn) {
            txn.executeSql(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='table_user'",
                [],
                function(tx, res) {
                    // console.log('1111111  item:', res.rows.length);
                    if (res.rows.length === 0) {
                        txn.executeSql('DROP TABLE IF EXISTS table_user', []);
                        txn.executeSql(
                            'CREATE TABLE IF NOT EXISTS table_user(user_id INTEGER PRIMARY KEY AUTOINCREMENT, email VARCHAR(128), password VARCHAR(128))',
                            []
                        );
                    }
                }
            );
        });
    };

    componentDidMount() {

        this.props.navigation.addListener('willFocus', this.setStateVarible.bind(this));

        self = this;
        accountDB.transaction(function(txn) {
            txn.executeSql(
              'SELECT * FROM table_user where 1',
              [],
                function(tx, results) {
                    var len = results.rows.length;
                    // console.log('1111111  length of DN result',len);
                    if (len > 0) {
                        // console.log('1111111  email password:  ' + results.rows.item(0).email + ':::::::' + results.rows.item(0).password + ']]]]]]');
                        self.setState({
                            email: results.rows.item(0).email,
                            password: results.rows.item(0).password,
                            checkRemember: true,
                        });
                        
                        
                    } else {
                        // console.log('111111:::    werqwerqwerqwre');
                    }
                }
            );
        });
    };

    setStateVarible = async() => {
        if(this.props.navigation.state.params) {
            this.setState({
                email: this.props.navigation.state.params.email,
                password: this.props.navigation.state.params.password,
            });
        }
    };

    // getCameraPermission = async() => {
    //     const permissionGallery = await Permissions.getAsync(Permissions.CAMERA_ROLL);
    //     if (permissionGallery.status !== 'granted') {
    //         const newPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    //         if (newPermission.status === 'granted') {
    //             //its granted.
    //             console.log("camera roll granted");
    //         }
    //     } else {
    //         console.log("camera roll granted from getAsync");
    //     }

    //     const permissionCamera = await Permissions.getAsync(Permissions.CAMERA);
    //     if (permissionCamera.status !== 'granted') {
    //         const newPermission = await Permissions.askAsync(Permissions.CAMERA);
    //         if (newPermission.status === 'granted') {
    //             //its granted.
    //             console.log("camera granted");
    //         }
    //     } else {
    //         console.log("camera granted from getAsync");
    //     }
    // }

    handleEmail = (typedText) => {
        this.setState({
            email: typedText
        });
    };

    handlePassword = (typedText) => {
        this.setState({
            password: typedText
        });
    };

    checkRemember = async() => {
        this.setState({
            checkRemember: !this.state.checkRemember
        });
    };

    signIn = async() => {
        Keyboard.dismiss();
        if(this.state.email === '') {
            Alert.alert('Warning!', 'Please input your Email address');
            return;
        };
        let regExpression = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
        if(regExpression.test(this.state.email) === false) {
            Alert.alert("Warning!", 'Please input valid Email Address');
            return;
        };
        if(this.state.password === '') {
            Alert.alert('Warning!', 'Please input your password');
            return;
        };
        if(this.state.password.length < 6) {
            Alert.alert("Warning!", 'The Password must be at least 6 characters.');
            return;
        };

        var formData = new FormData();
        formData.append('type', 'driver');
        formData.append('email', this.state.email);
        formData.append('password', this.state.password);

        this.setState({showIndicator: true});
        self = this;
        await fetch('https://cabgomaurice.com/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // console.log('111111: signinreponse' + JSON.stringify(data));
                if(data.status === 'fail') {
                    if(data.error_type === 'wrong_password') {
                        Alert.alert('Warning!', 'Invalid password.')
                    } else if(data.error_type === 'no_user') {
                        Alert.alert('Warning!', 'Invalid email.')
                    } else if(data.error_type === 'no_activated') {
                        Alert.alert('Warning!', 'Your account is not activated. Please verify your email and phone number',
                            [
                                {text: 'Cancel', onPress: () => null},
                                {text: 'OK', onPress: () => {
                                    Global.email = self.state.email;
                                    Global.password = self.state.password;
                                    this.props.navigation.navigate('Verification', {email: self.state.email})}
                                }
                            ],
                            {cancelable: true}
                        );
                    } else {
                        Alert.alert('Warning!', 'There is something wrong in server. Please try again.');
                    }
                } else if(data.status === 'success') {
                    Global.token = data.data;
                    Global.email = self.state.email;
                    Global.password = self.state.password;

                    //  operation on SQLite
                    accountDB.transaction(function(txn) {
                        txn.executeSql(
                            'DELETE FROM table_user where 1',
                            function(tx, results) {
                                console.log('Results', results.rowsAffected);
                                // if (results.rowsAffected > 0) {
                                //     Alert.alert(
                                //         'Success',
                                //         'User deleted successfully',
                                //     );
                                // } else {
                                //     alert('Please insert a valid User Id');
                                // }
                            }
                        );
                    });

                    if(self.state.checkRemember) {

                        accountDB.transaction(function(txn) {
                            txn.executeSql(
                                'INSERT INTO table_user (email, password) VALUES (?,?)',
                                [Global.email, Global.password],
                                function(tx, results) {
                                    console.log('Results', results.rowsAffected);
                                    if (results.rowsAffected > 0) {
                                        
                                    } else {
                                        // alert('Registration Failed');
                                    }
                                }
                            );
                        });
                    } else {
                        self.setState({
                            email: '',
                            password: '',
                            checkRemember: false,
                        })
                    }

                    this.props.navigation.navigate('Home');
                }
            })
            .catch(function(error) {
                // console.log('111111: signinerrorrororor' + JSON.stringify(error));
                Alert.alert('Warning!', 'Network error.')
            })

        this.setState({showIndicator: false});

    };

    signUp = async() => {
        this.props.navigation.navigate('SignUp');
        // this.props.navigation.navigate('DriverPicture', {email: 'self.state.email'});
    };

    forgetPassword = async() => {
        this.props.navigation.navigate('ForgetPassword');
    };


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
            <ScrollView style = {{width: '100%', height: '100%'}} keyboardShouldPersistTaps = 'always'>
                <View style = {styles.logo_part}>
                    <Image style = {styles.logo_style} resizeMode = {'contain'} source = {require('../assets/images/logo.png')}/>
                </View>
                <View style = {styles.main_part}>
                    <View style = {styles.component_input}>
                        <View style = {styles.title_view}>
                            <Text style = {styles.title_text}> Email </Text>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput underlineColorAndroid = 'transparent' style = {styles.input_text} onChangeText = {this.handleEmail}>{this.state.email}</TextInput>
                        </View>
                    </View>
                    <View style = {styles.component_input}>
                        <View style = {styles.title_view}>
                            <Text style = {styles.title_text}> Password </Text>
                        </View>
                        <View style = {styles.input_view}>
                            <TextInput underlineColorAndroid = 'transparent' style = {styles.input_text} secureTextEntry={true} onChangeText = {this.handlePassword}>{this.state.password}</TextInput>
                        </View>
                    </View>
                    <View style = {{width: '90%', marginLeft: '10%', height: 25, justifyContent: 'center', flexDirection: 'row'}}>
                        <TouchableOpacity onPress = {() => this.checkRemember()}>
                        {
                            this.state.checkRemember && 
                            <Image style = {{width: 25, height: 25}} resizeMode = {'contain'} source = {require('../assets/images/checkbox.png')}/>
                        }
                        {
                            !this.state.checkRemember &&
                            <Image style = {{width: 25, height: 25}} resizeMode = {'contain'} source = {require('../assets/images/uncheckbox.png')}/>
                        }
                        </TouchableOpacity>
                        <View style = {{width: '80%', height: 25, marginLeft: 10, justifyContent: 'center', }}>
                            <Text  style = {{color: '#ffffff', fontSize: 12, }}> Keep me Sign In </Text>
                        </View>
                    </View>
                    <TouchableOpacity style = {styles.signin_button} onPress = {() => this.signIn()} onPress = {() => this.signIn()}>
                        <Text style = {{color: '#ffffff', fontSize: 15}}>Sign In</Text>
                    </TouchableOpacity>
                    <View style = {styles.signup_view}>
                        <Text style = {{color: '#ffffff', fontSize: 15, fontStyle: 'italic'}}>New User?</Text>
                        <TouchableOpacity style = {{marginLeft: 10}} onPress = {() => this.signUp()}>
                            <Text style = {{color: '#ff4858', fontSize: 15}}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {styles.forgetpassword_view}>
                        <TouchableOpacity onPress = {() => this.forgetPassword()} onPress = {() => this.props.navigation.navigate('ForgetPassword')}>
                            <Text style = {{marginLeft: 10, color: '#ffffff', fontSize: 12, }}>Forgot Password</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>    
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
        backgroundColor: '#000000',
    },
    logo_part: {
        width: '100%',
        height: deviceHeight * 0.3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo_style: {
        width: '100%',
        height: '70%',
    },
    main_part: {
        width: '100%',
        height: deviceHeight * 0.7,
        // justifyContent: 'center',
        alignItems: 'center',
    },
    component_input: {
        width: '90%',
        height: 60,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 20,
    },
    title_view: {
        width: '100%',
        height: '50%',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    title_text: {
        color: '#ffffff', 
        fontSize: 15, 
        // fontFamily: 'coreSansBold', 
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    input_view: {
        width: '100%',
        height: '50%',
        borderBottomColor: '#6e1ced',
        borderBottomWidth: 1,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    input_text: {
        width: '100%',
        height: '100%',
        color: '#ffffff', 
        fontSize: 15, 
        // fontFamily: 'coreSansBold', 
        paddingTop: Platform.OS === 'android' ? 0 : 7
    },
    signin_button: {
        width: '40%',
        height: 40,
        backgroundColor: '#ff4858',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40
    },
    signup_view: {
        width: '100%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 20,
    },
    forgetpassword_view: {
        width: '100%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginTop: 20,
    }
});
