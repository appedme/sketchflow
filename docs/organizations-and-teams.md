# Organizations and Teams Feature

## Overview

SketchFlow now supports **Organizations and Teams** similar to Notion, allowing users to collaborate in shared workspaces with structured team management.

## Features

### Organizations

- **Create Organizations**: Users can create organizations to collaborate with their team
- **Organization Settings**: Customize organization name, slug, description, and avatar
- **Member Management**: Invite and manage organization members with different roles
- **Team Structure**: Create teams within organizations for better collaboration
- **Project Ownership**: Projects can belong to organizations for team access

### Teams

- **Create Teams**: Organize members into teams (e.g., Engineering, Design, Marketing)
- **Team Members**: Add organization members to specific teams
- **Default Teams**: Set default teams for new organization members
- **Team Projects**: Assign projects to specific teams

### Roles

#### Organization Roles

- **Owner**: Full control over the organization, can delete organization
- **Admin**: Can manage members, teams, and settings (cannot delete organization)
- **Member**: Standard member with access to organization projects
- **Guest**: Limited access to specific projects

#### Team Roles

- **Lead**: Team leader with additional permissions
- **Member**: Standard team member

## Database Schema

### Tables

#### `organizations`
- `id`: Unique identifier
- `name`: Organization name
- `slug`: URL-friendly slug
- `description`: Organization description
- `avatarUrl`: Organization avatar
- `plan`: Subscription plan (free, pro, team, enterprise)
- `maxMembers`: Maximum members allowed
- `maxProjects`: Maximum projects allowed
- `settings`: JSON settings
- `createdBy`: Creator user ID
- `createdAt`, `updatedAt`: Timestamps

#### `organization_members`
- `id`: Unique identifier
- `organizationId`: Reference to organization
- `userId`: Reference to user
- `role`: Member role (owner, admin, member, guest)
- `title`: Job title
- `invitedBy`: Who invited the member
- `invitedAt`: When invited
- `joinedAt`: When joined
- `lastActiveAt`: Last activity timestamp

#### `teams`
- `id`: Unique identifier
- `organizationId`: Reference to organization
- `name`: Team name
- `description`: Team description
- `avatarUrl`: Team avatar
- `isDefault`: Whether this is the default team
- `settings`: JSON settings
- `createdBy`: Creator user ID
- `createdAt`, `updatedAt`: Timestamps

#### `team_members`
- `id`: Unique identifier
- `teamId`: Reference to team
- `userId`: Reference to user
- `role`: Team role (lead, member)
- `addedBy`: Who added the member
- `addedAt`: When added

#### `organization_invitations`
- `id`: Unique identifier
- `organizationId`: Reference to organization
- `email`: Invitee email
- `role`: Invited role
- `token`: Unique invitation token
- `invitedBy`: Who sent the invitation
- `expiresAt`: Expiration date
- `acceptedAt`: When accepted
- `createdAt`: Creation timestamp

### Updated Tables

#### `projects` (added columns)
- `organizationId`: Optional reference to organization
- `teamId`: Optional reference to team

## API Routes

### Organizations

- `GET /api/organizations` - Get user's organizations
- `POST /api/organizations` - Create new organization
- `GET /api/organizations/[id]` - Get organization details
- `PATCH /api/organizations/[id]` - Update organization
- `DELETE /api/organizations/[id]` - Delete organization

### Members

- `GET /api/organizations/[id]/members` - Get organization members
- `POST /api/organizations/[id]/members` - Invite member
- `DELETE /api/organizations/[id]/members/[userId]` - Remove member

### Teams

- `GET /api/organizations/[id]/teams` - Get organization teams
- `POST /api/organizations/[id]/teams` - Create team
- `GET /api/teams/[id]` - Get team details
- `PATCH /api/teams/[id]` - Update team
- `DELETE /api/teams/[id]` - Delete team
- `POST /api/teams/[id]/members` - Add team member
- `DELETE /api/teams/[id]/members/[userId]` - Remove team member

## Server Actions

Located in `/src/lib/actions/organizations.ts`:

- `createOrganization()` - Create a new organization
- `getUserOrganizations()` - Get user's organizations
- `getOrganization()` - Get organization details
- `updateOrganization()` - Update organization
- `createTeam()` - Create a team
- `getOrganizationTeams()` - Get organization teams
- `addTeamMember()` - Add member to team
- `getOrganizationMembers()` - Get organization members
- `inviteMember()` - Invite new member
- `acceptInvitation()` - Accept invitation
- `removeMember()` - Remove member from organization

## UI Components

### Pages

- `/organizations` - List all organizations
- `/organizations/[id]` - Organization workspace
- `/organizations/[id]/settings` - Organization settings

### Components

- `OrganizationsList` - Display user's organizations
- `OrganizationSettings` - Manage organization settings, members, and teams

## Usage Examples

### Creating an Organization

```typescript
import { createOrganization } from '@/lib/actions/organizations';

const result = await createOrganization(userId, {
  name: 'Acme Inc',
  slug: 'acme-inc',
  description: 'Building the future'
});
```

### Inviting a Member

```typescript
import { inviteMember } from '@/lib/actions/organizations';

const result = await inviteMember(
  organizationId,
  currentUserId,
  'newmember@example.com',
  'member'
);
```

### Creating a Team

```typescript
import { createTeam } from '@/lib/actions/organizations';

const result = await createTeam(
  organizationId,
  currentUserId,
  {
    name: 'Engineering',
    description: 'Software development team',
    isDefault: false
  }
);
```

## Migration

Run the migration to add the new tables:

```bash
npm run db:migrate
```

Or manually apply the migration file:
```bash
migrations/0005_add_organizations_and_teams.sql
```

## Features Coming Soon

- [ ] Organization-wide settings and permissions
- [ ] Team-specific project access control
- [ ] Activity logs and audit trails
- [ ] Organization analytics and insights
- [ ] Billing and subscription management
- [ ] Custom roles and permissions
- [ ] SSO (Single Sign-On) integration
- [ ] Organization templates
- [ ] Team workspaces
- [ ] Organization dashboard

## Best Practices

1. **Always check permissions** before allowing organization/team operations
2. **Use transactions** for operations that modify multiple tables
3. **Validate slugs** to ensure they're URL-safe and unique
4. **Send email notifications** for invitations and important changes
5. **Implement rate limiting** for invitation endpoints
6. **Add pagination** for large member/team lists
7. **Cache organization data** for better performance

## Security Considerations

- Only owners can delete organizations
- Only admins and owners can invite members
- Only admins and owners can create teams
- Invitation tokens expire after 7 days
- Members can only access organizations they belong to
- Validate all user inputs and sanitize slugs

## Next Steps

1. Test the migration on a development database
2. Implement email notifications for invitations
3. Add organization switcher to the UI
4. Implement project access control based on organization membership
5. Add team-specific permissions
6. Create organization analytics dashboard
7. Implement billing integration
