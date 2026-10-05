package com.chemspace.app.data.api

import android.content.Context
import com.chemspace.app.BuildConfig
import com.chemspace.app.data.local.PreferencesDataStore
import kotlinx.coroutines.runBlocking
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

class DynamicHostInterceptor(private val preferencesDataStore: PreferencesDataStore) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        var request = chain.request()
        val currentBase = runBlocking { preferencesDataStore.getBaseUrlSync() }
        val parsed = currentBase.toHttpUrlOrNull()

        if (parsed != null) {
            val newUrl = request.url.newBuilder()
                .scheme(parsed.scheme)
                .host(parsed.host)
                .port(parsed.port)
                .build()
            request = request.newBuilder().url(newUrl).build()
        }

        return chain.proceed(request)
    }
}

object ApiClient {
    @Volatile
    private var apiService: ChemSpaceApiService? = null

    fun getService(context: Context, preferencesDataStore: PreferencesDataStore): ChemSpaceApiService {
        return apiService ?: synchronized(this) {
            apiService ?: buildService(context, preferencesDataStore).also { apiService = it }
        }
    }

    private fun buildService(context: Context, preferencesDataStore: PreferencesDataStore): ChemSpaceApiService {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }

        val authInterceptor = AuthInterceptor(preferencesDataStore)
        val dynamicHostInterceptor = DynamicHostInterceptor(preferencesDataStore)

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(dynamicHostInterceptor)
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(BuildConfig.DEFAULT_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        return retrofit.create(ChemSpaceApiService::class.java)
    }
}
