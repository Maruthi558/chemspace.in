# ProGuard rules for ChemSpace Android App

# Retain Retrofit and Gson models
-keepattributes Signature
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep class com.chemspace.app.data.api.** { *; }
-keep class com.chemspace.app.domain.model.** { *; }
