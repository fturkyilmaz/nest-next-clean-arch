# Advanced Authentication Implementation Guide

## Overview

Complete advanced authentication system for the diet-plan-ai application with:

- **Token Rotation Strategy**: Automatic token refresh without interrupting user experience
- **Multi-Session Management**: Track multiple devices/browsers per user
- **Two-Factor Authentication**: TOTP (Google Authenticator) with backup codes
- **Session Revocation**: Immediate logout from specific devices or all devices
- **Device Tracking**: Track and manage authenticated devices
- **Security Events Logging**: Comprehensive audit trail

## Architecture

### Token Rotation Flow

```
1. Login
   ↓
2. Create Session + Issue Tokens
   ├─ Access Token: Short-lived JWT (15 min)
   └─ Refresh Token: Long-lived token (30 days)
   ↓
3. Request with Access Token
   ↓
4. Access Token Expires
   ↓
5. Refresh Token Request
   ├─ Validate Refresh Token
   ├─ Revoke Old Refresh Token
   └─ Issue New Token Pair
   ↓
6. Continue with New Access Token
```

### Session Management

Each user can have multiple active sessions:

```
User
├─ Session 1 (Chrome on macOS)
│  ├─ Access Token
│  ├─ Refresh Token
│  ├─ Device ID
│  └─ Last Activity
├─ Session 2 (Safari on iPhone)
│  ├─ Access Token
│  ├─ Refresh Token
│  ├─ Device ID
│  └─ Last Activity
└─ Session 3 (Firefox on Windows)
   ├─ Access Token
   ├─ Refresh Token
   ├─ Device ID
   └─ Last Activity
```

### 2FA Flow

```
1. User Login with Email/Password
   ↓
2. Check if 2FA Enabled
   ├─ No: Issue tokens normally
   └─ Yes: Return 2FA Token
   ↓
3. User Provides 2FA Code
   ├─ TOTP Code from Authenticator
   └─ Or Backup Code
   ↓
4. Verify Code Against Secret
   ↓
5. Issue Tokens and Create Session
```

## Core Types

### UserSession

```typescript
interface UserSession {
    id: string;
    userId: string;
    deviceId: string;
    deviceName: string;           // "Chrome on macOS"
    deviceType: DeviceType;        // WEB, MOBILE_IOS, MOBILE_ANDROID
    ipAddress: string;
    userAgent: string;
    accessTokenHash: string;       // Never store plaintext tokens
    refreshTokenHash: string;
    status: SessionStatus;         // ACTIVE, REVOKED, EXPIRED
    lastActivityAt: Date;
    expiresAt: Date;               // Session auto-expires after 30 days
    createdAt: Date;
}
```

### TokenPair

```typescript
interface TokenPair {
    accessToken: string;           // 15-minute JWT
    refreshToken: string;          // 30-day refresh token
    expiresIn: number;             // Seconds until access token expires
}
```

### TwoFactorSetup

```typescript
interface TwoFactorSetup {
    id: string;
    userId: string;
    method: TwoFactorMethod;       // TOTP, SMS, EMAIL
    secret: string;                // Base32-encoded TOTP secret
    backupCodes: string[];         // Hashed recovery codes
    verified: boolean;
    enabledAt?: Date;
    disabledAt?: Date;
}
```

## Backend Implementation

### Token Rotation Service

```typescript
import { TokenRotationService } from '@diet/infrastructure/auth';

// Generate tokens for new login
const tokens = await tokenRotationService.generateTokenPair(
    userId,
    sessionId,
    deviceId,
);
// Result: { accessToken, refreshToken, expiresIn }

// Rotate tokens when refresh token is used
const newTokens = await tokenRotationService.rotateTokens(
    oldRefreshToken,
    sessionId,
    deviceId,
);
// Old token is marked as USED, new pair issued

// Revoke all tokens for user (password change, logout all)
await tokenRotationService.revokeAllUserTokens(userId);

// Revoke specific session
await tokenRotationService.revokeSessionTokens(sessionId);

// Clean up expired tokens (run as background job)
const count = await tokenRotationService.cleanupExpiredTokens();
```

