/**
 * !En pruebas
 * * Pipe para formatear la hora solo como pruebas, no necesario, mejor usar el que viene con Angular
 */
import { Pipe, PipeTransform } from '@angular/core';
import { UtcToLocalTimeFormat } from '../enums/utc-to-local-time-format';

@Pipe({
  name: 'dateTime'
})
export class DateTimePipe implements PipeTransform {


  transform(utcDate: Date, 
    format: UtcToLocalTimeFormat | string): string | null {
    const browserLanguae = navigator.language;
    console.log('Browser lenguaje', browserLanguae)
    if(format == UtcToLocalTimeFormat.SHORT){
      const date = new Date(utcDate).toLocaleDateString(browserLanguae);
      const time = new Date(utcDate).toLocaleTimeString(browserLanguae);
      return `${date}, ${time}`
    }
    else if (format === UtcToLocalTimeFormat.SHORT_DATE){
      return new Date(utcDate).toLocaleDateString(browserLanguae);
    }
    else if (format === UtcToLocalTimeFormat.SHORT_TIME){
      return new Date(utcDate).toLocaleTimeString(browserLanguae);
    }
    else if (format === UtcToLocalTimeFormat.FULL){
      return new Date(utcDate).toString();
    } else {
      console.error('Error ene el formato de fecha', format);
      return utcDate.toString();
    }
    return null
 }

}
