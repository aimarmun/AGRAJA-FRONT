import { AbstractControl, Validators } from "@angular/forms";

export class Utils {

    public static dniValidator(control: AbstractControl): any {
        let dni: string = control.value;
        if (dni === '' || dni === undefined || dni === null) return { "dnivalidator": 'El DNI no puede estar vacío' };

        dni = dni.toUpperCase().trim();

        const regex = new RegExp(/^\d{8}[a-zA-Z]$/);;
        if (!regex.test(dni)) {
            return { "dnivalidator": 'El DNI no contiene un formato válido' };
        }

        const leters: string = "TRWAGMYFPDXBNJZSQVHLCKE";
        let dniNumber: number = 0;

        try {
            dniNumber = Number(dni.substring(0, 8));
        }
        catch
        {
            return { "dnivalidator": "DNI formato incorrecto" };
        }

        const rest: number = dniNumber % 23;
        const letra: string = leters[rest];

        return dni[8] == letra ? null : "DNI incorrecto";
    }

    public static telephoneValidator(control: AbstractControl): any {
        const required: boolean = control.hasValidator(Validators.required);
        let phoneNumber: string = control.value;
        if (!phoneNumber && required) return {"telvalidator": "El teléfono no puede estar vacío"};
        
        if (!phoneNumber && !required) return null;
    
        const regex = new RegExp(/^\d{9}$|^\d{3}[-\s]?\d{2}[-\s]?\d{2}[-\s]?\d{2}$/);
        
        if(!regex.test(phoneNumber)) return{"telvalidator": "formato de teléfono no válido"};
    
        return null;
    }

    
}