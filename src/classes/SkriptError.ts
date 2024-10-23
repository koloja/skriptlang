export default class SkriptError extends Error {constructor(message: string) {
    super(message);
    this.name = 'SkriptError';
}};
