# Admin Setup Guide

## Granting Admin Role

The admin role is granted via direct SQL only. Client-side role updates are blocked by RLS.

### Steps to Grant Admin Role to Kati (or any user):

1. **Get the user's UUID from auth.users**:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'kati@example.com';
   ```

2. **Update their role to admin**:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid-from-step-1>';
   ```

3. **Verify the role was granted**:
   ```sql
   SELECT p.role, u.email 
   FROM profiles p 
   JOIN auth.users u ON p.id = u.id 
   WHERE u.email = 'kati@example.com';
   ```
   
   Should return:
   ```
   role  | email
   ------+------------------
   admin | kati@example.com
   ```

### Alternative: Use Supabase Service Role Key

If you have the service role key, you can also grant admin via the API:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key required
);

// Get user by email
const { data: { users } } = await supabase.auth.admin.listUsers();
const user = users.find(u => u.email === 'kati@example.com');

// Update role
await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', user.id);
```

## Admin Login

Once admin role is granted:

1. Navigate to `/admin/login`
2. Sign in with email and password OR use magic link
3. On successful authentication, you'll be redirected to `/admin/review`

## Admin Review Page

The admin review page shows:

- **Pending Submissions**: Tools submitted via the public form, awaiting approval
  - Approve & Create Draft: Creates a draft tool from the submission
  - Reject: Marks submission as rejected
  
- **Draft Tools**: Tools in draft status, ready for review
  - Approve: Changes status to `published` and makes tool visible sitewide
  - Reject: Changes status back to `needs_review`

## Security Notes

- Admin routes are protected by middleware that checks authentication + role
- All admin actions use `getUser()` (not `getSession()`) for secure server-side verification
- RLS policies prevent clients from changing their own role
- Failed admin access attempts are logged

## Troubleshooting

**"Access denied" after login**:
- Verify the user has `role = 'admin'` in the profiles table
- Check that the profiles trigger created the profile on signup
- If migrating from an existing user, manually insert profile: `INSERT INTO profiles (id, role) VALUES ('<user-uuid>', 'admin');`

**Middleware redirect loop**:
- Ensure `/admin/login` is excluded from auth checks in middleware
- Clear cookies and try again

**"Not authenticated" errors**:
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Verify Supabase project is running and accessible
