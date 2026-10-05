package com.chemspace.app.data.repository

import com.chemspace.app.data.api.CalculatePropertiesRequest
import com.chemspace.app.data.api.CalculatePropertiesResponse
import com.chemspace.app.data.api.ChemSpaceApiService
import com.chemspace.app.data.api.Conformer3DRequest
import com.chemspace.app.data.api.Conformer3DResponse
import com.chemspace.app.data.api.ParseMoleculeRequest
import com.chemspace.app.data.api.ParseMoleculeResponse
import com.chemspace.app.data.api.ResolveMoleculeRequest
import com.chemspace.app.data.api.ResolveMoleculeResponse
import com.chemspace.app.data.api.SimilaritySearchRequest
import com.chemspace.app.data.api.SimilaritySearchResponse
import com.chemspace.app.data.api.StandardizeRequest
import com.chemspace.app.data.api.StandardizeResponse
import com.chemspace.app.data.api.SubstructureSearchRequest
import com.chemspace.app.data.api.SubstructureSearchResponse
import com.chemspace.app.data.api.SuggestMoleculesResponse
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ChemistryRepository(
    private val api: ChemSpaceApiService
) {
    suspend fun resolveMolecule(query: String): Result<ResolveMoleculeResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.resolveMoleculeGet(query.trim())
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val postResponse = api.resolveMoleculePost(ResolveMoleculeRequest(query.trim()))
                if (postResponse.isSuccessful && postResponse.body() != null) {
                    Result.success(postResponse.body()!!)
                } else {
                    Result.failure(Exception("Could not resolve molecule '$query'"))
                }
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun suggestMolecules(query: String): Result<SuggestMoleculesResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.suggestMolecules(query.trim())
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.success(SuggestMoleculesResponse(emptyList()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun parseMolecule(smiles: String): Result<ParseMoleculeResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.parseMolecule(ParseMoleculeRequest(smiles.trim()))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Unable to parse molecular SMILES"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun calculateProperties(smiles: String): Result<CalculatePropertiesResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.calculateProperties(CalculatePropertiesRequest(smiles.trim()))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Property calculation failed for SMILES"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun generate3DConformer(smiles: String): Result<Conformer3DResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.generate3DConformer(Conformer3DRequest(smiles.trim()))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("3D conformer generation failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun standardizeMolecule(smiles: String): Result<StandardizeResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.standardizeMolecule(StandardizeRequest(smiles.trim()))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Standardization failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun similaritySearch(
        querySmiles: String,
        targetList: List<String>,
        threshold: Double = 0.4
    ): Result<SimilaritySearchResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.similaritySearch(SimilaritySearchRequest(querySmiles.trim(), targetList, threshold))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Similarity search failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun substructureSearch(
        querySmarts: String,
        targetList: List<String>
    ): Result<SubstructureSearchResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.substructureSearch(SubstructureSearchRequest(querySmarts.trim(), targetList))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Substructure search failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
