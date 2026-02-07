import { BlogCard } from "@/components/blog/blog-card";

const blogEntries = [
  {
    title: "Waarom Ultravasan?",
    date: "Januari 2026",
    excerpt:
      "Al jaren droom ik van een ultramarathon in Scandinavie. De Ultravasan 90 km van Salen naar Mora door de Zweedse wildernis voelde meteen als de perfecte uitdaging. In dit eerste artikel leg ik uit waarom juist deze race, en wat het voor mij betekent om 92 kilometer door de bossen te rennen.",
  },
  {
    title: "Eerste maand training",
    date: "December 2025",
    excerpt:
      "De eerste vier weken zitten erop. Van 30 naar 42 kilometer per week, drie tot vier runs, en de eerste lange duurloop van 16 kilometer. Hoe het voelde, wat ik geleerd heb over base building, en waarom geduld de belangrijkste eigenschap is van een ultrarunner.",
  },
  {
    title: "De route verkennen in Mora",
    date: "November 2025",
    excerpt:
      "Een verkennend bezoek aan Mora en de start in Salen. De finishlijn al een keer gezien, het terrein verkend en de hoogtemeters bestudeerd. Negen checkpoints, eindeloze bossen en het besef dat dit echt gaat gebeuren. Een reisverslag van mijn eerste kennismaking met het parcours.",
  },
];

export default function BlogPage() {
  return (
    <div className="space-y-6">
      {/* Coming soon banner */}
      <div className="rounded-xl border border-(--accent) bg-(--accent-light) px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-(--accent) px-3 py-1 text-xs font-bold text-white">
            Coming soon
          </span>
          <p className="text-sm font-medium text-(--accent-text)">
            Het blog wordt binnenkort gelanceerd met uitgebreide trainingsverslagen.
          </p>
        </div>
      </div>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary)">Blog</h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          Verhalen, inzichten en lessen van de weg naar Ultravasan 90
        </p>
      </div>

      {/* Blog entry cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blogEntries.map((entry) => (
          <BlogCard
            key={entry.title}
            title={entry.title}
            date={entry.date}
            excerpt={entry.excerpt}
          />
        ))}
      </div>
    </div>
  );
}
