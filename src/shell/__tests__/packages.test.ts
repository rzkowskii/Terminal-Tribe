import { execute } from '../../shell';
import { FileSystemState } from '../../types/level';

function ctx(state: FileSystemState) { return { currentState: state } as any; }

describe('packages (sim)', () => {
	test('apt search/install/remove and dpkg -l', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
		let res = await execute('apt search curl', ctx(state));
		expect(res.output).toMatch(/curl/);
		res = await execute('apt install curl', ctx(state));
		expect(res.status).toBe('success');
		res = await execute('dpkg -l', ctx(state));
		expect(res.output).toMatch(/curl/);
		res = await execute('apt remove curl', ctx(state));
		expect(res.status).toBe('success');
	});

	test('dnf install and rpm -q', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
		let res = await execute('dnf install nano', ctx(state));
		expect(res.status).toBe('success');
		res = await execute('rpm -q nano', ctx(state));
		expect(res.output).toMatch(/nano-6.0/);
	});
});


