export class RandomHelper {
  public static getNumberString(length: number): string {
    const chars = '0123456789';

    let str = '';
    for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return str;
  }

  public static getNumber(min: number, max: number): number {
    return Math.floor(Math.random() * max - min) + (min + 1);
  }
}
