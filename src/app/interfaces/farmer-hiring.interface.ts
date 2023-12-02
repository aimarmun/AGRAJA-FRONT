export interface FarmerHiring {
    id: number;
    clientId: number,
    farmerId: number,
    dateTimeUtc: Date
}

export interface FarmerHiringRequest {
    clientId: number,
    farmerId: number,
    dateTimeUtc: Date
}

export interface HiringAddRequestDto {
    clientId: number,
    clientIsActive: boolean,
    clientName: string,
    clientSurNames: string | null,
    clientEmail:string,
    clientAddress: string | null,
    clientTelephone: string | null,
    farmerId: number,
    farmerIsActive: boolean,
    farmerName: string,
    farmerSurnames: string,
    farmerCity: string,
    cropName: string,
    saleDateTimeUtc: Date,
    [key: string]: any
}
