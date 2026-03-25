import { TEST_CALLBACKS } from "./test-callbacks";
import { basename } from "node:path";
import { log } from "@utils/log";
import { ANSI_COLORS } from "@/constants/ansi-colors";

import type { Reporter, TestModule } from "vitest/node";

class CustomReporter implements Reporter {
	//

	async onTestModuleEnd(testModule: TestModule) {
		//

		const fileName = basename(testModule.moduleId);

		const handler = TEST_CALLBACKS[fileName];
		if (!handler) return;

		const tests = [...testModule.children.allTests()];

		const allPassed = tests.every((t) => t.result().state === "passed");

		const executable = tests.length > 0 && allPassed;

		if (executable) {
			log.info(`\n[custom-reporter]`);
			log.info(`${ANSI_COLORS.fg.green}\u2713${ANSI_COLORS.reset}`, `${fileName} passed successfully`);

			await handler();
		}

		if (!executable) {
			log.warn(`${ANSI_COLORS.fg.red}\u00D7`, `${fileName} has failures${ANSI_COLORS.reset}`);
		}
	}
}

export default CustomReporter;
