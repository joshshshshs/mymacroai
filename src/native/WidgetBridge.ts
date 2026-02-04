/**
 * WidgetBridge - Native Module Interface for Widgets
 * 
 * This file defines the TypeScript interface for the native widget bridge modules.
 * The actual implementation requires native code in iOS (Swift) and Android (Kotlin).
 * 
 * Usage:
 * - iOS: Implement in ios/MyMacroAI/WidgetBridge.swift
 * - Android: Implement in android/app/src/main/java/.../WidgetBridge.kt
 */

import { NativeModules, Platform } from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface WidgetBridgeInterface {
  /**
   * Set widget data in shared storage (App Groups on iOS, SharedPreferences on Android)
   */
  setWidgetData(jsonData: string): Promise<void>;

  /**
   * Get widget data from shared storage
   */
  getWidgetData(): Promise<string | null>;

  /**
   * Request all widgets to reload their timelines (iOS only)
   */
  reloadAllTimelines(): Promise<void>;

  /**
   * Request specific widget kind to reload (iOS only)
   */
  reloadTimeline(widgetKind: string): Promise<void>;

  /**
   * Check if widgets are supported
   */
  isSupported(): Promise<boolean>;

  /**
   * Get installed widget configurations
   */
  getInstalledWidgets(): Promise<InstalledWidget[]>;
}

export interface WatchConnectivityInterface {
  /**
   * Send message to paired Apple Watch
   */
  sendMessage(message: any): Promise<void>;

  /**
   * Transfer user info to watch (background)
   */
  transferUserInfo(userInfo: any): Promise<void>;

  /**
   * Update complication data
   */
  updateComplications(data: any): Promise<void>;

  /**
   * Get current session state
   */
  getSessionState(): Promise<WatchSessionState>;

  /**
   * Check if watch app is installed
   */
  isWatchAppInstalled(): Promise<boolean>;
}

export interface InstalledWidget {
  kind: string;
  family: 'systemSmall' | 'systemMedium' | 'systemLarge' | 'accessoryCircular' | 'accessoryRectangular' | 'accessoryInline';
  configurationIntent?: string;
}

export interface WatchSessionState {
  reachable: boolean;
  paired: boolean;
  watchAppInstalled: boolean;
  lastSyncTime?: string;
}

// ============================================================================
// MODULE ACCESS
// ============================================================================

/**
 * Get the Widget Bridge native module
 */
export function getWidgetBridge(): WidgetBridgeInterface | null {
  const { WidgetBridge } = NativeModules;
  
  if (!WidgetBridge) {
    console.warn('[WidgetBridge] Native module not available');
    return null;
  }
  
  return WidgetBridge as WidgetBridgeInterface;
}

/**
 * Get the Watch Connectivity native module (iOS only)
 */
