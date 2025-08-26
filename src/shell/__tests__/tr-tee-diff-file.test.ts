import { execute } from '../../shell';
import { FileSystemState } from '../../types/level';

function ctx(state: FileSystemState, stdin?: string) {
	return { currentState: state, stdin } as any;
}

describe('tr/tee/diff/file', () => {
	test('tr translate and delete', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
		let res = await execute("tr 'a-z' 'A-Z'", ctx(state, 'abz'));
		expect(res.output).toBe('ABZ');
		res = await execute("tr -d 'aeiou'", ctx(state, 'hello'));
		expect(res.output).toBe('hll');
	});

	test('tee writes to files and echoes', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
		let res = await execute('tee a.txt b.txt', ctx(state, 'payload'));
		expect(res.output).toBe('payload');
		state = res.newState!;
		res = await execute('diff a.txt b.txt', ctx(state));
		expect(res.output).toBe('');
	});

	test('file identifies types', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: { d: { type: 'directory', files: {} }, f: { type: 'file', content: 'x' }, l: { type: 'symlink', target: '/home/recruit/f' } } } } } } } as any;
		let res = await execute('file d', ctx(state));
		expect(res.output).toMatch(/directory/);
		res = await execute('file f', ctx(state));
		expect(res.output).toMatch(/ASCII text/);
		res = await execute('file l', ctx(state));
		expect(res.output).toMatch(/symbolic link/);
	});
});


