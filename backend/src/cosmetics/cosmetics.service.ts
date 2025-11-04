import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class CosmeticsService {
  private readonly baseUrl = 'https://fortnite-api.com/v2';

  constructor(private readonly httpService: HttpService) {}

  async getAll() {
    const { data } = await this.httpService.axiosRef.get(`${this.baseUrl}/cosmetics`);
    return data;
  }

  async getNew() {
    const { data } = await this.httpService.axiosRef.get(`${this.baseUrl}/cosmetics/new`);
    return data;
  }

  async getShop() {
    const { data } = await this.httpService.axiosRef.get(`${this.baseUrl}/shop`);
    return data;
  }
}
