import {useResource} from "../data/hooks/useResource";
import {ResourceBoundary} from "../ui/ResourceBoundary";
import {getCalendarResource} from "../data/services";





export default function Calendar() {
  const state=useResource(getCalendarResource);
  if(state.status!=='ready')return <div className="p-6"><ResourceBoundary state={state}>{()=>null}</ResourceBoundary></div>;
  const calendar=state.data;
  return (
<div className="mx-auto max-w-7xl p-8">
  <div className="relative flex flex-col w-full overflow-hidden rounded-xl bg-neutral-900 shadow-md">

    {/* Header */}
    <div className="flex flex-col justify-between gap-4 border-b p-6 md:flex-row md:items-center">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Race Calendar
        </h1>
        <p className="mt-1 text-sm text-gray-300">
          Complete Formula 1 season schedule.
        </p>
      </div>

     
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-neutral-800">
          <tr>
            <th className="px-6 py-4 text-sm font-semibold text-neutral-300">
              Round
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-neutral-300">
              Grand Prix
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-neutral-300">
              Date
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-neutral-300">
              Sprint
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-neutral-300">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {calendar.map((race) => (
            <tr
              key={race.round}
              className="border-b last:border-none hover:bg-neutral-800 transition-colors"
            >
              <td className="px-6 py-4 font-medium">
                {race.round}
              </td>

              <td className="px-6 py-4">
                {race.grandPrix}
              </td>

              <td className="px-6 py-4 text-gray-300">
                {race.date}
              </td>

              <td className="px-6 py-4">
                {race.sprintWeekend ? (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Sprint
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-orange-600">
                    No Sprint
                  </span>
                )}
              </td>

              <td className="px-6 py-4">
                {race.status === "upcoming" && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Upcoming
                  </span>
                )}

                {race.status === "in_progress" && (
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                    In Progress
                  </span>
                )}

                {race.status === "completed" && (
                  <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-700">
                    Completed
                  </span>
                )}

                {race.status === "cancelled" && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    Cancelled
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  </div>
</div>
  );
}
