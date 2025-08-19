// deckUtils.ts - Pure utility functions (no React dependencies)

/**
 * Converts card format from "AH" to "A,H"
 */
export const convertCardFormat = (card: string): string => {
    // Convert "AH" to "A,H", "2H" to "2,H", etc.
    // Split rank and suit - suit is the last character
    if (card.length < 2) return card;
    
    const suit = card.slice(-1);
    const rank = card.slice(0, -1);
    return `${rank},${suit}`;
  };
  
  /**
   * Parses YAML deck content and returns array of cards in "rank,suit" format
   * Supports both formats:
   * - deck: ["AH,2H,3H"] (single string with comma-separated cards)
   * - deck:
   *     - "A,H"
   *     - "2,H"
   */
  export const parseYamlDeck = (yamlContent: string): string[] => {
    try {
      console.log('=== YAML Parsing Debug ===');
      console.log('Input YAML content:');
      console.log(JSON.stringify(yamlContent));
      
      const lines = yamlContent.split('\n');
      console.log(`Split into ${lines.length} lines`);
      
      const cards: string[] = [];
      let inDeckSection = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        console.log(`Line ${i}: "${line}" -> trimmed: "${trimmedLine}"`);
        
        if (trimmedLine.startsWith('deck:')) {
          console.log('Found deck: line');
          inDeckSection = true;
          
          // Check if it's the array format on the same line
          const arrayMatch = trimmedLine.match(/^deck:\s*\[(.+)\]$/);
          console.log('Array match result:', arrayMatch);
          
          if (arrayMatch) {
            console.log('Found array format');
            
            // Parse the array content - could be comma-separated cards in one string
            const arrayContent = arrayMatch[1];
            console.log('Array content:', arrayContent);
            
            // First split by quotes/array elements, then split each element by commas
            const arrayCards: string[] = [];
            const elements = arrayContent.split(/["'],\s*["']|["']|\s*,\s*/);
            
            for (const element of elements) {
              const trimmed = element.trim();
              if (trimmed) {
                // If element contains commas, it's multiple cards in one string
                if (trimmed.includes(',')) {
                  // Check if it's already in "A,H" format or "AH,2H,3H" format
                  if (trimmed.match(/^[A-Z0-9]+,[A-Z]$/)) {
                    // Already in A,H format
                    arrayCards.push(trimmed);
                  } else {
                    // It's in "AH,2H,3H" format - split and convert each
                    const cards = trimmed.split(',');
                    for (const card of cards) {
                      const cleaned = card.trim();
                      if (cleaned) {
                        const converted = convertCardFormat(cleaned);
                        arrayCards.push(converted);
                      }
                    }
                  }
                } else {
                  // Single card, convert format
                  const converted = convertCardFormat(trimmed);
                  arrayCards.push(converted);
                }
              }
            }
            
            console.log('Final array cards:', arrayCards);
            cards.push(...arrayCards);
            break; // We're done, found the array format
          }
          continue;
        }
        
        if (inDeckSection) {
          console.log('In deck section, checking line:', trimmedLine);
          
          // Check if line starts with - and contains a card (list format)
          const match = trimmedLine.match(/^-\s*["']?([^"']+)["']?$/);
          console.log('List format match:', match);
          
          if (match) {
            const converted = convertCardFormat(match[1]);
            console.log('Found card:', match[1], '-> converted:', converted);
            cards.push(converted);
          } else if (trimmedLine && !trimmedLine.startsWith('#')) {
            console.log('Hit non-card line, ending deck section');
            // If we hit a non-card line, we're done with the deck section
            break;
          }
        }
      }
      
      console.log('Final cards array:', cards);
      console.log('=== End Debug ===');
      
      return cards;
    } catch (error) {
      console.error('Parse error:', error);
      throw new Error(`Failed to parse YAML: ${error}`);
    }
  };
  
  /**
   * Creates a standard 52-card deck in "rank,suit" format
   */
  export const createStandardDeck = (): string[] => {
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suits = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades
    
    const deck: string[] = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push(`${rank},${suit}`);
      }
    }
    
    return deck;
  };
  
  /**
   * Shuffles an array of cards
   */
  export const shuffleDeck = (cards: string[]): string[] => {
    const shuffled = [...cards]; // Create a copy
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled;
  };