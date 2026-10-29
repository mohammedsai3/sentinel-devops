export type RoleId = 'dev' | 'sec' | 'qa' | 'admin';

export type AppView =
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'incidents'
  | 'create-incident'
  | 'ticket-detail'
  | 'wiki'
  | 'supervision'
  | 'admin'
  | 'profile'
  | 'reporting'
  | 'role-dev'
  | 'role-sec'
  | 'role-qa'
  | 'role-admin'
  | 'role-management'
  // Pages dédiées Développeur
  | 'dev-refactor'
  | 'dev-pipeline'
  // Pages dédiées Sécurité
  | 'sec-threats'
  | 'sec-compliance'
  // Pages dédiées QA
  | 'qa-generator'
  | 'qa-bench'
  // Pages dédiées Administrateur
  | 'admin-topology'
  | 'admin-brief'
  // Import de projet
  | 'import-project';

export type PermissionKey =
  | 'view_dashboard'
  | 'view_incidents'
  | 'create_incidents'
  | 'manage_tickets'
  | 'view_code_hotfix'
  | 'view_security_cve'
  | 'manage_vault_secrets'
  | 'run_e2e_tests'
  | 'declare_qa_bug'
  | 'chaos_injection'
  | 'manage_roles_rbac'
  | 'manage_users'
  | 'view_audit_trail'
  | 'view_executive_reports'
  | 'access_cluster_topology';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  category: 'Opérations' | 'Sécurité & Vault' | 'Tests & QA' | 'Gouvernance & RBAC';
  description: string;
}

export interface RoleDefinition {
  id: RoleId;
  name: string;
  title: string;
  defaultUserName: string;
  defaultEmail: string;
  tag: string;
  badgeColor: string;
  borderColor: string;
  accentColor: string;
  description: string;
  mission: string;
  permissions: PermissionKey[];
  dedicatedRoute: string;
}

export interface UserMember {
  id: string;
  name: string;
  email: string;
  password?: string;
  roleId: RoleId;
  department: string;
  ssoProvider: string;
  mfaActive: boolean;
  active: boolean;
  avatarColor: string;
  createdAt?: string;
}

export interface IncidentItem {
  id: string;
  title: string;
  service: string;
  cluster: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'open' | 'investigating' | 'mitigated' | 'resolved';
  team: string;
  assignee: string;
  slaMinutesRemaining: number;
  reportedAt: string;
  rcaReady: boolean;
  rcaSummary: string;
  description?: string;
  category?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  category: 'security' | 'rbac' | 'deploy' | 'auth' | 'incident';
  ipAddress: string;
  status: 'success' | 'blocked' | 'warning';
}

export interface ProjectFile {
  name: string;
  content: string;
  size?: number;
}

export interface SharedProject {
  name: string;
  type: string;
  repoUrl?: string;
  files: ProjectFile[];
  updatedAt: string;
}
