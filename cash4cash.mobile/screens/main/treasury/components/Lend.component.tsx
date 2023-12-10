import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const lends = [

];

export function LendComponent() {

    return (
        <View style={styles.wrapper}>
            <View style={styles.header}>
                <MaterialCommunityIcons name='bank-transfer-in' size={24} color='white' />
                <Text style={styles.title}>Lend</Text>
            </View>
            <View style={styles.content}>

                {!lends.length && <View style={styles.empty}>
                    <Text style={{ color: 'grey' }}>No lend yet</Text>
                </View>}

                {!!lends.length && <View>
                    <View style={styles.info}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 16, }}>Current lended</Text>
                            <Text style={{ color: 'grey' }}>
                                $2000
                                <Text style={{ fontSize: 18, fontWeight: 'bold' }}> · </Text>
                                3% APY
                            </Text>
                        </View>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.list}>

                    </View>
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
});
