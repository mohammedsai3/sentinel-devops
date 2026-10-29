import { UserMember, RoleId, RoleDefinition, IncidentItem, AuditLog, AppView, PermissionKey } from '../types/role';

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const errObj = await res.json();
      errMsg = errObj.error || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  return res.json();
}

export const api = {
  // --- AUTH ---
  auth: {
    async login(email: string, password: string): Promise<{ success: boolean; user: UserMember }> {
      return fetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    async register(data: {
      name: string;
      email: string;
      password: string;
      roleId: RoleId;
      department?: string;
    }): Promise<{ success: boolean; user: UserMember }> {
      return fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  },

  // --- USERS ---
  users: {
    async getAll(): Promise<UserMember[]> {
      return fetchJson<UserMember[]>('/api/users');
    },

    async create(user: Partial<UserMember>): Promise<UserMember> {
      return fetchJson<UserMember>('/api/users', {
        method: 'POST',
        body: JSON.stringify(user),
      });
    },

    async update(id: string, updates: Partial<UserMember>): Promise<UserMember> {
      return fetchJson<UserMember>(`/api/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    async delete(id: string): Promise<{ success: boolean }> {
      return fetchJson<{ success: boolean }>(`/api/users/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // --- ROLES ---
  roles: {
    async getAll(): Promise<Record<RoleId, RoleDefinition>> {
      return fetchJson<Record<RoleId, RoleDefinition>>('/api/roles');
    },

    async updatePermissions(roleId: RoleId, permissions: PermissionKey[]): Promise<RoleDefinition> {
      return fetchJson<RoleDefinition>(`/api/roles/${roleId}/permissions`, {
        method: 'PATCH',
        body: JSON.stringify({ permissions }),
      });
    },

    async togglePermission(roleId: RoleId, permissionKey: PermissionKey): Promise<RoleDefinition> {
      return fetchJson<RoleDefinition>(`/api/roles/${roleId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ permissionKey }),
      });
    },
  },

  // --- INCIDENTS ---
  incidents: {
    async getAll(params?: { status?: string; priority?: string; search?: string }): Promise<IncidentItem[]> {
      const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return fetchJson<IncidentItem[]>(`/api/incidents${qs}`);
    },

    async getById(id: string): Promise<IncidentItem> {
      return fetchJson<IncidentItem>(`/api/incidents/${id}`);
    },

    async create(incident: Partial<IncidentItem>): Promise<IncidentItem> {
      return fetchJson<IncidentItem>('/api/incidents', {
        method: 'POST',
        body: JSON.stringify(incident),
      });
    },

    async update(id: string, updates: Partial<IncidentItem>): Promise<IncidentItem> {
      return fetchJson<IncidentItem>(`/api/incidents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    // War Room Messages
    async getMessages(ticketId: string): Promise<any[]> {
      return fetchJson<any[]>(`/api/incidents/${ticketId}/messages`);
    },

    async sendMessage(ticketId: string, message: {
      author: string;
      role: string;
      avatarColor?: string;
      content: string;
    }): Promise<{ userMessage: any; copilotMessage: any | null }> {
      return fetchJson(`/api/incidents/${ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify(message),
      });
    },
  },

  // --- POST MORTEMS ---
  postMortems: {
    async getAll(): Promise<any[]> {
      return fetchJson<any[]>('/api/postmortems');
    },

    async create(pm: any): Promise<any> {
      return fetchJson<any>('/api/postmortems', {
        method: 'POST',
        body: JSON.stringify(pm),
      });
    },

    async toggleAction(pmId: string, actionId: string): Promise<any> {
      return fetchJson<any>(`/api/postmortems/${pmId}/actions/${actionId}`, {
        method: 'PATCH',
      });
    },
  },

  // --- AUDIT LOGS ---
  audit: {
    async getAll(): Promise<AuditLog[]> {
      return fetchJson<AuditLog[]>('/api/audit-logs');
    },

    async create(log: Partial<AuditLog>): Promise<AuditLog> {
      return fetchJson<AuditLog>('/api/audit-logs', {
        method: 'POST',
        body: JSON.stringify(log),
      });
    },
  },

  // --- SECURITY ---
  security: {
    async getStats(): Promise<any> {
      return fetchJson('/api/security/stats');
    },

    async rotateVault(): Promise<any> {
      return fetchJson('/api/security/vault/rotate', { method: 'POST' });
    },

    async blockWafIp(ip: string): Promise<any> {
      return fetchJson('/api/security/waf/block', {
        method: 'POST',
        body: JSON.stringify({ ip }),
      });
    },
  },

  // --- QA ---
  qa: {
    async getStats(): Promise<any> {
      return fetchJson('/api/qa/stats');
    },

    async runSuite(suite: string): Promise<any> {
      return fetchJson('/api/qa/run', {
        method: 'POST',
        body: JSON.stringify({ suite }),
      });
    },
  },

  // --- TELEMETRY ---
  telemetry: {
    async get(): Promise<any> {
      return fetchJson('/api/telemetry');
    },
  },
};
