package com.chemspace.app.data.repository

import com.chemspace.app.data.api.AuthResponse
import com.chemspace.app.data.api.CheckEmailResponse
import com.chemspace.app.data.api.ChemSpaceApiService
import com.chemspace.app.data.api.LoginRequest
import com.chemspace.app.data.api.RegisterRequest
import com.chemspace.app.data.api.SendEmailOtpRequest
import com.chemspace.app.data.api.SendPhoneOtpRequest
import com.chemspace.app.data.api.UserDto
import com.chemspace.app.data.api.VerifyEmailOtpRequest
import com.chemspace.app.data.api.VerifyPhoneOtpRequest
import com.chemspace.app.data.local.PreferencesDataStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext

class AuthRepository(
    private val api: ChemSpaceApiService,
    private val preferencesDataStore: PreferencesDataStore
) {
    val currentUserFlow: Flow<UserDto?> = preferencesDataStore.currentUserFlow
    val authTokenFlow: Flow<String?> = preferencesDataStore.authTokenFlow

    suspend fun checkServerOnline(): Boolean = withContext(Dispatchers.IO) {
        try {
            val response = api.getHealth()
            response.isSuccessful
        } catch (e: Exception) {
            try {
                val apiHealth = api.getApiHealth()
                apiHealth.isSuccessful
            } catch (ex: Exception) {
                false
            }
        }
    }

    suspend fun login(identifier: String, password: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.login(LoginRequest(identifier.trim(), password))
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                if (body.token != null || body.user != null) {
                    val user = body.user ?: UserDto(
                        uid = "user_${System.currentTimeMillis()}",
                        username = identifier,
                        name = identifier.substringBefore("@"),
                        email = if (identifier.contains("@")) identifier else "$identifier@chemspace.local"
                    )
                    preferencesDataStore.saveAuthSession(body.token ?: "local_token_${System.currentTimeMillis()}", user)
                    Result.success(body)
                } else {
                    Result.failure(Exception(body.message ?: body.detail ?: "Invalid credentials"))
                }
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Login failed with status ${response.code()}"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(username: String, email: String, password: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.register(RegisterRequest(username.trim(), email.trim(), password))
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                val user = body.user ?: UserDto(
                    uid = "user_${System.currentTimeMillis()}",
                    username = username,
                    name = username,
                    email = email
                )
                preferencesDataStore.saveAuthSession(body.token ?: "local_token_${System.currentTimeMillis()}", user)
                Result.success(body)
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Registration failed with status ${response.code()}"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun checkEmail(email: String): Result<CheckEmailResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.checkEmail(email.trim())
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.success(CheckEmailResponse(exists = false))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun sendEmailOtp(email: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.sendEmailOtp(SendEmailOtpRequest(email.trim()))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Failed to dispatch verification email"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyEmailOtp(email: String, otp: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.verifyEmailOtp(VerifyEmailOtpRequest(email.trim(), otp.trim()))
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                val user = body.user ?: UserDto(
                    uid = "user_${System.currentTimeMillis()}",
                    username = email.substringBefore("@"),
                    name = email.substringBefore("@"),
                    email = email
                )
                preferencesDataStore.saveAuthSession(body.token ?: "otp_token_${System.currentTimeMillis()}", user)
                Result.success(body)
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Invalid verification code"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun sendPhoneOtp(phone: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.sendPhoneOtp(SendPhoneOtpRequest(phone.trim()))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Failed to send SMS code"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyPhoneOtp(phone: String, otp: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val response = api.verifyPhoneOtp(VerifyPhoneOtpRequest(phone.trim(), otp.trim()))
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                val user = body.user ?: UserDto(
                    uid = "phone_user_${System.currentTimeMillis()}",
                    username = phone,
                    name = "Scientist ($phone)",
                    email = "$phone@mobile.chemspace.local"
                )
                preferencesDataStore.saveAuthSession(body.token ?: "phone_token_${System.currentTimeMillis()}", user)
                Result.success(body)
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Invalid SMS verification code"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun handleGoogleSignIn(
        idToken: String,
        email: String?,
        displayName: String?,
        photoUrl: String?
    ): Result<UserDto> = withContext(Dispatchers.IO) {
        try {
            val cleanEmail = email ?: "google_user_${System.currentTimeMillis()}@chemspace.local"
            val cleanName = displayName ?: cleanEmail.substringBefore("@")
            val user = UserDto(
                uid = "google_${idToken.take(16)}",
                username = cleanEmail.substringBefore("@"),
                name = cleanName,
                email = cleanEmail,
                workplace = "ChemSpace Google Research Team",
                role = "Lead Research Chemist",
                avatar = photoUrl ?: "",
                isGuest = false
            )
            preferencesDataStore.saveAuthSession("google_auth_$idToken", user)
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun continueAsGuest(): UserDto = withContext(Dispatchers.IO) {
        val guest = UserDto(
            uid = "guest_${System.currentTimeMillis()}",
            username = "guest_researcher",
            name = "Guest Scientist",
            email = "guest@chemspace.local",
            workplace = "ChemSpace Open Laboratory",
            role = "Guest Researcher",
            isGuest = true
        )
        preferencesDataStore.saveAuthSession("guest_token_${System.currentTimeMillis()}", guest)
        guest
    }

    suspend fun logout() = withContext(Dispatchers.IO) {
        preferencesDataStore.clearSession()
    }
}
