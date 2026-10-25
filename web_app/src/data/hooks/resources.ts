import { useResource } from './useResource';
import * as core from '../services/core';
import { getCalendarResource, getPredictionsResource, getWeekendResource, getProgressionResource, getEvaluation } from '../services';

export const useDrivers = () => useResource(core.getDriverDirectory);
export const useTeams = () => useResource(core.getTeamDirectory);
export const useTracks = () => useResource(core.getTrackDirectory);
export const useDriverStandings = () => useResource(core.getDriverStandingsResource);
export const useTeamStandings = () => useResource(core.getTeamStandingsResource);
export const useSeasonStats = () => useResource(core.getSeasonStats);
export const useStages = () => useResource(core.getStages);
export const useMomentum = () => useResource(core.getMomentum);
export const useTrackProfiles = () => useResource(core.getTrackProfiles);
export const useInsights = () => useResource(core.getInsights);
export const useCalendar = () => useResource(getCalendarResource);
export const usePredictions = () => useResource(getPredictionsResource);
export const useWeekend = () => useResource(getWeekendResource);
export const useProgression = () => useResource(getProgressionResource);
export const useEvaluation = () => useResource(getEvaluation);
