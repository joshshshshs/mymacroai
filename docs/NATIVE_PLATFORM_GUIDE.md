# Native Platform Integration Guide

This guide covers the native code required for platform-specific features that cannot be implemented purely in React Native/Expo.

## 📱 iOS Widgets (WidgetKit)

### 1. Create Widget Extension

In Xcode, add a new Widget Extension target:
- File → New → Target → Widget Extension
- Name: `MyMacroWidget`
- Include Configuration Intent: Yes

### 2. Widget Implementation

```swift
// MyMacroWidget/MyMacroWidget.swift

import WidgetKit
import SwiftUI

// MARK: - Widget Data
struct MacroData: Codable {
    let calories: Int
    let caloriesTarget: Int
    let caloriesPercent: Int
    let protein: Int
    let proteinTarget: Int
    let carbs: Int
    let carbsTarget: Int
    let fats: Int
    let fatsTarget: Int
    let streak: Int
    let lastUpdated: String
}

// MARK: - Timeline Entry
struct MacroEntry: TimelineEntry {
    let date: Date
    let data: MacroData
}

// MARK: - Provider
struct MacroProvider: TimelineProvider {
    func placeholder(in context: Context) -> MacroEntry {
        MacroEntry(date: Date(), data: MacroData(
            calories: 1500, caloriesTarget: 2000, caloriesPercent: 75,
            protein: 120, proteinTarget: 150,
            carbs: 180, carbsTarget: 200,
            fats: 50, fatsTarget: 65,
            streak: 7, lastUpdated: ""
        ))
    }

    func getSnapshot(in context: Context, completion: @escaping (MacroEntry) -> ()) {
        let entry = loadEntry()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<MacroEntry>) -> ()) {
        let entry = loadEntry()
        
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadEntry() -> MacroEntry {
        let userDefaults = UserDefaults(suiteName: "group.com.mymacroai.app")
        
        if let jsonString = userDefaults?.string(forKey: "widgetData"),
           let jsonData = jsonString.data(using: .utf8),
           let data = try? JSONDecoder().decode(MacroData.self, from: jsonData) {
            return MacroEntry(date: Date(), data: data)
        }
        
        return MacroEntry(date: Date(), data: MacroData(
            calories: 0, caloriesTarget: 2000, caloriesPercent: 0,
            protein: 0, proteinTarget: 150,
            carbs: 0, carbsTarget: 200,
            fats: 0, fatsTarget: 65,
            streak: 0, lastUpdated: ""
        ))
    }
}

// MARK: - Widget Views
struct SmallMacroWidget: View {
    let entry: MacroEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("MyMacro")
                    .font(.caption2)
                    .foregroundColor(.secondary)
                Spacer()
                Text("🔥 \(entry.data.streak)")
                    .font(.caption2)
            }
            
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 8)
                Circle()
                    .trim(from: 0, to: CGFloat(entry.data.caloriesPercent) / 100)
                    .stroke(Color.orange, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                
                VStack(spacing: 2) {
                    Text("\(entry.data.calories)")
                        .font(.system(size: 24, weight: .bold))
                    Text("kcal")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            .frame(width: 80, height: 80)
            .frame(maxWidth: .infinity)
            
            Text("\(entry.data.caloriesTarget - entry.data.calories) left")
                .font(.caption)
                .foregroundColor(.secondary)
                .frame(maxWidth: .infinity)
        }
        .padding()
    }
}

struct MediumMacroWidget: View {
    let entry: MacroEntry
    
    var body: some View {
        HStack(spacing: 16) {
            // Calorie ring
            VStack {
                ZStack {
                    Circle()
                        .stroke(Color.gray.opacity(0.2), lineWidth: 6)
                    Circle()
                        .trim(from: 0, to: CGFloat(entry.data.caloriesPercent) / 100)
                        .stroke(Color.orange, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                    
                    VStack(spacing: 0) {
                        Text("\(entry.data.calories)")
                            .font(.system(size: 20, weight: .bold))
                        Text("kcal")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                .frame(width: 70, height: 70)
            }
            
            // Macros
            VStack(alignment: .leading, spacing: 8) {
                MacroRow(label: "Protein", value: entry.data.protein, target: entry.data.proteinTarget, color: .blue)
                MacroRow(label: "Carbs", value: entry.data.carbs, target: entry.data.carbsTarget, color: .green)
                MacroRow(label: "Fats", value: entry.data.fats, target: entry.data.fatsTarget, color: .yellow)
            }
            .frame(maxWidth: .infinity)
        }
        .padding()
    }
}

struct MacroRow: View {
    let label: String
    let value: Int
    let target: Int
    let color: Color
    
    var progress: CGFloat {
        CGFloat(value) / CGFloat(target)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Spacer()
                Text("\(value)g")
                    .font(.caption)
                    .fontWeight(.semibold)
            }
            
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.gray.opacity(0.2))
                        .frame(height: 4)
                        .cornerRadius(2)
                    
                    Rectangle()
                        .fill(color)
                        .frame(width: geo.size.width * min(progress, 1.0), height: 4)
                        .cornerRadius(2)
                }
            }
            .frame(height: 4)
        }
    }
}

// MARK: - Main Widget
@main
struct MyMacroWidget: Widget {
    let kind: String = "MyMacroWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: MacroProvider()) { entry in
            MyMacroWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("MyMacro")
        .description("Track your daily macros at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryCircular, .accessoryRectangular])
    }
}

struct MyMacroWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: MacroEntry
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallMacroWidget(entry: entry)
        case .systemMedium:
            MediumMacroWidget(entry: entry)
        case .accessoryCircular:
            AccessoryCircularView(entry: entry)
        case .accessoryRectangular:
            AccessoryRectangularView(entry: entry)
        default:
            SmallMacroWidget(entry: entry)
        }
    }
}

// MARK: - Lock Screen Widgets (iOS 16+)
struct AccessoryCircularView: View {
    let entry: MacroEntry
    
    var body: some View {
        Gauge(value: Double(entry.data.caloriesPercent), in: 0...100) {
            Text("kcal")
        } currentValueLabel: {
            Text("\(entry.data.caloriesTarget - entry.data.calories)")
                .font(.system(size: 12, weight: .bold))
        }
        .gaugeStyle(.accessoryCircular)
    }
}

struct AccessoryRectangularView: View {
    let entry: MacroEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("MyMacro")
                .font(.headline)
            
            HStack {
                Text("\(entry.data.calories)/\(entry.data.caloriesTarget)")
                    .font(.caption)
                Spacer()
                Text("🔥\(entry.data.streak)")
                    .font(.caption)
            }
            
            ProgressView(value: Double(entry.data.caloriesPercent), total: 100)
                .tint(.orange)
        }
    }
}
```

