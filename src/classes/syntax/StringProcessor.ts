class StringProcessor {
    public parse(input: string): string {
        if (this.isTemplateLiteral(input)) {
            const normalizedInput = input.replace(/[`']/g, '"');
            return normalizedInput.replace(/\${(.*?)}/g, '%$1%');
        }
        return input.replace(/[`']/g, '"');
    }
    private isTemplateLiteral(input: string): boolean {return input.startsWith('`') && input.endsWith('`')}
}

export default StringProcessor;