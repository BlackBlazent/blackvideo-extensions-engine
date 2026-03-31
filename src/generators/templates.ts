/*
 * templates.ts
 *
 * Pure functions that return the string content for every file
 * in the generated extension scaffold.
 *
 * Interpolation token: {{VAR}} — replaced by the generator.
 * All templates match the structure defined in extension.structure.md
 * and are compatible with extension.registry.server.ts (in-app).
 */

import type { LicenseModel, ExtensionType } from '../validators/manifest.validator.js';

export interface TemplateContext {
  id:            string;   // kebab-case  e.g. "my-video-ocr"
  displayName:   string;   // e.g. "My Video OCR"
  description:   string;
  author:        string;
  authorClass:   string;   // kebab-case CSS class  e.g. "john-doe"
  version:       string;
  type:          ExtensionType;
  license:       LicenseModel;
  playbackHooks: boolean;
  uiSupport:     boolean;
  cliSupport:    boolean;
}

// ─────────────────────────────────────────────────────────────
//  manifest.json
// ─────────────────────────────────────────────────────────────

export const tManifest = (c: TemplateContext): string =>
  JSON.stringify(
    {
      id:            c.id,
      name:          c.id,
      displayName:   c.displayName,
      description:   c.description,
      version:       c.version,
      author:        c.author,
      authorClass:   c.authorClass,
      type:          c.type,
      license:       c.license,
      icon:          'icon.png',
      entry:         'index.ts',
      uiEntry:       'src/components/extension.container.card',
      permissions:   [
        {
          scope:  'playback.read',
          reason: `${c.displayName} reads current playback state to provide its functionality`,
        },
      ],
      playbackHooks: c.playbackHooks,
      uiSupport:     c.uiSupport,
      cliSupport:    c.cliSupport,
    },
    null,
    2
  );

// ─────────────────────────────────────────────────────────────
//  package.json
// ─────────────────────────────────────────────────────────────

export const tPackageJson = (c: TemplateContext): string =>
  JSON.stringify(
    {
      name:        c.id,
      version:     c.version,
      description: c.description,
      author:      c.author,
      license:     'MIT',
      main:        'index.ts',
      blackvideo: {
        displayName:   c.displayName,
        authorClass:   c.authorClass,
        type:          c.type,
        license:       c.license,
        icon:          'icon.png',
        entry:         'index.ts',
        uiEntry:       'src/components/extension.container.card',
        permissions:   [
          {
            scope:  'playback.read',
            reason: `${c.displayName} reads playback state`,
          },
        ],
        playbackHooks: c.playbackHooks,
        uiSupport:     c.uiSupport,
        cliSupport:    c.cliSupport,
      },
      scripts: {
        dev:      'blackvideo-ext dev',
        build:    'blackvideo-ext build',
        validate: 'blackvideo-ext validate',
        publish:  'blackvideo-ext publish',
      },
      devDependencies: {
        typescript: '>=5.0.0',
      },
    },
    null,
    2
  );

// ─────────────────────────────────────────────────────────────
//  package.nls.json
// ─────────────────────────────────────────────────────────────

export const tPackageNls = (c: TemplateContext): string =>
  JSON.stringify(
    {
      'extension.displayName': c.displayName,
      'extension.description': c.description,
      'command.activate':      `Activate ${c.displayName}`,
      'command.deactivate':    `Deactivate ${c.displayName}`,
      'command.settings':      `${c.displayName} Settings`,
    },
    null,
    2
  );

// ─────────────────────────────────────────────────────────────
//  extension-configuration.json
// ─────────────────────────────────────────────────────────────

export const tExtensionConfig = (c: TemplateContext): string =>
  JSON.stringify(
    {
      extensionId:    c.id,
      schemaVersion:  '1.0',
      permissions:    ['playback.read'],
      resourceLimits: {
        maxMemoryMb:    64,
        maxCpuPercent:  10,
        maxNetworkKbps: 512,
      },
      featureFlags: {
        experimentalApi: false,
        debugMode:       false,
      },
      apiScopes: ['playback.read'],
      sandboxed: true,
    },
    null,
    2
  );

