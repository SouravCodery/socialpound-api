export class HttpResponse<T> {
  private status: number;
  private message: string;
  private data?: T;
  private toastMessage?: string;

  constructor({
    status,
    message,
    data,
    toastMessage,
  }: {
    status: number;
    message: string;
    data?: T;
    toastMessage?: string;
  }) {
    this.message = message;
    this.status = status;
    this.data = data;
    this.toastMessage = toastMessage;

    Object.setPrototypeOf(this, HttpResponse.prototype);
  }

  public getStatus() {
    return this.status;
  }

  public getResponse() {
    return {
      message: this.message,
      data: this.data,
      toastMessage: this.toastMessage,
    };
  }
}
