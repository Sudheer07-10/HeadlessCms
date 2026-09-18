import { describe, expect, it } from 'vitest'
import app from './index'
import { db } from '../db/index.js'
import { tenants, collections, entries, users, usersToTenants, abilities, locales, media, mediaFolders, forms, formEntries } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

describe('My CMS API', () => {
  it('should return 404 for unknown routes (when authenticated)', async () => {
    const res = await app.request('/api/unknown-route', {
      headers: { 'X-My-CMS-Test': 'true' }
    })
    expect(res.status).toBe(404)
  })

  it('should redirect unauthenticated requests to login (without bypass)', async () => {
    // Note: Inertia routes usually redirect, but /api/ routes might return 401
    // depending on which middleware hits first. 
    const res = await app.request('/api/collections')
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('Unauthorized')
  })

  it('should block access if X-Tenant-ID is missing (when bypass is active)', async () => {
    // Hit GraphQL with bypass but WITHOUT tenant ID
    const res = await app.request('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-My CMS-Test': 'true'
      },
      body: JSON.stringify({ query: '{ collections { id } }' }),
    })
    
    // Should hit our new security logic (403 Forbidden)
    expect(res.status).toBe(403)
    const data = await res.json()
    expect(data.error).toContain('X-Tenant-ID header is required')
  })

  describe('Public Routes', () => {
    it('should return 200 for the landing page (/)', async () => {
      const res = await app.request('/')
      expect(res.status).toBe(200)
    })

    it('should return 200 for the login page (/login)', async () => {
      const res = await app.request('/login')
      expect(res.status).toBe(200)
    })

    it('should redirect to /login and clear cookie on logout (/logout)', async () => {
      const res = await app.request('/logout')
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe('/login')
      // Check if Set-Cookie header attempts to clear the cms_token
      const setCookie = res.headers.get('set-cookie')
      expect(setCookie).toContain('cms_token=')
    })

    it('should return 200 for the forgot password page (/forgot-password)', async () => {
      const res = await app.request('/forgot-password')
      expect(res.status).toBe(200)
    })

    it('should return 200 for the docs page (/docs)', async () => {
      const res = await app.request('/docs')
      expect(res.status).toBe(200)
    })
  })

  describe('Tenant Isolation for Collection Entries', () => {
    it('should separate entries by tenant when collections have the same slug', async () => {
      const testId = crypto.randomUUID().substring(0, 8)
      const apiKey = `test-api-key-${testId}`
      const username = `testuser-${testId}`
      const email = `testuser-${testId}@example.com`

      let tenantAId: number | undefined
      let tenantBId: number | undefined
      let userTestId: number | undefined
      let colAId: number | undefined
      let colBId: number | undefined
      let entryAId: number | undefined
      let entryBId: number | undefined

      try {
        // 1. Create two tenants
        const [tenantA] = await db
          .insert(tenants)
          .values({
            name: `Tenant A ${testId}`,
            slug: `tenant-a-${testId}`,
          })
          .returning()
        tenantAId = tenantA.id

        const [tenantB] = await db
          .insert(tenants)
          .values({
            name: `Tenant B ${testId}`,
            slug: `tenant-b-${testId}`,
          })
          .returning()
        tenantBId = tenantB.id

        // 2. Create a super admin user with API key
        const [testUser] = await db
          .insert(users)
          .values({
            name: `Test Admin ${testId}`,
            username,
            email,
            supabaseUid: crypto.randomUUID(),
            role: 'super_admin',
            apiKey,
          })
          .returning()
        userTestId = testUser.id

        // Link user to tenants
        await db.insert(usersToTenants).values([
          { userId: testUser.id, tenantId: tenantA.id, role: 'owner' },
          { userId: testUser.id, tenantId: tenantB.id, role: 'owner' },
        ])

        // 3. Create collections with same slug in both tenants
        const [colA] = await db
          .insert(collections)
          .values({
            tenantId: tenantA.id,
            name: 'Projects',
            slug: 'projects',
            type: 'collection',
            fields: [{ name: 'title', type: 'text' }],
          })
          .returning()
        colAId = colA.id

        const [colB] = await db
          .insert(collections)
          .values({
            tenantId: tenantB.id,
            name: 'Projects',
            slug: 'projects',
            type: 'collection',
            fields: [{ name: 'title', type: 'text' }],
          })
          .returning()
        colBId = colB.id

        // 4. Create one published entry in each collection
        const [entryA] = await db
          .insert(entries)
          .values({
            tenantId: tenantA.id,
            collectionId: colA.id,
            content: { title: 'Project A' },
            status: 'published',
            locale: 'en',
          })
          .returning()
        entryAId = entryA.id

        const [entryB] = await db
          .insert(entries)
          .values({
            tenantId: tenantB.id,
            collectionId: colB.id,
            content: { title: 'Project B' },
            status: 'published',
            locale: 'en',
          })
          .returning()
        entryBId = entryB.id

        // 5. Query for tenant A
        const resA = await app.request('/api/collections/projects/entries', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-Tenant-ID': String(tenantA.id),
          },
        })
        expect(resA.status).toBe(200)
        const dataA = await resA.json()
        expect(dataA.entries).toBeDefined()
        expect(dataA.entries.length).toBe(1)
        expect(dataA.entries[0].content.title).toBe('Project A')
        expect(dataA.entries[0].collectionId).toBe(colA.id)

        // 6. Query for tenant B
        const resB = await app.request('/api/collections/projects/entries', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'X-Tenant-ID': String(tenantB.id),
          },
        })
        expect(resB.status).toBe(200)
        const dataB = await resB.json()
        expect(dataB.entries).toBeDefined()
        expect(dataB.entries.length).toBe(1)
        expect(dataB.entries[0].content.title).toBe('Project B')
        expect(dataB.entries[0].collectionId).toBe(colB.id)

      } finally {
        // Clean up
        if (entryAId) await db.delete(entries).where(eq(entries.id, entryAId))
        if (entryBId) await db.delete(entries).where(eq(entries.id, entryBId))
        if (colAId) await db.delete(collections).where(eq(collections.id, colAId))
        if (colBId) await db.delete(collections).where(eq(collections.id, colBId))
        if (userTestId) {
          await db.delete(usersToTenants).where(eq(usersToTenants.userId, userTestId))
          await db.delete(users).where(eq(users.id, userTestId))
        }
        if (tenantAId) await db.delete(tenants).where(eq(tenants.id, tenantAId))
        if (tenantBId) await db.delete(tenants).where(eq(tenants.id, tenantBId))
      }
    })
  })


  describe('API Key Media & Media Folder Permissions', () => {
    it('should allow media folder creation and deletion with media_folder permissions, and block without', async () => {
      const testId = crypto.randomUUID().substring(0, 8)
      const apiKeyAllowed = `media-key-allowed-${testId}`
      const apiKeyDenied = `media-key-denied-${testId}`
      let tenantId: number | undefined
      let abilityAllowedId: number | undefined
      let abilityDeniedId: number | undefined
      let userAllowedId: number | undefined
      let userDeniedId: number | undefined
      let createdFolderId: number | undefined

      try {
        // 1. Create tenant
        const [tenant] = await db
          .insert(tenants)
          .values({
            name: `Media Test Tenant ${testId}`,
            slug: `media-tenant-${testId}`,
          })
          .returning()
        tenantId = tenant.id

        // 2. Create ability with media_folder permissions
        const [abilityAllowed] = await db
          .insert(abilities)
          .values({
            name: `Media Folder Admin ${testId}`,
            permissions: {
              media_folder: { create: true, delete: true, read: false, update: false },
              media: { create: true, read: true, delete: true, update: false },
            },
            isSystem: '0',
            tenantId,
          })
          .returning()
        abilityAllowedId = abilityAllowed.id

        // 3. Create ability without media_folder permissions (read-only on media)
        const [abilityDenied] = await db
          .insert(abilities)
          .values({
            name: `Media Read Only ${testId}`,
            permissions: {
              media_folder: { create: false, delete: false, read: false, update: false },
              media: { create: false, read: true, delete: false, update: false },
            },
            isSystem: '0',
            tenantId,
          })
          .returning()
        abilityDeniedId = abilityDenied.id

        // 4. Create user with allowed ability
        const [userAllowed] = await db
          .insert(users)
          .values({
            username: `user-allowed-${testId}`,
            email: `user-allowed-${testId}@example.com`,
            supabaseUid: crypto.randomUUID(),
            apiKey: apiKeyAllowed,
            abilityId: abilityAllowedId,
            role: 'editor',
          })
          .returning()
        userAllowedId = userAllowed.id

        // 5. Create user with denied ability
        const [userDenied] = await db
          .insert(users)
          .values({
            username: `user-denied-${testId}`,
            email: `user-denied-${testId}@example.com`,
            supabaseUid: crypto.randomUUID(),
            apiKey: apiKeyDenied,
            abilityId: abilityDeniedId,
            role: 'editor',
          })
          .returning()
        userDeniedId = userDenied.id

        // Link users to tenant
        await db.insert(usersToTenants).values([
          { userId: userAllowedId, tenantId, role: 'editor' },
          { userId: userDeniedId, tenantId, role: 'editor' },
        ])

        // Test 1: Denied key tries to create folder -> 403 Forbidden
        const deniedRes = await app.request('/api/media/folders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKeyDenied}`,
            'X-Tenant-ID': `${tenantId}`,
          },
          body: JSON.stringify({ name: 'Denied Folder' }),
        })
        expect(deniedRes.status).toBe(403)
        const deniedData = await deniedRes.json()
        expect(deniedData.error).toContain('Create access required for media folder')

        // Test 2: Allowed key creates folder -> 201 Created
        const allowedRes = await app.request('/api/media/folders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKeyAllowed}`,
            'X-Tenant-ID': `${tenantId}`,
          },
          body: JSON.stringify({ name: 'Allowed Folder' }),
        })
        expect(allowedRes.status).toBe(201)
        const allowedData = await allowedRes.json()
        expect(allowedData.success).toBe(true)
        expect(allowedData.folder.name).toBe('Allowed Folder')
        createdFolderId = allowedData.folder.id

        // Test 3: Denied key tries to delete folder -> 403 Forbidden
        const deleteDeniedRes = await app.request(`/api/media/folders/${createdFolderId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${apiKeyDenied}`,
            'X-Tenant-ID': `${tenantId}`,
          },
        })
        expect(deleteDeniedRes.status).toBe(403)
        const deleteDeniedData = await deleteDeniedRes.json()
        expect(deleteDeniedData.error).toContain('Delete access required for media folder')

        // Test 4: Allowed key deletes folder -> 200 OK
        const deleteAllowedRes = await app.request(`/api/media/folders/${createdFolderId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${apiKeyAllowed}`,
            'X-Tenant-ID': `${tenantId}`,
          },
        })
        expect(deleteAllowedRes.status).toBe(200)
        const deleteAllowedData = await deleteAllowedRes.json()
        expect(deleteAllowedData.success).toBe(true)

        // Test 5: Denied key tries to upload media (no file provided test) -> fails with 403 write permission before file check
        const uploadDeniedRes = await app.request('/api/media/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKeyDenied}`,
            'X-Tenant-ID': `${tenantId}`,
          },
        })
        expect(uploadDeniedRes.status).toBe(403)
        const uploadDeniedData = await uploadDeniedRes.json()
        expect(uploadDeniedData.error).toContain('Write access required for this action')

        // Test 6: Allowed key tries to upload media with no file -> passes auth check, reaches route logic returning 400 No file provided
        const uploadAllowedRes = await app.request('/api/media/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKeyAllowed}`,
            'X-Tenant-ID': `${tenantId}`,
          },
        })
        expect(uploadAllowedRes.status).toBe(400)
        const uploadAllowedData = await uploadAllowedRes.json()
        expect(uploadAllowedData.error).toBe('No file provided')

      } finally {
        if (createdFolderId) {
          await db.delete(mediaFolders).where(eq(mediaFolders.id, createdFolderId)).catch(() => {})
        }
        if (userAllowedId) {
          await db.delete(usersToTenants).where(eq(usersToTenants.userId, userAllowedId)).catch(() => {})
          await db.delete(users).where(eq(users.id, userAllowedId)).catch(() => {})
        }
        if (userDeniedId) {
          await db.delete(usersToTenants).where(eq(usersToTenants.userId, userDeniedId)).catch(() => {})
          await db.delete(users).where(eq(users.id, userDeniedId)).catch(() => {})
        }
        if (abilityAllowedId) {
          await db.delete(abilities).where(eq(abilities.id, abilityAllowedId)).catch(() => {})
        }
        if (abilityDeniedId) {
          await db.delete(abilities).where(eq(abilities.id, abilityDeniedId)).catch(() => {})
        }
        if (tenantId) {
          await db.delete(tenants).where(eq(tenants.id, tenantId)).catch(() => {})
        }
      }
    })
  })

  describe('Form Max Entries & Auto-Close', () => {
    it('should automatically close form (isActive=false) when submissions reach maxEntries limit', async () => {
      const testId = crypto.randomUUID().substring(0, 8)
      let tenantId: number | undefined
      let formId: number | undefined

      try {
        const [tenant] = await db
          .insert(tenants)
          .values({
            name: `Form Tenant ${testId}`,
            slug: `form-tenant-${testId}`,
          })
          .returning()
        tenantId = tenant.id

        const [form] = await db
          .insert(forms)
          .values({
            name: `Test Form ${testId}`,
            slug: `test-form-${testId}`,
            tenantId,
            storageType: 'internal',
            isActive: true,
            maxEntries: 2,
            fields: [
              {
                id: 'field_email',
                name: 'email',
                label: 'Email',
                type: 'email',
                required: true,
              },
            ],
          })
          .returning()
        formId = form.id

        expect(form.isActive).toBe(true)
        expect(form.maxEntries).toBe(2)

        // 1. Submit first entry -> should succeed and form remains active
        const sub1 = await app.request(
          `/api/forms/${tenant.slug}/${form.slug}/submit`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Host: 'localhost',
            },
            body: JSON.stringify({ email: 'user1@example.com' }),
          }
        )
        expect(sub1.status).toBe(200)
        const sub1Data = await sub1.json()
        expect(sub1Data.success).toBe(true)

        const [formAfter1] = await db
          .select()
          .from(forms)
          .where(eq(forms.id, formId))
          .limit(1)
        expect(formAfter1.isActive).toBe(true)

        // 2. Submit second entry (reaches maxEntries: 2) -> should succeed and auto-close form
        const sub2 = await app.request(
          `/api/forms/${tenant.slug}/${form.slug}/submit`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Host: 'localhost',
            },
            body: JSON.stringify({ email: 'user2@example.com' }),
          }
        )
        expect(sub2.status).toBe(200)
        const sub2Data = await sub2.json()
        expect(sub2Data.success).toBe(true)

        const [formAfter2] = await db
          .select()
          .from(forms)
          .where(eq(forms.id, formId))
          .limit(1)
        expect(formAfter2.isActive).toBe(false)

        // 3. Submit third entry -> should be blocked with 400 since form is closed
        const sub3 = await app.request(
          `/api/forms/${tenant.slug}/${form.slug}/submit`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Host: 'localhost',
            },
            body: JSON.stringify({ email: 'user3@example.com' }),
          }
        )
        expect(sub3.status).toBe(400)
        const sub3Data = await sub3.json()
        expect(sub3Data.error).toContain('closed')

      } finally {
        if (formId) {
          await db.delete(formEntries).where(eq(formEntries.formId, formId)).catch(() => {})
          await db.delete(forms).where(eq(forms.id, formId)).catch(() => {})
        }
        if (tenantId) {
          await db.delete(tenants).where(eq(tenants.id, tenantId)).catch(() => {})
        }
      }
    })
  })
})
