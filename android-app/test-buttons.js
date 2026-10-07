// Test Suite for ChemSpace Android App API Service Layer & Button Actions
const API_BASE = 'http://127.0.0.1:8000';

async function testEndpoint(name, path, options = {}) {
  const url = `${API_BASE}${path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const elapsed = Date.now() - start;
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`[PASS] ${name} (${elapsed}ms) - Status: ${res.status}`);
      return { ok: true, name, elapsed, data };
    } else {
      console.error(`[FAIL] ${name} (${elapsed}ms) - Status: ${res.status}`, data);
      return { ok: false, name, elapsed, error: data };
    }
  } catch (err) {
    const elapsed = Date.now() - start;
    console.error(`[FAIL] ${name} (${elapsed}ms) - Error: ${err.message}`);
    return { ok: false, name, elapsed, error: err.message };
  }
}

async function runAllButtonTests() {
  console.log('=================================================================');
  console.log('CHEMSPACE ANDROID APP - REAL API BUTTON INTEGRATION TEST SUITE');
  console.log('=================================================================\n');

  const results = [];

  // Button 1: Live Server Health
  results.push(await testEndpoint(
    'Button: Refresh Health / Launch Check (/api/health)',
    '/api/health'
  ));

  // Button 2: Search Compound / Resolver
  results.push(await testEndpoint(
    'Button: Search Compound / Query Backend Resolver (/api/molecule/resolve)',
    '/api/molecule/resolve?query=Aspirin'
  ));

  // Button 3: Specimen Tap / Calculate Molecular Properties
  results.push(await testEndpoint(
    'Button: Calculate Molecular Properties (/api/molecule/properties)',
    '/api/molecule/properties',
    {
      method: 'POST',
      body: JSON.stringify({ smiles: 'CC(=O)Oc1ccccc1C(=O)O', generate_3d: true })
    }
  ));

  // Button 4: Predict Reaction Products
  results.push(await testEndpoint(
    'Button: Predict Reaction Products (/api/reaction/predict)',
    '/api/reaction/predict',
    {
      method: 'POST',
      body: JSON.stringify({
        reactants_smiles: 'CCO.CC(=O)O',
        reagents: 'H2SO4 catalyst',
        temperature: '25°C',
        solvent: 'DCM'
      })
    }
  ));

  // Button 5: Compute Retrosynthesis
  results.push(await testEndpoint(
    'Button: Compute Retrosynthesis (/api/reaction/retrosynthesis)',
    '/api/reaction/retrosynthesis',
    {
      method: 'POST',
      body: JSON.stringify({
        target_smiles: 'CC(=O)Oc1ccccc1C(=O)O',
        max_steps: 3
      })
    }
  ));

  // Button 6: Compute Quantum DFT
  results.push(await testEndpoint(
    'Button: Compute Quantum DFT (/api/quantum/calculate)',
    '/api/quantum/calculate',
    {
      method: 'POST',
      body: JSON.stringify({
        smiles: 'c1ccccc1',
        method: 'DFT (B3LYP)',
        basis_set: '6-31G(d)'
      })
    }
  ));

  // Button 7: Predict Analytical Spectra
  results.push(await testEndpoint(
    'Button: Predict Analytical Spectra (/api/spectroscopy/predict)',
    '/api/spectroscopy/predict',
    {
      method: 'POST',
      body: JSON.stringify({
        smiles: 'CC(=O)Oc1ccccc1C(=O)O',
        modalities: ['ms', 'ir', 'nmr', 'uv']
      })
    }
  ));

  // Button 8: Query Chemistry in Backend (Scientists / PubChem)
  results.push(await testEndpoint(
    'Button: Query Chemistry in Backend (/api/ai/pubchem)',
    '/api/ai/pubchem?query=Benzene'
  ));

  // Button 9: Save to My Workspace
  results.push(await testEndpoint(
    'Button: Save to My Workspace (/api/workspace/history)',
    '/api/workspace/history',
    {
      method: 'POST',
      headers: {
        Authorization: 'Bearer scientist_session_dev_user'
      },
      body: JSON.stringify({
        category: 'molecules',
        title: 'Aspirin Analytics Mobile',
        smiles: 'CC(=O)Oc1ccccc1C(=O)O',
        module: 'AndroidApp',
        detail: 'MW: 180.16 g/mol, Formula: C9H8O4'
      })
    }
  ));

  console.log('\n=================================================================');
  console.log('SUMMARY OF BUTTON INTEGRATION RESULTS:');
  const passed = results.filter(r => r.ok).length;
  console.log(`Passed: ${passed}/${results.length} (${((passed/results.length)*100).toFixed(0)}%)`);
  console.log('=================================================================');
}

runAllButtonTests();
