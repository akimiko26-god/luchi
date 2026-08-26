# ЛУЧИ — Coding Standards

**Версия:** 1.0.0  
**Дата:** 2026-08-07  

---

## 1. General Principles

| # | Principle | Description |
|---|-----------|-------------|
| 1 | Readability | Code is read 10x more than written |
| 2 | Consistency | Follow existing patterns, don't invent new ones |
| 3 | Simplicity | Simplest solution that works correctly |
| 4 | Testability | If it's hard to test, refactor it |
| 5 | Security | Security is not optional, it's built-in |

---

## 2. TypeScript Standards

### 2.1 Strict Mode

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2.2 Type Rules

```typescript
// ✅ GOOD: Explicit types
function creditRays(accountId: string, amount: number): Promise<Transaction> {}

// ❌ BAD: any type
function processData(data: any): any {}

// ✅ GOOD: unknown + type guard
function processData(data: unknown): ProcessedData {
  if (!isValidData(data)) throw new ValidationException();
  return transform(data);
}

// ✅ GOOD: Discriminated unions
type TransactionStatus = 'PENDING' | 'POSTED' | 'REVERSED' | 'FAILED';

// ✅ GOOD: Branded types for domain concepts
type AccountId = string & { readonly __brand: 'AccountId' };
type RaysAmount = number & { readonly __brand: 'RaysAmount' };
```

### 2.3 Forbidden Patterns

```typescript
// ❌ FORBIDDEN
any                           // Use proper types
console.log()                 // Use Logger service
// @ts-ignore                  // Fix the type error
// @ts-nocheck                 // Fix the type errors
eval()                        // Never
var                           // Use const/let
==                            // Use ===
magic numbers                 // Use constants
nested ternary                // Use if/else or early return
functions > 50 lines          // Split into smaller functions
files > 300 lines             // Split into modules
```

---

## 3. Naming Conventions

### 3.1 Files

| Type | Convention | Example |
|------|-----------|---------|
| Entity | `{name}.entity.ts` | `transaction.entity.ts` |
| Value Object | `{name}.vo.ts` | `money.vo.ts` |
| Command | `{action}.command.ts` | `credit-rays.command.ts` |
| Query | `{action}.query.ts` | `get-balance.query.ts` |
| Handler | `{action}.handler.ts` | `credit-rays.handler.ts` |
| Controller | `{name}.controller.ts` | `ledger.controller.ts` |
| Service | `{name}.service.ts` | `ledger-domain.service.ts` |
| Repository | `{name}.repository.ts` | `transaction.repository.ts` |
| DTO | `{action}.dto.ts` | `credit-rays.dto.ts` |
| Event | `{name}.event.ts` | `rays-credited.event.ts` |
| Guard | `{name}.guard.ts` | `permission.guard.ts` |
| Test | `{name}.spec.ts` | `credit-rays.handler.spec.ts` |
| Component | `{Name}.tsx` | `RayBalance.tsx` |
| Hook | `use{Name}.ts` | `useAuth.ts` |

### 3.2 Code

```typescript
// Classes: PascalCase
class CreditRaysHandler {}
class TransactionRepository {}

// Interfaces: PascalCase, NO "I" prefix
interface TransactionRepository {}
interface CreditRaysCommand {}

// Functions/methods: camelCase
function calculateBalance() {}
async function creditRays() {}

// Constants: UPPER_SNAKE_CASE
const MAX_TRANSFER_AMOUNT = 1000;
const JWT_ACCESS_TTL_SECONDS = 900;

// Enums: PascalCase members
enum TransactionType {
  Reward = 'REWARD',
  Transfer = 'TRANSFER',
  Purchase = 'PURCHASE',
}

// Variables: camelCase
const accountBalance = 340;
const isVerified = true;
```

---

## 4. Architecture Patterns

### 4.1 Controller (Thin)

```typescript
@Controller('ledger')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class LedgerController {
  constructor(private readonly ledgerService: LedgerApplicationService) {}

  @Post('transfer')
  @RequirePermission('rays:transfer')
  async transfer(
    @CurrentUser() user: AuthUser,
    @Body() dto: TransferRaysDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ): Promise<TransferRaysResponseDto> {
    return this.ledgerService.transfer(user.id, dto, idempotencyKey);
  }
}
```

### 4.2 Application Service

```typescript
@Injectable()
export class LedgerApplicationService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async transfer(
    userId: string,
    dto: TransferRaysDto,
    idempotencyKey: string,
  ): Promise<TransferRaysResponseDto> {
    const transaction = await this.commandBus.execute(
      new TransferRaysCommand(userId, dto.recipientId, dto.amount, dto.message, idempotencyKey),
    );
    return TransferRaysMapper.toResponse(transaction);
  }
}
```

### 4.3 Domain Entity

