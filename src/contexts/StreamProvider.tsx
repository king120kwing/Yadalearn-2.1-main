import React, { createContext, useContext, useEffect, useState } from 'react';
import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-sdk';
import { useAuth } from './AuthContext';

interface StreamContextType {
  client: StreamVideoClient | null;
  isStreamReady: boolean;
}

const StreamContext = createContext<StreamContextType>({ client: null, isStreamReady: false });

export const useStream = () => useContext(StreamContext);

const apiKey = import.meta.env.VITE_STREAM_API_KEY;

export const StreamProvider = ({ children }: { children: React.ReactNode }) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const { user, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded || !user) {
      if (client) {
        client.disconnectUser();
        setClient(null);
        setIsStreamReady(false);
      }
      return;
    }

    if (!apiKey) {
      console.warn('Stream API key is missing. Stream features will be disabled.');
      return;
    }

    let isMounted = true;
    let streamClient: StreamVideoClient | null = null;

    const initStream = async () => {
      try {
        // Fetch secure token from our Vite proxy API
        const response = await fetch(`/api/get-stream-token?user_id=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch Stream token');
        }
        const { token } = await response.json();

        streamClient = new StreamVideoClient({
          apiKey,
          user: {
            id: user.id,
            name: user.name || 'User',
            image: user.avatar || '',
          },
          token,
        });

        if (isMounted) {
          setClient(streamClient);
          setIsStreamReady(true);
        } else {
          // If unmounted while fetching, clean up immediately
          streamClient.disconnectUser();
        }
      } catch (err) {
        console.error('Error initializing Stream client:', err);
      }
    };

    initStream();

    return () => {
      isMounted = false;
      if (streamClient) {
        streamClient.disconnectUser();
        setClient(null);
        setIsStreamReady(false);
      }
    };
  }, [user, isLoaded]);

  if (!client || !isStreamReady) {
    return <>{children}</>;
  }

  return (
    <StreamContext.Provider value={{ client, isStreamReady }}>
      <StreamVideo client={client}>
        {children}
      </StreamVideo>
    </StreamContext.Provider>
  );
};
