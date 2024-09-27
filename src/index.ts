#!/usr/bin/env node
import ts from 'typescript';
import fs from 'node:fs/promises';
import path from 'node:path';
import logger from './lib/logger';
import chalk from 'chalk';
import FunctionScope from './classes/FunctionScope';
import FunctionsParser from './classes/FunctionsParser';

(async () => {
    const file: string | undefined = process.argv[2];
    if (!file) return logger.error(`No file to parse provided.`);
    if (path.extname(file) !== '.ts') return logger.error(`Provided file does is not a Typescript file. ${chalk.gray('(.ts)')}`);

    try {await fs.access(file)} 
    catch (error) {return logger.error(`Provided file '${file}' does not exist.`)}
    try {
        const data: string = await fs.readFile(file, 'utf-8');
        const functionScope = new FunctionScope(data, file);
        const scoped = await functionScope.check();
        if (!scoped) process.exit(1);
        else {
            const functionsParser = new FunctionsParser(data, file);
            const functions = await functionsParser.fetch();
            const parsedFunctions = await functionsParser.parse(functions);
            console.log(parsedFunctions);
        };
    } catch (error) {logger.mutliError(error as any)};
})();