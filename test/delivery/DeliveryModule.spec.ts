import { Test } from '@nestjs/testing';
import { DeliveryModule } from '../../src/delivery/delivery.module';
import { OrderDistributionService } from '../../src/delivery/core/domain/services/OrderDistributionService';

describe('DeliveryModule', () => {
  it('provides OrderDistributionService through Nest dependency injection', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DeliveryModule],
    }).compile();

    expect(moduleRef.get(OrderDistributionService)).toBeInstanceOf(
      OrderDistributionService,
    );
    await moduleRef.close();
  });
});
