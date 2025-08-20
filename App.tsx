// App.tsx - Multi-table blackjack application
import { useState } from 'react';
import type { Table } from './utils/types';
import { TableComponent } from './utils//TableComponent';
import { createNewTable } from './utils/tableFunctions';

export default function App() {
  const [tables, setTables] = useState<Table[]>([
    createNewTable('table-1', 'Table 1')
  ]);

  const addNewTable = () => {
    const newTableId = `table-${tables.length + 1}`;
    const newTableName = `Table ${tables.length + 1}`;
    const newTable = createNewTable(newTableId, newTableName);
    //newTable.Dealerdeck = createStandardDeck();
    setTables([...tables, newTable]);
  };

  const resetAllTables = () => {
    setTables([createNewTable('table-1', 'Table 1')]);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '1.5rem'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          Multi-Table Blackjack
        </h1>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={addNewTable}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            + Add New Table
          </button>
          
          <button
            onClick={resetAllTables}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            Reset All Tables
          </button>
          
          <div style={{
            backgroundColor: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: '2px solid #e5e7eb',
            color: '#374151',
            fontWeight: '600'
          }}>
            Active Tables: {tables.length}
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {tables.map(table => (
          <TableComponent
            key={table.id}
            table={table}
            tables={tables}
            setTables={setTables}
            canRemove={tables.length > 1}
          />
        ))}
      </div>

      {/* Instructions */}
      {tables.length === 1 && (
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          maxWidth: '600px',
          margin: '2rem auto 0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>
            🎰 Welcome to Multi-Table Blackjack!
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Each table has its own independent deck. Click "Add New Table" to create 
            additional tables for multiple games or different deck configurations.
          </p>
        </div>
      )}
    </div>
  );
}