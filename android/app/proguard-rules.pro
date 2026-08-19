# Proguard rules for BookMerger
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.bookmerger.app.** { *; }
