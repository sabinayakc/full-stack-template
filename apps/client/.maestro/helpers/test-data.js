// Centralized test data for all Maestro E2E flows.
// Usage: - runScript: { file: ../helpers/test-data.js }
// Then reference values as ${output.password}, ${output.orgName}, etc.

// App
output.appName = "App";

// Auth
output.password = "Test1234!@";
output.seedName = "E2E Seed User";
output.seedEmail = "e2e-seed12@example.test";

// Unique email per run (for sign-up flows that need a fresh user)
output.uniqueEmail = `e2e-${Date.now()}@example.test`;
output.uniqueName = "E2E Test User";

// Onboarding
output.orgName = "E2E Test Company";
output.seedOrgName = "E2E Seed Org";
output.companySizeId = "onboarding-size-small";
output.primaryServiceId = "onboarding-service-foundation_repair";
output.primaryService = "Foundation Repair";
output.aiTone = "Friendly";
output.aiToneId = "onboarding-tone-friendly";
output.jobTitle = "Estimator";

// Invitations
output.inviteEmail1 = "alice@testcompany.com";
output.inviteEmail2 = "bob@testcompany.com";
output.inviteRole1 = "member";
output.inviteRole2 = "admin";

// Estimate creation
output.estimateCustomerName = "E2E Estimate Customer";
output.estimateCustomerEmail = `e2e-estimate-customer-${Date.now()}@example.test`;
output.estimateTitle = "E2E Foundation Repair Estimate";
output.estimateNotes =
  "Customer reported cracks along the rear wall. Follow-up inspection scheduled.";
output.estimateScopeSummary = "Install 6 push piers along the rear wall and re-grade drainage.";
output.estimateSiteConditions = "Limited alley access, landscaping protection required.";
output.estimatePricingNotes =
  "Standard pricing for push piers. 10% discount for bundled drainage work.";
output.estimateSectionName = "Foundation Piers";
output.estimateSectionDescription = "Push pier installation along rear wall.";
output.estimateItemName = "Push Pier Installation";
output.estimateItemDescription = "Steel push pier driven to load-bearing strata.";
output.estimateItemQuantity = "6";
output.estimateItemUnit = "each";
output.estimateItemUnitPrice = "1250";
output.estimateInternalNote = "E2E test note - verify pricing with field team before sending.";

// Property (Google Places)
output.estimatePropertySearch = "1600 Pennsylvania Ave";

// Customer creation
output.customerName = "E2E Test Customer";
output.customerEmail = `e2e-customer-${Date.now()}@example.test`;
output.customerPhone = "5551234567";
output.customerNotes = "E2E test customer - created by automated flow.";
output.propertyAddress = "742 Evergreen Terrace";
output.propertyCity = "Springfield";
output.propertyState = "IL";
output.propertyZip = "62704";
output.propertySquareFeet = "2200";
output.propertyBasementType = "Full";
output.propertyFoundationType = "Poured Concrete";
output.addPropertyAddress = "100 Oak Street";
output.addPropertyCity = "Dallas";
output.addPropertyState = "TX";
output.addPropertyZip = "75201";

// Invitation join flow (inviter creates org, invitee joins via invitation)
output.inviterEmail = `e2e-inviter-${Date.now()}@example.test`;
output.inviterName = "E2E Inviter";
output.inviterOrgName = "E2E Inviter Org";
output.inviteeEmail = `e2e-invitee-${Date.now()}@example.test`;
output.inviteeName = "E2E Invitee";
