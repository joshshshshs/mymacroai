import Purchases, { PurchasesPackage, PurchasesOffering } from 'react-native-purchases';
import { Platform } from 'react-native';

// Keys - Ideally from Env/Config
const API_KEYS = {
    apple: "appl_ViJ...", // Placeholder
    google: "goog_..." // Placeholder
};

const ENTITLEMENT_ID = "pro";

class RevenueCatService {

    async configure() {
        if (Platform.OS === 'ios') {
            Purchases.configure({ apiKey: API_KEYS.apple });
        } else if (Platform.OS === 'android') {
            Purchases.configure({ apiKey: API_KEYS.google });
        }
    }

    async getOfferings(): Promise<PurchasesOffering | null> {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current !== null) {
                return offerings.current;
            }
            return null;
        } catch (e) {
            console.error("Error fetching offerings", e);
            return null;
        }
    }

    async checkEntitlement(): Promise<boolean> {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            if (typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined") {
                return true;
            }
            return false;
        } catch (e) {
            // Error fetching customer info
            return false;
        }
    }

    async purchasePackage(pack: PurchasesPackage): Promise<boolean> {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pack);
            if (typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined") {
                return true; // Unlock logic here
            }
            return false;
        } catch (e: any) {
            if (!e.userCancelled) {
                console.error("Purchase error", e);
            }
            return false;
        }
    }

    async restorePurchases(): Promise<boolean> {
        try {
            const customerInfo = await Purchases.restorePurchases();
            if (typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined") {
                return true;
            }
            return false;
        } catch (e) {
            console.error("Restore error", e);
            return false;
        }
    }
}

export const revenueCatService = new RevenueCatService();
