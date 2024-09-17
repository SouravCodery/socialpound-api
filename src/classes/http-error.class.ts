export class HttpError extends Error {
  public status: number;
  public toastMessage: string;

  constructor({
    status,
    message,
    toastMessage,
  }: {
    status: number;
    message: string;
    toastMessage?: string;
  }) {
    super(message);
    this.status = status;
    this.toastMessage = message;

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
