import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { postgresOptions } from './adapters/out/postgres/postgres.config';
import { Order } from './core/domain/model/order/Order';
import { Courier } from './core/domain/model/courier/Courier';
import { TypeOrmCourierRepository } from './adapters/out/postgres/TypeOrmCourierRepository';
import { TypeOrmUnitOfWork } from './adapters/out/postgres/TypeOrmUnitOfWork';
import { COURIER_REPOSITORY } from './core/ports/CourierRepository';
import { UNIT_OF_WORK } from './core/ports/UnitOfWork';
import { TypeOrmOrderRepository } from './adapters/out/postgres/TypeOrmOrderRepository';
import { ORDER_REPOSITORY } from './core/ports/OrderRepository';
import { OrderDistributionService } from './core/domain/services/OrderDistributionService';

@Module({
  imports: [
    TypeOrmModule.forRoot(postgresOptions),
    TypeOrmModule.forFeature([Order, Courier]),
  ],
  providers: [
    OrderDistributionService,
    { provide: ORDER_REPOSITORY, useClass: TypeOrmOrderRepository },
    { provide: COURIER_REPOSITORY, useClass: TypeOrmCourierRepository },
    { provide: UNIT_OF_WORK, useClass: TypeOrmUnitOfWork },
  ],
})
export class DeliveryModule {}
