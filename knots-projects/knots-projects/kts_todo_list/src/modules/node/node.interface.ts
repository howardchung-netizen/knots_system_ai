import { InterfaceType, Field, ID } from 'type-graphql';

export interface INode {
  id: string;
}

@InterfaceType()
export abstract class Node {
  @Field(type => ID)
  id: string;
}
