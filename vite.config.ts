import { defineConfig, Plugin } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
//import reactRefresh from "@vitejs/plugin-react-refresh"; // Assuming a React project; adjust accordingly.
import { nodePolyfills } from "vite-plugin-node-polyfills";
// Polyfill for Node.js built-ins and globals
import copy from "rollup-plugin-copy";
import fs from "fs";

function MockModulePlugin(): Plugin {
	return {
		name: "mock-module-plugin",
		resolveId(source) {
			if (source === "@achingbrain/nat-port-mapper") {
				return this.resolve(__dirname + "/mocks/nat-port-mapper");
			}
		},
	};
}

const wasmContentTypePlugin = {
	name: "wasm-content-type-plugin",
	configureServer(server) {
		server.middlewares.use(async (req, res, next) => {
			if (req.url.endsWith(".wasm")) {
				res.setHeader("Content-Type", "application/wasm");
				const newPath = req.url.replace("deps", "dist");
				const targetPath = path.join(__dirname, newPath);
				const wasmContent = fs.readFileSync(targetPath);
				return res.end(wasmContent);
			}
			next();
		});
	},
};

const copied = copy({
	targets: [{ src: "node_modules/**/*.wasm", dest: "node_modules/.vite/dist" }],
	copySync: true,
	hook: "buildStart",
});

export default defineConfig({
	plugins: [
		//reactRefresh(),
		react(),
		nodePolyfills(),
		MockModulePlugin(),
		//Polyfills for Node.js globals and modules for Vite/Rollup
		//copied,
		wasmContentTypePlugin,
	],
	resolve: {
		alias: {
			src: path.resolve(__dirname, "./src"),
			"default-gateway": "/mocks/default-gateway",
			"@achingbrain/nat-port-mapper": path.resolve(
				__dirname,
				"/mocks/@achingbrain/nat-port-mapper"
			),
			"custom-uniswap-v2-sdk": path.resolve(
				__dirname,
				"./mocks/custom-uniswap-v2-sdk"
			),
		},
	},
	optimizeDeps: {
		esbuildOptions: {
			// Node.js global to browser globalThis polyfill
			define: {
				global: "globalThis",
			},
			target: "esnext",
		},
	},
	build: {
		// assetsInclude: ["**/*.wasm"], // Include WASM files as assets
		// If snarkjs.min.js is large, you might increase the limit like so:
		rollupOptions: {
			output: {
				chunkFileNames: "scripts/[name]-[hash].js",
				manualChunks(id) {
					if (id.includes("snarkjs.min.js")) {
						return "snarkjs"; // This will keep snarkjs.min.js separate from other chunks
					}
				},
			},
		},
	},
});
