import { randomUUID } from 'crypto';

export abstract class Entity<TId = string> {
  protected readonly _id: TId;

  protected constructor(id: TId) {
    this._id = id;
  }

  get id(): TId {
    return this._id;
  }

  equals(other?: Entity<TId>): boolean {
    if (!other) {
      return false;
    }
    return this._id === other._id;
  }
}

export abstract class AggregateRoot<TId = string> extends Entity<TId> {
  private readonly domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }
}

export interface DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly eventType: string;
  readonly aggregateId: string;
  readonly payload: Record<string, unknown>;
}

export abstract class DomainEventBase implements DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;

  protected constructor(
    readonly eventType: string,
    readonly aggregateId: string,
    readonly payload: Record<string, unknown>,
  ) {
    this.eventId = randomUUID();
    this.occurredAt = new Date();
  }
}

export class DomainException extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = 'DomainException';
  }
}

export interface Repository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>;
  save(entity: TEntity): Promise<void>;
}
