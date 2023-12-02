import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Client } from 'src/app/interfaces/client.interface';
import { FarmerHiring, FarmerHiringRequest, HiringAddRequestDto } from 'src/app/interfaces/farmer-hiring.interface';
import { Farmer } from 'src/app/interfaces/farmer.interface';
import { ClientsService } from 'src/app/services/clients.service';
import { FarmersService } from 'src/app/services/farmers.service';

@Component({
  selector: 'app-add-client-modal',
  templateUrl: './add-client-modal.component.html',
  styleUrls: ['./add-client-modal.component.css']
})
export class AdClientModalComponent {
  @Input() farmer: Farmer;
  @Input() badgetext: string | null;
  @Input() classButton!: string;
  @Input() textButton!: string;
  @ViewChild('focusInput') focusInput!: ElementRef;
  @Output() onnewhiring!: EventEmitter<HiringAddRequestDto>;
  public form!: FormGroup;
  public saleHiringRequest!: HiringAddRequestDto | null;
  public clients: Client[];
  public isBookingHiring: boolean;
  public selectedClient!: Client;
  public farmerHiring!: FarmerHiring | null;
  public errorMsg!: string | null;
  public customClassButton: string[];
  public loadingCounter: number;
  public dniOrNameFilter: string;

  constructor(private clientService: ClientsService,
    private farmerService: FarmersService){
    this.form = new FormGroup(
      { dniOrName: new FormControl('', []) }
    );
    this.saleHiringRequest = null;
    this.clients = [];
    this.dniOrNameFilter = '';
    this.isBookingHiring = false;
    this.errorMsg = null;
    this.onnewhiring = new EventEmitter();
    this.badgetext = '';
    this.farmer = {
      id: 0,
      isActive: true,
      address: '',
      cityId: 0,
      cropTypeId: 0,
      dni: '',
      email: '',
      name: '',
      surnames: '',
      telephone: ''
    }
    this.customClassButton = [];
    this.loadingCounter = 0;
  }

  ngOnInit(): void {
    if(this.classButton !== undefined){
      this.customClassButton = this.classButton.split(' ');
    }
  }

  @HostListener('focusout', ['$event']) public onListenerTriggered(event: any): void {
    this.setFocusToInput();
  }

  @HostListener('hide.bs.modal', ['$event']) public onModalDismiss(event: any): void {
    this.reset();
  }

  setFocusToInput() {
    setTimeout(() => {
      this.focusInput?.nativeElement?.focus();
    }, 0);
  }

  async onKeyDown(): Promise<void> {
    const filter = this.form.get('dniOrName')?.value;
    if(filter === this.dniOrNameFilter) {
      return;
    }
    this.dniOrNameFilter = filter;
    this.errorMsg = null;
    this.loadingCounter++;
    
    if(this.dniOrNameFilter !== ''){
      await this.loadClients();
    } else {
      this.clientService.cancelHttpPetitions();
    }

    this.loadingCounter--;
    
    //* con esto nos aseguramos de que si el operador escribe muy rápido 
    //* y borra el filtro, se vacie correctamente la lista de clientes
    setTimeout(() => {
      if(this.dniOrNameFilter === '')
        this.clients = [];
    }, 0);
  }

  private async loadClients() {
    try {
      this.clients = [...await this.clientService.getByPartialDniOrNameAsync(this.dniOrNameFilter)];
    } catch (error) {
      this.catchError(error);
    }
  }

  async onBookingHiring(client: Client): Promise<void> {
    this.selectedClient = client;
    this.isBookingHiring = true;
    this.saleHiringRequest = null;

    try {
      /* const hirings: FarmerHiring[] = await this.farmerService.getFarmerHiringsByIdAsync(this.farmer.id);
      // console.log('Hirings',hirings)
      if (hirings) {
        if (hirings.find(h => h.clientId === client.id)) {
          this.errorMsg = 'Este cliente ya tiene contratado a este agricultor'
          return;
        }
        await this.addHiring(client);
      }else{
      } */
      //* PREGUNTAR A ROSA 👆
      await this.addHiring(client);
    } catch (error) {
      this.catchError(error);
    }
    this.isBookingHiring = false;
  }

  async addHiring(client: Client): Promise<void> {
    const saleHiring: FarmerHiringRequest = { clientId: client.id, farmerId: this.farmer.id, dateTimeUtc: new Date() };
    this.saleHiringRequest = await this.farmerService.addHiringAsync(saleHiring);
    //console.log('saleHiring:', this.saleHiringRequest)
    if (!this.saleHiringRequest) {
      this.errorMsg = 'Ups! algo salió mal';
    }
    this.errorMsg = null;
    this.onnewhiring?.emit(this.saleHiringRequest);
  }

  catchError(error: any) {
    if (error instanceof HttpErrorResponse) {
      if (error.status != 404) {
        if (error.error instanceof Object)
          this.errorMsg = 'Ups! hubo un error: ' + error.message;
        else
          this.errorMsg = error.error;
        console.dir(error);
      } else {
        this.errorMsg = 'Ups! hubo un error desconocido: ' + error.message;
      }
    }
  }

  reset() {
    this.form.reset();
    this.clients = [];
    this.farmerHiring = null;
    this.errorMsg = null;
    this.saleHiringRequest = null;
  }
}
