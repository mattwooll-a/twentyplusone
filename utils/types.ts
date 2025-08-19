// types.ts
export interface HandResult {
    total: number;
    bust: boolean;
  }
  
  export interface Table {
    id: string;
    name: string;
    deck: string[];
    drawnCards: string[];
    input: string;
    result: HandResult | null;
    isLoading: boolean;
    loadError: string | null;
  }
  
  export interface TableState {
    setDeck: (deck: string[]) => void;
    setIsLoading: (loading: boolean) => void;
    setLoadError: (error: string | null) => void;
    setDrawnCards: (cards: string[]) => void;
    setResult: (result: HandResult | null) => void;
    setInput: (input: string) => void;
  }