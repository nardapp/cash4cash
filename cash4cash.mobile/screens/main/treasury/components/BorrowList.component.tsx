import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAddress, useContract, useContractRead } from '@thirdweb-dev/react-native';
import { contractAddress } from '../../data';

let borrows = [
    // {
    //     date: new Date(2024, 6, 22),
    //     amount: 1000,
    //     apy: 3,
    //     status: 'active',
    //     lenders: [
    //         {
    //             name: 'John',
    //             amount: 1000
    //         },
    //     ]
    // }
];

export function BorrowListComponent({ setBorrowLength }: { setBorrowLength: (value: number) => void }) {
    borrows = [];

    const address = useAddress();
    const { contract } = useContract(contractAddress);

    const orderIds = [1, 2];
    // const { data, error, isSuccess } = useContractRead(contract, 'loanRequests', [address]);
    // if (isSuccess) {
    //     alert('loanRequests data:\n' + JSON.stringify(data, null, 2));
    // }


    if (address) {
        for (const orderId of orderIds) {
            try {
                const { data, error, isSuccess } = useContractRead(contract, 'remainingLoanTerms', [orderId]);

                if (error) {
                    const _ = error as Error;
                    alert('error: \n' + _.message);
                    continue;
                }

                if (!data || !isSuccess) continue;

                const result = {
                    loanTerm: +data[0].toString(),
                    createdAt: +data[1].toString(),
                    borrower: data[2].toString()
                };

                if (result.createdAt === 0) break;
                //alert('res: \n\n' + JSON.stringify(result, null, 2));

                if (result.borrower.toLowerCase() === address.toLowerCase()) {
                    borrows.push({
                        apy: 2,
                        status: 'active',
                        date: new Date((result.createdAt + result.loanTerm) * 1000),
                    });
                }

            } catch (error) {
                const _ = error as Error;
                alert('Error reading contract: \n\n' + _.message);
            }
        }
        setBorrowLength(borrows.length);
    }


    // useEffect(() => {

    // }, []);

    return (
        <View style={styles.content}>

            {!!borrows.length && <View style={styles.list}>

                {borrows.map((b, i) => <View key={i} style={styles.listItem}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{b.amount} USDC</Text>
                        <Text style={{ color: 'grey' }}>
                            {b.date?.toLocaleDateString()} {b.date?.toLocaleTimeString()}
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


        </View>
    )
};

const styles = StyleSheet.create({
    content: {

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
});
