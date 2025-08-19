// App.tsx
import { useState} from "react";

interface HandResult {
  total: number;
  bust: boolean;
}

function calculateHandTotal(cards: string[]): HandResult {
  let total = 0;
  let aceCount = 0;
  for (let card of cards) {
    let val = card.split(" ")[0];
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
}

export default function App() {
  const [input, setInput] = useState<string>("A H 3 C 4 D");
  const [result, setResult] = useState<HandResult | null>(null);
  const [drawnCards, setDrawnCards] = useState<string[]>([]);
  const [deck, setDeck] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Parse YAML data (simple implementation for card format)
  const parseYamlDeck = (yamlContent: string): string[] => {
    try {
      console.log('=== YAML Parsing Debug ===');
      console.log('Input YAML content:');
      console.log(JSON.stringify(yamlContent));
      
      // Simple YAML parser for deck format
      // Supports both formats:
      // Format 1 (list):
      // deck:
      //   - "A,H"
      //   - "2,H"
      //
      // Format 2 (array):
      // deck: ["AH,2H,3H"]
      
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
            // Parse the array content
            const arrayContent = arrayMatch[1];
            console.log('Array content:', arrayContent);
            
            // Split by comma and clean up quotes/whitespace
            const arrayCards = arrayContent.split(',').map(card => {
              const cleaned = card.trim().replace(/^["']|["']$/g, '');
              console.log(`Card: "${card}" -> cleaned: "${cleaned}"`);
              return cleaned;
            });
            
            console.log('Array cards:', arrayCards);
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
            console.log('Found card:', match[1]);
            cards.push(match[1]);
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
  // Load deck from YAML file
  const loadDeckFromYaml = async () => {
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
      
      // Shuffle the loaded deck
      const shuffledDeck = [...cards];
      for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
      }
      
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

  // Initialize a standard deck (fallback option)
  const initializeStandardDeck = () => {
    const suits = ['H', 'D', 'C', 'S']; // Hearts, Diamonds, Clubs, Spades
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const newDeck = [];
    
    for (let suit of suits) {
      for (let value of values) {
        newDeck.push(`${value} ${suit}`);
      }
    }
    
    // Shuffle the deck
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    
    setDeck(newDeck);
    setDrawnCards([]);
    setLoadError(null);
  };

  const drawRandomCard = () => {
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

  const handleCheck = () => {
    const cards = input.split(" ").filter((c) => c.length > 0);
    setResult(calculateHandTotal(cards));
  };

  const clearHand = () => {
    setDrawnCards([]);
    setInput("");
    setResult(null);
  };

  const formatCard = (card: string): string => {
    const [value, suit] = card.split(",");
    const suitSymbols: { [key: string]: string } = {
      'H': '♥️',
      'D': '♦️',
      'C': '♣️',
      'S': '♠️'
    };
    return `${value}${suitSymbols[suit]}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <h1 style={{
        fontSize: '1.875rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        color: '#1f2937'
      }}>
        Blackjack Hand Calculator
      </h1>
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        padding: '1.5rem',
        width: '100%',
        maxWidth: '28rem'
      }}>
        {/* Deck Status */}
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>Cards remaining in deck: {deck.length}</p>
          {deck.length === 0 && (
            <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>No deck loaded!</p>
          )}
          {loadError && (
            <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {loadError}
            </p>
          )}
          {isLoading && (
            <p style={{ color: '#3b82f6', fontSize: '0.875rem' }}>Loading deck...</p>
          )}
        </div>

        {/* Card Drawing Controls */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={loadDeckFromYaml}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#9ca3af' : '#8b5cf6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            {isLoading ? 'Loading...' : 'Load from YAML'}
          </button>
          <button
            onClick={initializeStandardDeck}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Standard Deck
          </button>
          <button
            onClick={drawRandomCard}
            disabled={deck.length === 0}
            style={{
              backgroundColor: deck.length === 0 ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: deck.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            Draw Card
          </button>
          <button
            onClick={clearHand}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Clear Hand
          </button>
        </div>

        {/* Current Hand Display */}
        {drawnCards.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Current Hand:</h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              justifyContent: 'center'
            }}>
              {drawnCards.map((card, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    fontSize: '1.125rem',
                    fontFamily: 'monospace',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {formatCard(card)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Manual Input (Optional) */}
        <div style={{ marginBottom: '1rem' }}>
          <p style={{
            marginBottom: '0.5rem',
            color: '#374151',
            fontSize: '0.875rem'
          }}>
            Or enter cards manually (example: <code style={{
              backgroundColor: '#f3f4f6',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontFamily: 'monospace'
            }}>A,H 3,C 4,D</code>)
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                padding: '0.5rem 0.75rem',
                flex: '1',
                minWidth: '200px'
              }}
            />
            <button
              onClick={handleCheck}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Calculate
            </button>
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: result.bust ? '#dc2626' : result.total === 21 ? '#d97706' : '#059669'
            }}>
              Total: {result.total}
            </div>
            {result.bust && (
              <div style={{ color: '#dc2626', fontWeight: '600', marginTop: '0.5rem' }}>
                BUST!
              </div>
            )}
            {result.total === 21 && drawnCards.length === 2 && (
              <div style={{ color: '#d97706', fontWeight: '600', marginTop: '0.5rem' }}>
                BLACKJACK! 🎉
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}