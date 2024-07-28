from flask import Flask, request, jsonify
from flask_cors import CORS
from Bio import SeqIO
from Bio.Seq import Seq
from collections import Counter
import io

app = Flask(__name__)
CORS(app)

def find_snps(sequences):
    # Assuming all sequences are of the same length
    seq_length = len(sequences[0])
    snps = []
    
    for i in range(seq_length):
        nucleotides = [seq[i] for seq in sequences]
        count = Counter(nucleotides)
        if len(count) > 1:
            snps.append({
                'position': i,
                'variants': dict(count)
            })
    
    return snps

@app.route('/upload', methods=['POST'])
def upload_sequences():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        sequences = []
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        for record in SeqIO.parse(stream, "fasta"):
            sequences.append(str(record.seq))
        
        snps = find_snps(sequences)
        
        return jsonify({
            'sequences': sequences,
            'snps': snps
        })

if __name__ == '__main__':
    app.run(debug=True)
