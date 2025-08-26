import { execute } from '../../shell';
import { FileSystemState } from '../../types/level';

function ctx(state: FileSystemState) { return { currentState: state } as any; }

describe('networking (sim)', () => {
	test('ip addr/link/route and ping', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
		let res = await execute('ip addr add 10.0.0.2/24 dev eth0', ctx(state));
		expect(res.status).toBe('success');
		res = await execute('ip link set eth0 up', ctx(state));
		expect(res.status).toBe('success');
		res = await execute('ip route add default via 10.0.0.1', ctx(state));
		expect(res.status).toBe('success');
		res = await execute('ip addr show', ctx(state));
		expect(res.output).toMatch(/eth0 10.0.0.2\/24/);
		res = await execute('ip route show', ctx(state));
		expect(res.output).toMatch(/default via 10.0.0.1/);
		res = await execute('ping example.com', ctx(state));
		expect(res.output).toMatch(/PING example.com/);
	});
});


