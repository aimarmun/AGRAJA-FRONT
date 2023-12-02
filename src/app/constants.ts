import { PersonConstants } from "./interfaces/person-constants.interface"

export class Constants {
    /**
     * Constantes utilizadas en el modelo PeronData
     */
    public PersonData: PersonConstants = {
        /**
         *  Mínima longitud para el nombre 
         */
        MIN_LENGTH_NAME: 3,
        /**
         * Máxima longitud del nombre
         */
        MAX_LENGTH_NAME: 64,
        /**
         * Máxima longitud de los apellidos
         */
        MAX_LENGTH_SURNAMES: 128,
        /**
         * Máxima longitud para las direcciones
         */
        MAX_LENGTH_ADDRESS: 256,
        /**
         * Longitud de un DNI
         */
        MAX_LENGHT_DNI: 9,
        /**
         * Máxima longitud para campo teléfono
         */
        MAX_LENGHT_TELEPHONE: 16,
        /**
         * Máxima longitud para correo
         */
        MAX_LENGHT_EMAIL:  320
    }
    /**
     * Constantes para el modelo Crate
     */
    public Crate: any = {
        /**
         *  Mínima longitud para el nombre de la caja
         */
        MIN_LENGTH_NAME: 1,
        
        /**
         * Máxima longitud para el nombre de la caja
         */
        MAX_LENGTH_NAME: 64,

        /**
         * Máxima longitud para la descripción
         */
        MAX_LENGTH_DESCRIPTION: 256
    }
}