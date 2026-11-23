export type PluginInfo = {
  name: string;
  enabled: boolean;
  description: string;
};

export type QueryRequest = {
  query: string;
  collection_id?: string;
};

export type QueryResponse = {
  answer: string;
  sources: string[];
  tools_used: string[];
};
