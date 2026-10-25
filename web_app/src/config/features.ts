export const features = { simulationProvider: import.meta.env.VITE_SIM_API_URL ? 'http' : 'placeholder' } as const;