```typescript
export class Transaction extends AggregateRoot {
  private constructor(
    public readonly id: TransactionId,
    public readonly type: TransactionType,
    private _status: TransactionStatus,
    public readonly entries: LedgerEntry[],
    public readonly reason: string,
    public readonly idempotencyKey: IdempotencyKey,
  ) {
    super();
    this.validateDoubleEntry();
  }

  static create(props: CreateTransactionProps): Transaction {
    const transaction = new Transaction(/* ... */);
    transaction.validateDoubleEntry();
    return transaction;
  }

  post(): void {
    if (this._status !== TransactionStatus.Pending) {
      throw new InvalidTransactionStateException(this._status, 'POST');
    }
    this._status = TransactionStatus.Posted;
    this.addDomainEvent(new RaysCreditedEvent(/* ... */));
  }

  private validateDoubleEntry(): void {
    const debits = this.entries.filter(e => e.type === EntryType.Debit).reduce((s, e) => s + e.amount, 0);
    const credits = this.entries.filter(e => e.type === EntryType.Credit).reduce((s, e) => s + e.amount, 0);
    if (debits !== credits) {
      throw new UnbalancedTransactionException(debits, credits);
    }
  }
}
```

### 4.4 Repository Interface (Domain)

```typescript
export interface TransactionRepository {
  save(transaction: Transaction): Promise<void>;
  findById(id: TransactionId): Promise<Transaction | null>;
  findByIdempotencyKey(key: IdempotencyKey): Promise<Transaction | null>;
  findByAccountId(accountId: AccountId, pagination: PaginationParams): Promise<PaginatedResult<Transaction>>;
}
```

---

## 5. Error Handling

### 5.1 Domain Exceptions

```typescript
export class InsufficientBalanceException extends DomainException {
  constructor(
    public readonly accountId: string,
    public readonly requested: number,
    public readonly available: number,
  ) {
    super(`Insufficient balance: requested ${requested}, available ${available}`);
  }
}
```

### 5.2 Global Exception Filter

```typescript
// Maps domain exceptions to RFC 7807 responses
InsufficientBalanceException → 422 { code: 'INSUFFICIENT_BALANCE' }
EntityNotFoundException      → 404 { code: 'NOT_FOUND' }
PermissionDeniedException    → 403 { code: 'FORBIDDEN' }
ValidationException          → 422 { code: 'VALIDATION_ERROR' }
DuplicateException           → 409 { code: 'DUPLICATE' }
```

### 5.3 Rules

- Domain layer throws domain exceptions
- Application layer catches and re-throws or handles
- Controllers never catch exceptions (global filter handles)
- Never swallow errors silently
- Always log errors with correlation ID

---

## 6. Logging

```typescript
// ✅ GOOD: Structured logging
this.logger.log('Rays credited', {
  transactionId: transaction.id,
  accountId: account.id,
  amount: amount,
  correlationId: context.correlationId,
});

// ❌ BAD
console.log('credited rays', amount);
console.log(`Transaction ${id} completed`);
```

### Log Levels

| Level | Usage |
|-------|-------|
| `error` | Unhandled exceptions, data corruption |
| `warn` | Suspicious activity, deprecated usage, retry |
| `log` | Business events (login, transfer, approve) |
| `debug` | Development debugging (not in production) |
| `verbose` | Detailed tracing (not in production) |

---

## 7. DTO Validation

```typescript
export class TransferRaysDto {
  @IsUUID()
  recipientId: string;

  @IsInt()
  @Min(1)
  @Max(MAX_TRANSFER_AMOUNT)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  message?: string;
}
```

### Validation Rules

- All DTOs validated with `class-validator` decorators
- ValidationPipe enabled globally with `whitelist: true, forbidNonWhitelisted: true`
- Custom validators for domain-specific rules (e.g., `@IsValidRaysAmount()`)
- Frontend uses Zod schemas mirroring backend DTOs

---

## 8. Database Conventions

```sql
-- Table names: snake_case, plural
CREATE TABLE ledger.transactions (...);

-- Column names: snake_case
created_at, user_id, transaction_type

-- Primary keys: UUID
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Foreign keys: {referenced_table_singular}_id
user_id, account_id, transaction_id

-- Timestamps: always TIMESTAMPTZ
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

-- Soft delete: deleted_at TIMESTAMPTZ (nullable)
-- Enums: VARCHAR with CHECK constraint (not PG ENUM type)
status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'DELETED'))

-- Indexes: idx_{table}_{columns}
CREATE INDEX idx_transactions_created ON ledger.transactions(created_at DESC);
```

---

## 9. API Conventions

```
# URL structure
/api/v1/{resource}              # Collection
/api/v1/{resource}/{id}           # Item
/api/v1/{resource}/{id}/{action}  # Action

# HTTP methods
GET    → Read
POST   → Create / Action
PATCH  → Partial update
DELETE → Delete (soft)

# Response structure
{
  "data": { ... },           // Single item
  "data": [ ... ],           // Collection
  "meta": { "next_cursor", "has_more" },  // Pagination
  "error": { ... }           // RFC 7807 (errors only)
}

# Status codes
200 OK, 201 Created, 204 No Content
400 Bad Request, 401 Unauthorized, 403 Forbidden
404 Not Found, 409 Conflict, 422 Unprocessable Entity
429 Too Many Requests, 500 Internal Server Error
```

---

## 10. Frontend Conventions

### 10.1 Component Structure