// ─────────────────────────────────────────────────────────────
//  cgmanifest.json
// ─────────────────────────────────────────────────────────────

export const tCgManifest = (c: TemplateContext): string =>
  JSON.stringify(
    {
      registrations: [
        {
          component: {
            type: 'git',
            git:  {
              name:          c.id,
              repositoryUrl: `https://github.com/${c.authorClass}/${c.id}`,
              commitHash:    '',
            },
          },
        },
      ],
      version: 1,
    },
    null,
    2
  );

// ─────────────────────────────────────────────────────────────
//  .blackvideoignore
// ─────────────────────────────────────────────────────────────

export const tBlackvideoIgnore = (): string =>
`# BlackVideo Extension — ignore file
# Files excluded from .bvx packaging and marketplace upload.

node_modules/
dist/
*.log
*.map
.DS_Store
Thumbs.db
.env
.env.*
*.test.ts
*.spec.ts
__tests__/
coverage/
`;

// ─────────────────────────────────────────────────────────────
//  index.ts  (extension entry point)
// ─────────────────────────────────────────────────────────────

export const tIndex = (c: TemplateContext): string => {
  const playbackBlock = c.playbackHooks
    ? `
  // ── Playback hooks ───────────────────────────────────────
  _stage = VideoTheaterStage.getInstance();

  _stage.subscribe('loadedmetadata', (video: HTMLVideoElement | null) => {
    if (!video) return;
    console.log('[${c.id}] Video loaded:', video.src);
    // Your logic here
  });

  _stage.subscribe('canplay', (_video: HTMLVideoElement | null) => {
    // Your logic here
  });
`
    : `
  // Playback hooks disabled. Enable via manifest.json: playbackHooks: true
`;

  return `/*
 * ${c.displayName} — BlackVideo Extension
 * Author: ${c.author}
 * Version: ${c.version}
 * Type: ${c.type}
 *
 * index.ts — Extension entry point.
 * Called by the BlackVideo extension loader when the extension is activated.
 */
${c.playbackHooks ? `
import { VideoTheaterStage } from '../../../../AppData/forbidden/dev/main/playground/Video.Theater.Stage';
` : ''}
// ─────────────────────────────────────────────────────────────
//  State
// ─────────────────────────────────────────────────────────────
${c.playbackHooks ? `
let _stage: VideoTheaterStage | null = null;
` : ''}
// ─────────────────────────────────────────────────────────────
//  Lifecycle
// ─────────────────────────────────────────────────────────────

export default function activate(): void {
  console.log('[${c.id}] Activated');
${playbackBlock}}

export function deactivate(): void {
  console.log('[${c.id}] Deactivated');
  // Release resources, unsubscribe hooks, stop workers.
${c.playbackHooks ? '  _stage = null;\n' : ''}}
`;
};

// ─────────────────────────────────────────────────────────────
//  config/@settings.config.ts
// ─────────────────────────────────────────────────────────────

export const tSettingsConfig = (c: TemplateContext): string =>
`/*
 * ${c.displayName}
 * config/@settings.config.ts
 *
 * User-facing settings for this extension.
 * Persisted via the BlackVideo Tauri store.
 */

import { invoke } from '@tauri-apps/api/core';

export interface ExtensionSettings {
  enabled: boolean;
  // Add your settings here:
}

const DEFAULTS: ExtensionSettings = {
  enabled: true,
};

const STORE_KEY = 'bv_ext_${c.id}_settings';

export async function loadSettings(): Promise<ExtensionSettings> {
  try {
    const raw = await invoke<string | null>('store_get', { key: STORE_KEY });
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveSettings(settings: Partial<ExtensionSettings>): Promise<void> {
  const current = await loadSettings();
  await invoke('store_set', {
    key:   STORE_KEY,
    value: JSON.stringify({ ...current, ...settings }),
  });
}

export async function resetSettings(): Promise<void> {
  await invoke('store_set', { key: STORE_KEY, value: JSON.stringify(DEFAULTS) });
}
`;

