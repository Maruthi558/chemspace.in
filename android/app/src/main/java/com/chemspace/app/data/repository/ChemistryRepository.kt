package com.chemspace.app.data.repository

import com.chemspace.app.data.api.ApiClient
import com.chemspace.app.data.api.ChemSpaceApiService
import com.chemspace.app.data.api.MoleculeResolveRequest
import com.chemspace.app.domain.model.Molecule

class ChemistryRepository(
    private val apiService: ChemSpaceApiService = ApiClient.apiService
) {

    // Built-in curated scientific database of essential molecules for offline/zero-latency calculations
    private val curatedMolecules = mapOf(
        "aspirin" to Molecule(
            name = "Aspirin",
            iupac = "2-acetyloxybenzoic acid",
            formula = "C9H8O4",
            smiles = "CC(=O)Oc1ccccc1C(=O)O",
            molecularWeight = 180.16,
            description = "Nonsteroidal anti-inflammatory drug (NSAID) used to relieve pain, fever, and inflammation, and as an antithrombotic.",
            cas = "50-78-2"
        ),
        "caffeine" to Molecule(
            name = "Caffeine",
            iupac = "1,3,7-trimethylpurine-2,6-dione",
            formula = "C8H10N4O2",
            smiles = "Cn1cnc2c1c(=O)n(c(=O)n2C)C",
            molecularWeight = 194.19,
            description = "Central nervous system stimulant of the methylxanthine class, acting as a competitive adenosine receptor antagonist.",
            cas = "58-08-2"
        ),
        "paracetamol" to Molecule(
            name = "Paracetamol (Acetaminophen)",
            iupac = "N-(4-hydroxyphenyl)acetamide",
            formula = "C8H9NO2",
            smiles = "CC(=O)Nc1ccc(O)cc1",
            molecularWeight = 151.16,
            description = "Analgesic and antipyretic medication used to treat mild to moderate pain and reduce fever.",
            cas = "103-90-2"
        ),
        "benzene" to Molecule(
            name = "Benzene",
            iupac = "benzene",
            formula = "C6H6",
            smiles = "c1ccccc1",
            molecularWeight = 78.11,
            description = "Archetypal aromatic hydrocarbon with continuous cyclic pi-electron delocalization.",
            cas = "71-43-2"
        ),
        "ethanol" to Molecule(
            name = "Ethanol",
            iupac = "ethanol",
            formula = "C2H6O",
            smiles = "CCO",
            molecularWeight = 46.07,
            description = "Simple primary alcohol, renewable solvent, psychoactive recreational substance, and clean fuel precursor.",
            cas = "64-17-5"
        ),
        "glucose" to Molecule(
            name = "D-Glucose",
            iupac = "(2R,3S,4R,5R)-2,3,4,5,6-pentahydroxyhexanal",
            formula = "C6H12O6",
            smiles = "OC[C@@H](O)[C@@H](O)[C@H](O)[C@@H](O)C=O",
            molecularWeight = 180.16,
            description = "Primary sub-cellular energy source in cellular respiration and photosynthetic carbohydrate synthesis.",
            cas = "50-99-7"
        ),
        "ibuprofen" to Molecule(
            name = "Ibuprofen",
            iupac = "2-[4-(2-methylpropyl)phenyl]propanoic acid",
            formula = "C13H18O2",
            smiles = "CC(C)Cc1ccc(cc1)C(C)C(=O)O",
            molecularWeight = 206.28,
            description = "Widely utilized nonsteroidal anti-inflammatory drug inhibiting COX-1 and COX-2 enzymes.",
            cas = "15687-27-1"
        )
    )

    suspend fun resolveMolecule(query: String): Result<Molecule> {
        val trimmed = query.trim()
        if (trimmed.isEmpty()) {
            return Result.failure(IllegalArgumentException("Search query cannot be empty."))
        }

        // Check local curated database first for zero-latency instant match
        val localMatch = curatedMolecules[trimmed.lowercase()]
        if (localMatch != null) {
            return Result.success(localMatch)
        }

        return try {
            val response = apiService.resolveMolecule(MoleculeResolveRequest(query = trimmed))
            if (response.isSuccessful && response.body()?.success == true) {
                val body = response.body()!!
                Result.success(
                    Molecule(
                        name = body.name ?: trimmed.replaceFirstChar { it.uppercase() },
                        iupac = body.iupac ?: body.name ?: trimmed,
                        formula = body.formula ?: "Unknown",
                        smiles = body.smiles ?: trimmed,
                        molecularWeight = body.mw ?: 0.0,
                        description = "Resolved via ChemSpace CIR & PubChem Gateway (${body.source ?: "Cloud"})"
                    )
                )
            } else {
                // If API returns failure or molecule not found, check partial name matches locally
                val partial = curatedMolecules.entries.find { it.key.contains(trimmed.lowercase()) }?.value
                if (partial != null) {
                    Result.success(partial)
                } else {
                    Result.failure(Exception(response.body()?.error ?: "Molecule '$trimmed' could not be resolved."))
                }
            }
        } catch (e: Exception) {
            // Offline fallback
            val partial = curatedMolecules.entries.find { it.key.contains(trimmed.lowercase()) }?.value
            if (partial != null) {
                Result.success(partial)
            } else {
                Result.failure(Exception("Unable to contact ChemSpace molecule server. Ensure internet connection."))
            }
        }
    }

    fun getCuratedMolecules(): List<Molecule> = curatedMolecules.values.toList()
}
