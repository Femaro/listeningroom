import type { Config } from '@react-router/dev/config';

export default {
	appDirectory: './src/app',
	ssr: false,
	prerender: ['/*?'],
	serverModuleFormat: 'esm',
	serverBuildFile: 'index.js',
	serverDependenciesToBundle: [],
	serverConditions: [],
	serverMainFields: [],
	serverMinify: false,
	serverPlatform: 'node',
	serverPlugins: [],
} satisfies Config;
