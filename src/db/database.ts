import { UserMember, RoleId } from '../types/role';

const USERS_STORAGE_KEY = 'sentinel_db_users';
const SESSION_STORAGE_KEY = 'sentinel_db_session';

export const SEED_USERS: UserMember[] = [
  {
    id: 'u-dev-1',
    name: 'Mohammed',
    email: 'mohammed@corp.sentinel',
    password: 'dev123',
    roleId: 'dev',
    department: 'Ingénierie & Microservices',
    ssoProvider: 'Okta SSO',
    mfaActive: true,
    active: true,
    avatarColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'u-sec-1',
    name: 'Tasnim',
    email: 'tasnim@corp.sentinel',
    password: 'sec123',
    roleId: 'sec',
    department: 'Gouvernance & SSI',
    ssoProvider: 'Azure AD',
    mfaActive: true,
    active: true,
    avatarColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    createdAt: '2026-01-18T09:30:00Z',
  },
  {
    id: 'u-qa-1',
    name: 'Aymane',
    email: 'aymane@corp.sentinel',
    password: 'qa123',
    roleId: 'qa',
    department: 'Qualité Logicielle & Chaos',
    ssoProvider: 'Google Workspace',
    mfaActive: true,
    active: true,
    avatarColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    createdAt: '2026-02-01T11:15:00Z',
  },
  {
    id: 'u-admin-1',
    name: 'Mourad',
    email: 'mourad@corp.sentinel',
    password: 'admin123',
    roleId: 'admin',
    department: 'Cloud & Infrastructure SRE',
    ssoProvider: 'Okta Hardware Key',
    mfaActive: true,
    active: true,
    avatarColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    createdAt: '2025-11-10T07:45:00Z',
  },
  {
    id: 'u-dev-2',
    name: 'Sarah Benali',
    email: 'sarah.b@corp.sentinel',
    password: 'dev123',
    roleId: 'dev',
    department: 'Cloud Ops & Backend',
    ssoProvider: 'Okta SSO',
    mfaActive: true,
    active: true,
    avatarColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    createdAt: '2026-02-14T14:20:00Z',
  },
];

export const database = {
  // Get all users from persistent localStorage or seed
  getUsers(): UserMember[] {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading users from DB:', e);
    }
    // Initialize seed
    this.saveUsers(SEED_USERS);
    return SEED_USERS;
  },

  // Save users array to localStorage
  saveUsers(users: UserMember[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to DB:', e);
    }
  },

  // Find user by email
  findUserByEmail(email: string): UserMember | undefined {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
  },

  // Authenticate user by email & password
  authenticate(email: string, password: string): { success: boolean; user?: UserMember; error?: string } {
    const normalizedEmail = email.toLowerCase().trim();
    const user = this.findUserByEmail(normalizedEmail);

    if (!user) {
      return {
        success: false,
        error: 'Aucun compte trouvé avec cette adresse e-mail. Veuillez vérifier ou vous inscrire.',
      };
    }

    if (!user.active) {
      return {
        success: false,
        error: 'Ce compte utilisateur a été suspendu par un administrateur SRE.',
      };
    }

    // Check password
    if (user.password && user.password !== password) {
      return {
        success: false,
        error: 'Mot de passe incorrect pour ce compte. Veuillez réessayer.',
      };
    }

    // Save session
    this.saveSession(user);
    return { success: true, user };
  },

  // Register a new user
  register(data: {
    name: string;
    email: string;
    password: string;
    roleId: RoleId;
    department?: string;
  }): { success: boolean; user?: UserMember; error?: string } {
    const normalizedEmail = data.email.toLowerCase().trim();
    if (!normalizedEmail || !data.password || !data.name) {
      return { success: false, error: 'Tous les champs requis doivent être renseignés.' };
    }

    const existing = this.findUserByEmail(normalizedEmail);
    if (existing) {
      return {
        success: false,
        error: 'Un compte existe déjà avec cette adresse e-mail. Veuillez vous connecter.',
      };
    }

    const colorMap: Record<RoleId, string> = {
      dev: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      sec: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      qa: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      admin: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    };

    const newUser: UserMember = {
      id: `u-${Date.now().toString().slice(-6)}`,
      name: data.name.trim(),
      email: normalizedEmail,
      password: data.password,
      roleId: data.roleId,
      department: data.department?.trim() || 'Ingénierie & DevOps',
      ssoProvider: 'Sentinel Local DB',
      mfaActive: true,
      active: true,
      avatarColor: colorMap[data.roleId],
      createdAt: new Date().toISOString(),
    };

    const users = this.getUsers();
    users.push(newUser);
    this.saveUsers(users);

    // Automatically set session
    this.saveSession(newUser);
    return { success: true, user: newUser };
  },

  // Save session
  saveSession(user: UserMember): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {}
  },

  // Get active session
  getSession(): UserMember | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {}
    return null;
  },

  // Clear session (Logout)
  clearSession(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {}
  },

  // Reset database back to seed
  reset(): void {
    this.saveUsers(SEED_USERS);
    this.clearSession();
  },
};
