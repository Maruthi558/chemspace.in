package com.chemspace.app

import android.app.Application
import coil.ImageLoader
import coil.ImageLoaderFactory
import coil.decode.SvgDecoder
import coil.disk.DiskCache
import coil.memory.MemoryCache
import com.chemspace.app.data.api.ApiClient
import com.chemspace.app.data.api.ChemSpaceApiService
import com.chemspace.app.data.local.PreferencesDataStore
import com.chemspace.app.data.repository.AiAssistantRepository
import com.chemspace.app.data.repository.AuthRepository
import com.chemspace.app.data.repository.ChemistryRepository
import com.chemspace.app.data.repository.QuantumRepository
import com.chemspace.app.data.repository.RdkitLabRepository
import com.chemspace.app.data.repository.ReactionRepository
import com.chemspace.app.data.repository.SpectroscopyRepository
import com.chemspace.app.data.repository.WorkspaceRepository

class ChemSpaceApp : Application(), ImageLoaderFactory {

    lateinit var preferencesDataStore: PreferencesDataStore
        private set

    lateinit var apiService: ChemSpaceApiService
        private set

    lateinit var authRepository: AuthRepository
        private set

    lateinit var chemistryRepository: ChemistryRepository
        private set

    lateinit var spectroscopyRepository: SpectroscopyRepository
        private set

    lateinit var quantumRepository: QuantumRepository
        private set

    lateinit var reactionRepository: ReactionRepository
        private set

    lateinit var aiAssistantRepository: AiAssistantRepository
        private set

    lateinit var rdkitLabRepository: RdkitLabRepository
        private set

    lateinit var workspaceRepository: WorkspaceRepository
        private set

    companion object {
        lateinit var instance: ChemSpaceApp
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this

        preferencesDataStore = PreferencesDataStore(this)
        apiService = ApiClient.getService(this, preferencesDataStore)

        authRepository = AuthRepository(apiService, preferencesDataStore)
        chemistryRepository = ChemistryRepository(apiService)
        spectroscopyRepository = SpectroscopyRepository(apiService)
        quantumRepository = QuantumRepository(apiService)
        reactionRepository = ReactionRepository(apiService)
        aiAssistantRepository = AiAssistantRepository(apiService)
        rdkitLabRepository = RdkitLabRepository(apiService)
        workspaceRepository = WorkspaceRepository(apiService)
    }

    override fun newImageLoader(): ImageLoader {
        return ImageLoader.Builder(this)
            .components {
                add(SvgDecoder.Factory())
            }
            .memoryCache {
                MemoryCache.Builder(this)
                    .maxSizePercent(0.25)
                    .build()
            }
            .diskCache {
                DiskCache.Builder()
                    .directory(cacheDir.resolve("chemspace_image_cache"))
                    .maxSizePercent(0.02)
                    .build()
            }
            .crossfade(true)
            .build()
    }
}
