import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { AiMemoryRepository } from "./aiMemory.repository";
import { AiMemory } from "./aiMemory.entity";

@Service()
export class AiMemoryService {
  constructor(
    @InjectRepository()
    private readonly aiMemoryRepository: AiMemoryRepository,
  ) {}

  /**
   * Retrieves the AI memory for a specific user.
   * If the user doesn't have a memory record yet, it returns an empty string,
   * but it will be lazily created when they append a memory.
   */
  async getMemory(userId: string): Promise<string> {
    const memory = await this.aiMemoryRepository.findOne({ where: { userId } });
    return memory?.content || "";
  }

  /**
   * Appends a new fact to the user's AI memory.
   * If the memory record does not exist, it creates one automatically.
   */
  async appendMemory(userId: string, newFact: string): Promise<AiMemory> {
    let memory = await this.aiMemoryRepository.findOne({ where: { userId } });
    
    if (!memory) {
      memory = this.aiMemoryRepository.create({ userId, content: "" });
    }

    const currentContent = memory.content ? memory.content.trim() : "";
    const prefix = currentContent ? currentContent + "\n- " : "- ";
    
    // Clean up the new fact just in case
    const cleanFact = newFact.replace(/^-\s*/, '').trim();
    memory.content = prefix + cleanFact;

    return await this.aiMemoryRepository.save(memory);
  }

  /**
   * Fully replaces the user's memory content (useful if AI reorganizes it).
   */
  async setMemory(userId: string, newContent: string): Promise<AiMemory> {
    let memory = await this.aiMemoryRepository.findOne({ where: { userId } });
    
    if (!memory) {
      memory = this.aiMemoryRepository.create({ userId });
    }
    
    memory.content = newContent.trim();
    return await this.aiMemoryRepository.save(memory);
  }
}
