import { execute } from '../../shell';
import { FileSystemState } from '../../types/level';

function ctx(state: FileSystemState) {
	return { currentState: state };
}

describe('grep/sort/uniq', () => {
	test('grep -i pattern from file', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: { log: { type: 'file', content: 'Error: X\ninfo: ok\nERROR: Y\n' } } } } } } } as any;
		const res = await execute('grep -i error log', ctx(state));
		expect(res.status).toBe('success');
		expect(res.output.trim().split('\n').length).toBe(2);
	});

	test('sort -n and uniq -c', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: { nums: { type: 'file', content: '10\n2\n2\n11\n' } } } } } } } as any;
		let res = await execute('sort -n nums', ctx(state));
		expect(res.output.trim().split('\n')).toEqual(['2','2','10','11']);
		res = await execute('uniq -c', { currentState: state, stdin: res.output } as any);
		expect(res.output.trim().split('\n')[0]).toMatch(/^2 2$/);
	});
});


