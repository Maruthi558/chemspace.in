package com.chemspace.app.data.api

import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface ChemSpaceApiService {

    // --- HEALTH ---
    @GET("health")
    suspend fun getHealth(): Response<ServerHealthResponse>

    @GET("api/health")
    suspend fun getApiHealth(): Response<ServerHealthResponse>

    // --- AUTHENTICATION ---
    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequest): Response<AuthResponse>

    @POST("api/auth/register")
    suspend fun register(@Body body: RegisterRequest): Response<AuthResponse>

    @GET("api/auth/check-email")
    suspend fun checkEmail(@Query("email") email: String): Response<CheckEmailResponse>

    @POST("api/auth/otp/send-email")
    suspend fun sendEmailOtp(@Body body: SendEmailOtpRequest): Response<AuthResponse>

    @POST("api/auth/otp/verify-email")
    suspend fun verifyEmailOtp(@Body body: VerifyEmailOtpRequest): Response<AuthResponse>

    @POST("api/auth/otp/send-phone")
    suspend fun sendPhoneOtp(@Body body: SendPhoneOtpRequest): Response<AuthResponse>

    @POST("api/auth/otp/verify-phone")
    suspend fun verifyPhoneOtp(@Body body: VerifyPhoneOtpRequest): Response<AuthResponse>

    // --- MOLECULE RESOLUTION & PREVIEW ---
    @GET("api/molecule/resolve")
    suspend fun resolveMoleculeGet(@Query("query") query: String): Response<ResolveMoleculeResponse>

    @POST("api/molecule/resolve")
    suspend fun resolveMoleculePost(@Body body: ResolveMoleculeRequest): Response<ResolveMoleculeResponse>

    @GET("api/molecule/suggest")
    suspend fun suggestMolecules(@Query("query") query: String): Response<SuggestMoleculesResponse>

    @GET("api/molecule/2d")
    suspend fun getMolecule2dSvg(
        @Query("smiles") smiles: String,
        @Query("width") width: Int = 400,
        @Query("height") height: Int = 400
    ): Response<ResponseBody>

    @POST("api/molecule/parse")
    suspend fun parseMolecule(@Body body: ParseMoleculeRequest): Response<ParseMoleculeResponse>

    @POST("api/molecule/properties")
    suspend fun calculateProperties(@Body body: CalculatePropertiesRequest): Response<CalculatePropertiesResponse>

    @POST("api/molecule/3d")
    suspend fun generate3DConformer(@Body body: Conformer3DRequest): Response<Conformer3DResponse>

    @POST("api/molecule/standardize")
    suspend fun standardizeMolecule(@Body body: StandardizeRequest): Response<StandardizeResponse>

    // --- SEARCH ---
    @POST("api/search/similarity")
    suspend fun similaritySearch(@Body body: SimilaritySearchRequest): Response<SimilaritySearchResponse>

    @POST("api/search/substructure")
    suspend fun substructureSearch(@Body body: SubstructureSearchRequest): Response<SubstructureSearchResponse>

    // --- REACTION & RETROSYNTHESIS ---
    @POST("api/reaction/predict")
    suspend fun predictReaction(@Body body: ReactionPredictRequest): Response<ReactionPredictResponse>

    @POST("api/reaction/retrosynthesis")
    suspend fun predictRetrosynthesis(@Body body: RetrosynthesisRequest): Response<RetrosynthesisResponse>

    // --- QUANTUM ENGINE ---
    @POST("api/quantum/calculate")
    suspend fun calculateQuantum(@Body body: QuantumCalcRequest): Response<QuantumCalcResponse>

    // --- SPECTROSCOPY ---
    @POST("api/spectroscopy/predict")
    suspend fun predictSpectroscopy(@Body body: SpectroscopyPredictRequest): Response<SpectroscopyPredictResponse>

    // --- RDKIT PYTHON EXECUTION ---
    @POST("api/rdkit/execute")
    suspend fun executeRdkitCode(@Body body: RdkitExecuteRequest): Response<RdkitExecuteResponse>

    // --- AI CHATBOT (ChemNova) ---
    @POST("api/ai/chat")
    suspend fun sendAiChat(@Body body: AIChatRequest): Response<AIChatResponse>

    // --- WORKSPACE & HISTORY ---
    @GET("api/workspace/history")
    suspend fun getWorkspaceHistory(): Response<List<WorkspaceHistoryItem>>

    @POST("api/workspace/history")
    suspend fun saveWorkspaceHistoryItem(@Body item: WorkspaceHistoryItem): Response<Unit>

    @DELETE("api/workspace/history/{itemId}")
    suspend fun deleteWorkspaceHistoryItem(@Path("itemId") itemId: String): Response<Unit>

    @DELETE("api/workspace/history")
    suspend fun clearWorkspaceHistory(): Response<Unit>

    @GET("api/workspace/stats")
    suspend fun getWorkspaceStats(): Response<WorkspaceStatsResponse>

    @GET("api/workspace/preferences")
    suspend fun getUserPreferences(): Response<UserPreferencesDto>

    @PUT("api/workspace/preferences")
    suspend fun updateUserPreferences(@Body prefs: UserPreferencesDto): Response<UserPreferencesDto>
}
