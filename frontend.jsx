// App.js
import React, { useState } from 'react';
import SequenceUpload from './components/SequenceUpload';
import SNPVisualization from './components/SNPVisualization';

function App() {
  const [snpData, setSNPData] = useState(null);

  return (
    <div className="App">
      <h1>SNP Identification and Visualization Tool</h1>
      <SequenceUpload setSNPData={setSNPData} />
      {snpData && <SNPVisualization data={snpData} />}
    </div>
  );
}

export default App;

// components/SequenceUpload.js
import React from 'react';
import axios from 'axios';

function SequenceUpload({ setSNPData }) {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSNPData(response.data);
    } catch (error) {
      console.error('Error uploading sequences:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} accept=".fasta,.fa" />
    </div>
  );
}

export default SequenceUpload;

// components/SNPVisualization.js
import React from 'react';
import Plot from 'react-plotly.js';

function SNPVisualization({ data }) {
  const { snps } = data;

  const positions = snps.map(snp => snp.position);
  const variants = snps.map(snp => Object.keys(snp.variants).join('/'));
  const frequencies = snps.map(snp => {
    const total = Object.values(snp.variants).reduce((a, b) => a + b, 0);
    return Object.values(snp.variants).map(count => count / total);
  });

  const traces = ['A', 'C', 'G', 'T'].map(nucleotide => ({
    x: positions,
    y: frequencies.map(freq => freq[['A', 'C', 'G', 'T'].indexOf(nucleotide)] || 0),
    type: 'bar',
    name: nucleotide,
  }));

  return (
    <div>
      <h2>SNP Visualization</h2>
      <Plot
        data={traces}
        layout={{
          barmode: 'stack',
          title: 'SNP Frequencies',
          xaxis: { title: 'Position' },
          yaxis: { title: 'Frequency' },
        }}
      />
      <h3>SNP Details:</h3>
      <ul>
        {snps.map((snp, index) => (
          <li key={index}>
            Position {snp.position}: {Object.entries(snp.variants).map(([base, count]) => `${base}:${count}`).join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SNPVisualization;
