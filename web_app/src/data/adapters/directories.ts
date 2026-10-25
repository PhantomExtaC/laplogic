import type { z } from 'zod';
import type { driversSchema, tracksSchema } from '../schemas';
import type { Driver, Track } from '../../domain/types/directories';
import { lapSeconds } from './index';

export function adaptDriver(row: z.infer<typeof driversSchema>[number]): Driver {
  return { ...row, poles: row.polePositions };
}

export function adaptTrack(row: z.infer<typeof tracksSchema>[number], assets: ReadonlySet<string>): Track {
  return {
    ...row,
    corners: row.turns,
    layout: row.layoutImage !== null && assets.has(row.layoutImage) ? row.layoutImage : null,
    laps: null,
    drsZones: null,
    lapRecord: row.lapRecord === null ? null : {
      time: row.lapRecord.time,
      driver: row.lapRecord.driver,
      year: row.lapRecord.year,
      seconds: lapSeconds(row.lapRecord),
    },
  };
}
