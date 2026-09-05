// Quick SSR test: compile all src with esbuild and render Home to string.
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

// Bundle src/main with esbuild for node
execSync(
  "npx --prefix . esbuild src/main.jsx --bundle --platform=node --format=cjs --outfile=/tmp/ssr_bundle.cjs --external:react --external:react-dom --jsx=automatic 2>&1 | tail -20",
  { stdio: "pipe" }
);
console.log("bundle built");
