import { execute } from '../../shell';
import { FileSystemState } from '../../types/level';

function ctx(state: FileSystemState) { return { currentState: state } as any; }

describe('filesystem ops (sim)', () => {
	test('mount/df/lsblk/umount', async () => {
		let state: FileSystemState = { currentDirectory: '/home/recruit', previousDirectory: '/home/recruit', files: { home: { type: 'directory', files: { recruit: { type: 'directory', files: {} } } } } } as any;
		let res = await execute('mount /dev/sdb1 /mnt/data', ctx(state));
		expect(res.status).toBe('success');
		res = await execute('df', ctx(state));
		expect(res.output).toMatch(/\/dev\/sdb1 \/mnt\/data/);
		res = await execute('lsblk', ctx(state));
		expect(res.output).toMatch(/\/dev\/sdb1/);
		res = await execute('umount /mnt/data', ctx(state));
		expect(res.status).toBe('success');
	});
});


