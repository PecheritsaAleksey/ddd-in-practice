import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Uuid } from '../../../../common/Uuid';
import { Courier } from '../../../core/domain/model/courier/Courier';
import { CourierRepository } from '../../../core/ports/CourierRepository';

@Injectable()
export class TypeOrmCourierRepository implements CourierRepository {
  constructor(
    @InjectRepository(Courier) private readonly records: Repository<Courier>,
  ) {}

  async add(courier: Courier): Promise<void> {
    await this.records.manager.transaction(async (manager) => {
      const repository = manager.getRepository(Courier);
      if (await repository.existsBy({ id: courier.id }))
        throw new Error('Courier already exists');
      await repository.save(courier);
    });
  }

  async update(courier: Courier): Promise<void> {
    await this.records.manager.transaction(async (manager) => {
      const repository = manager.getRepository(Courier);
      if (!(await repository.existsBy({ id: courier.id })))
        throw new Error('Courier not found');
      await repository.save(courier);
    });
  }

  async findById(id: Uuid): Promise<Courier | null> {
    const courier = await this.records.findOneBy({ id });
    courier?.validateLoadedState();
    return courier;
  }

  async findAll(): Promise<Courier[]> {
    const couriers = await this.records.find();
    couriers.forEach((courier) => courier.validateLoadedState());
    return couriers;
  }
}
