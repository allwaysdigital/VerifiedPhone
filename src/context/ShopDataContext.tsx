import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { subscribeToAuthState } from '../auth/firebaseAuth';
import { createBrand as apiCreateBrand, listBrands } from '../api/brands';
import {
  createDevice as apiCreateDevice,
  listDevices,
  markDeviceSold as apiMarkDeviceSold,
  type DeviceCreateInput,
  type MarkDeviceSoldInput,
} from '../api/devices';
import {
  getMyShop,
  registerShop as apiRegisterShop,
  updateShop as apiUpdateShop,
  type ShopDetailsInput,
} from '../api/shop';
import {
  cancelSubscription as apiCancelSubscription,
  startTrial as apiStartTrial,
} from '../api/subscription';
import type { Brand, Device, PlanId, Shop, Subscription } from '../types/domain';

export type ShopDataState = {
  shop: Shop | null;
  devices: Device[];
  brands: Brand[];
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  refetchAll: () => Promise<void>;
  createDevice: (input: DeviceCreateInput) => Promise<Device>;
  markDeviceSold: (id: string, input: MarkDeviceSoldInput) => Promise<Device>;
  createBrand: (name: string) => Promise<Brand>;
  registerShop: (input: ShopDetailsInput) => Promise<Shop>;
  updateShop: (input: ShopDetailsInput) => Promise<Shop>;
  startTrial: (planId: PlanId) => Promise<Subscription>;
  cancelSubscription: () => Promise<Subscription>;
};

export const ShopDataContext = createContext<ShopDataState | null>(null);

export function ShopDataProvider({ children }: { children: React.ReactNode }) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [shopResult, devicesResult, brandsResult] = await Promise.all([
        getMyShop(),
        listDevices(),
        listBrands(),
      ]);
      setShop(shopResult.shop);
      setSubscription(shopResult.subscription);
      setDevices(devicesResult);
      setBrands(brandsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load shop data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(user => {
      if (user) {
        fetchAll();
      } else {
        setShop(null);
        setDevices([]);
        setBrands([]);
        setSubscription(null);
      }
    });
    return unsubscribe;
  }, [fetchAll]);

  const createDevice = useCallback(async (input: DeviceCreateInput) => {
    const device = await apiCreateDevice(input);
    setDevices(prev => [device, ...prev]);
    return device;
  }, []);

  const markDeviceSold = useCallback(async (id: string, input: MarkDeviceSoldInput) => {
    const updated = await apiMarkDeviceSold(id, input);
    setDevices(prev => prev.map(d => (d.id === id ? updated : d)));
    return updated;
  }, []);

  const createBrand = useCallback(async (name: string) => {
    const brand = await apiCreateBrand(name);
    setBrands(prev => [...prev, brand].sort((a, b) => a.name.localeCompare(b.name)));
    return brand;
  }, []);

  const registerShop = useCallback(async (input: ShopDetailsInput) => {
    const result = await apiRegisterShop(input);
    setShop(result.shop);
    setSubscription(result.subscription);
    return result.shop;
  }, []);

  const updateShop = useCallback(async (input: ShopDetailsInput) => {
    const result = await apiUpdateShop(input);
    setShop(result.shop);
    setSubscription(result.subscription);
    return result.shop;
  }, []);

  const startTrial = useCallback(async (planId: PlanId) => {
    const updated = await apiStartTrial(planId);
    setSubscription(updated);
    return updated;
  }, []);

  const cancelSubscription = useCallback(async () => {
    const updated = await apiCancelSubscription();
    setSubscription(updated);
    return updated;
  }, []);

  const value = useMemo<ShopDataState>(
    () => ({
      shop,
      devices,
      brands,
      subscription,
      loading,
      error,
      refetchAll: fetchAll,
      createDevice,
      markDeviceSold,
      createBrand,
      registerShop,
      updateShop,
      startTrial,
      cancelSubscription,
    }),
    [
      shop,
      devices,
      brands,
      subscription,
      loading,
      error,
      fetchAll,
      createDevice,
      markDeviceSold,
      createBrand,
      registerShop,
      updateShop,
      startTrial,
      cancelSubscription,
    ],
  );

  return <ShopDataContext.Provider value={value}>{children}</ShopDataContext.Provider>;
}

export function useShopData(): ShopDataState {
  const ctx = useContext(ShopDataContext);
  if (!ctx) {
    throw new Error('useShopData must be used within a ShopDataProvider');
  }
  return ctx;
}