// ─────────────────────────────────────────────────────────────
//  config/services.config.ts
// ─────────────────────────────────────────────────────────────

export const tServicesConfig = (c: TemplateContext): string =>
`/*
 * ${c.displayName}
 * config/services.config.ts
 *
 * License and service configuration.
 */

export type LicenseModel = '${c.license}';

export interface ServiceConfig {
  license:          LicenseModel;
  trialDays?:       number;
  featureGates:     Record<string, boolean>;
  subscriptionUrl?: string;
}

export const servicesConfig: ServiceConfig = {
  license: '${c.license}',
  featureGates: {
    // 'advanced-mode': false,
  },
};

export function isFeatureEnabled(feature: string): boolean {
  return servicesConfig.featureGates[feature] ?? false;
}
`;

// ─────────────────────────────────────────────────────────────
//  config/extension.install.handler.ts
// ─────────────────────────────────────────────────────────────

export const tInstallHandler = (c: TemplateContext): string =>
`/*
 * ${c.displayName}
 * config/extension.install.handler.ts — called once on first install.
 */

export default async function install({ manifest }: { manifest: { id: string } }): Promise<void> {
  console.log(\`[${c.id}] Installing…\`);
  // Initialize data directories, write default config, etc.
}
`;

// ─────────────────────────────────────────────────────────────
//  config/extension.active.handler.ts
// ─────────────────────────────────────────────────────────────

export const tActiveHandler = (c: TemplateContext): string =>
`/*
 * ${c.displayName}
 * config/extension.active.handler.ts — called on every activation.
 */

export default async function activate({ manifest }: { manifest: { id: string } }): Promise<void> {
  console.log(\`[${c.id}] Activating…\`);
  // Start workers, register playback hooks, open IPC channels.
}
`;

// ─────────────────────────────────────────────────────────────
//  config/extension.deactivate.handler.ts
// ─────────────────────────────────────────────────────────────

export const tDeactivateHandler = (c: TemplateContext): string =>
`/*
 * ${c.displayName}
 * config/extension.deactivate.handler.ts — called on every deactivation.
 */

export default async function deactivate({ manifest }: { manifest: { id: string } }): Promise<void> {
  console.log(\`[${c.id}] Deactivating…\`);
  // Unregister listeners, stop workers, save state.
}
`;

// ─────────────────────────────────────────────────────────────
//  config/extension.uninstall.handler.ts
// ─────────────────────────────────────────────────────────────

export const tUninstallHandler = (c: TemplateContext): string =>
`/*
 * ${c.displayName}
 * config/extension.uninstall.handler.ts — called on permanent removal.
 */

export default async function uninstall({ manifest }: { manifest: { id: string } }): Promise<void> {
  console.log(\`[${c.id}] Uninstalling…\`);
  // Remove stored data, revoke permissions, clean up files.
}
`;

// ─────────────────────────────────────────────────────────────
//  cli/cli.extension.runner.ts  (only when cliSupport = true)
// ─────────────────────────────────────────────────────────────

export const tCliRunner = (c: TemplateContext): string =>
`/*
 * ${c.displayName}
 * cli/cli.extension.runner.ts
 *
 * CLI entry point. Only generated because cliSupport: true.
 * Invoked by: bvx cli run ${c.id} [args...]
 */

export interface CliContext {
  args:  string[];
  extId: string;
  log:   (msg: string) => void;
  error: (msg: string) => void;
}

export default async function runCli(ctx: CliContext): Promise<boolean> {
  const { args, log, error } = ctx;

  if (args.length === 0 || args[0] === 'help') {
    log('Usage: bvx cli run ${c.id} <command> [options]');
    log('Commands:');
    log('  help    Show this help');
    return true;
  }

  switch (args[0]) {
    default:
      error(\`Unknown command: "\${args[0]}". Run "help" to see available commands.\`);
      return false;
  }
}
`;

// ─────────────────────────────────────────────────────────────
//  src/components/extension.container.card.tsx
// ─────────────────────────────────────────────────────────────

