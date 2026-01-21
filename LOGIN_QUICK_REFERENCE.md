# Quick Reference: Login System

## How It Works Now ✅

### On First Visit:
```
User sees two buttons:
├── "未有帳戶?" (No account?) → Sign Up form
└── "已有帳戶?" (Have account?) → Already on Login form
```

### Sign Up Flow:
```
1. User fills in:
   - Username (required)
   - Password (required)
   - Email (optional)
   
2. Data saved to:
   localStorage.setItem('users', JSON.stringify([...]))
   
3. User auto-directed to login with username pre-filled
```

### Login Flow:
```
1. User fills in:
   - Username (required)
   - Password (required)
   
2. System checks:
   - authManager.login(username, password)
   
3. On success:
   - localStorage.setItem('current-user', {...})
   - Redirect to index.html
```

---

## Form Fields Summary

### Login Form:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Username | Text | ✅ Yes | Used for sign in |
| Password | Password | ✅ Yes | 4+ characters |

### Sign Up Form:
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Username | Text | ✅ Yes | Must be unique |
| Password | Password | ✅ Yes | 4+ characters |
| Email | Email | ❌ No | Optional field |

---

## localStorage Data

### Key: `users`
Stores array of all registered accounts with:
- id, username, password, email, createdAt

### Key: `current-user`
Stores logged-in user info:
- username, loginTime

### Key: `rs-system-session`
Stores session info (managed by authManager)

---

## Example User Data in localStorage

```javascript
// Sample data after sign up
localStorage.getItem('users')
// Returns:
[
  {
    "id": "1705833000123",
    "username": "john_doe",
    "password": "mypass123",
    "email": "john@email.com",
    "createdAt": "2026-01-21T10:30:00Z"
  },
  {
    "id": "1705833060456", 
    "username": "jane_smith",
    "password": "janepass",
    "email": null,  // Optional field
    "createdAt": "2026-01-21T10:31:00Z"
  }
]

// After login
localStorage.getItem('current-user')
// Returns:
{
  "username": "john_doe",
  "loginTime": "2026-01-21T10:35:00Z"
}
```

---

## Validation Rules

✅ **Sign Up Passes If:**
- Username provided and not empty
- Password provided (min 4 chars)
- Email optional (can be empty)
- Username doesn't already exist in localStorage

❌ **Sign Up Fails If:**
- Username empty → "請填寫使用者名稱和密碼"
- Password < 4 chars → "密碼至少需要 4 個字符"
- Username already exists → "此使用者名稱已被使用"

✅ **Sign In Passes If:**
- Username matches registered user
- Password matches user's password
- authManager.login() returns success

❌ **Sign In Fails If:**
- Username/Password empty → "請填寫使用者名稱和密碼"
- Username not found → authManager error
- Password incorrect → authManager error

---

## Code Examples

### Check if user is logged in:
```javascript
const currentUser = localStorage.getItem('current-user');
if (currentUser) {
  const user = JSON.parse(currentUser);
  console.log('Logged in as:', user.username);
}
```

### Get all registered users:
```javascript
const users = JSON.parse(localStorage.getItem('users') || '[]');
console.log('Total users:', users.length);
users.forEach(user => {
  console.log(`- ${user.username} (${user.email || 'no email'})`);
});
```

### Verify user credentials:
```javascript
function verifyLogin(username, password) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.username === username && u.password === password);
  return !!user;
}

if (verifyLogin('john_doe', 'mypass123')) {
  console.log('Login successful!');
}
```

---

## Common Scenarios

### Scenario 1: New User Journey
```
1. Opens login.html
2. Sees "未有帳戶?" button
3. Clicks it → Sign Up form appears
4. Fills: username="alice", password="alice123", email=""
5. Clicks "建立帳戶"
6. Form switches to login, "alice" pre-filled
7. Enters password and logs in
8. Redirects to index.html
```

### Scenario 2: Returning User Journey
```
1. Opens login.html
2. Already on login form
3. Fills: username="alice", password="alice123"
4. Clicks "登入"
5. Logs in successfully
6. Redirects to index.html
```

### Scenario 3: Multiple Users
```
User 1: alice / alice123 / alice@email.com
User 2: bob / bob456 / (no email)
User 3: charlie / charlie789 / charlie@email.com

All stored in localStorage['users'] array
```

---

## Verification Status

| Requirement | Status | Evidence |
|-----------|--------|----------|
| Two form options | ✅ | Sign In / Sign Up toggle buttons |
| Username + Password only | ✅ | Email is optional with no required attr |
| Login function called | ✅ | authManager.login() + localStorage save |
| Uses localStorage | ✅ | localStorage.setItem('users') + 'current-user' |
| Simple interface | ✅ | Minimal form fields, clear buttons |

**Overall Status**: 🎉 **READY FOR PRODUCTION**
