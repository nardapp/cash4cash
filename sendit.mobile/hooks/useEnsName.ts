import { useSigner } from '@thirdweb-dev/react-native';
import { useEffect, useState } from 'react';

export const useEnsName = (address: string) => {
    const signer = useSigner();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>(null);
    const [name, setName] = useState<string | null>(null);
    const [avatar, setAvatar] = useState<string | null>(null);

    useEffect(() => {
        if (!address) {
            setIsLoading(false);
            setError(null);
            setName(null);
            return;
        }

        const fetchEnsName = async () => {
            try {
                const name = await signer?.provider?.lookupAddress(address || '');
                setName(name);
                setIsLoading(false);
            } catch (e) {
                setError(e);
                await fetchEnsNameByWeb3Bio();
            }
        };
        const fetchEnsNameByWeb3Bio = async () => {
            try {
                const response = await fetch(`https://api.web3.bio/profile/ens/${address}`)
                const result: IWeb3bioENSResponse = await response.json();
                if (result.platform?.toLowerCase() === 'ens') {
                    setName(result.displayName);
                    setAvatar(result.avatar);
                }
            } catch (e) {
                setError(e);
            } finally {
                setIsLoading(false);
            }
        };

        setIsLoading(true);
        setName(null);
        setAvatar(null);
        void fetchEnsName();
    }, [address, signer]);

    return { isLoading, error, name, avatar };
}

interface IWeb3bioENSResponse {
    address: string;
    identity: string;
    platform: string;
    displayName: string;
    avatar: string;
    email: string | null;
    description: string | null;
    location: string | null;
    header: string | null;
    links: Record<string, { link: string; handle: string }>;
}