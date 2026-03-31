/*
 * manifest.validator.ts
 *
 * Validates an extension manifest against the BlackVideo extension schema.
 * Used by: init (post-generation), validate command, publish command.
 *
 * Mirrors the verifier in extension.server.verified.ts (in-app)
 * so that CLI and runtime share the same rules.
 */

import semver from 'semver';
import validateNpmName from 'validate-npm-package-name';

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export type LicenseModel  = 'free' | 'trial' | 'subscription' | 'enterprise' | 'internal';
export type ExtensionType = 'extension' | 'plugin' | 'theme' | 'addon' | 'dev-tool' | 'subtitle';

export interface ManifestPermission {
  scope:  string;
  reason: string;
}

export interface ExtensionManifest {
  id:            string;
  name:          string;
  displayName:   string;
  description:   string;
  version:       string;
  author:        string;
  authorClass:   string;
  type:          ExtensionType;
  license:       LicenseModel;
  icon:          string;
  entry:         string;
  uiEntry?:      string;
  permissions:   ManifestPermission[];
  playbackHooks: boolean;
  uiSupport:     boolean;
  cliSupport:    boolean;
}

export interface ValidationResult {
  valid:    boolean;
  errors:   string[];
  warnings: string[];
}

// ─────────────────────────────────────────────────────────────
//  Allowed permission scopes — must mirror extension.server.verified.ts
// ─────────────────────────────────────────────────────────────

const ALLOWED_SCOPES = new Set([
  'playback.read',
  'playback.control',
  'frame.capture',
  'overlay.render',
  'subtitle.read',
  'subtitle.write',
  'metadata.read',
  'metadata.write',
  'audio.analyze',
  'timeline.read',
  'timeline.seek',
  'filesystem.read',
  'network.fetch',
  'store.read',
  'store.write',
  'ipc.emit',
]);

const BLOCKED_COMBINATIONS: Array<[string, string]> = [
  ['filesystem.read', 'network.fetch'],
  ['ipc.emit', 'store.write'],
];

const VALID_TYPES: ExtensionType[] = ['extension', 'plugin', 'theme', 'addon', 'dev-tool', 'subtitle'];
const VALID_LICENSES: LicenseModel[] = ['free', 'trial', 'subscription', 'enterprise', 'internal'];

const REQUIRED_FIELDS: Array<keyof ExtensionManifest> = [
  'id', 'name', 'displayName', 'description', 'version',
  'author', 'authorClass', 'type', 'license', 'icon', 'entry',
  'permissions', 'playbackHooks', 'uiSupport', 'cliSupport',
];

// ─────────────────────────────────────────────────────────────
//  Validator
// ─────────────────────────────────────────────────────────────

export function validateManifest(manifest: Partial<ExtensionManifest>): ValidationResult {
  const errors:   string[] = [];
  const warnings: string[] = [];

  // 1 — Required fields
  for (const field of REQUIRED_FIELDS) {
    const val = manifest[field];
    if (val === undefined || val === null || val === '') {
      errors.push(`Missing required field: "${field}"`);
    }
  }

  // 2 — ID: kebab-case npm-compatible name
  if (manifest.id) {
    const { validForNewPackages, errors: npmErrors } = validateNpmName(manifest.id);
    if (!validForNewPackages) {
      errors.push(`Extension id "${manifest.id}" is not a valid npm package name: ${npmErrors?.join(', ')}`);
    }
    if (!/^[a-z0-9-]+$/.test(manifest.id)) {
      errors.push(`Extension id must be kebab-case (lowercase letters, numbers, hyphens only)`);
    }
  }

  // 3 — authorClass: no spaces, no special chars except hyphen
  if (manifest.authorClass && /\s/.test(manifest.authorClass)) {
    errors.push(`authorClass must not contain spaces. Use kebab-case (e.g. "john-doe")`);
  }

  // 4 — Version: semver
  if (manifest.version && !semver.valid(manifest.version)) {
    errors.push(`Version "${manifest.version}" is not valid semver (e.g. 1.0.0)`);
  }

  // 5 — Type
  if (manifest.type && !VALID_TYPES.includes(manifest.type)) {
    errors.push(`Unknown extension type "${manifest.type}". Must be one of: ${VALID_TYPES.join(', ')}`);
  }

  // 6 — License
  if (manifest.license && !VALID_LICENSES.includes(manifest.license)) {
    errors.push(`Unknown license "${manifest.license}". Must be one of: ${VALID_LICENSES.join(', ')}`);
  }

  // 7 — Permissions
  const scopes = new Set<string>();
  for (const perm of manifest.permissions ?? []) {
    if (!ALLOWED_SCOPES.has(perm.scope)) {
      errors.push(`Permission scope "${perm.scope}" is not allowed`);
    }
    if (!perm.reason || perm.reason.trim().length < 10) {
      warnings.push(`Permission "${perm.scope}" needs a more descriptive reason (min 10 chars)`);
    }
    scopes.add(perm.scope);
  }

  // 8 — Blocked combos
  for (const [a, b] of BLOCKED_COMBINATIONS) {
    if (scopes.has(a) && scopes.has(b)) {
      errors.push(`Permission combination "${a}" + "${b}" is blocked for security reasons`);
    }
  }

  // 9 — Warnings for paid models
  if (manifest.license && ['subscription', 'enterprise'].includes(manifest.license)) {
    warnings.push(`"${manifest.license}" license requires services.config.ts to be fully wired`);
  }

  // 10 — CLI support requires cli/ directory
  if (manifest.cliSupport) {
    warnings.push(`cliSupport: true — ensure cli/cli.extension.runner.ts is implemented`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─────────────────────────────────────────────────────────────
//  Structure validator
//  Checks that all required files/dirs exist in the extension dir
// ─────────────────────────────────────────────────────────────

import { existsSync } from 'fs';
import path from 'path';

const REQUIRED_PATHS = [
  'manifest.json',
  'package.json',
  'index.ts',
  'icon.png',
  'extension-configuration.json',
  'config/@settings.config.ts',
  'config/extension.active.handler.ts',
  'config/extension.deactivate.handler.ts',
  'config/extension.install.handler.ts',
  'config/extension.uninstall.handler.ts',
  'config/services.config.ts',
  'src/components/extension.container.card.tsx',
  'src/components/ui/navigation.tsx',
  'src/components/ui/bottomSpace.tsx',
];

export interface StructureResult {
  valid:   boolean;
  missing: string[];
  present: string[];
}

export function validateStructure(extensionRoot: string): StructureResult {
  const missing: string[] = [];
  const present: string[] = [];

  for (const rel of REQUIRED_PATHS) {
    const full = path.join(extensionRoot, rel);
    if (existsSync(full)) present.push(rel);
    else missing.push(rel);
  }

  return { valid: missing.length === 0, missing, present };
}
