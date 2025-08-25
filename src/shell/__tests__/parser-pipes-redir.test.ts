import { parse } from '../../shell/parser';

describe('parser pipes and redirection', () => {
  it('parses simple pipeline with redirections', () => {
    const ast = parse('echo hello | cat > out.txt');
    expect(ast && ast.type).toBe('pipeline');
    const pipeline = ast as any;
    expect(pipeline.stages).toHaveLength(2);
    expect(pipeline.stages[1].redirections[0]).toEqual({ kind: 'stdout', mode: 'write', target: 'out.txt' });
  });
  it('parses stdin redirection', () => {
    const ast = parse('cat < input.txt');
    expect(ast && ast.type).toBe('command');
    const simple = ast as any;
    expect(simple.redirections[0]).toEqual({ kind: 'stdin', target: 'input.txt' });
  });
});


