import { Storage } from '@capacitor/storage';

export const setupDebugPrint =
  (tag: string) => (message: string, data?: any) => {
    console.log(`${tag}: ${message}`);
    if (data) {
      console.log(`${JSON.stringify(data, null, 4)}`);
    }
  };

const numPointsKey = 'num-points';

export const getNumPoints = async () => {
  const { value } = await Storage.get({ key: numPointsKey });
  return JSON.parse(value ?? '0');
};

export const setNumPoints = async (points: number) => {
  await Storage.set({ key: numPointsKey, value: JSON.stringify(points) });
};
