import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";

export const organizationStatements = {
  ...defaultStatements,
  settings: ["read", "update"],
  billing: ["read", "manage"],
} as const;

export const ac = createAccessControl(organizationStatements);

export const owner = ac.newRole({
  ...ownerAc.statements,
  settings: ["read", "update"],
  billing: ["read", "manage"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  settings: ["read", "update"],
  billing: ["read", "manage"],
});

export const member = ac.newRole({
  ...memberAc.statements,
  settings: ["read"],
  billing: ["read"],
});

export const roles = {
  owner,
  admin,
  member,
};

export type OrganizationRole = keyof typeof roles;