### 3. App Group Configuration

In Xcode:
1. Select main app target → Signing & Capabilities → + Capability → App Groups
2. Add: `group.com.mymacroai.app`
3. Select widget extension target → Add same App Group

---

## ⌚ Apple Watch App

### 1. Create Watch App Target

In Xcode:
- File → New → Target → watchOS → App
- Include Notification Scene: Yes
- Include Complication: Yes

### 2. Watch App Implementation

```swift
// MyMacroWatch/MyMacroWatchApp.swift

import SwiftUI
import WatchConnectivity

@main
struct MyMacroWatchApp: App {
    @StateObject private var connectivity = WatchConnectivityManager()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(connectivity)
        }
    }
}

// MARK: - Watch Connectivity
class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
    @Published var macroData: MacroData?
    @Published var isReachable = false
    
    override init() {
        super.init()
        
        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = self
            session.activate()
        }
    }
    
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            self.isReachable = session.isReachable
        }
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        if let jsonString = message["payload"] as? String,
           let data = jsonString.data(using: .utf8),
           let macros = try? JSONDecoder().decode(MacroData.self, from: data) {
            DispatchQueue.main.async {
                self.macroData = macros
            }
        }
    }
    
    func sendMessage(_ message: [String: Any]) {
        if WCSession.default.isReachable {
            WCSession.default.sendMessage(message, replyHandler: nil)
        }
    }
}

// MARK: - Main View
struct ContentView: View {
    @EnvironmentObject var connectivity: WatchConnectivityManager
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 16) {
                    // Calorie Ring
                    CalorieRingView(
                        current: connectivity.macroData?.calories ?? 0,
                        target: connectivity.macroData?.caloriesTarget ?? 2000
                    )
                    
                    // Quick Actions
                    HStack(spacing: 12) {
                        QuickActionButton(icon: "drop.fill", label: "+250ml") {
                            connectivity.sendMessage(["type": "log_water", "payload": ["amount": 250]])
                        }
                        
                        QuickActionButton(icon: "drop.fill", label: "+500ml") {
                            connectivity.sendMessage(["type": "log_water", "payload": ["amount": 500]])
                        }
                    }
                    
                    // Macro Bars
                    VStack(spacing: 8) {
                        MacroBar(label: "P", value: connectivity.macroData?.protein ?? 0, target: connectivity.macroData?.proteinTarget ?? 150, color: .blue)
                        MacroBar(label: "C", value: connectivity.macroData?.carbs ?? 0, target: connectivity.macroData?.carbsTarget ?? 200, color: .green)
                        MacroBar(label: "F", value: connectivity.macroData?.fats ?? 0, target: connectivity.macroData?.fatsTarget ?? 65, color: .yellow)
                    }
                }
                .padding()
            }
            .navigationTitle("MyMacro")
        }
    }
}

struct CalorieRingView: View {
    let current: Int
    let target: Int
    
    var progress: Double {
        Double(current) / Double(target)
    }
    
    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.gray.opacity(0.3), lineWidth: 12)
            
            Circle()
                .trim(from: 0, to: min(progress, 1.0))
                .stroke(Color.orange, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                .rotationEffect(.degrees(-90))
            
            VStack(spacing: 0) {
                Text("\(current)")
                    .font(.system(size: 32, weight: .bold))
                Text("/ \(target)")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .frame(width: 120, height: 120)
    }
}

struct QuickActionButton: View {
    let icon: String
    let label: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.title3)
                Text(label)
                    .font(.caption2)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(Color.blue.opacity(0.2))
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
    }
}

struct MacroBar: View {
    let label: String
    let value: Int
    let target: Int
    let color: Color
    
    var progress: CGFloat {
        CGFloat(value) / CGFloat(target)
    }
    
    var body: some View {
        HStack(spacing: 8) {
            Text(label)
                .font(.caption2)
                .frame(width: 16)
            
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                    Rectangle()
                        .fill(color)
                        .frame(width: geo.size.width * min(progress, 1.0))
                }
                .cornerRadius(4)
            }
            .frame(height: 8)
            
            Text("\(value)g")
                .font(.caption2)
                .frame(width: 36, alignment: .trailing)
        }
    }
}
```

