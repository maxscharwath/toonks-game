import create from 'zustand';
import Network, {NetworkStatus} from '@game/network/Network';

type Store = {
	network: Network;
	status: NetworkStatus;
};
export const useNetwork = create<Store>((set, get) => {
	const network = Network.getInstance();
	network.on('status', status => {
		console.log('status', status);
		set({status});
	});

	return ({
		network,
		status: NetworkStatus.Disconnected,
	});
});