export function getWatchConnectivity(): WatchConnectivityInterface | null {
  if (Platform.OS !== 'ios') {
    return null;
  }
  
  const { WatchConnectivity } = NativeModules;
  
  if (!WatchConnectivity) {
    console.warn('[WatchConnectivity] Native module not available');
    return null;
  }
  
  return WatchConnectivity as WatchConnectivityInterface;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if widgets are available on this platform
 */
export async function areWidgetsSupported(): Promise<boolean> {
  const bridge = getWidgetBridge();
  if (!bridge) return false;
  
  try {
    return await bridge.isSupported();
  } catch {
    return false;
  }
}

/**
 * Save data to widget storage
 */
export async function saveWidgetData(data: any): Promise<boolean> {
  const bridge = getWidgetBridge();
  if (!bridge) return false;
  
  try {
    await bridge.setWidgetData(JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('[WidgetBridge] Failed to save widget data:', error);
    return false;
  }
}

/**
 * Request widget refresh
 */
export async function refreshWidgets(): Promise<boolean> {
  const bridge = getWidgetBridge();
  if (!bridge) return false;
  
  try {
    await bridge.reloadAllTimelines();
    return true;
  } catch (error) {
    console.error('[WidgetBridge] Failed to refresh widgets:', error);
    return false;
  }
}

/**
 * Check if Apple Watch is connected and has app installed
 */
export async function isWatchAvailable(): Promise<boolean> {
  const watch = getWatchConnectivity();
  if (!watch) return false;
  
  try {
    return await watch.isWatchAppInstalled();
  } catch {
    return false;
  }
}

/**
 * Send data to Apple Watch
 */
export async function sendToWatch(data: any): Promise<boolean> {
  const watch = getWatchConnectivity();
  if (!watch) return false;
  
  try {
    await watch.sendMessage(data);
    return true;
  } catch (error) {
    console.error('[WatchConnectivity] Failed to send to watch:', error);
    return false;
  }
}

// ============================================================================
// NATIVE MODULE IMPLEMENTATION GUIDE
// ============================================================================

/**
 * iOS Implementation (Swift)
 * 
 * File: ios/MyMacroAI/WidgetBridge.swift
 * 
 * ```swift
 * import Foundation
 * import WidgetKit
 * import React
 * 
 * @objc(WidgetBridge)
 * class WidgetBridge: NSObject {
 *   
 *   @objc
 *   func setWidgetData(_ jsonData: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
 *     let userDefaults = UserDefaults(suiteName: "group.com.mymacroai.app")
 *     userDefaults?.set(jsonData, forKey: "widgetData")
 *     resolve(nil)
 *   }
 *   
 *   @objc
 *   func getWidgetData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
 *     let userDefaults = UserDefaults(suiteName: "group.com.mymacroai.app")
 *     let data = userDefaults?.string(forKey: "widgetData")
 *     resolve(data)
 *   }
 *   
 *   @objc
 *   func reloadAllTimelines(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
 *     if #available(iOS 14.0, *) {
 *       WidgetCenter.shared.reloadAllTimelines()
 *     }
 *     resolve(nil)
 *   }
 *   
 *   @objc
 *   func isSupported(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
 *     if #available(iOS 14.0, *) {
 *       resolve(true)
 *     } else {
 *       resolve(false)
 *     }
 *   }
 *   
 *   @objc
 *   static func requiresMainQueueSetup() -> Bool {
 *     return false
 *   }
 * }
 * ```
 * 
 * Also need: ios/MyMacroAI/WidgetBridge.m
 * ```objc
 * #import <React/RCTBridgeModule.h>
 * 
 * @interface RCT_EXTERN_MODULE(WidgetBridge, NSObject)
 * 
 * RCT_EXTERN_METHOD(setWidgetData:(NSString *)jsonData
 *                   resolver:(RCTPromiseResolveBlock)resolve
 *                   rejecter:(RCTPromiseRejectBlock)reject)
 * 
 * RCT_EXTERN_METHOD(getWidgetData:(RCTPromiseResolveBlock)resolve
 *                   rejecter:(RCTPromiseRejectBlock)reject)
 * 
 * RCT_EXTERN_METHOD(reloadAllTimelines:(RCTPromiseResolveBlock)resolve
 *                   rejecter:(RCTPromiseRejectBlock)reject)
 * 
 * RCT_EXTERN_METHOD(isSupported:(RCTPromiseResolveBlock)resolve
 *                   rejecter:(RCTPromiseRejectBlock)reject)
 * 
 * @end
 * ```
 */

/**
 * Android Implementation (Kotlin)
 * 
 * File: android/app/src/main/java/com/mymacroai/app/WidgetBridge.kt
 * 
 * ```kotlin
 * package com.mymacroai.app
 * 
 * import android.appwidget.AppWidgetManager
 * import android.content.ComponentName
 * import android.content.Context
 * import android.content.SharedPreferences
 * import com.facebook.react.bridge.*
 * 
 * class WidgetBridge(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
 *   
 *   override fun getName() = "WidgetBridge"
 *   
 *   private fun getSharedPrefs(): SharedPreferences {
 *     return reactApplicationContext.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
 *   }
 *   
 *   @ReactMethod
 *   fun setWidgetData(jsonData: String, promise: Promise) {
 *     try {
 *       getSharedPrefs().edit().putString("widgetData", jsonData).apply()
 *       // Request widget update
 *       val appWidgetManager = AppWidgetManager.getInstance(reactApplicationContext)
 *       val widgetComponent = ComponentName(reactApplicationContext, MacroWidget::class.java)
 *       val widgetIds = appWidgetManager.getAppWidgetIds(widgetComponent)
 *       appWidgetManager.notifyAppWidgetViewDataChanged(widgetIds, android.R.id.list)
 *       promise.resolve(null)
 *     } catch (e: Exception) {
 *       promise.reject("ERROR", e.message)
 *     }
 *   }
 *   
 *   @ReactMethod
 *   fun getWidgetData(promise: Promise) {
 *     val data = getSharedPrefs().getString("widgetData", null)
 *     promise.resolve(data)
 *   }
 *   
 *   @ReactMethod
 *   fun reloadAllTimelines(promise: Promise) {
 *     // Trigger widget refresh
 *     val appWidgetManager = AppWidgetManager.getInstance(reactApplicationContext)
 *     val widgetComponent = ComponentName(reactApplicationContext, MacroWidget::class.java)
 *     val widgetIds = appWidgetManager.getAppWidgetIds(widgetComponent)
 *     appWidgetManager.notifyAppWidgetViewDataChanged(widgetIds, android.R.id.list)
 *     promise.resolve(null)
 *   }
 *   
 *   @ReactMethod
 *   fun isSupported(promise: Promise) {
 *     promise.resolve(true)
 *   }
 * }
 * ```
 */

export default {
  getWidgetBridge,
  getWatchConnectivity,
  areWidgetsSupported,
  saveWidgetData,
  refreshWidgets,
  isWatchAvailable,
  sendToWatch,
};
