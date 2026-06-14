import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── DB mock ─────────────────────────────────────────────────────────────────

const mocks = vi.hoisted(() => {
  const selectFromWhere = vi.fn();
  const selectFrom = vi.fn(() => ({ where: selectFromWhere }));
  const select = vi.fn(() => ({ from: selectFrom }));

  return { db: { select }, selectFrom, selectFromWhere };
});

vi.mock("@repo/db/client", () => ({ db: mocks.db }));

vi.mock("@repo/db", async () => {
  const actual = await vi.importActual<typeof import("@repo/db")>("@repo/db");
  return { ...actual };
});

vi.mock("@repo/db/schema", () => ({
  member: { userId: "m_user", organizationId: "m_org", role: "m_role" },
  organization: { id: "o_id", name: "o_name" },
}));

import { getOrgDeletePreflight, getUserDeletePreflight } from "./delete-preflight-service";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Make `selectFromWhere` resolve to the given count for the next call. */
function mockCount(count: number) {
  mocks.selectFromWhere.mockResolvedValueOnce([{ count }]);
}

/** Make `selectFromWhere` resolve to an array of rows for the next call. */
function mockRows(rows: Record<string, unknown>[]) {
  mocks.selectFromWhere.mockResolvedValueOnce(rows);
}

// ─── getOrgDeletePreflight ───────────────────────────────────────────────────

describe("getOrgDeletePreflight", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns canDelete=true (no business entities block deletion in template)", async () => {
    const result = await getOrgDeletePreflight("org-1");

    expect(result.canDelete).toBe(true);
    expect(result.blockers).toEqual([]);
  });
});

// ─── getUserDeletePreflight ──────────────────────────────────────────────────

describe("getUserDeletePreflight", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns canDelete=true when user owns no orgs", async () => {
    mockRows([]); // ownedOrgs query

    const result = await getUserDeletePreflight("user-1");

    expect(result.canDelete).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("returns canDelete=true when user is co-owner (not sole)", async () => {
    mockRows([{ organizationId: "org-1" }]); // ownedOrgs
    mockCount(2); // 2 owners in org-1

    const result = await getUserDeletePreflight("user-1");

    expect(result.canDelete).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("returns blocker when user is sole owner", async () => {
    mockRows([{ organizationId: "org-1" }]); // ownedOrgs
    mockCount(1); // sole owner
    mockRows([{ name: "Acme Corp" }]); // org name lookup

    const result = await getUserDeletePreflight("user-1");

    expect(result.canDelete).toBe(false);
    expect(result.blockers).toEqual([{ label: 'sole owner of "Acme Corp"', count: 1 }]);
  });

  it("returns multiple blockers for sole ownership of multiple orgs", async () => {
    mockRows([{ organizationId: "org-1" }, { organizationId: "org-2" }]); // ownedOrgs
    mockCount(1); // sole owner of org-1
    mockRows([{ name: "Acme Corp" }]); // org-1 name
    mockCount(1); // sole owner of org-2
    mockRows([{ name: "Beta Inc" }]); // org-2 name

    const result = await getUserDeletePreflight("user-1");

    expect(result.canDelete).toBe(false);
    expect(result.blockers).toHaveLength(2);
    expect(result.blockers[0]).toEqual({ label: 'sole owner of "Acme Corp"', count: 1 });
    expect(result.blockers[1]).toEqual({ label: 'sole owner of "Beta Inc"', count: 1 });
  });

  it("skips orgs where user is co-owner among multiple sole-owned", async () => {
    mockRows([{ organizationId: "org-1" }, { organizationId: "org-2" }]); // ownedOrgs
    mockCount(2); // co-owner of org-1
    mockCount(1); // sole owner of org-2
    mockRows([{ name: "Beta Inc" }]); // org-2 name

    const result = await getUserDeletePreflight("user-1");

    expect(result.canDelete).toBe(false);
    expect(result.blockers).toEqual([{ label: 'sole owner of "Beta Inc"', count: 1 }]);
  });
});
