import { create } from "zustand";
import { Result } from "../types/result.type";

interface ResultStore {
  results: Result[];
  setResult: (result: Result[]) => void;
}

export const useResultStore = create<ResultStore>((set) => ({
  results: [],
  setResult: (result) =>
    set({
      results: result.sort((a, b) => b.score - a.score),
    }),
}));
