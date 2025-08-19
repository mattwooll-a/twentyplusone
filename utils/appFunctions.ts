// appFunctions.ts - Functions that work with your React state

import { parseYamlDeck, shuffleDeck, createStandardDeck } from './deckUtils.tsx';

// Type definitions (matching your actual types)
interface HandResult {
  total: number;
  bust: boolean;
}

interface AppState {
  setDeck: (deck: string[]) => void;
  setIsLoading: (loading: boolean) => void;
  setLoadError: (error: string | null) => void;
  setDrawnCards: (cards: string[]) => void;
  setResult: (result: HandResult | null) => void;
  setInput: (input: string) => void;
}

/**
 * Loads deck from YAML file and shuffles it
 */
export const loadDeckFromYaml = async (
  { setDeck, setIsLoading, setLoadError, setDrawnCards }: AppState
) => {
  setIsLoading(true);
  setLoadError(null);
  
  try {
    // Fetch the YAML file from the public directory
    const response = await fetch('./src/save.yaml');
    if (!response.ok) {
      throw new Error(`Failed to load save.yaml: ${response.status} ${response.statusText}`);
    }
    
    const yamlContent = await response.text();
    const cards = parseYamlDeck(yamlContent);
    
    if (cards.length === 0) {
      throw new Error('No cards found in YAML file');
    }
    
    // Shuffle the loaded deck using utility function
    const shuffledDeck = shuffleDeck(cards);
    
    setDeck(shuffledDeck);
    setDrawnCards([]);
    setLoadError(null);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    setLoadError(`Error loading deck: ${errorMessage}`);
    console.error('Failed to load deck from YAML:', error);
  } finally {
    setIsLoading(false);
  }
};

/**
 * Initializes a standard 52-card deck
 */
export const initializeStandardDeck = (
  { setDeck, setDrawnCards, setLoadError }: AppState
) => {
  try {
    const standardDeck = createStandardDeck();
    const shuffledDeck = shuffleDeck(standardDeck);
    
    setDeck(shuffledDeck);
    setDrawnCards([]);
    setLoadError(null);
    
    console.log('Initialized and shuffled standard 52-card deck');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create standard deck';
    setLoadError(errorMessage);
    console.error('Failed to initialize standard deck:', error);
  }
};

/**
 * Draws a random card from the deck
 */
export const drawRandomCard = (
  deck: string[],
  drawnCards: string[],
  calculateHandTotal: (cards: string[]) => HandResult,
  { setDeck, setDrawnCards, setInput, setResult }: AppState
) => {
  if (deck.length === 0) {
    alert("No cards left in deck! Load a deck from YAML or use the standard deck.");
    return;
  }
  
  const newCard = deck[0];
  const newDeck = deck.slice(1);
  const newDrawnCards = [...drawnCards, newCard];
  
  setDeck(newDeck);
  setDrawnCards(newDrawnCards);
  setInput(newDrawnCards.join(" "));
  setResult(calculateHandTotal(newDrawnCards));
};

/**
 * Calculates hand result from input
 */
export const handleCheck = (
  input: string,
  calculateHandTotal: (cards: string[]) => HandResult,
  { setResult }: AppState
) => {
  const cards = input.split(" ").filter((c) => c.length > 0);
  setResult(calculateHandTotal(cards));
};

/**
 * Clears the current hand
 */
export const clearHand = (
  { setDrawnCards, setInput, setResult }: AppState
) => {
  setDrawnCards([]);
  setInput("");
  setResult(null);
};

/**
 * Formats a card for display with suit symbols
 */
export const formatCard = (card: string): string => {
  const [value, suit] = card.split(",");
  const suitSymbols: { [key: string]: string } = {
    'H': '♥️',
    'D': '♦️',
    'C': '♣️',
    'S': '♠️'
  };
  return `${value}${suitSymbols[suit]}`;
};

/**
 * Formats multiple cards for display
 */
export const formatCards = (cards: string[]): string[] => {
  return cards.map(formatCard);
};

/**
 * Resets the entire game state
 */
export const resetGame = (
  { setDeck, setDrawnCards, setResult, setLoadError, setInput }: AppState
) => {
  setDeck([]);
  setDrawnCards([]);
  setResult(null);
  setLoadError(null);
  setInput("");
};