### 3. Complications

```swift
// MyMacroWatch/Complications/ComplicationController.swift

import ClockKit
import SwiftUI

class ComplicationController: NSObject, CLKComplicationDataSource {
    
    func getCurrentTimelineEntry(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationTimelineEntry?) -> Void) {
        let template = makeTemplate(for: complication)
        let entry = CLKComplicationTimelineEntry(date: Date(), complicationTemplate: template)
        handler(entry)
    }
    
    func getLocalizableSampleTemplate(for complication: CLKComplication, withHandler handler: @escaping (CLKComplicationTemplate?) -> Void) {
        handler(makeTemplate(for: complication))
    }
    
    private func makeTemplate(for complication: CLKComplication) -> CLKComplicationTemplate {
        switch complication.family {
        case .graphicCircular:
            return CLKComplicationTemplateGraphicCircularView(
                ComplicationCircularView()
            )
        case .graphicRectangular:
            return CLKComplicationTemplateGraphicRectangularFullView(
                ComplicationRectangularView()
            )
        case .graphicCorner:
            return CLKComplicationTemplateGraphicCornerGaugeText(
                gaugeProvider: CLKSimpleGaugeProvider(style: .fill, gaugeColor: .orange, fillFraction: 0.75),
                outerTextProvider: CLKSimpleTextProvider(text: "1500 kcal")
            )
        default:
            return CLKComplicationTemplateGraphicCircularView(
                ComplicationCircularView()
            )
        }
    }
}

struct ComplicationCircularView: View {
    var body: some View {
        Gauge(value: 0.75) {
            Text("kcal")
        } currentValueLabel: {
            Text("500")
        }
        .gaugeStyle(.accessoryCircular)
        .tint(.orange)
    }
}

struct ComplicationRectangularView: View {
    var body: some View {
        VStack(alignment: .leading) {
            Text("MyMacro")
                .font(.headline)
            Text("1500 / 2000 kcal")
                .font(.caption)
            ProgressView(value: 0.75)
                .tint(.orange)
        }
    }
}
```

