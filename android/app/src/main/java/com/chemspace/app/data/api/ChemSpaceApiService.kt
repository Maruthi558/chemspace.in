package com.chemspace.app.data.api

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ChemSpaceApiService {

    @POST("api/auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<AuthResponse>

    @POST("api/auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<AuthResponse>

    @POST("api/ai/chat")
    suspend fun sendChatMessage(
        @Body request: AIChatRequest
    ): Response<AIChatResponse>

    @POST("api/molecule/resolve")
    suspend fun resolveMolecule(
        @Body request: MoleculeResolveRequest
    ): Response<MoleculeResolveResponse>

    @GET("api/health")
    suspend fun checkHealth(): Response<HealthResponse>
}
