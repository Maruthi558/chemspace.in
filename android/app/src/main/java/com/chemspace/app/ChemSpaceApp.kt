package com.chemspace.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build

class ChemSpaceApp : Application() {

    val preferencesDataStore: com.chemspace.app.data.local.PreferencesDataStore by lazy {
        com.chemspace.app.data.local.PreferencesDataStore(this)
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ANALYSIS_ID,
                "Chemical Analysis & Calculations",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications when RDKit jobs, quantum calculations, or reaction analyses complete"
            }
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    companion object {
        const val CHANNEL_ANALYSIS_ID = "chemspace_analysis_channel"
        lateinit var instance: ChemSpaceApp
            private set
    }
}
