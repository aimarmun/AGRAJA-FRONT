export interface Crate {
    id: number,
    isActive: boolean,
    name: string,
    description?: string,
    kilograms: number,
    price: number,
    stock: number,
    [key: string]: any
}

export interface CrateUpdate {
    name: string,
    description?: string,
    stock: number,
    isActive: boolean,
    [key: string]: any
}

export interface CrateSale {
    clientId: number,
    crateId: number,
    amount: number,
    payOptionId: number,
    createdDateTime: Date
}

export interface CrateSaleRequest {
    saleId: number,
    clientId: number,
    clientIsActive: boolean,
    clientName: string,
    clientSurnames: string,
    clientAddress: string,
    clientTelephone: string,
    clientEmail:string,
    crateId: number,
    crateIsActive: boolean,
    crateName: string,
    crateDescription: string,
    amount: number,
    crateKilograms: number,
    cratePrice: number,
    totalPrice: number,
    payOptionName: string,
    saleDateTimeUtz: Date
}