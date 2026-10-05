package com.chemspace.app.data.api

import com.google.gson.annotations.SerializedName

// ─────────────────────────────────────────────────────────────
// AUTHENTICATION MODELS
// ─────────────────────────────────────────────────────────────

data class LoginRequest(
    @SerializedName("identifier") val identifier: String,
    @SerializedName("password") val password: String
)

data class RegisterRequest(
    @SerializedName("username") val username: String,
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class SendEmailOtpRequest(
    @SerializedName("email") val email: String
)

data class VerifyEmailOtpRequest(
    @SerializedName("email") val email: String,
    @SerializedName("otp") val otp: String
)

data class SendPhoneOtpRequest(
    @SerializedName("phone") val phone: String
)

data class VerifyPhoneOtpRequest(
    @SerializedName("phone") val phone: String,
    @SerializedName("otp") val otp: String
)

data class AuthResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("message") val message: String? = null,
    @SerializedName("token") val token: String? = null,
    @SerializedName("user") val user: UserDto? = null,
    @SerializedName("detail") val detail: String? = null
)

data class CheckEmailResponse(
    @SerializedName("exists") val exists: Boolean = false,
    @SerializedName("username") val username: String? = null
)

data class UserDto(
    @SerializedName("uid") val uid: String? = null,
    @SerializedName("username") val username: String? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("email") val email: String? = null,
    @SerializedName("workplace") val workplace: String? = null,
    @SerializedName("role") val role: String? = null,
    @SerializedName("avatar") val avatar: String? = null,
    @SerializedName("is_guest") val isGuest: Boolean = false
)

data class ServerHealthResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("version") val version: String? = null,
    @SerializedName("online") val online: Boolean = true
)

// ─────────────────────────────────────────────────────────────
// MOLECULAR CHEMISTRY MODELS
// ─────────────────────────────────────────────────────────────

data class ParseMoleculeRequest(
    @SerializedName("smiles") val smiles: String,
    @SerializedName("generate_3d") val generate3d: Boolean = true
)

data class ParseMoleculeResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("smiles") val smiles: String? = null,
    @SerializedName("canonical_smiles") val canonicalSmiles: String? = null,
    @SerializedName("formula") val formula: String? = null,
    @SerializedName("mol_weight") val molWeight: Double? = null,
    @SerializedName("num_atoms") val numAtoms: Int? = null,
    @SerializedName("num_bonds") val numBonds: Int? = null,
    @SerializedName("svg") val svg: String? = null,
    @SerializedName("sdf_3d") val sdf3d: String? = null,
    @SerializedName("atoms") val atoms: List<AtomDto>? = null,
    @SerializedName("bonds") val bonds: List<BondDto>? = null,
    @SerializedName("engine") val engine: String? = null
)

data class AtomDto(
    @SerializedName("element") val element: String,
    @SerializedName("x") val x: Double,
    @SerializedName("y") val y: Double,
    @SerializedName("z") val z: Double = 0.0,
    @SerializedName("charge") val charge: Int = 0
)

data class BondDto(
    @SerializedName("source") val source: Int,
    @SerializedName("target") val target: Int,
    @SerializedName("order") val order: Int = 1
)

data class CalculatePropertiesRequest(
    @SerializedName("smiles") val smiles: String
)

data class CalculatePropertiesResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("smiles") val smiles: String? = null,
    @SerializedName("formula") val formula: String? = null,
    @SerializedName("mol_weight") val molWeight: Double? = null,
    @SerializedName("logP") val logP: Double? = null,
    @SerializedName("tpsa") val tpsa: Double? = null,
    @SerializedName("hbd") val hbd: Int? = null,
    @SerializedName("hba") val hba: Int? = null,
    @SerializedName("rotatable_bonds") val rotatableBonds: Int? = null,
    @SerializedName("aromatic_rings") val aromaticRings: Int? = null,
    @SerializedName("heavy_atoms") val heavyAtoms: Int? = null,
    @SerializedName("qed") val qed: Double? = null,
    @SerializedName("lipinski_passed") val lipinskiPassed: Boolean? = null,
    @SerializedName("engine") val engine: String? = null
)

