import { Gift, PackageCheck, PenLine, Users } from "lucide-react";

export function RuvaaniPromise() {
  return <section className="wrap ruvaani-promise section" aria-labelledby="promise-heading"><span className="eyebrow">THE RUVAANI PROMISE</span><h2 id="promise-heading">Considered, down to <em>the details.</em></h2><div>
    {[{ title: "Thoughtfully curated", text: "A meaningful selection, never just a list of products.", icon: Gift }, { title: "Made personal", text: "Discuss your branding, message and finishing touches.", icon: PenLine }, { title: "Beautifully presented", text: "Packaging and contents agreed with your quotation.", icon: PackageCheck }, { title: "Together, from 10 gifts", text: "A clear brief for teams, celebrations and your people.", icon: Users }].map(({ title, text, icon: Icon }) => <article key={title}><Icon size={34} strokeWidth={1.2} /><h3>{title}</h3><p>{text}</p></article>)}
  </div></section>;
}
