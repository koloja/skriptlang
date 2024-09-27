import chalk from 'chalk';

export default {
    info: (text: string) => console.log(chalk.cyan('*'), text),
    success: (text: string) => console.log(chalk.green('√'), text),
    fail: (text: string) => console.error(chalk.red(`X ${text}`)),
    await: (text: string) => console.log(chalk.magenta('*'), text),
    warn: (text: string) => console.warn(chalk.yellow(`! ${text}`)),
    error: (text: string) => console.error(chalk.red(`X ${text}`)),
    mutliError: (error: Error) => console.error(chalk.red(`Something went wrong!\n${error}`))
}; 