data class Conformer3DRequest(
    @SerializedName("smiles") val smiles: String
)

data class Conformer3DResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("smiles") val smiles: String? = null,
    @SerializedName("sdf") val sdf: String? = null,
    @SerializedName("pdb") val pdb: String? = null,
    @SerializedName("atoms") val atoms: List<AtomDto>? = null,
    @SerializedName("num_atoms") val numAtoms: Int? = null
)

data class StandardizeRequest(
    @SerializedName("smiles") val smiles: String,
    @SerializedName("strip_salts") val stripSalts: Boolean = true,
    @SerializedName("neutralize_charges") val neutralizeCharges: Boolean = true,
    @SerializedName("canonicalize_tautomers") val canonicalizeTautomers: Boolean = true
)

data class StandardizeResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("original_smiles") val originalSmiles: String? = null,
    @SerializedName("standardized_smiles") val standardizedSmiles: String? = null,
    @SerializedName("actions_applied") val actionsApplied: List<String>? = null
)

data class ResolveMoleculeRequest(
    @SerializedName("query") val query: String
)

data class ResolveMoleculeResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("query") val query: String? = null,
    @SerializedName("name") val name: String? = null,
    @SerializedName("smiles") val smiles: String? = null,
    @SerializedName("formula") val formula: String? = null,
    @SerializedName("mol_weight") val molWeight: Double? = null,
    @SerializedName("iupac") val iupac: String? = null,
    @SerializedName("cid") val cid: Long? = null,
    @SerializedName("source") val source: String? = null
)

data class SuggestMoleculesResponse(
    @SerializedName("suggestions") val suggestions: List<String>? = null
)

// ─────────────────────────────────────────────────────────────
// SEARCH MODELS
// ─────────────────────────────────────────────────────────────

data class SimilaritySearchRequest(
    @SerializedName("query_smiles") val querySmiles: String,
    @SerializedName("target_smiles_list") val targetSmilesList: List<String>,
    @SerializedName("threshold") val threshold: Double = 0.4
)

data class SimilarityHit(
    @SerializedName("smiles") val smiles: String,
    @SerializedName("name") val name: String? = null,
    @SerializedName("score") val score: Double
)

data class SimilaritySearchResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("query") val query: String? = null,
    @SerializedName("results") val results: List<SimilarityHit>? = null
)

data class SubstructureSearchRequest(
    @SerializedName("query_smarts") val querySmarts: String,
    @SerializedName("target_smiles_list") val targetSmilesList: List<String>
)

data class SubstructureHit(
    @SerializedName("smiles") val smiles: String,
    @SerializedName("matches") val matches: Boolean
)

data class SubstructureSearchResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("query_smarts") val querySmarts: String? = null,
    @SerializedName("results") val results: List<SubstructureHit>? = null
)

// ─────────────────────────────────────────────────────────────
// REACTION & RETROSYNTHESIS (IBM RXN)
// ─────────────────────────────────────────────────────────────

data class ReactionPredictRequest(
    @SerializedName("reactants_smiles") val reactantsSmiles: String,
    @SerializedName("reagents") val reagents: String? = null,
    @SerializedName("solvent") val solvent: String? = "DCM",
    @SerializedName("temperature") val temperature: String? = "25°C"
)

data class ReactionProduct(
    @SerializedName("name") val name: String? = null,
    @SerializedName("smiles") val smiles: String? = null,
    @SerializedName("formula") val formula: String? = null,
    @SerializedName("confidence_score") val confidenceScore: Double? = null,
    @SerializedName("predicted_yield") val predictedYield: String? = null,
    @SerializedName("byproducts") val byproducts: List<String>? = null
)

