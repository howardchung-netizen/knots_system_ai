import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Args,
  Ctx,
} from 'type-graphql';
import { GanttTemplate } from './ganttTemplate.entity';
import { GanttTemplateService } from './ganttTemplate.service';
import { GanttTemplateArgs } from './args/ganttTemplate.args';
import { GanttTemplateConnection } from './connection/ganttTemplate.connection';
import { GanttTemplateCreateInput } from './input/ganttTemplateCreate.input';
import { GanttTemplatePayload } from './payload/ganttTemplate.payload';
import { GanttTemplateUpdateInput } from './input/ganttTemplateUpdate.input';
import { AppContext } from '../shared/graphql/context';

@Resolver(of => GanttTemplate)
export class GanttTemplateResolver {
  constructor(private readonly ganttTemplateService: GanttTemplateService) {}

  @Query(returns => GanttTemplateConnection)
  async ganttTemplates(
    @Args() args: GanttTemplateArgs,
    @Ctx() ctx: AppContext,
  ): Promise<GanttTemplateConnection> {
    return this.ganttTemplateService.getMany(args);
  }

  @Mutation(returns => GanttTemplatePayload)
  async ganttTemplateCreate(
    @Arg('data') data: GanttTemplateCreateInput,
    @Ctx() ctx: AppContext,
  ): Promise<GanttTemplatePayload> {
    return this.ganttTemplateService.create(data, ctx.user, ctx.enforcer);
  }

  @Mutation(returns => GanttTemplatePayload)
  async ganttTemplateUpdate(
    @Arg('data') data: GanttTemplateUpdateInput,
    @Ctx() ctx: AppContext,
  ): Promise<GanttTemplatePayload> {
    return this.ganttTemplateService.save(data, ctx.user, ctx.enforcer);
  }
}
