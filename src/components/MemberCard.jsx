export default function MemberCard({ name, role, photo, quote }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-surface-light ring-1 ring-white/10 transition hover:-translate-y-1 hover:ring-white/20">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={photo}
          alt={name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <h3 className="font-semibold text-slate-100">{name}</h3>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-400">
            {role}
          </p>
        </div>
        <p className="mt-auto text-sm italic text-slate-400">“{quote}”</p>
      </div>
    </div>
  )
}
