import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Client } from 'src/app/interfaces/client.interface';
import { Crate, CrateSale, CrateSaleRequest } from 'src/app/interfaces/crate.interface';
import { PayOption } from 'src/app/interfaces/pay-option.interface';
import { ClientsService } from 'src/app/services/clients.service';
import { CratesService } from 'src/app/services/crates.service';
import { PayOptionsService } from 'src/app/services/pay-options.service';
@Component({
  selector: 'app-add-client-sale-modal',
  templateUrl: './add-client-sale-modal.component.html',
  styleUrls: ['./add-client-sale-modal.component.css']
})
export class AddClientSaleModalComponent {
  @Input() crate: Crate;
  @Input() amount: number;
  @Input() classButton!: string;
  @Input() textButton!: string;
  @Input() disabled: boolean;
  @Input() payOptions: PayOption[];
  @ViewChild('focusInput') focusInput!: ElementRef;
  @Output() onnewsale!: EventEmitter<CrateSaleRequest>;
  public form!: FormGroup;
  public clients: Client[];
  public isSaling: boolean;
  public selectedClient!: Client;
  public errorMsg!: string | null;
  public customClassButton: string[];
  public loadingCounter: number;
  public saleOk: boolean;
  //public payOptions: PayOption[];
  private inputIsTouched: boolean;
  public crateSaleRequest!: CrateSaleRequest;
  public dniOrNameFilter: string;

  constructor(private clientService: ClientsService,
    private crateService: CratesService,
    private payOptionsService: PayOptionsService){
    this.form = this.getFormGroup();
    this.clients = [];
    this.dniOrNameFilter = '';
    this.isSaling = false;
    this.errorMsg = null;
    this.onnewsale = new EventEmitter();
    this.crate = {
      id: 0,
      isActive: true,
      kilograms: 0,
      name: '',
      price: 0,
      stock: 0
    }

    this.selectedClient ={
      id: 0,
      isActive: true,
      name: '',
      surnames: '',
      address: '',
      dni: '',
      email: '',
      telephone: ''
    }

    this.payOptions = [];
    this.customClassButton = [];
    this.loadingCounter = 0;
    this.amount = 0;
    this.disabled = true;
    this.saleOk = false;
    this.inputIsTouched = false;
  }

  private getFormGroup(): FormGroup{
    return new FormGroup(
      { 
        dniOrName: new FormControl('', []),
        payOption: new FormControl(0, [Validators.min(1)] )
      }
    );
  }

  async ngOnInit(): Promise<void> {
    if(this.classButton !== undefined){
      this.customClassButton = this.classButton.split(' ');
    }
   // this.payOptions = await this.payOptionsService.getAll();
   // console.log('opciones de pago', this.payOptions)
  }

  @HostListener('focusout', ['$event']) public onListenerTriggered(event: any): void {
    if(!this.inputIsTouched){
      this.setFocusToInput();
      this.inputIsTouched = true;
    }
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
      this.clients = [...await this.clientService.getByPartialDniOrNameAsync(this.dniOrNameFilter, true)];
    } catch (error) {
      this.catchError(error);
    }
  }

  async onSale(client: Client): Promise<void> {
    this.selectedClient = client;
    this.isSaling = true;
    this.saleOk = false;
    try {
      await this.addSale(client);
      this.saleOk = true;
    } catch (error) {
      this.catchError(error);
    }
    this.isSaling = false;
  }

  async addSale(client: Client): Promise<void> {
    const saleCrate: CrateSale = { 
      clientId: client.id, 
      amount: this.amount,
      crateId: this.crate.id, 
      payOptionId: this.form.get('payOption')?.value || 0, 
      createdDateTime: new Date() 
    };
    this.crateSaleRequest = await this.crateService.addSaleAsync(saleCrate);
    //console.log('venta resultado:', this.crateSaleRequest);
    if (!this.saleOk) {
      this.errorMsg = 'Ups! algo salió mal';
    }
    this.errorMsg = null;
    this.onnewsale?.emit(this.crateSaleRequest);
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
    this.errorMsg = null;
    this.saleOk = false;
    this.inputIsTouched = false;
    this.form.reset();
    this.form = this.getFormGroup();
  }
}
