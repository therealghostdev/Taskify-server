class ErrorMessage extends Error {
  code: number;

  constructor(message: string, code: number) {
    super();
    (this.message = message), (this.code = code);
  }
}

export default ErrorMessage;
