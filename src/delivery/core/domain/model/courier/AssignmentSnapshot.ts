import { Uuid } from '../../../../../common/Uuid';
import { AssignmentStatus } from '../AssignmentStatus';
import { Location } from '../Location';
import { Volume } from '../Volume';

export type AssignmentSnapshot = Readonly<{
  orderId: Uuid;
  location: Location;
  volume: Volume;
  status: AssignmentStatus;
}>;