### Session Management Service

```typescript
import { SessionManagementService } from '@diet/infrastructure/auth';

// Create session
const session = await sessionService.createSession(
    userId,
    {
        deviceId: 'uuid-123',
        deviceName: 'Chrome on macOS',
        deviceType: DeviceType.WEB,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
    },
    accessToken,
    refreshToken,
);

// Get user's active sessions
const sessions = await sessionService.getUserSessions(userId);

// Revoke specific session (logout from one device)
await sessionService.revokeSession(sessionId);

// Revoke all sessions (logout all devices)
await sessionService.revokeAllSessions(userId);

// Validate session is still active
const isValid = await sessionService.validateSession(sessionId);

// Update session activity timestamp
await sessionService.updateSessionActivity(sessionId);
```

### Two-Factor Auth Service

```typescript
import { TwoFactorAuthService } from '@diet/infrastructure/auth';

// Check if user has 2FA enabled
const enabled = await twoFactorService.isTwoFactorEnabled(userId);

// Initiate TOTP setup (returns QR code)
const setup = await twoFactorService.initiateTOTPSetup(userId);
// Result: { uri, secret, qrCode }

// Verify TOTP code and enable 2FA
const backupCodes = await twoFactorService.verifyAndEnableTOTP(
    userId,
    '123456'  // 6-digit code from authenticator
);

// Verify 2FA code during login
const isValid = await twoFactorService.verifyTwoFactorCode(
    userId,
    '123456'  // Or backup code like 'XXXX-XXXX'
);

// Get 2FA status
const status = await twoFactorService.getTwoFactorStatus(userId);
// Result: { enabled, method, enabledAt, backupCodesRemaining }

// Generate new backup codes
const newCodes = await twoFactorService.generateNewBackupCodes(userId);

// Disable 2FA
await twoFactorService.disableTwoFactor(userId);
```

## Authentication Controllers

### Login Endpoint

```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "deviceType": "WEB"
}

// Response (without 2FA)
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 900,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "requiresTwoFactor": false
}

// Response (with 2FA required)
{
  "accessToken": "",
  "refreshToken": "",
  "expiresIn": 0,
  "user": { ... },
  "requiresTwoFactor": true,
  "twoFactorToken": "temp-token-base64"
}
```

### 2FA Verification Endpoint

```typescript
POST /api/auth/2fa/verify
Content-Type: application/json

{
  "code": "123456",
  "method": "TOTP",
  "twoFactorToken": "temp-token-base64"
}

// Response
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": 900,
  "user": { ... },
  "requiresTwoFactor": false
}
```

### Token Refresh Endpoint

```typescript
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

// Response
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 900
}
```

### Session Management Endpoints

```typescript
// List all sessions
GET /api/auth/sessions
Authorization: Bearer <access-token>

// Response
[
  {
    "id": "session-123",
    "deviceName": "Chrome on macOS",
    "deviceType": "WEB",
    "ipAddress": "192.168.1.1",
    "lastActivityAt": "2024-12-25T10:30:00Z",
    "expiresAt": "2025-01-24T10:30:00Z",
    "isCurrent": true,
    "createdAt": "2024-12-25T10:30:00Z"
  },
  {
    "id": "session-456",
    "deviceName": "Safari on iPhone",
    "deviceType": "MOBILE_IOS",
    "ipAddress": "203.0.113.15",
    "lastActivityAt": "2024-12-24T15:45:00Z",
    "expiresAt": "2025-01-23T15:45:00Z",
    "isCurrent": false,
    "createdAt": "2024-12-24T15:45:00Z"
  }
]

// Revoke specific session
DELETE /api/auth/sessions/:sessionId
Authorization: Bearer <access-token>

// Logout current session only
POST /api/auth/logout
Authorization: Bearer <access-token>

// Logout all sessions (all devices)
POST /api/auth/logout-all
Authorization: Bearer <access-token>
```

### 2FA Setup Endpoints

