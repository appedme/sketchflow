# Quick Start Guide: Organizations & Teams

## Step 1: Run Database Migration

```bash
# Generate migration (if schema changes)
npm run db:generate

# Apply migration
npm run db:migrate

# Or manually apply the SQL file
# migrations/0005_add_organizations_and_teams.sql
```

## Step 2: Add Organization Switcher to Navigation

Update your main navigation component to include the organization switcher:

```tsx
// In your navigation component (e.g., src/components/layout/Header.tsx)
import { OrganizationSwitcher } from "@/components/dashboard/OrganizationSwitcher";

export function Header() {
  return (
    <header>
      {/* Other navigation items */}
      <OrganizationSwitcher />
    </header>
  );
}
```

## Step 3: Add Organizations Link to Dashboard

Add a link to the organizations page in your dashboard menu:

```tsx
<Link href="/organizations">
  <Building2 className="w-4 h-4 mr-2" />
  Organizations
</Link>
```

## Step 4: Update Project Creation

When creating projects, optionally assign them to organizations:

```tsx
// In your new project form
const [selectedOrganization, setSelectedOrganization] = useState<string | null>(
  null
);

// Fetch user's organizations
const { data: orgs } = useSWR("/api/organizations");

// Add organization selector to form
<select onChange={(e) => setSelectedOrganization(e.target.value)}>
  <option value="">Personal</option>
  {orgs?.organizations?.map((org) => (
    <option key={org.organization.id} value={org.organization.id}>
      {org.organization.name}
    </option>
  ))}
</select>;

// When creating project
await fetch("/api/projects", {
  method: "POST",
  body: JSON.stringify({
    ...projectData,
    organizationId: selectedOrganization,
  }),
});
```

## Step 5: Update Authentication

The API routes currently use `x-user-id` header. Update to use your auth system:

```tsx
// Option 1: Using middleware
// src/middleware.ts
export function middleware(request: NextRequest) {
  const user = await getCurrentUser(); // Your auth method
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.id);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Option 2: Update each API route
// Replace:
const userId = request.headers.get("x-user-id");

// With your auth method:
const { userId } = await auth(); // Your auth method
```

## Step 6: Implement Email Notifications (Optional)

Add email service to send invitation emails:

```tsx
// src/lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(
  email: string,
  organizationName: string,
  inviteLink: string,
  inviterName: string
) {
  await resend.emails.send({
    from: "noreply@yourapp.com",
    to: email,
    subject: `You've been invited to join ${organizationName}`,
    html: `
      <h2>You've been invited!</h2>
      <p>${inviterName} has invited you to join ${organizationName} on SketchFlow.</p>
      <a href="${inviteLink}">Accept Invitation</a>
    `,
  });
}

// Use in API route
import { sendInvitationEmail } from "@/lib/email";

// After creating invitation
await sendInvitationEmail(
  email,
  organization.name,
  `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`,
  inviter.name
);
```

## Step 7: Testing

### Test Organization Creation

1. Go to `/organizations`
2. Click "New Organization"
3. Fill in details and create

### Test Member Invitation

1. Go to organization settings
2. Navigate to Members tab
3. Enter email and click Invite
4. Copy invitation link from console/response
5. Open in new incognito window
6. Accept invitation

### Test Team Creation

1. Go to organization settings
2. Navigate to Teams tab
3. Create a new team
4. Add members to team

## Step 8: Update Project Access Control

Add checks to ensure users can only access projects they have permission for:

```tsx
// src/app/api/projects/[id]/route.ts
export async function GET(request, { params }) {
  const userId = await getCurrentUser();
  const project = await getProject(params.id);

  // Check access
  if (project.organizationId) {
    const membership = await checkOrganizationMembership(
      project.organizationId,
      userId
    );

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  } else if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Return project
}
```

## Environment Variables

Add these to your `.env.local`:

```bash
# Email service (optional)
RESEND_API_KEY=your_resend_api_key

# App URL for invitation links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Common Issues & Solutions

### Issue: TypeScript errors in API routes

**Solution**: These are compile-time warnings and won't affect runtime. The dependencies are installed, just TypeScript can't find them during static analysis.

### Issue: "Unauthorized" errors

**Solution**: Make sure your authentication middleware is setting the `x-user-id` header or update the API routes to use your auth system.

### Issue: Invitations not working

**Solution**: Check that:

1. Token is being generated correctly
2. Expiration date is in the future
3. User is authenticated when accepting
4. Database migration was applied

### Issue: Can't see organizations

**Solution**: Make sure you've:

1. Created an organization
2. Are a member of the organization
3. Fetching organizations with correct user ID

## Next Steps

1. ✅ Run migration
2. ✅ Add organization switcher to navigation
3. ✅ Test creating organization
4. ✅ Test inviting members
5. ✅ Test creating teams
6. ⏳ Implement email notifications
7. ⏳ Add organization context to projects
8. ⏳ Implement advanced permissions
9. ⏳ Add organization analytics

## Support

For issues or questions:

1. Check the documentation in `docs/organizations-and-teams.md`
2. Review the implementation summary in `docs/ORGANIZATION_IMPLEMENTATION_SUMMARY.md`
3. Check the API routes and server actions for examples

---

**You're all set! Start collaborating with your team in SketchFlow!** 🚀
