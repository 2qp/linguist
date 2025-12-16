import { getFile } from "@services/fetch/get-file";

const fetchRemoteYaml = async (url: string): Promise<string> => await getFile<string>(url, "text");

export { fetchRemoteYaml };