```typescript
// Initiate 2FA setup
POST /api/auth/2fa/setup
Authorization: Bearer <access-token>

// Response
{
  "secret": "JBSWY3DPEBLW64TMMQ======",
  "qrCode": "data:image/png;base64,...",
  "uri": "otpauth://totp/Diet%20Plan%20AI:user@example.com?secret=..."
}

// Enable 2FA
POST /api/auth/2fa/enable
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "code": "123456"
}

// Response
{
  "backupCodes": [
    "XXXX-XXXX",
    "YYYY-YYYY",
    // ... 8 more codes
  ]
}

// Get 2FA status
GET /api/auth/2fa/status
Authorization: Bearer <access-token>

// Response
{
  "enabled": true,
  "method": "TOTP",
  "enabledAt": "2024-12-20T14:30:00Z",
  "backupCodesRemaining": 9
}

// Generate new backup codes
POST /api/auth/2fa/backup-codes
Authorization: Bearer <access-token>

// Response
{
  "backupCodes": [
    "AAAA-AAAA",
    "BBBB-BBBB",
    // ... 8 more codes
  ]
}

// Disable 2FA
POST /api/auth/2fa/disable
Authorization: Bearer <access-token>
```

## Frontend Implementation

### Web App Login Hook

```typescript
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@diet/web/stores';
import { useApiClient } from '@diet/web/contexts';

export function useLogin() {
    const { setTokens, setUser } = useAuthStore();
    const apiClient = useApiClient();

    return useMutation({
        mutationFn: async (credentials: LoginInput) => {
            const response = await apiClient.post('/api/auth/login', credentials);
            return response.data;
        },
        onSuccess: (data) => {
            // Handle 2FA required
            if (data.requiresTwoFactor) {
                return { requiresTwoFactor: true, token: data.twoFactorToken };
            }

            // Store tokens
            setTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresIn: data.expiresIn,
                expiresAt: Date.now() + data.expiresIn * 1000,
            });

            // Store user
            setUser(data.user);
        },
    });
}

// Usage in component
function LoginPage() {
    const { mutate: login, isPending } = useLogin();
    const navigate = useNavigate();

    const handleSubmit = (credentials) => {
        login(credentials, {
            onSuccess: (result) => {
                if (result.requiresTwoFactor) {
                    navigate('/2fa-verify', { state: { token: result.token } });
                } else {
                    navigate('/dashboard');
                }
            },
        });
    };

    return <LoginForm onSubmit={handleSubmit} />;
}
```

### 2FA Verification Component

```typescript
export function TwoFactorVerification() {
    const [code, setCode] = useState('');
    const { twoFactorToken } = useLocation().state;
    const { setTokens } = useAuthStore();
    const apiClient = useApiClient();

    const handleSubmit = async () => {
        const response = await apiClient.post('/api/auth/2fa/verify', {
            code,
            twoFactorToken,
        });

        setTokens(response.data);
        navigate('/dashboard');
    };

    return (
        <div className="2fa-form">
            <h2>Two-Factor Authentication</h2>
            <p>Enter the 6-digit code from your authenticator app</p>
            <input
                type="text"
                maxLength="6"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
            <button onClick={handleSubmit}>Verify</button>
        </div>
    );
}
```

### Token Refresh Interceptor

```typescript
// Auto-refresh tokens when access token expires
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const refreshToken = getAuthStore().refreshToken;

            try {
                const response = await apiClient.post('/api/auth/refresh', {
                    refreshToken,
                });

                setAuthStore({
                    accessToken: response.data.accessToken,
                });

                // Retry original request
                return apiClient(error.config);
            } catch {
                // Refresh failed, logout
                setAuthStore(null);
                navigate('/login');
            }
        }
        throw error;
    }
);
```

### Session Management Component

