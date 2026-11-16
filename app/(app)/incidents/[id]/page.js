import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import IncidentActionForm from "@/components/IncidentActionForm";
import IncidentMapLoader from "@/components/IncidentMapLoader";
import StatusBadge from "@/components/StatusBadge";
import { changeIncidentStatusAction, resolveIncidentAction } from "@/lib/incidentActions";
import { getIncidentDetails } from "@/lib/incidents";
import { INCIDENT_STATUS, INCIDENT_STATUS_LABEL, INCIDENT_STATUS_PILL, getAllowedNextStatuses } from "@/lib/incidentStatus";
import { toMapMarker } from "@/lib/mapMarkers";
import { ROLE, canAccessDistrict } from "@/lib/roles";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/;
const DETAIL_MAP_ZOOM = 12;
const EVENT_LABEL = { AUTO_ASSIGNED: "Auto-assigned", STATUS_CHANGED: "Status changed" };
const inputClass =
  "w-full rounded-md border border-outline-variant bg-white px-3 py-2 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20";
const cardClass = "rounded-xl border border-outline-variant bg-surface-lowest p-6 shadow-sm";

function Fact({ label, value }) {
  return (
    <div className="rounded-lg border border-outline-variant/50 bg-surface-low/40 p-3.5">
      <span className="mb-1 block text-xs text-outline">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function CardHeading({ icon, title, description }) {
  return (
    <div className="mb-5 flex items-center gap-2.5 border-b border-outline-variant/50 pb-4">
      <span className="rounded-lg bg-surface-low p-2 text-secondary"><Icon name={icon} /></span>
      <div>
        <h2 className="font-display text-lg font-bold text-on-surface">{title}</h2>
        <p className="text-xs text-outline">{description}</p>
      </div>
    </div>
  );
}

export default async function IncidentDetailsPage({ params }) {
  const { id } = await params;
  if (!OBJECT_ID_PATTERN.test(id)) notFound();
  const session = await requireSession();
  const incident = await getIncidentDetails(id);
  // Incidents outside the user's scope look the same as missing ones.
  if (!incident || !canAccessDistrict(session, incident.district)) notFound();

  const { observation } = incident;
  const nextStatuses = getAllowedNextStatuses(incident.status);
  // Resolving has its own card: it is the officer's closing decision and needs a note.
  const reviewStatuses = nextStatuses.filter((status) => status !== INCIDENT_STATUS.RESOLVED);
  const canResolve = session.role === ROLE.DISTRICT_OFFICER && nextStatuses.includes(INCIDENT_STATUS.RESOLVED);

  return (
    <>
      <Link href="/incidents" className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary">
        <Icon name="arrow_back" className="!text-lg" /> Back to incidents
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight">Incident in {incident.district.name}</h1>
        <StatusBadge status={incident.status} />
        {observation.isSampleData && (
          <span className="rounded border border-[#FCD34D] bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#92400E]">
            Sample data
          </span>
        )}
      </div>

      <section className={cardClass}>
        <CardHeading
          icon="radar"
          title="Satellite observation (suspected fire, not verified)"
          description="Original record from the satellite source. It is never changed by assignment or review."
        />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:col-span-7">
            <Fact label="Source" value={observation.source} />
            <Fact label="Observed at" value={observation.observedAt.toISOString().replace("T", " ").slice(0, 16) + " UTC"} />
            <Fact label="Latitude" value={observation.latitude.toFixed(5)} />
            <Fact label="Longitude" value={observation.longitude.toFixed(5)} />
            <Fact label="Confidence" value={observation.confidence ?? "not provided"} />
            {observation.brightness != null && <Fact label="Brightness (K)" value={observation.brightness} />}
            {observation.frp != null && <Fact label="Fire radiative power (MW)" value={observation.frp} />}
            <Fact label="Assigned to" value={incident.assignedTo ?? "Unassigned"} />
          </div>
          <div className="h-72 overflow-hidden rounded-lg border border-outline-variant lg:col-span-5">
            <IncidentMapLoader
              incidents={[toMapMarker(incident)]}
              center={[observation.latitude, observation.longitude]}
              zoom={DETAIL_MAP_ZOOM}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={cardClass}>
          <CardHeading icon="assignment_ind" title="Assigned authority" description="Detections go automatically to the officer of their district." />
          <p className="text-sm font-semibold">{incident.assignedTo ?? "Unassigned"}</p>
          <p className="mt-1 text-xs text-outline">{incident.district.name}, {incident.district.state}</p>
        </section>
        {reviewStatuses.length > 0 && (
          <section className={cardClass}>
            <CardHeading icon="published_with_changes" title="Review / update status" description="Record findings and move the incident forward." />
            <IncidentActionForm
              action={changeIncidentStatusAction}
              incidentId={incident.id}
              submitLabel="Update status"
              confirmMessage="Change the status of this incident?"
            >
              <label className="block text-sm font-semibold">
                New status
                <select name="nextStatus" className={`${inputClass} mt-1.5 font-normal`}>
                  {reviewStatuses.map((status) => (
                    <option key={status} value={status}>{INCIDENT_STATUS_LABEL[status]}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Investigation findings
                <textarea name="note" rows={3} maxLength={1000} placeholder="Optional notes" className={`${inputClass} mt-1.5 resize-none font-normal`} />
              </label>
            </IncidentActionForm>
          </section>
        )}
        {canResolve && (
          <section className={cardClass}>
            <CardHeading icon="task_alt" title="Close this case" description="Mark the incident resolved once the burning has been dealt with." />
            <IncidentActionForm
              action={resolveIncidentAction}
              incidentId={incident.id}
              submitLabel="Mark resolved"
              confirmMessage="Mark this incident as resolved? This closes the case."
            >
              <label className="block text-sm font-semibold">
                Resolution note
                <textarea
                  name="note"
                  rows={3}
                  required
                  minLength={5}
                  maxLength={1000}
                  placeholder="What action was taken?"
                  className={`${inputClass} mt-1.5 resize-none font-normal`}
                />
              </label>
            </IncidentActionForm>
          </section>
        )}
      </div>

      <section className={cardClass}>
        <CardHeading icon="history" title="History" description="Every assignment and status change, with who made it." />
        {incident.events.length === 0 && <p className="text-sm text-outline">No actions recorded yet.</p>}
        <ol className="relative space-y-4 pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-0.5 before:bg-outline-variant">
          {incident.events.map((event) => (
            <li key={event.id} className="relative rounded-lg border border-outline-variant/40 bg-surface-low/40 p-4">
              <span
                className="absolute -left-6 top-4 h-4 w-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: INCIDENT_STATUS_PILL[event.toStatus ?? incident.status].marker }}
              />
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-mono text-xs font-bold">{event.createdAt.toISOString().slice(0, 16).replace("T", " ")}</span>
                <span className="font-semibold">{EVENT_LABEL[event.action] ?? event.action}</span>
                {event.toStatus && <StatusBadge status={event.toStatus} />}
              </div>
              {event.note && <p className="mt-1 text-sm text-on-surface-variant">{event.note}</p>}
              <p className="mt-1 text-xs text-outline">By {event.actor}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
