import { PipeTransform } from '@nestjs/common';

export const trimRecursive = <K>(obj: K): K => {
  if (!obj) {
    return obj;
  }
  if (Buffer.isBuffer(obj)) {
    return obj;
  }

  if (typeof obj === 'string') {
    return obj.trim() as K;
  }

  if (Array.isArray(obj)) {
    return obj.map((x) => trimRecursive(x)) as K;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, curr) => {
      acc[curr] = obj[curr] && trimRecursive(obj[curr]);
      return acc;
    }, {}) as K;
  }

  return obj;
};
export class TrimWhitespacePipe implements PipeTransform {
  transform(value: any) {
    return trimRecursive(value);
  }
}