```typescript
export function SessionsPage() {
    const { data: sessions } = useQuery({
        queryKey: ['sessions'],
        queryFn: async () => {
            const response = await apiClient.get('/api/auth/sessions');
            return response.data;
        },
    });

    const { mutate: revokeSession } = useMutation({
        mutationFn: (sessionId: string) =>
            apiClient.delete(`/api/auth/sessions/${sessionId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
    });

    return (
        <div className="sessions">
            <h2>Active Sessions</h2>
            {sessions?.map((session) => (
                <div key={session.id} className="session-item">
                    <div>
                        <strong>{session.deviceName}</strong>
                        <p>{session.ipAddress}</p>
                        <small>
                            Last active: {formatDate(session.lastActivityAt)}
                        </small>
                    </div>
                    {!session.isCurrent && (
                        <button
                            onClick={() => revokeSession(session.id)}
                            className="btn-danger"
                        >
                            Sign Out
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
```

### 2FA Setup Component

```typescript
export function TwoFactorSetupPage() {
    const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
    const [code, setCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);

    const { data: setup } = useQuery({
        queryKey: ['2fa-setup'],
        queryFn: () => apiClient.get('/api/auth/2fa/setup'),
    });

    const { mutate: enable2FA } = useMutation({
        mutationFn: (code: string) =>
            apiClient.post('/api/auth/2fa/enable', { code }),
        onSuccess: (data) => {
            setBackupCodes(data.backupCodes);
            setStep('backup');
        },
    });

    if (step === 'setup') {
        return (
            <div>
                <h2>Enable Two-Factor Authentication</h2>
                <p>Scan this QR code with your authenticator app:</p>
                <img src={setup?.qrCode} alt="QR Code" />
                <p>Or enter manually: {setup?.secret}</p>
                <button onClick={() => setStep('verify')}>Next</button>
            </div>
        );
    }

    if (step === 'verify') {
        return (
            <div>
                <p>Enter the 6-digit code from your authenticator:</p>
                <input
                    type="text"
                    maxLength="6"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                />
                <button onClick={() => enable2FA(code)}>Verify</button>
            </div>
        );
    }

    return (
        <div>
            <h2>Save Your Backup Codes</h2>
            <p>Store these in a safe place. Use them if you lose access to your authenticator.</p>
            <div className="backup-codes">
                {backupCodes.map((code) => (
                    <code key={code}>{code}</code>
                ))}
            </div>
            <button onClick={() => navigate('/dashboard')}>Done</button>
        </div>
    );
}
```

## Mobile Implementation

```typescript
import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

export function useMobileLogin() {
    const { apiClient } = useApiClient();
    const authStore = useAuthStore();

    return useMutation({
        mutationFn: async (credentials: LoginInput) => {
            return apiClient.post('/api/auth/login', {
                ...credentials,
                deviceType: Platform.OS === 'ios' ? 'MOBILE_IOS' : 'MOBILE_ANDROID',
            });
        },
        onSuccess: async (response) => {
            if (response.data.requiresTwoFactor) {
                return { requiresTwoFactor: true, token: response.data.twoFactorToken };
            }

            // Secure storage for mobile
            await SecureStore.setItemAsync('accessToken', response.data.accessToken);
            await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);

            authStore.setUser(response.data.user);
        },
    });
}
```

## Security Best Practices

1. **Never store plaintext tokens**: Always hash tokens before storage
2. **Use HTTPS only**: Token transmission must be encrypted
3. **Validate session on each request**: Check session status in JWT guard
4. **Implement token rotation**: Auto-refresh prevents token reuse
5. **Limit session duration**: Sessions expire after 30 days
6. **Monitor suspicious activity**: Log all login/logout/2FA events
7. **Rate limit login attempts**: Prevent brute force attacks
8. **Secure backup codes**: Hash and store separately
9. **Device fingerprinting**: Validate user agent matches session
10. **Correlation IDs**: Track requests for security audit

## Testing

```typescript
describe('Authentication', () => {
    it('should login and create session', async () => {
        const response = await apiClient.post('/api/auth/login', {
            email: 'test@example.com',
            password: 'Password123!',
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('accessToken');
        expect(response.data).toHaveProperty('refreshToken');
    });

    it('should refresh tokens', async () => {
        const response = await apiClient.post('/api/auth/refresh', {
            refreshToken,
        });

        expect(response.data.accessToken).toBeDefined();
    });

    it('should verify 2FA code', async () => {
        const response = await apiClient.post('/api/auth/2fa/verify', {
            code: '123456',
            twoFactorToken,
        });

        expect(response.data).toHaveProperty('accessToken');
    });
});
```
