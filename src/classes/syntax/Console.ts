import ts from 'typescript';
import StringProcessor from './StringProcessor';

const stringProcessor = new StringProcessor();

class Console {
    private data: string;
    private methods: Array<string> = ['log', 'error', 'warn', 'info'];
    constructor(data: string, file: string) {this.data = data}

    public async parse(): Promise<string> {
        const source = ts.createSourceFile('temp.source.ts', this.data, ts.ScriptTarget.Latest, true);
        const lines: string[] = this.data.split('\n');

        const checkNode = (node: ts.Node): void => {
            if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
                const method = node.expression.name.getText();
                if (node.expression.expression.getText() === 'console' && this.methods.includes(method)) {
                    const args = node.arguments.map((arg) => arg.getText(source));
                    if (args.length > 0) {
                        const line = node.getStart(source) + 1;
                        lines[line - 1] = `send ${stringProcessor.parse(args[0])} to console`;
                    }
                }
            }
            ts.forEachChild(node, checkNode);
        };

        source.forEachChild(checkNode);
        return lines.join('\n');
    }
}

export default Console;