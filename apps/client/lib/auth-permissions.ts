import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

export const organizationStatements = {
  ...defaultStatements,
  estimate: ["create", "read", "update", "delete"],
  customer: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  schedule: ["create", "read", "update", "delete"],
  invoice: ["create", "read", "update", "delete"],
  report: ["read"],
  settings: ["read", "update"],
  chat: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(organizationStatements);

export const owner = ac.newRole({
  ...ownerAc.statements,
  estimate: ["create", "read", "update", "delete"],
  customer: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  schedule: ["create", "read", "update", "delete"],
  invoice: ["create", "read", "update", "delete"],
  report: ["read"],
  settings: ["read", "update"],
  chat: ["create", "read", "update", "delete"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  estimate: ["create", "read", "update", "delete"],
  customer: ["create", "read", "update", "delete"],
  project: ["create", "read", "update", "delete"],
  schedule: ["create", "read", "update", "delete"],
  invoice: ["create", "read", "update", "delete"],
  report: ["read"],
  settings: ["read", "update"],
  chat: ["create", "read", "update", "delete"],
});

export const member = ac.newRole({
  ...memberAc.statements,
  estimate: ["create", "read", "update"],
  customer: ["create", "read", "update"],
  project: ["read"],
  schedule: ["read"],
  invoice: ["read"],
  report: ["read"],
  settings: ["read"],
  chat: ["create", "read", "update"],
});

export const estimator = ac.newRole({
  ...memberAc.statements,
  estimate: ["create", "read", "update", "delete"],
  customer: ["create", "read", "update"],
  project: ["create", "read", "update"],
  schedule: ["create", "read", "update"],
  invoice: ["read"],
  report: ["read"],
  settings: ["read"],
  chat: ["create", "read", "update"],
});

export const field = ac.newRole({
  ...memberAc.statements,
  estimate: ["read"],
  customer: ["read"],
  project: ["read"],
  schedule: ["read"],
  invoice: [],
  report: [],
  settings: ["read"],
  chat: ["create", "read"],
});

export const roles = {
  owner,
  admin,
  member,
  estimator,
  field,
};

export type OrganizationRole = keyof typeof roles;
