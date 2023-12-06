import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { AntDesign } from '@expo/vector-icons';

import { cryptoList, recipientList, networks } from '../../data';

export function BorrowAddPersonalComponent() {
    const [cryptoIsOpen, setCryptoIsOpen] = useState(false);
    const [cryptoValueSelected, setCryptoValueSelected] = useState<string>(cryptoList[0].value);

    const [networkIsOpen, setNetworkIsOpen] = useState(false);
    const [networkValueSelected, setNetworkValueSelected] = useState<string>(networks[0].value);

    const [borrowers, setBorrowers] = useState([]);
    const [recipientIsOpen, setRecipientIsOpen] = useState(false);
    const [recipientValueSelected, setRecipientValueSelected] = useState<string>();

    const tokenNetworkView = useRef(null);
    const [tokenNetworkViewWidth, setTokenNetworkViewWidth] = useState(100);

    useEffect(() => {
        const timer = setTimeout(() => {
            tokenNetworkView.current?.measure((x, y, width) => width && setTokenNetworkViewWidth(width));
        }, 100);
        return () => clearTimeout(timer);
    }, [tokenNetworkView]);

    return (
        <View style={styles.content}>

            <View style={{ marginBottom: 15, zIndex: 10 }}>
                <View ref={tokenNetworkView} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8, zIndex: 10 }}>
                    <View style={{ flexGrow: 1 }}>
                        <DropDownPicker
                            showTickIcon={false}
                            open={cryptoIsOpen}
                            value={cryptoValueSelected}
                            items={cryptoList}
                            setOpen={setCryptoIsOpen}
                            setValue={setCryptoValueSelected}
                            style={{
                                backgroundColor: 'transparent',
                                minHeight: 30,
                                borderWidth: 0,
                            }}
                            containerStyle={{
                                width: tokenNetworkViewWidth / 5 * 2,
                            }}
                        />
                    </View>
                    <View style={{ flexGrow: 1 }}>
                        <DropDownPicker
                            showTickIcon={false}
                            open={networkIsOpen}
                            value={networkValueSelected}
                            items={networks}
                            setOpen={setNetworkIsOpen}
                            setValue={setNetworkValueSelected}
                            style={{
                                backgroundColor: 'transparent',
                                minHeight: 30,
                                borderWidth: 0,
                            }}
                            containerStyle={{
                                width: tokenNetworkViewWidth / 5 * 3,
                            }}
                        />
                    </View>
                </View>
                <View>
                    <TextInput
                        placeholder='money amount'
                        style={{
                            backgroundColor: '#fffa',
                            borderColor: '#cccc',
                            padding: 12,
                            borderRadius: 5,
                            borderWidth: 1,
                            marginRight: 8,
                            height: 40,
                            width: '100%'
                        }}
                        keyboardType='numeric'
                        returnKeyType='done'
                        //onChangeText={(text) => setTokenAmount(Number.parseFloat(text))}
                        //value={tokenAmount.toString()}
                        maxLength={10}
                    />
                </View>
                {false && <View>
                    <Text style={{ marginTop: 5, color: '#f57c71', fontWeight: '600' }}>Invalid</Text>
                </View>}
            </View>


            <View style={{ marginBottom: 15 }}>
                <TextInput
                    multiline
                    placeholder='Reason for loan'
                    style={{
                        height: 50,
                        backgroundColor: '#fffa',
                        borderColor: '#cccc',
                        padding: 12,
                        paddingBottom: 4,
                        borderRadius: 5,
                        borderWidth: 1,
                    }}
                    returnKeyType='done'
                />
            </View>


            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10, zIndex: 9 }}>
                <Text style={styles.title}>Collective Collateral</Text>
                <TouchableOpacity
                    style={{
                        padding: 8,
                        backgroundColor: 'black',
                        borderRadius: 5,
                    }}
                    onPress={() => setRecipientIsOpen(true)}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: 'white',
                    }}>Add lender</Text>
                </TouchableOpacity>
            </View>

            <DropDownPicker
                showTickIcon={false}
                searchable={true}
                open={recipientIsOpen}
                value={recipientValueSelected}
                items={recipientList}
                setOpen={setRecipientIsOpen}
                setValue={setRecipientValueSelected}
                onChangeValue={(value) => {
                    const recipient = recipientList.find(p => p.value === value);
                    if (!borrowers.includes(recipient)) {
                        setBorrowers([...borrowers, recipient]);
                    }
                }}
                searchPlaceholder='Search...'
                listMode='MODAL'
                modalProps={{
                    animationType: 'slide'
                }}
                style={{
                    display: 'none',
                }}
                searchTextInputStyle={{
                    backgroundColor: '#fff6',
                    borderColor: '#cccc',
                }}
                searchContainerStyle={{ borderBottomColor: '#ccc6' }}
            />

            {!borrowers.length && <Text style={{
                marginTop: 30,
                marginBottom: 10,
                color: 'grey',
                textAlign: 'center'
            }}>Please add borrowers</Text>}

            {borrowers.map(b => <View key={b.value} style={{
                marginVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
            }}>
                <Text style={{
                    flexGrow: 1,
                    minWidth: '30%',

                }}>{b.label}</Text>
                <TextInput
                    style={{
                        flexGrow: 1,
                        textAlign: 'center',
                        backgroundColor: '#fffa',
                        borderColor: '#cccc',
                        padding: 12,
                        borderRadius: 5,
                        borderWidth: 1,
                        height: 40,
                    }}
                    returnKeyType='done'
                    //onChangeText={(text) => setTokenAmount(Number.parseFloat(text))}
                    //value={tokenAmount.toString()}
                    maxLength={10}
                />
                <TouchableOpacity style={{
                    padding: 8,
                    marginLeft: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'black',
                    borderRadius: 5,
                    elevation: 5,
                }} onPress={() => { }}>
                    <AntDesign name='deleteuser' size={24} color='white' />
                </TouchableOpacity>

            </View>)}

        </View>
    )
};

const styles = StyleSheet.create({
    content: {

    },
    title: {
        flexGrow: 1,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.75,
    },
    cryptoDropDown: {
        backgroundColor: '#fffa',
        borderColor: '#cccc',
        borderRadius: 5,
        borderWidth: 1,
        minHeight: 40,
    },
});
