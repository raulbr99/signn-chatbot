export class MessageDto {
  isUser: boolean;
  content: string;
  annotations?: Array<any>;

  constructor(isUser: boolean, content: string, annotations: Array<any>) {
    this.isUser = isUser;
    this.content = content;
    this.annotations = annotations;
  }
}
