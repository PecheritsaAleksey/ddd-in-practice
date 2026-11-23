import { Test } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Order } from '../../src/delivery/core/domain/model/order/Order';
import { Courier } from '../../src/delivery/core/domain/model/courier/Courier';
import { DeliveryModule } from '../../src/delivery/delivery.module';
import { OrderDistributionService } from '../../src/delivery/core/domain/services/OrderDistributionService';

describe('DeliveryModule', () => {
  it('provides OrderDistributionService through Nest dependency injection', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DeliveryModule],
    })
      .overrideProvider(getDataSourceToken())
      .useValue({ manager: {}, isInitialized: false })
      .overrideProvider(getRepositoryToken(Order))
      .useValue({})
      .overrideProvider(getRepositoryToken(Courier))
      .useValue({})
      .compile();

    expect(moduleRef.get(OrderDistributionService)).toBeInstanceOf(
      OrderDistributionService,
    );
    await moduleRef.close();
  });
});
