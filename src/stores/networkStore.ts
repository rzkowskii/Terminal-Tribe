import { create } from 'zustand';

export interface NetInterface {
	name: string;
	up: boolean;
	addresses: string[]; // CIDR strings like 192.168.1.10/24
}

export interface Route {
	destination: string; // e.g., 'default' or '10.0.0.0/24'
	via?: string; // next hop IP
}

interface NetworkStore {
	interfaces: Record<string, NetInterface>;
	routes: Route[];
	ensure: (name: string) => NetInterface;
	setLink: (name: string, up: boolean) => void;
	addAddress: (name: string, cidr: string) => void;
	addRoute: (route: Route) => void;
	listInterfaces: () => NetInterface[];
	listRoutes: () => Route[];
}

const useNetworkStore = create<NetworkStore>((set, get) => ({
	interfaces: {},
	routes: [],
	ensure: (name) => {
		const i = get().interfaces[name];
		if (i) return i;
		const ni: NetInterface = { name, up: false, addresses: [] };
		set(s => ({ interfaces: { ...s.interfaces, [name]: ni } }));
		return ni;
	},
	setLink: (name, up) => set(s => ({ interfaces: { ...s.interfaces, [name]: { ...(s.interfaces[name] || { name, up: false, addresses: [] }), up } } })),
	addAddress: (name, cidr) => set(s => ({ interfaces: { ...s.interfaces, [name]: { ...(s.interfaces[name] || { name, up: false, addresses: [] }), addresses: [ ...(s.interfaces[name]?.addresses || []), cidr ] } } })),
	addRoute: (route) => set(s => ({ routes: [ ...s.routes, route ] })),
	listInterfaces: () => Object.values(get().interfaces),
	listRoutes: () => get().routes,
}));

export default useNetworkStore;


