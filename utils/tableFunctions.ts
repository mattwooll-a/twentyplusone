// tableFunctions.ts - Functions for managing multiple tables
import type { Table, HandResult} from './types';
import { parseYamlDeck, shuffleDeck, createStandardDeck } from './deckUtils';

/**
 * Creates a new empty table
 */
export const createNewTable = (id: string, name: string): Table => ({
  id,
  name,
  deck: [],
  Dealerdeck: createStandardDeck(), // Initialize dealer deck immediately
  drawnCards: [],
  dealerHand: [],
  input: "",
  dealer: null,
  result: null,
  isLoading: false,
  loadError: null,
});

/**
 * Calculates blackjack hand total
 */
export const calculateHandTotal = (cards: string[]): HandResult => {
  let total = 0;
  let aceCount = 0;
  for (let card of cards) {
    let val = card.split(",")[0];
    if (val === "A") {
      aceCount += 1;
    } else if (["K", "Q", "J"].includes(val)) {
      total += 10;
    } else {
      total += parseInt(val, 10);
    }
  }
  // Handle Aces (1 or 11)
  for (let i = 0; i < aceCount; i++) {
    if (total + 11 > 21) {
      total += 1;
    } else {
      total += 11;
    }
  }
  if (total > 21) {
    return { total, bust: true };
  }
  return { total, bust: false };
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
 * Loads deck from YAML file for a specific table
 */
export const loadDeckFromYaml = async (
  tableId: string,
  tables: Table[],
  setTables: (tables: Table[]) => void
) => {
  const updatedTables = tables.map(table => 
    table.id === tableId 
      ? { ...table, isLoading: true, loadError: null }
      : table
  );
  setTables(updatedTables);
  
  try {
    const response = await fetch('./src/save.yaml');
    if (!response.ok) {
      throw new Error(`Failed to load save.yaml: ${response.status} ${response.statusText}`);
    }
    
    const yamlContent = await response.text();
    const cards = parseYamlDeck(yamlContent);
    
    if (cards.length === 0) {
      throw new Error('No cards found in YAML file');
    }
    
    const shuffledDeck = shuffleDeck(cards);
    
    setTables(tables.map(table => 
      table.id === tableId 
        ? { 
            ...table, 
            deck: shuffledDeck, 
            drawnCards: [], 
            isLoading: false, 
            loadError: null 
          }
        : table
    ));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    setTables(tables.map(table => 
      table.id === tableId 
        ? { 
            ...table, 
            isLoading: false, 
            loadError: `Error loading deck: ${errorMessage}` 
          }
        : table
    ));
  }
};

/**
 * Initializes a standard deck for a specific table
 */
export const initializeStandardDeck = (
  tableId: string,
  tables: Table[],
  setTables: (tables: Table[]) => void
) => {
  try {
    const standardDeck = createStandardDeck();
    const shuffledDeck = shuffleDeck(standardDeck);
    
    setTables(tables.map(table => 
      table.id === tableId 
        ? { 
            ...table, 
            deck: shuffledDeck, 
            drawnCards: [], 
            loadError: null 
          }
        : table
    ));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create standard deck';
    setTables(tables.map(table => 
      table.id === tableId 
        ? { ...table, loadError: errorMessage }
        : table
    ));
  }
};

export const initializeDealerDeck = (
  tableId: string,
  tables: Table[],
  setTables: (tables: Table[]) => void
) => {
  try {
    const standardDeck = createStandardDeck();
    const shuffledDeck = shuffleDeck(standardDeck);
    
    setTables(tables.map(table => 
      table.id === tableId 
        ? { 
            ...table, 
            Dealerdeck: shuffledDeck, 
            dealerHand: [], 
            loadError: null 
          }
        : table
    ));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create standard deck';
    setTables(tables.map(table => 
      table.id === tableId 
        ? { ...table, loadError: errorMessage }
        : table
    ));
  }
};

/**
 * Draws cards for both player and dealer in a single atomic operation
 */
export const drawBothCards = (
  tableId: string,
  tables: Table[],
  setTables: (tables: Table[]) => void
) => {
  setTables(tables.map(table => {
    if (table.id !== tableId) return table;
    
    // Check if player deck is empty
    if (table.deck.length === 0) {
      alert("No cards left in player deck! Load a deck from YAML or use the standard deck.");
      return table;
    }
    
    // Check if dealer deck is empty and refill if needed
    let dealerDeck = table.Dealerdeck;
    if (dealerDeck.length === 0) {
      console.log("Dealer deck empty, adding new deck to shoe");
      const newDealerDeck = createStandardDeck();
      dealerDeck = shuffleDeck(newDealerDeck);
    }
    
    // Draw player card
    const playerCard = table.deck[0];
    const newPlayerDeck = table.deck.slice(1);
    const newPlayerCards = [...table.drawnCards, playerCard];
    const newPlayerInput = newPlayerCards.join(" ");
    const newPlayerResult = calculateHandTotal(newPlayerCards);
    
    // Draw dealer card
    const dealerCard = dealerDeck[0];
    const newDealerDeck = dealerDeck.slice(1);
    const newDealerCards = [...table.dealerHand, dealerCard];
    const newDealerResult = calculateHandTotal(newDealerCards);
    
    return {
      ...table,
      // Player updates
      deck: newPlayerDeck,
      drawnCards: newPlayerCards,
      input: newPlayerInput,
      result: newPlayerResult,
      // Dealer updates
      Dealerdeck: newDealerDeck,
      dealerHand: newDealerCards,
      dealer: newDealerResult
    };
  }));
};

/**
 * Draws a random card for player only
 */
export const drawRandomCard = (
  tableId: string,
  tables: Table[],
  setTables: (tables: Table[]) => void
) => {
  setTables(tables.map(table => {
    if (table.id !== tableId) return table;
    
    if (table.deck.length === 0) {
      alert("No cards left in deck! Load a deck from YAML or use the standard deck.");
      return table;
    }
    
    const newCard = table.deck[0];
    const newDeck = table.deck.slice(1);
    const newDrawnCards = [...table.drawnCards, newCard];
    const newInput = newDrawnCards.join(" ");
    const newResult = calculateHandTotal(newDrawnCards);
    
    return {
      ...table,
      deck: newDeck,
      drawnCards: newDrawnCards,
      input: newInput,
      result: newResult
    };
  }));
};

/**
 * Draws a card for dealer only
 */
export const DealerDrawCard = (
  tableId: string,
  tables: Table[],
  setTables: (tables: Table[]) => void
) => {
  setTables(tables.map(table => {
    if (table.id !== tableId) return table;
    
    let dealerDeck = table.Dealerdeck;
    
    // Check if dealer deck is empty and refill if needed
    if (dealerDeck.length === 0) {
      console.log("Dealer deck empty, adding new deck to shoe");
      const newDealerDeck = createStandardDeck();
      dealerDeck = shuffleDeck(newDealerDeck);
    }
    
    const newCard = dealerDeck[0];
    const newDeck = dealerDeck.slice(1);
    const newDrawnCards = [...table.dealerHand, newCard];
    const newDealerVal = calculateHandTotal(newDrawnCards);
    
    return {
      ...table,
      Dealerdeck: newDeck,
      dealerHand: newDrawnCards,
      dealer: newDealerVal
    };
  }));
};

/**
 * Handles manual input check for a specific table
 */
export const handleCheck = (
  tableId: string,
  tables: Table[],
  setTables: (tables: Table[]) => void
) => {
  setTables(tables.map(table => {
    if (table.id !== tableId) return table;
    
    const cards = table.input.split(" ").filter((c) => c.length > 0);
    const result = calculateHandTotal(cards);
    
    return { ...table, result };
  }));
};

/**
 * Clears hand for a specific table
 */
export const clearHand = (
  tableId: string,
  tables: Table[],
  setTables: (tables: Table[]) => void
) => {
  setTables(tables.map(table => 
    table.id === tableId 
      ? { ...table, drawnCards: [], dealerHand: [], input: "", result: null, dealer: null }
      : table
  ));
};

/**
 * Updates input for a specific table
 */
export const updateTableInput = (
  tableId: string,
  input: string,
  tables: Table[],
  setTables: (tables: Table[]) => void
) => {
  setTables(tables.map(table => 
    table.id === tableId 
      ? { ...table, input }
      : table
  ));
};

/**
 * Removes a table
 */
export const removeTable = (
  tableId: string,
  tables: Table[],
  setTables: (tables: Table[]) => void
) => {
  setTables(tables.filter(table => table.id !== tableId));
};