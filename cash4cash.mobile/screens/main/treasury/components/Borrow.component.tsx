import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import { BottomModalComponent } from '@/components';

import { BorrowAddComponent } from './BorrowAdd.component';
import { BorrowListComponent } from './BorrowList.component';

export function BorrowComponent({ onChangeBlurBackground }: { onChangeBlurBackground: (value: boolean) => void }) {
    const [isBorrowModalVisible, setIsBorrowModalVisible] = useState(false);
    const [borrowLength, setBorrowLength] = useState(0);

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
                        {!borrowLength && <>
                            <Text style={{ color: 'grey' }}>No borrow yet</Text>
                        </>}
                        {!!borrowLength && <>
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

                {!borrowLength && <View style={styles.empty}>
                    <Text style={{ color: 'grey', marginBottom: 5 }}>Need money?</Text>
                    <Text style={{ color: 'grey' }}>Click "Add +" button and your friends will help.</Text>
                </View>}

                <BorrowListComponent setBorrowLength={setBorrowLength} />

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
