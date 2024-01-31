export class MessageDto {
  content: string;
  role: string;

  constructor(content: string, role: string) {
    this.role = role
    this.content = content;
  }
}