---

## 🤖 Android Widgets

### 1. Widget Provider

```kotlin
// android/app/src/main/java/com/mymacroai/app/widgets/MacroWidgetProvider.kt

package com.mymacroai.app.widgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import com.mymacroai.app.R
import org.json.JSONObject

class MacroWidgetProvider : AppWidgetProvider() {
    
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }
    
    companion object {
        fun updateWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.widget_macros)
            
            // Load data from SharedPreferences
            val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
            val jsonString = prefs.getString("widgetData", null)
            
            if (jsonString != null) {
                try {
                    val data = JSONObject(jsonString)
                    val macros = data.getJSONObject("macros")
                    
                    val calories = macros.getInt("calories")
                    val target = macros.getInt("caloriesTarget")
                    val percent = macros.getInt("caloriesPercent")
                    
                    views.setTextViewText(R.id.calories_value, "$calories")
                    views.setTextViewText(R.id.calories_target, "/ $target kcal")
                    views.setProgressBar(R.id.calories_progress, 100, percent, false)
                    
                    val protein = macros.getInt("protein")
                    val proteinTarget = macros.getInt("proteinTarget")
                    views.setTextViewText(R.id.protein_value, "${protein}g")
                    views.setProgressBar(R.id.protein_progress, proteinTarget, protein, false)
                    
                    val carbs = macros.getInt("carbs")
                    val carbsTarget = macros.getInt("carbsTarget")
                    views.setTextViewText(R.id.carbs_value, "${carbs}g")
                    views.setProgressBar(R.id.carbs_progress, carbsTarget, carbs, false)
                    
                    val fats = macros.getInt("fats")
                    val fatsTarget = macros.getInt("fatsTarget")
                    views.setTextViewText(R.id.fats_value, "${fats}g")
                    views.setProgressBar(R.id.fats_progress, fatsTarget, fats, false)
                    
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }
            
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
```

### 2. Widget Layout

