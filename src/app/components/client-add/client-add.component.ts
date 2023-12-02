import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Constants } from 'src/app/constants';
import { Client } from 'src/app/interfaces/client.interface';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';
import { ClientsService } from 'src/app/services/clients.service';
import { Utils } from 'src/app/utils/utils';

@Component({
  selector: 'app-client-add',
  templateUrl: './client-add.component.html',
  styleUrls: ['./client-add.component.css']
})
export class ClientAddComponent {
  public form: FormGroup;
  public cons: Constants;
  public errorAddClient: string | null;
  public client!: Client;
  public isAddingClient: boolean;
  public showAddingOk: boolean;

  constructor(private clientsService: ClientsService,
    private breadcrumService: BreadcrumbService,
    private activatedRoute: ActivatedRoute,
    private location: Location){
      this.cons = new Constants();
      this.form = this.getFormGroupConfig();
      this.errorAddClient = null;
      this.isAddingClient = false;
      this.showAddingOk = false;
  }

  ngOnInit(){
    this.breadcrumService.setActiveRoute(this.activatedRoute);
  }

  private getFormGroupConfig(): FormGroup {
    return new FormGroup({
      name: new FormControl('', Validators.compose([
        Validators.minLength(3),
        Validators.maxLength(this.cons.PersonData.MAX_LENGTH_NAME),
        Validators.required
      ])),
      surnames: new FormControl('', Validators.compose([
        Validators.maxLength(this.cons.PersonData.MAX_LENGTH_SURNAMES)
      ])),
      dni: new FormControl('', Validators.compose([
        Validators.required,
        Validators.maxLength(this.cons.PersonData.MAX_LENGHT_DNI),
        Utils.dniValidator])),
      telephone: new FormControl('', Validators.compose([
        Validators.maxLength(this.cons.PersonData.MAX_LENGHT_TELEPHONE),
        Utils.telephoneValidator])),
      email: new FormControl('', Validators.compose([
        Validators.maxLength(this.cons.PersonData.MAX_LENGHT_EMAIL),
        Validators.email
      ])),
      address: new FormControl('', Validators.compose([
        Validators.maxLength(this.cons.PersonData.MAX_LENGTH_ADDRESS)
      ]))
    }, []);
  }

  back(){
    this.location.back();
  }

  checkError(control: string, error: string) {
    if (this.form.get(control)?.hasError(error) && this.form.get(control)?.touched) {
      return true
    } else {
      return false
    }
  }
  
  closeError(){
    this.errorAddClient = null;
  }

  reset(){
    this.form.reset();
    this.form = this.getFormGroupConfig();
    this.errorAddClient = null;
    this.isAddingClient = false;
    this.showAddingOk = false;
  }

  private setFormValues(): void {
    this.form.reset();
    const controls = this.form.controls;
    Object.keys(controls).forEach(key => controls[key].setValue(this.client?.[key]));
  }

  async onSubmit(): Promise<void> {
    this.errorAddClient = null;
    this.isAddingClient = true;
    const updateData: Client = { name: '', isActive: true, address: '', dni: '', email: '', surnames: '', id: 0, telephone: '' };
    Object.keys(this.form.controls).forEach(key => {
      updateData[key] = this.form?.controls?.[key]?.value;
    });
    try{
      this.client = await this.clientsService.addAsync(updateData);
      this.setFormValues();
      this.showAddingOk = true;
    }catch (error){
      if (error instanceof HttpErrorResponse) {
        if (error.error instanceof Object)
          this.errorAddClient = 'Ups! hubo un error: ' + error.message;
        else
          this.errorAddClient = error.error;
        console.dir(error);
      } else {
        this.errorAddClient = 'Ups! hubo un error desconocido: ' + error
      }
      
    } finally {
      this.isAddingClient = false;
    }
  }
}
