import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CosmeticsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureCosmeticsSeeded();
  }

  private resolveSamplePath() {
    // primeiro tenta no src (dev), se não existir tenta dist (produção)
    const srcPath = path.join(process.cwd(), 'src', 'data', 'sample-cosmetics.json');
    if (fs.existsSync(srcPath)) return srcPath;

    const distPath = path.join(process.cwd(), 'dist', 'data', 'sample-cosmetics.json');
    if (fs.existsSync(distPath)) return distPath;

    // fallback: tenta __dirname relativo ao arquivo (útil em alguns builds)
    const altPath = path.join(__dirname, '..', 'data', 'sample-cosmetics.json');
    if (fs.existsSync(altPath)) return altPath;

    return null;
  }

  private async ensureCosmeticsSeeded() {
    const count = await this.prisma.cosmetic.count();
    if (count === 0) {
      const filePath = this.resolveSamplePath();
      if (!filePath) {
        console.warn('⚠️ sample-cosmetics.json não encontrado em src/ nem em dist/. Pulando seed local.');
        return;
      }

      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);

        await this.prisma.cosmetic.createMany({
          data: data.map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            rarity: c.rarity,
            image: c.image,
            price: c.price,
          })),
        });

        console.log('🌱 Cosméticos locais inseridos com sucesso!');
      } catch (err) {
        console.error('Erro ao inserir cosméticos locais:', err);
      }
    }
  }

  async getAll() {
    return this.prisma.cosmetic.findMany();
  }

  async getNew() {
    return this.prisma.cosmetic.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });
  }

  async getShop() {
    return this.prisma.cosmetic.findMany({ orderBy: { rarity: 'desc' }, take: 10 });
  }
}
