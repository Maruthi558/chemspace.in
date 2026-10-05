package com.chemspace.app.data.local

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.chemspace.app.BuildConfig
import com.chemspace.app.data.api.UserDto
import com.google.gson.Gson
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "chemspace_preferences")

class PreferencesDataStore(private val context: Context) {
    private val gson = Gson()

    companion object {
        private val KEY_TOKEN = stringPreferencesKey("auth_token")
        private val KEY_USER = stringPreferencesKey("user_data")
        private val KEY_THEME_DARK = booleanPreferencesKey("theme_dark")
        private val KEY_BASE_URL = stringPreferencesKey("custom_base_url")
    }

    val authTokenFlow: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[KEY_TOKEN]
    }

    val currentUserFlow: Flow<UserDto?> = context.dataStore.data.map { prefs ->
        val json = prefs[KEY_USER]
        if (!json.isNullOrBlank()) {
            try {
                gson.fromJson(json, UserDto::class.java)
            } catch (e: Exception) {
                null
            }
        } else {
            null
        }
    }

    val isDarkThemeFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_THEME_DARK] ?: true // ChemSpace default is deep sleek dark mode
    }

    val baseUrlFlow: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[KEY_BASE_URL] ?: BuildConfig.DEFAULT_BASE_URL
    }

    suspend fun saveAuthSession(token: String?, user: UserDto?) {
        context.dataStore.edit { prefs ->
            if (token != null) {
                prefs[KEY_TOKEN] = token
            } else {
                prefs.remove(KEY_TOKEN)
            }

            if (user != null) {
                prefs[KEY_USER] = gson.toJson(user)
            } else {
                prefs.remove(KEY_USER)
            }
        }
    }

    suspend fun clearSession() {
        context.dataStore.edit { prefs ->
            prefs.remove(KEY_TOKEN)
            prefs.remove(KEY_USER)
        }
    }

    suspend fun setDarkTheme(isDark: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[KEY_THEME_DARK] = isDark
        }
    }

    suspend fun setBaseUrl(url: String) {
        val cleanUrl = if (!url.endsWith("/")) "$url/" else url
        context.dataStore.edit { prefs ->
            prefs[KEY_BASE_URL] = cleanUrl
        }
    }

    suspend fun resetBaseUrlToDefault() {
        context.dataStore.edit { prefs ->
            prefs.remove(KEY_BASE_URL)
        }
    }

    suspend fun getAuthTokenSync(): String? {
        return context.dataStore.data.first()[KEY_TOKEN]
    }

    suspend fun getBaseUrlSync(): String {
        return context.dataStore.data.first()[KEY_BASE_URL] ?: BuildConfig.DEFAULT_BASE_URL
    }
}
