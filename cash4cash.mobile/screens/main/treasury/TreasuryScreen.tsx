import { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationOptions } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useConnectionStatus } from '@thirdweb-dev/react-native';

import { BorrowComponent, LendComponent } from './components';

export function TreasuryScreen() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [isBlurBackground, setIsBlurBackground] = useState(false);

    const connectionStatus = useConnectionStatus();

    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
            title: '',
        } as DrawerNavigationOptions);
    });

    return (
        <ScrollView>
            <View style={{ marginTop: insets.top, marginBottom: 100 }}>
                {connectionStatus === 'connected' && <>
                    <BorrowComponent onChangeBlurBackground={(value: boolean) => setIsBlurBackground(value)} />
                    <LendComponent />
                </>}
                {connectionStatus !== 'connected' && <>
                    <View>
                        <Text style={{ textAlign: 'center', marginTop: 350 }}>Please connect your wallet</Text>
                    </View>
                </>}
            </View>

            {isBlurBackground && <View style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }} />}
        </ScrollView>
    )
};
