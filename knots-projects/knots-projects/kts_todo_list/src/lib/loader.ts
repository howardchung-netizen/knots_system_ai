import { contactLoader } from "../modules/contact/contact.loader";
import { calendarLoader, ganttAssignmentsLoader, ganttDependenciesLoader, ganttTasksAssignmentsLoader, ganttTasksLoader, subCalendarLoader } from "../modules/gantt/gantt.loader";
import { projectAssigneeLoader, projectByProjectIdLoader, projectHashtagsLoader, projectLoader } from "../modules/project/project.loader";
import { assignedContactLoader, assignedProjectsLoader, assignedStaffLoader, subTaskLoader, taskAssignedProjectLoader, taskLoader, taskLogsbyTaskIdLoader } from "../modules/task/task.loader";
import { userLoader } from "../modules/user/user.loader";
import { clockInContactLoader } from "../modules/clockInContact/clockInContact.loader";
import { clockInLocationLoader } from "../modules/clockInLocation/clockInLocation.loader";
import { pdfUploadByPdfIdLoader } from "../modules/pdfUpload/pdfUpload.loader";
import { pdfSourceByPdfIdLoader, pdfSourceLoader } from "../modules/pdfSource/pdfSource.loader";
import { pdfSourcePageByPdfSourceIdLoader, pdfSourcePageLoader } from "../modules/pdfSourcePage/pdfSourcePage.loader";
import { historyVersionLoader, pdfSourcePageVersionLoader } from "../modules/pdfSourcePageVersion/pdfSourcePageVersion.loader";
import { pdfShareLoader } from "../modules/pdfShare/pdfShare.loader";
import { clockInContactFileByTelLoader } from "../modules/clockInContactFile/clockInContactFile.loader";
import { pdfSourceHistoryByPdfSourceIdLoader } from "../modules/pdfSourceHistory/pdfSourceHistory.loader";
import { pdfSourcePageHistoryByPdfSourcePageIdLoader } from "../modules/pdfSourcePageHistory/pdfSourcePageHistory.loader";
import { clientContactsLoader, clientLoader } from "../modules/client/client.loader";
import { projectTypeLoader } from "../modules/projectType/projectType.loader";
import { clientContactsByIdLoader } from "../modules/clientContacts/clientContacts.loader";
import { projectStatusLoader } from "../modules/projectStatus/projectStatus.loader";
import { projectOrderByProjectIdLoader, projectOrderLoader } from "../modules/projectOrder/projectOrder.loader";
import { measureTypeLoader } from "../modules/measureType/measureType.loader";
import { measurementLoader } from "../modules/measurement/measurement.loader";
import { quotationStatusLoader } from "../modules/quotationStatus/quotationStatus.loader";
import { quotationTemplateLoader } from "../modules/quotationTemplate/quotationTemplate.loader";
import { bookKeepingAccountLoader } from "../modules/bookKeepingAccount/bookKeepingAccount.loader";
import { bookKeepingTransactionLoader } from "../modules/bookKeepingTransaction/bookKeepingTransaction.loader";
import { bookKeepingTransactionItemsLoader } from "../modules/bookKeepingTransactionItem/bookKeepingTransactionItem.loader";
import { bookKeepingCompanyLoader } from "../modules/bookKeepingCompany/bookKeepingCompany.loader";
import { bookKeepingAccountTypeLoader } from "../modules/bookKeepingAccountType/bookKeepingAccountType.loader";
import { chequeBookByNoLoader, chequeBookLoader } from "../modules/chequeBook/chequeBook.loader";
import { chequeBookAllocateLoader } from "../modules/chequeBookAllocate/chequeBookAllocate.loader";
import { projectInvoiceLoader } from "../modules/projectInvoice/projectInvoice.loader";
import { claimFormLoader } from "../modules/claimForm/claimForm.loader";
import { projectItemChildLoader } from "../modules/projectItem/projectItem.loader";
import { contactFileByIdLoader } from "../modules/contactFile/contactFile.loader";
import { projectOrderFileLoader } from "../modules/projectOrderFile/projectOrderFile.loader";
import { claimFormFileLoader } from "../modules/claimFormFile/claimFormFile.loader";
import { quotationFileByIdLoader } from "../modules/quotationFile_/quotationFile.loader";