```typescript
// components/RayBalance/RayBalance.tsx
interface RayBalanceProps {
  balance: number;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function RayBalance({ balance, size = 'md', animated = false }: RayBalanceProps) {
  return (
    <div className={cn('flex items-center gap-1', sizeClasses[size])}>
      <RayIcon className="text-rays-gold" />
      <span className="font-semibold">{formatRays(balance)}</span>
    </div>
  );
}
```

### 10.2 Rules

- Functional components only (no class components)
- Props interface defined above component
- No business logic — data fetching in hooks/server components
- Tailwind CSS for styling (no inline styles, no CSS modules)
- Use `@luchi/ui` components, don't recreate
- Use `cn()` utility for conditional classes
- Server Components by default, `'use client'` only when needed

### 10.3 File Organization

```
features/
├── auth/
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   └── api/
│       └── auth-api.ts
├── feed/
├── deeds/
├── store/
└── profile/
```

---

## 11. Git Conventions

### Commit Messages

```
feat(ledger): add P2P Ray transfer
fix(auth): refresh token rotation on concurrent requests
docs(api): update ledger endpoint documentation
refactor(social): extract feed service from controller
test(ledger): add concurrent transfer integration tests
chore(deps): update NestJS to 10.4
```

### Branch Naming

```
feat/ledger-transfer
fix/auth-refresh-race
docs/api-update
refactor/social-feed
test/ledger-integration
```

---

## 12. Constants & Configuration

```typescript
// ✅ GOOD: Named constants in dedicated file
// modules/ledger/domain/constants/ledger.constants.ts
export const MAX_TRANSFER_AMOUNT = 1000;
export const MIN_TRANSFER_AMOUNT = 1;
export const DAILY_TRANSFER_LIMIT = 5000;
export const DAILY_TRANSFER_COUNT_LIMIT = 20;

// ✅ GOOD: Config from environment
export const jwtConfig = {
  accessTtl: parseInt(process.env.JWT_ACCESS_TTL ?? '900', 10),
  refreshTtl: parseInt(process.env.JWT_REFRESH_TTL ?? '604800', 10),
};

// ❌ BAD: Magic numbers in code
if (amount > 1000) throw new Error('Too much');
setTimeout(refresh, 900000);
```

---

## 13. Import Order

```typescript
// 1. Node.js built-ins
import { createHash } from 'crypto';

// 2. External packages
import { Injectable } from '@nestjs/common';
import { IsUUID, IsInt } from 'class-validator';

// 3. Internal packages (monorepo)
import { RayBalance } from '@luchi/ui';

// 4. Module absolute imports
import { TransactionRepository } from '../../domain/repositories';
import { CreditRaysCommand } from '../../application/commands';

// 5. Relative imports
import { TransferRaysMapper } from '../mappers';
```

---

## 14. Documentation in Code

```typescript
// ✅ GOOD: Self-documenting code with clear names
async creditRaysForApprovedDeed(submission: DeedSubmission, amount: RaysAmount): Promise<Transaction>

// ✅ ACCEPTABLE: Comment for non-obvious business rule
// Rollback creates a NEW transaction with reversed entries.
// Original transaction status changes to REVERSED but entries are never deleted.
async rollbackTransaction(transactionId: TransactionId, reason: string): Promise<Transaction>

// ❌ BAD: Obvious comment
// Get user by ID
const user = await this.userRepo.findById(id);

// ❌ BAD: Commented-out code
// const oldBalance = user.balance;
// user.balance += amount;
```

---

## 15. Performance Guidelines

| Guideline | Implementation |
|-----------|---------------|
| N+1 queries | Use JOIN or batch loading |
| Pagination | Cursor-based, never offset for large tables |
| Caching | Redis for hot data (feed, balance, sessions) |
| Lazy loading | Frontend: dynamic imports for routes |
| Image optimization | Next.js Image component, WebP format |
| DB indexes | Every WHERE/ORDER BY column indexed |
| Connection pooling | PgBouncer in production |
| Async operations | Event bus for non-critical side effects |

---

## 16. Code Review Checklist

- [ ] No `any` types
- [ ] No `console.log`
- [ ] No magic numbers
- [ ] No business logic in controllers/UI
- [ ] No secrets in code
- [ ] DTOs validated
- [ ] Permission guard on endpoint
- [ ] Audit log for mutations
- [ ] Unit tests included
- [ ] Error handling with domain exceptions
- [ ] Idempotency for financial operations
- [ ] Balance computed from ledger (not stored)
- [ ] Follows module structure
- [ ] Naming conventions followed

---

## 17. ESLint Configuration

```javascript
// packages/config/eslint.config.js
module.exports = {
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    'import/order': ['error', { /* import order rules */ }],
    'max-lines': ['warn', { max: 300 }],
    'max-depth': ['warn', { max: 3 }],
    'complexity': ['warn', { max: 10 }],
  },
};
```

---

## 18. Связанные документы

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [CURSOR_RULES.md](./CURSOR_RULES.md)
- [TESTING.md](./TESTING.md)
- [SECURITY.md](./SECURITY.md)