export const tContainerCard = (c: TemplateContext): string =>
`/*
 * ${c.displayName} — BlackVideo Extension
 * src/components/extension.container.card.tsx
 *
 * Main UI container injected into extension.modalFrame.ui.tsx.
 * This is the primary surface for rendering your extension's UI.
 */

import React, { useState, useEffect } from 'react';
${c.playbackHooks
  ? `import { VideoTheaterStage } from '../../../../../../../AppData/forbidden/dev/main/playground/Video.Theater.Stage';`
  : ''}

interface Props {
  extId:    string;
  manifest?: { id: string; displayName: string; version: string };
}

const ExtensionContainerCard: React.FC<Props> = ({ extId, manifest }) => {
${c.playbackHooks
  ? `  const [videoReady, setVideoReady] = useState(false);
  const [videoSrc,   setVideoSrc]   = useState<string>('');

  useEffect(() => {
    const stage = VideoTheaterStage.getInstance();
    const onLoad = (video: HTMLVideoElement | null) => {
      if (!video) return;
      setVideoReady(true);
      setVideoSrc(video.src);
    };
    stage.subscribe('loadedmetadata', onLoad);
    stage.subscribe('canplay', onLoad);
    const existing = stage.getVideoElement();
    if (existing && existing.readyState >= 2) {
      setVideoReady(true);
      setVideoSrc(existing.src);
    }
    return () => {
      stage.unsubscribe('loadedmetadata', onLoad);
      stage.unsubscribe('canplay', onLoad);
    };
  }, []);`
  : '  // Add your state and effects here'}

  return (
    <div className="ext-container-card">
      <div className="ext-card-header">
        <span className="ext-card-title">{manifest?.displayName ?? extId}</span>
        <span className="ext-card-version">v{manifest?.version ?? '1.0.0'}</span>
      </div>

      <div className="ext-card-body">
${c.playbackHooks
  ? `        {videoReady
          ? <div className="ext-video-info">
              <span className="ext-label">Now Playing</span>
              <span className="ext-value ext-value--truncate">{videoSrc}</span>
            </div>
          : <div className="ext-idle-state">
              <span>Waiting for video…</span>
            </div>
        }`
  : `        {/*
          ─────────────────────────────────────────────
          DEVELOPER: Add your extension UI here
          ─────────────────────────────────────────────
        */}`}
      </div>
    </div>
  );
};

export default ExtensionContainerCard;
`;

// ─────────────────────────────────────────────────────────────
//  src/components/ui/navigation.tsx
// ─────────────────────────────────────────────────────────────

export const tNavigation = (c: TemplateContext): string =>
`/*
 * ${c.displayName}
 * src/components/ui/navigation.tsx
 *
 * Optional inner nav bar rendered above the container card.
 * Return null if not needed.
 */

import React from 'react';

interface NavigationProps {
  extId:     string;
  manifest?: { id: string };
}

const Navigation: React.FC<NavigationProps> = (_props) => {
  // Return null to hide, or add tab buttons:
  return null;

  /*
  return (
    <nav className="ext-inner-nav">
      <button className="ext-nav-tab active">Overview</button>
      <button className="ext-nav-tab">Settings</button>
    </nav>
  );
  */
};

export default Navigation;
`;

// ─────────────────────────────────────────────────────────────
//  src/components/ui/bottomSpace.tsx
// ─────────────────────────────────────────────────────────────

export const tBottomSpace = (c: TemplateContext): string =>
`/*
 * ${c.displayName}
 * src/components/ui/bottomSpace.tsx
 *
 * Optional status bar rendered below the container card.
 * Return null if not needed.
 */

import React from 'react';

interface BottomSpaceProps {
  extId:     string;
  manifest?: { id: string };
}

const BottomSpace: React.FC<BottomSpaceProps> = (_props) => {
  return null;

  /*
  return (
    <div className="ext-bottom-bar">
      <span className="ext-status-dot ext-status-dot--ok" />
      <span>Ready</span>
    </div>
  );
  */
};

export default BottomSpace;
`;
