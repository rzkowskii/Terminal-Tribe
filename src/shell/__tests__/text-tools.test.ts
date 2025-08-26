import { execute } from '../../shell';
import { FileSystemState } from '../../types/level';

function ctx(state: FileSystemState) {
	return { currentState: state };
}

describe('text tools', () => {
	test('head -n and tail -n', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: { log: { type: 'file', content: 'a\nb\nc\nd\ne\n' } } } } } } } as any;
		let res = await execute('head -n 2 log', ctx(state));
		expect(res.status).toBe('success');
		expect(res.output).toBe('a\nb');
		res = await execute('tail -n 2 log', ctx(state));
		expect(res.output).toBe('d\ne');
	});

	test('wc default and flags', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: { f: { type: 'file', content: 'hello world\nnext line' } } } } } } } as any;
		let res = await execute('wc f', ctx(state));
		expect(res.output).toMatch(/^\d+ \d+ \d+$/);
		res = await execute('wc -l f', ctx(state));
		expect(res.output).toMatch(/^\d+$/);
	});

	test('cut -d -f', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: { data: { type: 'file', content: 'a,b,c\n1,2,3\n' } } } } } } } as any;
		const res = await execute('cut -d , -f 1,3 data', ctx(state));
		expect(res.output.trim()).toBe('a,c\n1,3');
	});
});