export const createLoaders = () => ({
  userLoader: userLoader(),
  contactLoader: contactLoader(),
  assignedStaffLoader: assignedStaffLoader(),
  assignedContactLoader: assignedContactLoader(),
  taskLoader: taskLoader(),
  subTaskLoader: subTaskLoader(),
  taskLogbyTaskIdLoader: taskLogsbyTaskIdLoader(),
  ganttTasksLoader: ganttTasksLoader(),
  ganttDependenciesLoader: ganttDependenciesLoader(),
  ganttAssignmentsLoader: ganttAssignmentsLoader(),
  ganttTasksAssignmentsLoader: ganttTasksAssignmentsLoader(),
  calendarLoader: calendarLoader(),
  subCalendarLoader: subCalendarLoader(),
  assignedProjectsLoader: assignedProjectsLoader(),
  projectLoader: projectLoader(),
  clockInContactLoader: clockInContactLoader(),
  clockInLocationLoader: clockInLocationLoader(),
  pdfUploadByPdfIdLoader: pdfUploadByPdfIdLoader(),
  pdfSourceByPdfIdLoader: pdfSourceByPdfIdLoader(),
  pdfSourcePageByPdfSourceIdLoader: pdfSourcePageByPdfSourceIdLoader(),
  pdfSourcePageVersionLoader: pdfSourcePageVersionLoader(),
  historyVersionLoader: historyVersionLoader(),
  pdfShareLoader: pdfShareLoader(),
  clockInContactFileByTelLoader: clockInContactFileByTelLoader(),
  pdfSourceLoader: pdfSourceLoader(),
  pdfSourceHistoryByPdfSourceIdLoader: pdfSourceHistoryByPdfSourceIdLoader(),
  pdfSourcePageLoader: pdfSourcePageLoader(),
  pdfSourcePageHistoryByPdfSourcePageIdLoader: pdfSourcePageHistoryByPdfSourcePageIdLoader(),
  clientContactsLoader: clientContactsLoader(),
  projectTypeLoader: projectTypeLoader(),
  clientLoader: clientLoader(),
  clientContactsByIdLoader: clientContactsByIdLoader(),
  projectStatusLoader: projectStatusLoader(),
  projectByProjectIdLoader: projectByProjectIdLoader(),
  projectOrderByProjectIdLoader: projectOrderByProjectIdLoader(),
  measureTypeLoader: measureTypeLoader(),
  measurementLoader: measurementLoader(),
  quotationStatusLoader: quotationStatusLoader(),
  quotationTemplateLoader: quotationTemplateLoader(),
  projectAssigneeLoader: projectAssigneeLoader(),
  projectHashtagsLoader: projectHashtagsLoader(),
  bookKeepingAccountLoader: bookKeepingAccountLoader(),
  bookKeepingTransactionLoader: bookKeepingTransactionLoader(),
  bookKeepingTransactionItemsLoader: bookKeepingTransactionItemsLoader(),
  bookKeepingCompanyLoader: bookKeepingCompanyLoader(),
  bookKeepingAccountTypeLoader: bookKeepingAccountTypeLoader(),
  chequeBookLoader: chequeBookLoader(),
  chequeBookAllocateLoader: chequeBookAllocateLoader(),
  chequeBookByNoLoader: chequeBookByNoLoader(),
  projectInvoiceLoader: projectInvoiceLoader(),
  claimFormLoader: claimFormLoader(),
  projectItemChildLoader: projectItemChildLoader(),
  taskAssignedProjectLoader: taskAssignedProjectLoader(),
  contactFileByIdLoader: contactFileByIdLoader(),
  projectOrderFileLoader: projectOrderFileLoader(),
  projectOrderLoader: projectOrderLoader(),
  claimFormFileLoader: claimFormFileLoader(),
  quotationFileByIdLoader: quotationFileByIdLoader(),
});
