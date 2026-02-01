import api from "./api";

export const saveMindMap = (nodes, edges) =>
  api.post("/mindmap/save", { nodes, edges });

export const loadMindMap = () =>
  api.get("/mindmap/load");

export const clearMindMap = () =>
  api.delete("/mindmap/clear");
    