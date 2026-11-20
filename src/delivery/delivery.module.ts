import { Module } from '@nestjs/common';
import { OrderDistributionService } from './core/domain/services/OrderDistributionService';

@Module({
  providers: [OrderDistributionService],
})
export class DeliveryModule {}
