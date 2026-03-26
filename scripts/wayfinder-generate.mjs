import { spawnSync } from 'node:child_process';
import { access, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const generatedTargets = [
    path.join(projectRoot, 'resources', 'js', 'routes'),
    path.join(projectRoot, 'resources', 'js', 'actions'),
    path.join(projectRoot, 'resources', 'js', 'wayfinder'),
];
const args = new Set(process.argv.slice(2));
const cleanOnly = args.has('--clean-only');

function ensureProjectTarget(targetPath) {
    const relativePath = path.relative(projectRoot, targetPath);

    if (
        relativePath === ''
        || relativePath.startsWith('..')
        || path.isAbsolute(relativePath)
    ) {
        throw new Error(`Refusing to touch path outside the project root: ${targetPath}`);
    }
}

async function removeGeneratedTargets() {
    for (const targetPath of generatedTargets) {
        ensureProjectTarget(targetPath);
        await rm(targetPath, { recursive: true, force: true });
    }
}

function runWayfinderGenerate() {
    const result = spawnSync(
        'php',
        ['artisan', 'wayfinder:generate', '--with-form'],
        {
            cwd: projectRoot,
            stdio: 'inherit',
        },
    );

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

async function assertGeneratedArtifact(relativePath) {
    const artifactPath = path.join(projectRoot, relativePath);

    ensureProjectTarget(artifactPath);
    await access(artifactPath);
}

async function main() {
    await removeGeneratedTargets();

    if (cleanOnly) {
        return;
    }

    runWayfinderGenerate();

    await assertGeneratedArtifact(path.join('resources', 'js', 'routes', 'index.ts'));
    await assertGeneratedArtifact(path.join('resources', 'js', 'wayfinder', 'index.ts'));
    await assertGeneratedArtifact(path.join('resources', 'js', 'actions'));
}

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[wayfinder] ${message}`);
    process.exit(1);
});
