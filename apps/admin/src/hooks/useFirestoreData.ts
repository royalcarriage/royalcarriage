/**
 * Custom hooks for fetching live Firestore data across dashboard components
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  getDocs,
  getCountFromServer,
  Timestamp,
  type QueryConstraint,
  type DocumentData,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../lib/firebase';
import { ensureFirebaseApp } from '../lib/firebaseClient';

// Generic hook for real-time collection data
export function useCollection<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: { realtime?: boolean; limitCount?: number } = {}
) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { realtime = true, limitCount = 100 } = options;

  useEffect(() => {
    setLoading(true);

    const q = query(
      collection(db, collectionName),
      ...constraints,
      limit(limitCount)
    );

    if (realtime) {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as T),
          }));
          setData(docs);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`Error fetching ${collectionName}:`, err);
          setError(err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } else {
      getDocs(q)
        .then((snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as T),
          }));
          setData(docs);
          setLoading(false);
        })
        .catch((err) => {
          console.error(`Error fetching ${collectionName}:`, err);
          setError(err);
          setLoading(false);
        });
    }
  }, [collectionName, realtime, limitCount]);

  return { data, loading, error };
}

// Hook for collection count
export function useCollectionCount(
  collectionName: string,
  constraints: QueryConstraint[] = []
) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const q = query(collection(db, collectionName), ...constraints);
        const snapshot = await getCountFromServer(q);
        setCount(snapshot.data().count);
      } catch (err) {
        console.error(`Error counting ${collectionName}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [collectionName]);

  return { count, loading };
}

// Hook for dashboard metrics
export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState({
    bookings: 0,
    content: 0,
    imports: 0,
    locations: 0,
    services: 0,
    fleet: 0,
    commandsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [bookingsSnap, contentSnap, importsSnap, locationsSnap, servicesSnap, fleetSnap] =
          await Promise.all([
            getCountFromServer(collection(db, 'bookings')),
            getCountFromServer(query(collection(db, 'content'), where('status', '==', 'published'))),
            getCountFromServer(collection(db, 'imports')),
            getCountFromServer(collection(db, 'locations')),
            getCountFromServer(collection(db, 'services')),
            getCountFromServer(collection(db, 'fleet')),
          ]);

        setMetrics({
          bookings: bookingsSnap.data().count,
          content: contentSnap.data().count,
          imports: importsSnap.data().count,
          locations: locationsSnap.data().count,
          services: servicesSnap.data().count,
          fleet: fleetSnap.data().count,
          commandsToday: 0, // Will be set from activity log
        });
      } catch (err) {
        console.error('Error fetching metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, loading };
}

// Hook for recent activity
export function useActivityLog(limitCount = 10) {
  const [activities, setActivities] = useState<
    Array<{
      id: string;
      type: string;
      message: string;
      status: string;
      userId?: string;
      timestamp: Date;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'activity_log'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type || 'system',
          message: data.message || '',
          status: data.status || 'success',
          userId: data.userId,
          timestamp: data.timestamp?.toDate?.() || new Date(),
        };
      });
      setActivities(logs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [limitCount]);

  return { activities, loading };
}

// Hook for system metrics via Cloud Function
export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<{
    systems: Record<string, { status: string; latency: number }>;
    bookings: number;
    publishedContent: number;
    imports: number;
    commandsLast24h: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    try {
      const { app } = ensureFirebaseApp();
      if (!app) throw new Error('Firebase not initialized');

      const functions = getFunctions(app);
      const getSystemMetrics = httpsCallable<
        Record<string, never>,
        {
          bookings: number;
          publishedContent: number;
          imports: number;
          commandsLast24h: number;
          systems: Record<string, { status: string; latency: number }>;
        }
      >(functions, 'getSystemMetrics');

      const result = await getSystemMetrics({});
      setMetrics(result.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching system metrics:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    // Refresh every 30 seconds
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  return { metrics, loading, error, refetch };
}

// Hook for content stats
export function useContentStats() {
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    pending: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [totalSnap, publishedSnap, draftSnap, pendingSnap, rejectedSnap] = await Promise.all([
          getCountFromServer(collection(db, 'content')),
          getCountFromServer(query(collection(db, 'content'), where('status', '==', 'published'))),
          getCountFromServer(query(collection(db, 'content'), where('status', '==', 'draft'))),
          getCountFromServer(query(collection(db, 'content'), where('status', '==', 'pending'))),
          getCountFromServer(query(collection(db, 'content'), where('status', '==', 'rejected'))),
        ]);

        setStats({
          total: totalSnap.data().count,
          published: publishedSnap.data().count,
          draft: draftSnap.data().count,
          pending: pendingSnap.data().count,
          rejected: rejectedSnap.data().count,
        });
      } catch (err) {
        console.error('Error fetching content stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}

// Hook for location data
export function useLocations(limitCount = 50) {
  return useCollection<{
    city: string;
    state: string;
    region?: string;
    status: string;
    servicesCount?: number;
    contentGenerated?: boolean;
  }>('locations', [orderBy('city', 'asc')], { limitCount });
}

// Hook for services data
export function useServices(limitCount = 50) {
  return useCollection<{
    name: string;
    slug: string;
    category: string;
    status: string;
    locationsCount?: number;
  }>('services', [orderBy('name', 'asc')], { limitCount });
}

// Hook for fleet vehicles
export function useFleet() {
  return useCollection<{
    name: string;
    type: string;
    capacity: number;
    status: string;
    imageUrl?: string;
  }>('fleet', [orderBy('name', 'asc')]);
}

// Hook for recent imports
export function useImports(limitCount = 20) {
  return useCollection<{
    type: string;
    source: string;
    recordsCount: number;
    status: string;
    timestamp: Timestamp;
    userId?: string;
  }>('imports', [orderBy('timestamp', 'desc')], { limitCount });
}

// Hook for bookings (admin only)
export function useBookings(status?: string, limitCount = 50) {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (status) {
    constraints.unshift(where('status', '==', status));
  }

  return useCollection<{
    customerId: string;
    customerName: string;
    serviceType: string;
    pickupDate: Timestamp;
    pickupLocation: string;
    dropoffLocation: string;
    status: string;
    amount: number;
  }>('bookings', constraints, { limitCount });
}

// Hook for command logs (admin only)
export function useCommandLogs(limitCount = 50) {
  return useCollection<{
    command: string;
    type: string;
    userId: string;
    userEmail: string;
    result: string;
    output: string;
    duration: number;
    timestamp: Timestamp;
  }>('command_logs', [orderBy('timestamp', 'desc')], { limitCount });
}

// Hook for chat conversations
export function useChatConversations(userId: string, limitCount = 20) {
  return useCollection<{
    title: string;
    lastMessage: string;
    messageCount: number;
    timestamp: Timestamp;
    userId: string;
  }>(
    'chat_conversations',
    [where('userId', '==', userId), orderBy('timestamp', 'desc')],
    { limitCount }
  );
}
