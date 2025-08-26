import { execute } from '../../shell';
import { FileSystemState } from '../../types/level';

function ctx(state: FileSystemState) {
	return { currentState: state } as any;
}

describe('permissions and ownership', () => {
	test('chmod octal and recursive', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: { d: { type: 'directory', files: { f: { type: 'file', content: 'x' } } } } } } } } } as any;
		let res = await execute('chmod -R 755 d', ctx(state));
		expect(res.status).toBe('success');
		state = res.newState!;
		res = await execute('ls -l', ctx(state));
		expect(res.output).toMatch(/drwxr-xr-x/);
	});

	test('chown owner:group', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: { f: { type: 'file', content: 'x' } } } } } } } as any;
		let res = await execute('chown root:root f', ctx(state));
		expect(res.status).toBe('success');
		state = res.newState!;
		res = await execute('ls -l', ctx(state));
		expect(res.output).toMatch(/root\s+root/);
	});

	test('umask get/set', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
		let res = await execute('umask', ctx(state));
		expect(res.output).toMatch(/^[0-7]{3}$/);
		res = await execute('umask 027', ctx(state));
		expect(res.status).toBe('success');
		res = await execute('umask', ctx(state));
		expect(res.output.trim()).toBe('027');
	});
});


