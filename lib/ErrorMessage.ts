class ErrorMessage extends Error {
  constructor(message: string, code: number) {
    super();
    (this.message = message), (this.code = code);
  }
}

export default ErrorMessage;
