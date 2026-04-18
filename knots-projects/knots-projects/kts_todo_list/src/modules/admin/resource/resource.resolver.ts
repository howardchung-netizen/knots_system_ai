import { Query } from 'type-graphql';
import { RESOURCE_CONTACT } from '../../contact/contact.resolver';
import { RESOURCE_SERVICE_ACCOUNT } from '../../serviceAccount/serviceAccount.resolver';
import { RESOURCE_TASK, RESOURCE_TASK_APPROVAL } from '../../task/task.resolver';
import { RESOURCE_USER } from '../../user/user.resolver';
import { RESOURCE_USER_NOTIFICATION_MESSAGE } from '../../userNotificationMessage/userNotificationMessage.resolver';
import { RESOURCE_CLIENT } from '../../client/client.resolver';
import { RESOURCE_TENDER_FORM } from '../../tenderForm/tenderForm.resolver';
import { RESOURCE_BOOKKEEPING_ACCOUNT } from '../../bookKeepingAccount/bookKeepingAccount.resolver';
import { RESOURCE_BOOKKEEPING_COMPANY } from '../../bookKeepingCompany/bookKeepingCompany.resolver';
import { RESOURCE_BOOKKEEPING_TRANSACTION } from '../../bookKeepingPeriodExpense/bookKeepingPeriodExpense.resolver';
import { RESOURCE_BOOKKEEPING_ACCOUNT_TYPE } from '../../bookKeepingAccountType/bookKeepingAccountType.resolver';
import { RESOURCE_CHEQUE_BOOK } from '../../chequeBook/chequeBook.resolver';
import { RESOURCE_APP_SETTING } from '../../appSetting/appSetting.resolver';
import { RESOURCE_GANTT } from '../../gantt/gantt.resolver';
import { RESOURCE_PDF } from '../../pdf/pdf.resolver';
import { RESOURCE_PROJECT } from '../../project/project.resolver';
import { RESOURCE_QUOTATION } from '../../quotation/quotation.resolver';
import { RESOURCE_PERMISSION } from '../permission/permission.resolver';
import { RESOURCE_ROLE } from '../role/role.resolver';
import { RESOURCE_CURRENCY } from '../../currency/currency.resolver';

export class ResourceResolver {
  @Query(() => [String], { nullable: true })
  resources() {
    return [
      RESOURCE_APP_SETTING,
      RESOURCE_SERVICE_ACCOUNT,
      RESOURCE_PERMISSION,
      RESOURCE_ROLE,
      RESOURCE_USER,
      RESOURCE_TASK,
      RESOURCE_TASK_APPROVAL,
      RESOURCE_SERVICE_ACCOUNT,
      RESOURCE_CONTACT,
      RESOURCE_USER_NOTIFICATION_MESSAGE,
      RESOURCE_CLIENT,
      RESOURCE_CURRENCY,
      RESOURCE_TENDER_FORM,
      RESOURCE_BOOKKEEPING_ACCOUNT,
      RESOURCE_BOOKKEEPING_ACCOUNT_TYPE,
      RESOURCE_BOOKKEEPING_COMPANY,
      RESOURCE_BOOKKEEPING_TRANSACTION,
      RESOURCE_CHEQUE_BOOK,
      RESOURCE_GANTT,
      RESOURCE_PDF,
      RESOURCE_PROJECT,
      RESOURCE_QUOTATION,
    ];
  }
}
