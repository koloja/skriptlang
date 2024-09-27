import ts from 'typescript';
import logger from '../lib/logger';
import chalk from 'chalk';
import SkriptError from './SkriptError';
import indent from '../lib/indent';
import Console from './syntax/Console';

interface FunctionDetails {
    name: string;
    parameters: Array<ParameterDetail>;
    returnType: string;
    content: string;
    line: number;
}

interface ParameterDetail {
    name: string;
    type: string;
}

class FunctionsParser {
    private data: string;
    private indent: number;

    constructor(data: string, file: string) {
        this.data = data;
        this.indent = indent;
    }

    private getBody(body: ts.Node | undefined, source: ts.SourceFile): string {
        if (!body) return '';
        const bodyText = body.getText(source).trim();
        if (ts.isBlock(body)) {
            const content = body.statements.map(stmt => stmt.getText(source).trim()).join('\n');
            return content;
        }
        return bodyText;
    }
    
    public async fetch(): Promise<Array<FunctionDetails>> {
        const source = ts.createSourceFile('temp.source.ts', this.data, ts.ScriptTarget.Latest, true);
        const functions: Array<FunctionDetails> = [];

        const checkNode = (node: ts.Node): void => {
            if (ts.isFunctionDeclaration(node) && node.name) {
                const name = node.name.getText(source);
                const parameters = node.parameters.map(param => ({
                    name: param.name.getText(source),
                    type: param.type ? param.type.getText(source) : 'any',
                }));

                const returnType = node.type ? node.type.getText(source) : 'void';
                const content = this.getBody(node.body, source);
                functions.push({
                    name,
                    parameters,
                    returnType,
                    content,
                    line: node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1
                });
            }

            // arrow functions
            else if (ts.isArrowFunction(node)) {
                const parent = node.parent; // parent node
                let name = 'anonymous'; // default
                if (ts.isVariableDeclaration(parent) && parent.name) name = parent.name.getText(source); // use variables name

                const parameters = node.parameters.map(param => ({
                    name: param.name.getText(source),
                    type: param.type ? param.type.getText(source) : 'any',
                }));

                const returnType = node.type ? node.type.getText(source) : 'void';
                const content = this.getBody(node.body, source);
                functions.push({
                    name,
                    parameters,
                    returnType,
                    content,
                    line: node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1
                });
            }

            // functions
            else if (ts.isFunctionExpression(node)) {
                const parent = node.parent; // parent node
                let name = 'anonymous'; // default
                if (ts.isVariableDeclaration(parent) && parent.name) name = parent.name.getText(source); // use variables name

                const parameters = node.parameters.map(param => ({
                    name: param.name.getText(source),
                    type: param.type ? param.type.getText(source) : 'any',
                }));

                const returnType = node.type ? node.type.getText(source) : 'void';
                const content = this.getBody(node.body, source);
                functions.push({
                    name,
                    parameters,
                    returnType,
                    content,
                    line: node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1
                });
            }
            ts.forEachChild(node, checkNode);
        };

        source.forEachChild(checkNode);
        return functions;
    }

    public async parse(functions: Array<FunctionDetails>): Promise<string> {
        const parsed: Array<string> = [];
    
        // use for not forEach for awaiting
        for (const data of functions) {
            const consoleParser = new Console(data.content, 'temp.source.ts');
            const name: string = data.name;
            const parameters: string = data.parameters.map(param => `${param.name}: ${param.type}`).join(', ');
            const returnType: string = data.returnType === 'void' ? '' : `: ${data.returnType}`;
            const content = await consoleParser.parse();
            const tab = ' '.repeat(this.indent);
            const indentedContent = content.split('\n').map(line => `${tab}${line}`).join('\n');
            
            parsed.push(`function ${name}(${parameters})${returnType}:\n${indentedContent}\n`);
        }
    
        return parsed.join('\n');
    }
}

export default FunctionsParser;