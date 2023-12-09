import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { CourierModel } from '../../data';

export function CourierItemComponent({ courier }: { courier: CourierModel }) {
    const [animation] = useState(new Animated.Value(1));

    useEffect(() => {
        Animated.timing(animation, {
            toValue: 0,
            duration: 60000,
            useNativeDriver: false,
        }).start();
    }, [animation]);

    const animatedStyle = {
        width: animation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
        }),
        backgroundColor: animation.interpolate({
            inputRange: [0, 0.1, 0.3, 1],
            outputRange: ['red', 'orange', '#2dac45', '#2dac45'],
        }),
        height: '100%',
        borderRadius: 3,
    };

    const onSuccessAccept = async () => {
        Alert.alert('Success', 'The request was successfully registered in the blockchain network', [{ text: 'OK' }]);
    }

    return (
        <View style={styles.wrapper}>
            <View style={styles.content}>
                <Image source={courier.icon} style={styles.avatar} />
                <View style={styles.infoWrapper}>
                    <Text>{courier.label}</Text>
                    <Text style={styles.rate}>Rate: {courier.rate}</Text>
                    <Text style={styles.sum}>{(courier.rate * 100).toFixed(2)} ฿ THB</Text>
                </View>
                <TouchableOpacity style={styles.acceptButton} onPress={() => onSuccessAccept()}>
                    <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.timerWrapper}>
                <Animated.View style={animatedStyle} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: 10,
    },
    content: {
        width: '100%',
        flexDirection: 'row',
        alignContent: 'flex-start',
        backgroundColor: '#eee9',
        borderColor: '#bbb5',
        borderBottomColor: 'transparent',
        borderWidth: 1,
        borderRadius: 5,
        borderBottomEndRadius: 0,
        borderBottomStartRadius: 0,

        padding: 10,
        paddingBottom: 8
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#bbb8',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    infoWrapper: {
        marginHorizontal: 10,
        flexGrow: 1,
        justifyContent: 'center'
    },
    rate: {
        fontSize: 14,
        color: '#666',
        letterSpacing: 0.5,
    },
    sum: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    acceptButton: {
        backgroundColor: '#add88d',
        justifyContent: 'center',
        paddingHorizontal: 14,
        borderColor: "#ccc9",
        borderRadius: 5,
        borderWidth: 1,
        elevation: 5,
    },
    acceptButtonText: {
        letterSpacing: 0.5,
        fontWeight: '600',
        color: 'black',
    },
    timerWrapper: {
        backgroundColor: '#eee9',
        borderColor: '#bbb5',
        borderTopColor: 'transparent',
        borderWidth: 1,
        borderRadius: 5,
        borderTopEndRadius: 0,
        borderTopStartRadius: 0,
        height: 6,
    },
});
