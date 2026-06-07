export type Activity = "theory" | "experiment" | "design";
export type StudyLevel = "bachelor" | "master" | "phd";

export interface Connection {
  to: string;
  type: string;
}

export interface Problem {
  title: string;
  open: boolean;
  example: string;
}

export interface CSNode {
  id: string;
  label: string;
  labelRO: string;
  x: number;
  y: number;
  r: number;
  color: string;
  textColor: string;
  cluster: string;
  activities: Activity[];
  tagline: string;
  taglineRO: string;
  connections: Connection[];
  problems: Problem[];
  people: string[];
  venues: string[];
  uvt: string;
  uvtRO: string;
  studyLevel: StudyLevel[];
}

export interface Cluster {
  id: string;
  label: string;
  labelRO: string;
  color: string;
}

export interface MapMeta {
  title: string;
  titleRO: string;
  source: string;
  year: number;
  institution: string;
  institutionRO: string;
}

export interface CSMapData {
  meta: MapMeta;
  clusters: Cluster[];
  nodes: CSNode[];
}

export interface Edge {
  from: string;
  to: string;
  type: string;
}
