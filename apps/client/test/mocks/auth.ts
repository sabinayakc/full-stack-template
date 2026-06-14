export const mockAuthClient = {
  getCookie: jest.fn(() => ""),
  verifyEmail: jest.fn(),
  sendVerificationEmail: jest.fn(),
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn(),
  organization: {
    setActive: jest.fn(),
    list: jest.fn(),
    create: jest.fn(),
    getInvitation: jest.fn(),
    acceptInvitation: jest.fn(),
    rejectInvitation: jest.fn(),
    checkSlug: jest.fn().mockResolvedValue({ data: { status: true } }),
  },
  twoFactor: {
    enable: jest.fn(),
    disable: jest.fn(),
    verifyTotp: jest.fn(),
    sendOtp: jest.fn(),
    verifyOtp: jest.fn(),
    verifyBackupCode: jest.fn(),
    generateBackupCodes: jest.fn(),
    getTotpUri: jest.fn(),
  },
};

export const mockSignIn = {
  email: jest.fn(),
};

export const mockSignUp = {
  email: jest.fn(),
};

export const mockSignOut = jest.fn();

export const mockUseSession = jest.fn(() => ({
  data: null,
  isPending: false,
}));

export const mockUseActiveOrganization = jest.fn(() => ({
  data: null,
  isPending: false,
}));

export const mockUseListOrganizations = jest.fn(() => ({
  data: [],
  isPending: false,
}));

jest.mock("@/lib/auth", () => ({
  authClient: mockAuthClient,
  signIn: mockSignIn,
  signUp: mockSignUp,
  signOut: mockSignOut,
  useSession: mockUseSession,
  useActiveOrganization: mockUseActiveOrganization,
  useListOrganizations: mockUseListOrganizations,
}));
