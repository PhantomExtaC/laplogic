import { useResource } from '../data/hooks/useResource';
import { legacy } from '../data/adapters';
import { ResourceBoundary } from '../ui/ResourceBoundary';
import { Surface, SectionHeader } from '../ui/Surface';
import { Select } from '../ui/Controls';
import { useState, useMemo } from "react";

import TrackCard from "../components/cards/TrackCard";

import { getTracks } from "../services/tracks";


const loadTracks = async (signal: AbortSignal) => legacy(await getTracks(signal));

export default function Tracks() {
  const tracksState = useResource(loadTracks);

  const [sortBy, setSortBy] = useState("alphabetical");


  const sortedTracks = useMemo(() => {
    const updatedTracks = tracksState.status === 'ready' ? [...tracksState.data] : [];

    return updatedTracks.sort((a, b) => {
      if (sortBy === "alphabetical") {
        // Safe string comparison fallback
        const nameA = a.name || "";
        const nameB = b.name || "";
        return nameA.localeCompare(nameB);
      }

      if (sortBy === "lengthAsc" || sortBy === "lengthDesc") {
        // Safely convert to string first to handle both nulls and numbers, then parse
        if (a.lengthKm === null) return b.lengthKm === null ? 0 : 1;
        if (b.lengthKm === null) return -1;
        const lengthA = a.lengthKm;
        const lengthB = b.lengthKm;
        
        return sortBy === "lengthAsc" ? lengthA - lengthB : lengthB - lengthA;
      }

      if (sortBy === "recency") {
        // Only call substring if lastGrandPrix is a valid string
        const yearA = typeof a.lastGrandPrix === "string" 
          ? parseInt(a.lastGrandPrix.substring(0, 4), 10) 
          : 0;
          
        const yearB = typeof b.lastGrandPrix === "string" 
          ? parseInt(b.lastGrandPrix.substring(0, 4), 10) 
          : 0;
        
        return yearB - yearA;
      }

      return 0;
    });
  }, [tracksState, sortBy]);

  return (
    <div className="page space-y-6">
      <SectionHeader title="Tracks" level={1} kicker="LapLogic / Directory" asOf="Directory export · season and as-of unverified" />

      <Surface>
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <Select label="Sort by"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="alphabetical">Alphabetical (A-Z)</option>
          <option value="lengthAsc">Track Length (Shortest to Longest)</option>
          <option value="lengthDesc">Track Length (Longest to Shortest)</option>
          <option value="recency">Recency (Most Recent First)</option>
        </Select>
      </div>

      </Surface>
      <ResourceBoundary state={tracksState}>{() => <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sortedTracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
          />
        ))}
      </div>
      </>}</ResourceBoundary>
    </div>
  );
}