```xml
<!-- android/app/src/main/res/layout/widget_macros.xml -->

<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:padding="16dp"
    android:background="@drawable/widget_background">

    <TextView
        android:id="@+id/widget_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="MyMacro"
        android:textSize="14sp"
        android:textColor="#888888" />

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:layout_marginTop="8dp">

        <TextView
            android:id="@+id/calories_value"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="0"
            android:textSize="32sp"
            android:textStyle="bold"
            android:textColor="#FF5C00" />

        <TextView
            android:id="@+id/calories_target"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="/ 2000 kcal"
            android:textSize="14sp"
            android:textColor="#888888"
            android:layout_marginStart="4dp" />

    </LinearLayout>

    <ProgressBar
        android:id="@+id/calories_progress"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="8dp"
        android:layout_marginTop="8dp"
        android:progressDrawable="@drawable/progress_orange"
        android:max="100"
        android:progress="0" />

    <!-- Macro bars -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:layout_marginTop="12dp">

        <!-- Protein -->
        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:orientation="vertical">
            
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Protein"
                android:textSize="10sp"
                android:textColor="#888888" />
            
            <TextView
                android:id="@+id/protein_value"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="0g"
                android:textSize="12sp"
                android:textColor="#3B82F6" />
            
            <ProgressBar
                android:id="@+id/protein_progress"
                style="?android:attr/progressBarStyleHorizontal"
                android:layout_width="match_parent"
                android:layout_height="4dp"
                android:progressDrawable="@drawable/progress_blue" />
        </LinearLayout>

        <!-- Carbs -->
        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginStart="8dp"
            android:orientation="vertical">
            
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Carbs"
                android:textSize="10sp"
                android:textColor="#888888" />
            
            <TextView
                android:id="@+id/carbs_value"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="0g"
                android:textSize="12sp"
                android:textColor="#22C55E" />
            
            <ProgressBar
                android:id="@+id/carbs_progress"
                style="?android:attr/progressBarStyleHorizontal"
                android:layout_width="match_parent"
                android:layout_height="4dp"
                android:progressDrawable="@drawable/progress_green" />
        </LinearLayout>

        <!-- Fats -->
        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:layout_marginStart="8dp"
            android:orientation="vertical">
            
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="Fats"
                android:textSize="10sp"
                android:textColor="#888888" />
            
            <TextView
                android:id="@+id/fats_value"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="0g"
                android:textSize="12sp"
                android:textColor="#F59E0B" />
            
            <ProgressBar
                android:id="@+id/fats_progress"
                style="?android:attr/progressBarStyleHorizontal"
                android:layout_width="match_parent"
                android:layout_height="4dp"
                android:progressDrawable="@drawable/progress_yellow" />
        </LinearLayout>

    </LinearLayout>

</LinearLayout>
```

### 3. Widget Info XML

```xml
<!-- android/app/src/main/res/xml/widget_macros_info.xml -->

<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="180dp"
    android:minHeight="110dp"
    android:targetCellWidth="3"
    android:targetCellHeight="2"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/widget_macros"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:previewImage="@drawable/widget_preview" />
```

### 4. Register in AndroidManifest.xml

```xml
<receiver android:name=".widgets.MacroWidgetProvider"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/widget_macros_info" />
</receiver>
```

---

## 🔔 Push Notification Setup

### iOS - APNs Configuration

1. Create APNs Key in Apple Developer Console
2. Upload to Expo / your push notification service
3. Configure in `app.json`:

```json
{
  "ios": {
    "infoPlist": {
      "UIBackgroundModes": ["remote-notification"]
    }
  }
}
```

### Android - FCM Configuration

1. Create Firebase project
2. Download `google-services.json`
3. Place in `android/app/`
4. Configure in `app.json`:

```json
{
  "android": {
    "googleServicesFile": "./google-services.json"
  }
}
```

---

## 📱 macOS Catalyst Support

For macOS widgets and Catalyst support:

1. Enable Mac Catalyst in Xcode project settings
2. Add WidgetKit extension for macOS
3. Share App Group between iOS and macOS

---

## 🧪 Testing

### Widget Testing
- iOS: Use Widget Gallery in Xcode 12+ simulator
- Android: Use Android Studio emulator with widget testing

### Watch Testing
- Use Watch Simulator paired with iOS Simulator
- Test complications with CLKComplicationServer

### Push Notification Testing
- Use Expo push notification tool
- Use Apple Push Notification Console for APNs

---

*Last Updated: February 2026*
