import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { AntDesign } from '@expo/vector-icons';
import { BottomModalComponent } from '@/components';
import { cryptoList, recipientList } from '../data';
import { BorrowComponent, LendComponent } from './components';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationOptions } from '@react-navigation/drawer';

const borrows = [

];

const loans = [

];

export function TreasuryScreen() {
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({
            title: '',
        } as DrawerNavigationOptions);
    });

    const [cryptoIsOpen, setCryptoIsOpen] = useState(false);
    const [cryptoValueSelected, setCryptoValueSelected] = useState<string>(cryptoList[0].value);

    const [borrowers, setBorrowers] = useState([]);
    const [recipientIsOpen, setRecipientIsOpen] = useState(false);
    const [recipientValueSelected, setRecipientValueSelected] = useState<string>();

    const cryptoSelected = cryptoList.find(p => p.value === cryptoValueSelected);

    return (
        <View style={styles.wrapper}>
            <View style={{ marginBottom: 30 }}>
                <BorrowComponent />
            </View>
            <View>
                <LendComponent />
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    wrapper: {
        padding: 12,
    },

    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    applyButton: {
        marginTop: 40,
        marginBottom: 20,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 5,
        elevation: 3,
        backgroundColor: 'black',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
});
