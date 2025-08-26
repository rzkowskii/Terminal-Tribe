import { BuiltinCommand } from '../types';
import useNetworkStore from '../../stores/networkStore';

export const ipCmd: BuiltinCommand = {
	meta: { name: 'ip', description: 'Show / manipulate routing, devices, policy routing (simulated)' },
	run: async (_ctx, args) => {
		const store = useNetworkStore.getState();
		const [obj, action, ...rest] = args;
		if (obj === 'addr' && action === 'add') {
			const [cidr, , name] = rest; // format: ip addr add 10.0.0.2/24 dev eth0
			if (!cidr || !name) return { output: 'ip: invalid addr add', status: 'error' };
			store.ensure(name);
			store.addAddress(name, cidr);
			return { output: '', status: 'success' };
		}
		if (obj === 'link' && (action === 'set')) {
			const [name, stateTok, updown] = rest; // ip link set eth0 up
			if (!name || stateTok !== 'up' && updown !== 'up' && updown !== 'down') {
				// try alternate token order
				const n = rest[0];
				const ud = rest[rest.length - 1];
				if (!n || (ud !== 'up' && ud !== 'down')) return { output: 'ip: invalid link set', status: 'error' };
				store.ensure(n);
				store.setLink(n, ud === 'up');
				return { output: '', status: 'success' };
			}
			store.ensure(name);
			store.setLink(name, (updown || stateTok) === 'up');
			return { output: '', status: 'success' };
		}
		if (obj === 'route' && action === 'add') {
			const dest = rest[0];
			const viaIdx = rest.indexOf('via');
			const via = viaIdx >= 0 ? rest[viaIdx + 1] : undefined;
			store.addRoute({ destination: dest || 'default', via });
			return { output: '', status: 'success' };
		}
		if (obj === 'addr' && action === 'show') {
			const lines: string[] = [];
			for (const i of store.listInterfaces()) {
				for (const a of i.addresses) lines.push(`${i.name} ${a}`);
			}
			return { output: lines.join('\n'), status: 'success' };
		}
		if (obj === 'route' && action === 'show') {
			return { output: store.listRoutes().map(r => `${r.destination}${r.via ? ' via ' + r.via : ''}`).join('\n'), status: 'success' };
		}
		return { output: 'ip: unsupported', status: 'error' };
	}
};

export const pingCmd: BuiltinCommand = {
	meta: { name: 'ping', description: 'Send ICMP ECHO_REQUEST (simulated)' },
	run: async (_ctx, args) => {
		const host = args[0];
		if (!host) return { output: 'ping: missing host', status: 'error' };
		// Simulate success
		return { output: `PING ${host} (192.0.2.1): 56 data bytes\n64 bytes from 192.0.2.1: icmp_seq=0 ttl=64 time=0.5 ms`, status: 'success' };
	}
};


