import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { BottomModalComponent } from '@/components';

import { BorrowAddComponent } from './BorrowAdd.component';

const borrows = [
    {
        status: 'rejected',
        date: new Date(2021, 5, 20),
        amount: 1000,
        apy: 3,
        lenders: [
            {
                name: 'John',
                amount: 1000
            }
        ]
    },
    {
        status: 'requested',
        date: new Date(2021, 5, 20),
        amount: 1000,
        apy: 3,
        lenders: [
            {
                name: 'John',
                amount: 500
            },
            {
                name: 'Peter',
                amount: 500
            }
        ]
    },
    {
        date: new Date(2024, 3, 10),
        amount: 1000,
        apy: 3,
        status: 'active',
        lenders: [
            {
                name: 'John',
                amount: 500
            },
            {
                name: 'Peter',
                amount: 500
            }
        ]
    },
    {
        date: new Date(2024, 6, 22),
        amount: 1000,
        apy: 3,
        status: 'active',
        lenders: [
            {
                name: 'John',
                amount: 1000
            },
        ]
    }
];

export function BorrowComponent({ onChangeBlurBackground }: { onChangeBlurBackground: (value: boolean) => void }) {
    const [isBorrowModalVisible, setIsBorrowModalVisible] = useState(false);

    useEffect(() => {
        onChangeBlurBackground(isBorrowModalVisible);
    }, [isBorrowModalVisible]);

    return (
        <View style={styles.wrapper}>
            <BottomModalComponent title='Borrow' isVisible={isBorrowModalVisible} onClose={() => setIsBorrowModalVisible(false)} titleAlign='left' blurIntensity={90}>
                <BorrowAddComponent />
            </BottomModalComponent>

            <View style={styles.header}>
                <MaterialCommunityIcons name='bank-transfer-out' size={24} color='white' />
                <Text style={styles.title}>Borrow</Text>
            </View>
            <View style={styles.content}>

                <View style={styles.info}>
                    <View style={{ flex: 1 }}>
                        {!borrows.length && <>
                            <Text style={{ color: 'grey' }}>No borrow yet</Text>
                        </>}
                        {!!borrows.length && <>
                            <Text style={{ fontSize: 16, }}>Current borrowed</Text>
                            <Text style={{ color: 'grey' }}>
                                $2000
                                <Text style={{ fontSize: 18, fontWeight: 'bold' }}> · </Text>
                                3% APY
                            </Text>
                        </>}
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={() => setIsBorrowModalVisible(true)}>
                        <Text style={styles.addButtonText}>Add +</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.separator} />

                {!borrows.length && <View style={styles.empty}>
                    <Text style={{ color: 'grey', marginBottom: 5 }}>Need money?</Text>
                    <Text style={{ color: 'grey' }}>Click "Add +" button and your friends will help.</Text>
                </View>}

                {!!borrows.length && <View style={styles.list}>

                    {borrows.map((b, i) => <View key={i} style={styles.listItem}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{b.amount} USDT</Text>
                            <Text style={{ color: 'grey' }}>
                                {b.date?.toLocaleDateString()}
                                <Text style={{ fontSize: 18, fontWeight: 'bold' }}> · </Text>
                                {b.apy}% APY
                            </Text>
                            {!!b.lenders?.length && <Text style={{ color: 'grey' }}>
                                {b.lenders?.length} lenders
                            </Text>}
                        </View>
                        <Text style={{ color: 'grey' }}>{b.status}</Text>
                    </View>)}

                </View>}

                <View style={styles.help}>
                    <Text style={{ fontSize: 16, color: '#444', marginVertical: 10 }}>
                        <MaterialCommunityIcons name='help-rhombus' size={20} color='#444' />
                        &nbsp;&nbsp;Need more information?
                    </Text>
                    <MaterialIcons name='arrow-forward-ios' size={20} color='#444' />
                </View>


            </View>

        </View>
    )
};

const styles = StyleSheet.create({
    wrapper: {
        margin: 12,
        backgroundColor: '#000',
        borderRadius: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 0.75,
        margin: 10,
    },
    content: {
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingTop: 15,
        paddingBottom: 15,

    },
    info: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 15,
        flexDirection: 'row',
    },
    separator: {
        borderColor: '#ccc',
        borderBottomWidth: 1,
        marginTop: 15,
        marginBottom: 15,
    },
    empty: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 30,
    },
    list: {
        marginBottom: 15,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 15,
        marginVertical: 10,
    },
    help: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0002',
        borderRadius: 10,
        marginHorizontal: 15,
        padding: 10,
    },

    addButton: {
        padding: 10,
        backgroundColor: 'black',
        borderRadius: 5,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.75,
        color: 'white',
    },
});
