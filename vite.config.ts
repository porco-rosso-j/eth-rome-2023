import { defineConfig, Plugin } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from "vite-plugin-node-polyfills";
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

export default defineConfig({
	plugins: [
		react(),
		nodePolyfills(),
		MockModulePlugin(),
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
			target: "esnext",
		},
	},
	build: {
		target: "esnext",
	},
});
