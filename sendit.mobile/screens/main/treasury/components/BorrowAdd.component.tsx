import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toggle from 'react-native-toggle-element';

import { BorrowAddPersonalComponent } from './BorrowAddPersonal.component';
import { BorrowAddBusinessComponent } from './BorrowAddBusiness.component';

export function BorrowAddComponent() {
    const [isBusinessLoan, setIsBusinessLoan] = useState(false);
    const [parentViewWidth, setParentViewWidth] = useState(350);
    const parentViewRef = useRef<View>();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (parentViewRef.current)
                parentViewRef.current.measure((x, y, width) => {
                    if (width)
                        setParentViewWidth(width);
                });
        }, 100);
        return () => clearTimeout(timer);
    }, [parentViewRef]);

    return (
        <View style={styles.wrapper}>
            <View ref={parentViewRef} style={styles.content}>
                <Toggle
                    value={isBusinessLoan}
                    onPress={(newState) => setIsBusinessLoan(newState)}
                    thumbButton={{
                        width: parentViewWidth / 2,
                        height: 40,
                        radius: 5,
                        activeBackgroundColor: '#000',
                        inActiveBackgroundColor: '#000',
                    }}
                    trackBar={{
                        width: parentViewWidth,
                        height: 40,
                        radius: 5,
                        borderWidth: 1,
                        activeBackgroundColor: '#ddd3',
                        inActiveBackgroundColor: '#ddd3',
                    }}
                    containerStyle={{
                        marginBottom: 20
                    }}
                    trackBarStyle={{
                        borderColor: '#ccc2',
                    }}
                    leftComponent={
                        <Text style={{ fontSize: 16, letterSpacing: 0.75, fontWeight: 'bold', color: isBusinessLoan ? '#888' : '#fff' }}>Personal {isBusinessLoan ? '' : 'loan'}</Text>
                    }
                    rightComponent={
                        <Text style={{ fontSize: 16, letterSpacing: 0.75, fontWeight: 'bold', color: isBusinessLoan ? '#fff' : '#888' }}>Business {isBusinessLoan ? 'loan' : ''}</Text>
                    }
                />

                {!isBusinessLoan && <>
                    <BorrowAddPersonalComponent />
                </>}

                {isBusinessLoan && <>
                    <BorrowAddBusinessComponent />
                </>}

                <TouchableOpacity style={styles.applyButton} onPress={() => alert('Yes')}>
                    <Text style={styles.applyButtonText}>Request</Text>
                </TouchableOpacity>

            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    wrapper: {
    },
    content: {
        paddingTop: 6,
        paddingBottom: 20,
    },
    applyButton: {
        marginTop: 30,
        marginBottom: 10,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 5,
        backgroundColor: 'black',
    },
    applyButtonDisabled: {
        marginTop: 30,
        marginBottom: 10,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 5,
        backgroundColor: 'grey',
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
});
