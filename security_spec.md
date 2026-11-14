# CrisisGrid AI — Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default Deny**: Any path not explicitly matched under `/databases/{database}/documents` is unconditionally denied (`allow read, write: if false;`).
2. **Verified Identity**: All reads and writes to `/simulations/{simulationId}` require an authenticated user (`request.auth != null`) with a verified email (`request.auth.token.email_verified == true`).
3. **Path ID Hardening**: Document ID `{simulationId}` must match `^[a-zA-Z0-9_\-]+$` with length `1..128` for all single-document operations (`get`, `create`, `update`, `delete`).
4. **Strict Ownership (`ownerId`)**:
   - On `create`: `incoming().ownerId == request.auth.uid`.
   - On `get`, `list`, `update`, `delete`: `existing().ownerId == request.auth.uid`.
   - On `update`: `incoming().ownerId == existing().ownerId` (immutable owner).
5. **Schema & Volumetric Bounds (`isValidSimulationRecord`)**:
   - Allowed keys: `['ownerId', 'scenario', 'supply', 'totalDemand', 'safe', 'statusMessage', 'hospitalAllocated', 'waterAllocated', 'emergencyAllocated', 'telecomAllocated', 'notes', 'createdAt', 'updatedAt']`.
   - Required keys: `['ownerId', 'scenario', 'supply', 'totalDemand', 'safe', 'statusMessage', 'hospitalAllocated', 'waterAllocated', 'emergencyAllocated', 'telecomAllocated', 'createdAt', 'updatedAt']`.
   - `scenario` is a string (`1..64` chars).
   - `statusMessage` is a string (`1..160` chars).
   - Optional `notes` is a string (`<= 300` chars).
   - Numeric bounds: `supply`, `totalDemand`, `hospitalAllocated`, `waterAllocated`, `emergencyAllocated`, `telecomAllocated` are numbers between `0` and `10000`.
6. **Temporal Integrity**:
   - On `create`: `incoming().createdAt == request.time && incoming().updatedAt == request.time`.
   - On `update`: `incoming().createdAt == existing().createdAt && incoming().updatedAt == request.time`.

## 2. The "Dirty Dozen" Payloads

1. **Unauthenticated Write**: `auth = null`, creating `/simulations/sim_1`.
2. **Unverified Email Spoof**: `auth.uid = 'user_1'`, `email_verified = false`, creating `/simulations/sim_1`.
3. **Identity Spoofing on Create**: `auth.uid = 'user_1'`, `payload.ownerId = 'victim_uid'`.
4. **Shadow Field Injection on Create**: Adding undeclared field `isAdmin: true` to `/simulations/sim_1`.
5. **Path ID Poisoning**: Creating `/simulations/invalid$id!@#` with invalid characters.
6. **Oversized String Denial-of-Wallet**: `scenario` string of 500 characters (`> 64`).
7. **Negative Power Value Poisoning**: `supply: -50` or `hospitalAllocated: -10`.
8. **Client-Spoofed Timestamp on Create**: `createdAt` set to a past timestamp instead of `request.time`.
9. **Owner Hijack on Update**: Changing `ownerId` from `'user_1'` to `'user_2'` during update.
10. **Unauthorized Field Mutation on Update**: Attempting to mutate `supply` or `scenario` when only `['notes', 'updatedAt']` is allowed in the update action.
11. **Cross-Tenant Get/Delete**: `auth.uid = 'attacker'` attempting `get` or `delete` on a document owned by `'user_1'`.
12. **Unfiltered Blanket List Query**: `auth.uid = 'attacker'` attempting `list` on `/simulations` without filtering `ownerId == request.auth.uid`.