data class ReactionPredictResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("reactants") val reactants: String? = null,
    @SerializedName("reagents") val reagents: String? = null,
    @SerializedName("predicted_product") val predictedProduct: ReactionProduct? = null,
    @SerializedName("reaction_class") val reactionClass: String? = null,
    @SerializedName("mechanism_steps") val mechanismSteps: List<String>? = null
)

data class RetrosynthesisRequest(
    @SerializedName("target_smiles") val targetSmiles: String,
    @SerializedName("max_steps") val maxSteps: Int = 3
)

data class RetroStep(
    @SerializedName("step_number") val stepNumber: Int,
    @SerializedName("reaction") val reaction: String,
    @SerializedName("precursors") val precursors: List<String>,
    @SerializedName("reagents") val reagents: String? = null,
    @SerializedName("yield") val yield: String? = null
)

data class RetroRoute(
    @SerializedName("route_id") val routeId: Int,
    @SerializedName("confidence_score") val confidenceScore: Double,
    @SerializedName("overall_yield") val overallYield: String? = null,
    @SerializedName("steps") val steps: List<RetroStep>
)

data class RetrosynthesisResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("target_smiles") val targetSmiles: String? = null,
    @SerializedName("routes") val routes: List<RetroRoute>? = null
)

// ─────────────────────────────────────────────────────────────
// QUANTUM CHEMISTRY
// ─────────────────────────────────────────────────────────────

data class QuantumCalcRequest(
    @SerializedName("smiles") val smiles: String? = null,
    @SerializedName("geometry_xyz") val geometryXyz: String? = null,
    @SerializedName("method") val method: String = "DFT (B3LYP)",
    @SerializedName("basis_set") val basisSet: String = "6-31G(d)",
    @SerializedName("solvent_model") val solventModel: String? = "Gas Phase"
)

data class DipoleMomentDto(
    @SerializedName("dx") val dx: Double = 0.0,
    @SerializedName("dy") val dy: Double = 0.0,
    @SerializedName("dz") val dz: Double = 0.0,
    @SerializedName("total_debye") val totalDebye: Double = 0.0
)

data class MolecularOrbitalsDto(
    @SerializedName("homo_energy") val homoEnergy: Double = 0.0,
    @SerializedName("lumo_energy") val lumoEnergy: Double = 0.0,
    @SerializedName("energy_gap_ev") val energyGapEv: Double = 0.0,
    @SerializedName("chemical_hardness") val chemicalHardness: Double = 0.0,
    @SerializedName("electronegativity") val electronegativity: Double = 0.0,
    @SerializedName("electrophilicity_index") val electrophilicityIndex: Double = 0.0
)

data class VibrationalModeDto(
    @SerializedName("mode") val mode: Int,
    @SerializedName("frequency") val frequency: Double,
    @SerializedName("intensity") val intensity: Double,
    @SerializedName("symmetry") val symmetry: String? = null
)

data class QuantumCalcResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("method") val method: String? = null,
    @SerializedName("basis_set") val basisSet: String? = null,
    @SerializedName("total_energy_hartree") val totalEnergyHartree: Double? = null,
    @SerializedName("total_energy_kcal_mol") val totalEnergyKcalMol: Double? = null,
    @SerializedName("zero_point_energy") val zeroPointEnergy: String? = null,
    @SerializedName("dipole_moment") val dipoleMoment: DipoleMomentDto? = null,
    @SerializedName("molecular_orbitals") val molecularOrbitals: MolecularOrbitalsDto? = null,
    @SerializedName("vibrational_frequencies") val vibrationalFrequencies: List<VibrationalModeDto>? = null
)

// ─────────────────────────────────────────────────────────────
// SPECTROSCOPY SUITE
// ─────────────────────────────────────────────────────────────

data class SpectroscopyPredictRequest(
    @SerializedName("smiles") val smiles: String,
    @SerializedName("modalities") val modalities: List<String> = listOf("ir", "uv", "nmr", "ms")
)

