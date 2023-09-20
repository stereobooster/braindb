import { queue } from "fastq";

export type Event = { action: "add" | "delete" | "update"; path: string };
export type Queue = queue<Event>;
