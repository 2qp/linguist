type BuildInfo = {
	source: string;
	hash: string;
	generated_at: string;

	upstream?: Upstream;
	workflow_run?: WorkflowRun;
};

type Upstream = {
	updated_at: Date;
};

type WorkflowRun = {
	repository: string;
	run_attempt: number;
	run_id: number;
	run_number: number;
	trigger: string;
	workflow_id: string;
};

export type { BuildInfo };
