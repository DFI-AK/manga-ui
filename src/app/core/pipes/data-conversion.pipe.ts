import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataConversion',
  standalone: true
})
export class DataConversionPipe implements PipeTransform {
  transform(value: any): string | number {
    // Convert input to number
    const numericValue = Number(value);

    if (isNaN(numericValue)) {
      return value;  // Return original input if it's not a valid number
    }

    // Skip conversion if the value has exactly two digits
    if (numericValue >= 10 && numericValue <= 99) {
      return numericValue + ' KB'; // Assume KB by default and skip further processing
    }

    // Conversion logic (assuming input is in KB)
    if (numericValue >= 1_000_000) {
      return (numericValue / 1_000_000).toFixed(2) + ' GB';
    } else if (numericValue >= 1_000) {
      return (numericValue / 1_000).toFixed(2) + ' MB';
    } else {
      return numericValue + ' KB'; // Keep as KB if under 1,000 KB
    }
  }
}
