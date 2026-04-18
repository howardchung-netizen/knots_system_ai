import { InputType, Field, Float, Int } from 'type-graphql';

@InputType()
export class ClockInLocationCreate {

  @Field(type => String)
  projectId: string;

  @Field(type => String)
  staffId: string;

  @Field(type => Float, { nullable: true })
  lat?: number;

  @Field(type => Float, { nullable: true })
  lon?: number;

  @Field(type => String, { nullable: true })
  address?: string;

}

@InputType()
export class ClockInLocationRefresh {

  @Field()
  locationId: string;

}

@InputType()
export class ClockInLocationUpdate {

  @Field(type => String)
  id: string;

  @Field(type => String)
  projectId: string;

  @Field(type => String)
  staffId: string;

  @Field(type => Float, { nullable: true })
  lat?: number;

  @Field(type => Float, { nullable: true })
  lon?: number;

  @Field(type => String, { nullable: true })
  address?: string;

}