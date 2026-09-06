export class AppTimestamp {
  private readonly value: Date;

  private constructor(value: Date) {
    this.value = value;
  }

  static now() {
    return new AppTimestamp(new Date());
  }

  static fromDate(date: Date) {
    return new AppTimestamp(date);
  }

  static fromISOString(value: string) {
    return new AppTimestamp(new Date(value));
  }

  toDate() {
    return new Date(this.value.getTime());
  }

  toMillis() {
    return this.value.getTime();
  }

  toISOString() {
    return this.value.toISOString();
  }
}
