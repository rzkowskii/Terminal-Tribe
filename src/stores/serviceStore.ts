import { create } from 'zustand';

export interface ServiceUnit {
	name: string;
	enabled: boolean;
	active: boolean;
	logs: string[];
}

interface ServiceStore {
	units: Record<string, ServiceUnit>;
	ensure: (name: string) => ServiceUnit;
	status: (name: string) => ServiceUnit | undefined;
	start: (name: string) => void;
	stop: (name: string) => void;
	enable: (name: string) => void;
	disable: (name: string) => void;
	log: (name: string, message: string) => void;
	list: () => ServiceUnit[];
}

const useServiceStore = create<ServiceStore>((set, get) => ({
	units: {},
	ensure: (name) => {
		const u = get().units[name];
		if (u) return u;
		const nu: ServiceUnit = { name, enabled: false, active: false, logs: [] };
		set(s => ({ units: { ...s.units, [name]: nu } }));
		return nu;
	},
	status: (name) => get().units[name],
	start: (name) => set(s => ({ units: { ...s.units, [name]: { ...(s.units[name] || { name, enabled: false, active: false, logs: [] }), active: true } } })),
	stop: (name) => set(s => ({ units: { ...s.units, [name]: { ...(s.units[name] || { name, enabled: false, active: false, logs: [] }), active: false } } })),
	enable: (name) => set(s => ({ units: { ...s.units, [name]: { ...(s.units[name] || { name, enabled: false, active: false, logs: [] }), enabled: true } } })),
	disable: (name) => set(s => ({ units: { ...s.units, [name]: { ...(s.units[name] || { name, enabled: false, active: false, logs: [] }), enabled: false } } })),
	log: (name, message) => set(s => ({ units: { ...s.units, [name]: { ...(s.units[name] || { name, enabled: false, active: false, logs: [] }), logs: [ ...(s.units[name]?.logs || []), message ] } } })),
	list: () => Object.values(get().units),
}));

export default useServiceStore;


