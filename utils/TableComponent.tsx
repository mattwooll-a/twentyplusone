// TableComponent.tsx - Individual table component
import React from 'react';
import type { Table } from './types';
import { 
  loadDeckFromYaml, 
  initializeStandardDeck, 
  drawRandomCard, 
  handleCheck, 
  clearHand,
  updateTableInput,
  removeTable,
  formatCard 
} from './tableFunctions';

interface TableComponentProps {
  table: Table;
  tables: Table[];
  setTables: (tables: Table[]) => void;
  canRemove: boolean;
}

export const TableComponent: React.FC<TableComponentProps> = ({ 
  table, 
  tables, 
  setTables, 
  canRemove 
}) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '1.5rem',
      width: '100%',
      maxWidth: '28rem',
      position: 'relative'
    }}>
      {/* Table Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1rem' 
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#1f2937',
          margin: 0
        }}>
          {table.name}
        </h2>
        {canRemove && (
          <button
            onClick={() => removeTable(table.id, tables, setTables)}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            ✕ Remove
          </button>
        )}
      </div>

      {/* Deck Status */}
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Cards remaining: {table.deck.length}
        </p>
        {table.deck.length === 0 && (
          <p style={{ color: '#ef4444', fontSize: '0.75rem' }}>No deck loaded!</p>
        )}
        {table.loadError && (
          <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            {table.loadError}
          </p>
        )}
        {table.isLoading && (
          <p style={{ color: '#3b82f6', fontSize: '0.75rem' }}>Loading deck...</p>
        )}
      </div>

      {/* Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <button
          onClick={() => loadDeckFromYaml(table.id, tables, setTables)}
          disabled={table.isLoading}
          style={{
            backgroundColor: table.isLoading ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: table.isLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          {table.isLoading ? 'Loading...' : 'YAML Deck'}
        </button>
        <button
          onClick={() => initializeStandardDeck(table.id, tables, setTables)}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Standard
        </button>
        <button
          onClick={() => drawRandomCard(table.id, tables, setTables)}
          disabled={table.deck.length === 0}
          style={{
            backgroundColor: table.deck.length === 0 ? '#9ca3af' : '#3b82f6',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: table.deck.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Draw Card
        </button>
        <button
          onClick={() => clearHand(table.id, tables, setTables)}
          style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Clear
        </button>
      </div>

      {/* Current Hand */}
      {table.drawnCards.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            Current Hand:
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.25rem',
            justifyContent: 'center'
          }}>
            {table.drawnCards.map((card, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace'
                }}
              >
                {formatCard(card)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Manual Input */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={table.input}
            onChange={(e) => updateTableInput(table.id, e.target.value, tables, setTables)}
            placeholder="A,H 3,C 4,D"
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              flex: '1',
              fontSize: '0.875rem'
            }}
          />
          <button
            onClick={() => handleCheck(table.id, tables, setTables)}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Check
          </button>
        </div>
      </div>

      {/* Result */}
      {table.result && (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: table.result.bust ? '#dc2626' : table.result.total === 21 ? '#d97706' : '#059669'
          }}>
            Total: {table.result.total}
          </div>
          {table.result.bust && (
            <div style={{ color: '#dc2626', fontWeight: '600', fontSize: '0.875rem' }}>
              BUST!
            </div>
          )}
          {table.result.total === 21 && table.drawnCards.length === 2 && (
            <div style={{ color: '#d97706', fontWeight: '600', fontSize: '0.875rem' }}>
              BLACKJACK! 🎉
            </div>
          )}
        </div>
      )}
    </div>
  );
};