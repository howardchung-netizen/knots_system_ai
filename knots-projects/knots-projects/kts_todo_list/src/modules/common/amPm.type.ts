import { registerEnumType } from 'type-graphql';

export enum AmPm {
  AM = 'AM',
  PM = 'PM',
}

registerEnumType(AmPm, {
  name: 'AmPm',
});
