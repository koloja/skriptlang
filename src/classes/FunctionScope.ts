import ts from 'typescript';
import logger from '../lib/logger';
import chalk from 'chalk';

class FunctionScope {
    private data: string;
    public allowedCalls: Set<string>;
    constructor(data: string, file: string) {
        this.data = data;
        this.allowedCalls = new Set([
            'Events',
            'Server',
            'Meta'
        ]);
    }
    
    public async check(): Promise<boolean> {
        const source = ts.createSourceFile('temp.source.ts', this.data, ts.ScriptTarget.Latest, true);
        let errors: Array<{line: number; code: string}> = [];

        const checkNode = (node: ts.Node): void => {
            const {line} = ts.getLineAndCharacterOfPosition(source, node.getStart());
            const snippet = this.data.split('\n')[line];

            // file checks

            if (ts.isImportDeclaration(node)) return;
            if (ts.isFunctionDeclaration(node)) return; // function declarations
            if (ts.isFunctionExpression(node)) return;  // function expressions
            if (ts.isArrowFunction(node)) return;       // arrow functions
            
            if (ts.isVariableStatement(node)) {
                // has a valid initializer
                const hasValidInitializer = node.declarationList.declarations.some(decl => {
                    const initializer = decl.initializer; // get initializer
                    return initializer && (ts.isFunctionExpression(initializer) || ts.isArrowFunction(initializer));
                });
                if (!hasValidInitializer) errors.push({line, code: snippet});
                return;
            }
            if (ts.isStatement(node)) errors.push({line, code: snippet});
            ts.forEachChild(node, checkNode);
        };
        source.forEachChild(checkNode);

        if (errors.length > 0) {
            errors.forEach(({line}) => logger.error(`Invalid code ${chalk.cyan(`at line ${line + 1}`)} outside of function scope.`));
            return false;
        } else return true;
    }
}

export default FunctionScope;