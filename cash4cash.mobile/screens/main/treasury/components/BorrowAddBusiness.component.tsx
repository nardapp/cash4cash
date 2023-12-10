import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export function BorrowAddBusinessComponent() {

    return (
        <View style={styles.content}>
            <Text style={styles.title}>Business</Text>
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
        margin: 20,
        marginBottom: 200,
    },
});
