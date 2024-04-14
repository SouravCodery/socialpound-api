export class HttpResponse {
  private status: number;
  private message: string;
  private data?: Object;

  constructor({
    status,
    message,
    data,
  }: {
    status: number;
    message: string;
    data?: Object;
  }) {
    this.message = message;
    this.status = status;
    this.data = data;

    Object.setPrototypeOf(this, HttpResponse.prototype);
  }

  public getStatus() {
    return this.status;
  }

  public getResponse() {
    return {
      message: this.message,
      data: this.data,
    };
  }
}
