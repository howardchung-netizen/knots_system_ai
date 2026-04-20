import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { ResolverContext } from '../../lib/types';
import { Inject } from "typedi";
import { AiAssistantService } from './aiAssistant.service';
import { AiChatMessageInput } from './input/aiChatMessage.input';
import { AiChatMessagePayload } from './payload/aiChatMessage.payload';
import { AiOcrReceiptInput } from './input/aiOcrReceipt.input';
import { AiOcrReceiptPayload } from './payload/aiOcrReceipt.payload';

// We apply @Authorized later if needed, but for now we leave it open or handle in auth middleware
@Resolver()
export class AiAssistantResolver {
  constructor(
    @Inject(type => AiAssistantService)
    private readonly aiAssistantService: AiAssistantService,
  ) {}

  @Mutation(
    type => AiChatMessagePayload,
    { name: 'sendAiMessage' }
  )
  async sendAiMessage(
    @Arg('data') data: AiChatMessageInput,
    @Ctx() {user}: ResolverContext,
  ): Promise<AiChatMessagePayload> {
    return this.aiAssistantService.processMessage(data);
  }

  @Mutation(
    type => AiOcrReceiptPayload,
    { name: 'ocrReceipt' }
  )
  async ocrReceipt(
    @Arg('data') data: AiOcrReceiptInput,
    @Ctx() {user}: ResolverContext,
  ): Promise<AiOcrReceiptPayload> {
    return this.aiAssistantService.ocrReceipt(data);
  }
}
