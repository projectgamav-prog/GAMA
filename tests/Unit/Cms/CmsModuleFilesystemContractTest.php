<?php

test('cms modules keep the frozen folder structure', function () {
    $modulesRoot = dirname(__DIR__, 3).'/resources/js/admin/cms/modules';
    $requiredFiles = [
        'manifest.ts',
        'renderer.tsx',
        'editor.tsx',
        'types.ts',
        'defaults.ts',
        'index.tsx',
    ];

    foreach (['rich-text', 'button-group', 'media'] as $module) {
        $modulePath = "{$modulesRoot}/{$module}";

        expect(is_dir($modulePath))->toBeTrue(
            "Expected CMS module directory [{$module}] to exist.",
        );

        foreach ($requiredFiles as $file) {
            expect(is_file("{$modulePath}/{$file}"))->toBeTrue(
                "Expected CMS module [{$module}] to contain [{$file}].",
            );
        }
    }
});
