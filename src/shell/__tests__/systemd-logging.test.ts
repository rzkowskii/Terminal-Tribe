import { execute } from '../../shell';
import { FileSystemState } from '../../types/level';

function ctx(state: FileSystemState) {
	return { currentState: state } as any;
}

describe('systemctl/journalctl/logger', () => {
	test('enable/start service and log', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
		let res = await execute('systemctl enable api.service', ctx(state));
		expect(res.status).toBe('success');
		res = await execute('systemctl start api.service', ctx(state));
		expect(res.status).toBe('success');
		res = await execute('logger API up', ctx(state));
		expect(res.status).toBe('success');
		res = await execute('journalctl', ctx(state));
		expect(res.output).toMatch(/API up/);
		res = await execute('systemctl status api.service', ctx(state));
		expect(res.output).toMatch(/active enabled/);
	});
});


