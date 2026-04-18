import { createUnionType } from "type-graphql";
import { ClockIn } from "../../clockIn/clockIn.entity";
import { Contact } from "../../contact/contact.entity";
import { Gantt } from "../../gantt/gantt.entity";
import { Pdf } from "../../pdf/pdf.entity";
import { Project } from "../../project/project.entity";
import { Task } from "../../task/task.entity";

export const OperationLogObjectUnion = createUnionType({
  name: "OperationLogObjectUnion",
  types: () => [
    ClockIn,
    Contact,
    Gantt,
    Pdf,
    Project,
    Task,
  ],
});
