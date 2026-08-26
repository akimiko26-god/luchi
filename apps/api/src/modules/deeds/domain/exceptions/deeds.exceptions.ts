import { DomainException } from '../../../../shared/kernel/domain.base';

export class TaskFullException extends DomainException {
  constructor() {
    super('Набор волонтёров на это дело уже закрыт', 'TASK_FULL');
  }
}

export class BeneficiaryRequiredException extends DomainException {
  constructor() {
    super('Укажите хотя бы одного человека, которому помогли', 'BENEFICIARY_REQUIRED');
  }
}

export class ConfirmationPendingException extends DomainException {
  constructor() {
    super('Нужно подтверждение того, кому помогли, либо явное одобрение администратора', 'NEED_BENEFICIARY_CONFIRMATION');
  }
}

export class AttachmentRequiredException extends DomainException {
  constructor() {
    super('Прикрепите фото, видео или документ', 'ATTACHMENT_REQUIRED');
  }
}
