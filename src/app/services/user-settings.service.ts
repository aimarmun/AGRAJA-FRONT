import { Injectable } from '@angular/core';

export enum SettingKey {
  SHOW_HIDDEN_FARMERS,
  SHOW_HIDDEN_CLIENTS,
  SHOW_HIDDEN_CRATES,
  CROP_TYPE_SELECTED,
  CLIENTS_FILTER,
  CRATE_PRICE_ORDER
}

@Injectable({
  providedIn: 'root'
})


export class UserSettingsService {
  private showHiddenFarmers: boolean;
  private showHiddenClients: boolean;
  private showHiddenCrates: boolean;
  private cropTypeSelected: number;
  private clientsFilter: string;
  private cratePriceOrder: number;

  constructor() {
    this.showHiddenClients = false;
    this.showHiddenCrates = false;
    this.showHiddenFarmers = false;
    this.cropTypeSelected = 0;
    this.clientsFilter = "";
    this.cratePriceOrder = 0;
  }

  getUserSetting<T>(key: SettingKey): T {
    if (key === SettingKey.SHOW_HIDDEN_CLIENTS) {
      return this.showHiddenClients as unknown as T;
    } else if (key === SettingKey.SHOW_HIDDEN_CRATES) {
      return this.showHiddenCrates as unknown as T;
    } else if (key === SettingKey.SHOW_HIDDEN_FARMERS) {
      return this.showHiddenFarmers as unknown as T;
    } else if (key === SettingKey.CROP_TYPE_SELECTED) {
      return this.cropTypeSelected as unknown as T;
    } else if (key === SettingKey.CLIENTS_FILTER) {
      return this.clientsFilter as unknown as T;
    } else if (key === SettingKey.CRATE_PRICE_ORDER) {
      return this.cratePriceOrder as unknown as T;
    } else {
      throw new Error(`Invalid key: ${key}`);
    }
  }

  setUserSetting(key: SettingKey, value: boolean | number | string): void {
    switch (key) {
      case SettingKey.SHOW_HIDDEN_CLIENTS:
        this.showHiddenClients = Boolean(value);
        break;
      case SettingKey.SHOW_HIDDEN_CRATES:
        this.showHiddenCrates = Boolean(value);
        break;
      case SettingKey.SHOW_HIDDEN_FARMERS:
        this.showHiddenFarmers = Boolean(value);
        break;
      case SettingKey.CROP_TYPE_SELECTED:
        this.cropTypeSelected = Number(value);
        break;
      case SettingKey.CLIENTS_FILTER:
        this.clientsFilter = String(value);
        break;
      case SettingKey.CRATE_PRICE_ORDER:
        this.cratePriceOrder = Number(value);
        break;
      default:
        throw new Error(`Invalid key: ${key}`);
    }
  }

}