data class SpectrumPeak(
    @SerializedName("x") val x: Double,
    @SerializedName("y") val y: Double,
    @SerializedName("assignment") val assignment: String? = null,
    @SerializedName("intensity") val intensity: String? = null
)

data class SpectrumDataset(
    @SerializedName("technique") val technique: String,
    @SerializedName("x_label") val xLabel: String,
    @SerializedName("y_label") val yLabel: String,
    @SerializedName("x_range") val xRange: List<Double>? = null,
    @SerializedName("curve_points") val curvePoints: List<List<Double>>? = null,
    @SerializedName("peaks") val peaks: List<SpectrumPeak>? = null
)

data class SpectroscopyPredictResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("smiles") val smiles: String? = null,
    @SerializedName("formula") val formula: String? = null,
    @SerializedName("molecular_weight") val molecularWeight: Double? = null,
    @SerializedName("spectra") val spectra: Map<String, SpectrumDataset>? = null
)

// ─────────────────────────────────────────────────────────────
// RDKIT PYTHON EXECUTION
// ─────────────────────────────────────────────────────────────

data class RdkitExecuteRequest(
    @SerializedName("code") val code: String,
    @SerializedName("session_id") val sessionId: String? = null,
    @SerializedName("cell_id") val cellId: String? = null
)

data class RdkitExecuteResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("stdout") val stdout: String? = null,
    @SerializedName("stderr") val stderr: String? = null,
    @SerializedName("images") val images: List<String>? = null, // base64 images
    @SerializedName("execution_time") val executionTime: Double? = null
)

// ─────────────────────────────────────────────────────────────
// AI CHAT (ChemNova)
// ─────────────────────────────────────────────────────────────

data class AIChatRequest(
    @SerializedName("query") val query: String,
    @SerializedName("system_prompt") val systemPrompt: String? = null,
    @SerializedName("conversation_id") val conversationId: String? = null,
    @SerializedName("language") val language: String = "en"
)

data class AIChatResponse(
    @SerializedName("status") val status: String? = null,
    @SerializedName("provider") val provider: String? = null,
    @SerializedName("model") val model: String? = null,
    @SerializedName("query") val query: String? = null,
    @SerializedName("response") val response: String? = null,
    @SerializedName("responseText") val responseText: String? = null,
    @SerializedName("intent") val intent: String? = null,
    @SerializedName("confidence") val confidence: Double? = null,
    @SerializedName("tool_used") val toolUsed: Boolean = false,
    @SerializedName("tools") val tools: List<String>? = null,
    @SerializedName("citations") val citations: List<String>? = null,
    @SerializedName("timestamp") val timestamp: String? = null
)

// ─────────────────────────────────────────────────────────────
// WORKSPACE & HISTORY
// ─────────────────────────────────────────────────────────────

data class WorkspaceHistoryItem(
    @SerializedName("id") val id: String,
    @SerializedName("category") val category: String,
    @SerializedName("title") val title: String,
    @SerializedName("smiles") val smiles: String? = null,
    @SerializedName("module") val module: String,
    @SerializedName("detail") val detail: String? = null,
    @SerializedName("created_at") val createdAt: Double
)

data class WorkspaceStatsResponse(
    @SerializedName("total_analyses") val totalAnalyses: Int = 0,
    @SerializedName("molecules_explored") val moleculesExplored: Int = 0,
    @SerializedName("quantum_runs") val quantumRuns: Int = 0,
    @SerializedName("reactions_predicted") val reactionsPredicted: Int = 0
)

data class UserPreferencesDto(
    @SerializedName("theme") val theme: String = "dark",
    @SerializedName("language") val language: String = "en",
    @SerializedName("voice_enabled") val voiceEnabled: Boolean = true,
    @SerializedName("ai_response_mode") val aiResponseMode: String = "balanced"
)
