import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SmartContract, Web3Button, useContract, useContractWrite } from '@thirdweb-dev/react-native';
import { LocationObjectCoords } from 'expo-location';
import { CourierModel, courierList, recipientList } from '../../data';
import { BottomModalComponent } from '@/components';
import { OrdersABI } from '@/services/abi/orders';
import { CourierItemComponent } from './CourierItem.component';


const CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_CONTRACT_ADDRESS;

export function LookingCourierComponent({ isVisible, onClose, location }: {
    isVisible: boolean,
    onClose: (event?: any) => void,
    location: LocationObjectCoords
}) {

    const { contract } = useContract(CONTRACT_ADDRESS, OrdersABI);
    const { mutateAsync, isLoading, error } = useContractWrite(contract, 'assignCourier');
    const [couriers, setCouriers] = useState<CourierModel[]>([]);

    useEffect(() => {
        if (!isVisible) {
            setCouriers([]);
            return;
        }

        let timer = setTimeout(() => {
            setCouriers(courierList);
        }, 3000);

        return () => {
            clearTimeout(timer);
        };
    }, [isVisible]);

    const onCancelButtonClick = () => {
        onClose();
    }

    const onAcceptButtonClick = async (contract: SmartContract, courier: CourierModel) => {
        console.log('contract\n', contract);
        await mutateAsync({
            args: [1, courier.address]
        });
    }

    const onSuccessAccept = async () => {
        Alert.alert('Success', 'The request was successfully registered in the blockchain network', [{ text: 'OK' }]);
    }

    const onErrorAccept = async (error: Error) => {
        console.error(JSON.stringify(error, null, 2));
        Alert.alert('Error', error.message, [{ text: 'OK' }]);
    }

    return (
        <BottomModalComponent isShowHeader={false} isVisible={isVisible} onClose={onClose} titleAlign='left' blurIntensity={100}>
            <View style={styles.content}>
                <View style={{ alignItems: 'center', marginBottom: 30 }}>
                    <View style={{ alignItems: 'center', marginBottom: 30 }}>
                        {!couriers.length &&
                            <Text style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                letterSpacing: 0.5,
                                marginBottom: 30,
                            }}>Looking for exchangers</Text>}

                        {couriers.map(courier => <CourierItemComponent key={courier.address} courier={courier} />)}
                    </View>


                    <Text style={{
                        fontSize: 14,
                        color: '#666',
                        fontWeight: '600',
                        letterSpacing: 0.5,
                        marginBottom: 12,
                    }}>Your suggestion</Text>

                    <View style={{ marginBottom: 44, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{
                            fontSize: 16,
                            marginHorizontal: 10,
                            color: '#666',
                            fontWeight: 'bold'
                        }}>100 USDC</Text>
                        <Image source={require(`../../../../assets/tokens/${'usdc'}.png`)} style={{
                            left: 3,
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            borderWidth: 1,
                            borderColor: '#999c',
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                        }} />
                        <Image source={require(`../../../../assets/flags/${'th'}.png`)} style={{
                            left: -3,
                            width: 30,
                            height: 30,
                            borderRadius: 15,
                            borderWidth: 1,
                            borderColor: '#999c',
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                        }} />
                        <Text style={{
                            fontSize: 16,
                            marginHorizontal: 10,
                            color: '#666',
                            fontWeight: 'bold'
                        }}>฿ THB</Text>
                    </View>

                    <TouchableOpacity style={styles.сancelButton} onPress={onCancelButtonClick}>
                        <Text style={styles.сancelButtonText}>Cancel order</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ marginBottom: 20 }}>



                </View>
            </View >
        </BottomModalComponent>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingTop: 10
    },
    сancelButton: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 5,
        elevation: 3,
        backgroundColor: 'black',
    },
    сancelButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        color: '#eb888a',
    },
});
