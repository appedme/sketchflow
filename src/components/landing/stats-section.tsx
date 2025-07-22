export function StatsSection() {
  const stats = [
    {
      number: "10K+",
      label: "Active Users",
      description: "Creators worldwide"
    },
    {
      number: "50K+",
      label: "Projects Created",
      description: "Visual stories shared"
    },
    {
      number: "99.9%",
      label: "Uptime",
      description: "Reliable platform"
    },
    {
      number: "24/7",
      label: "Support",
      description: "Always here to help"
    }
  ];

  return (
    <section className="py-20 px-4 bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-bitcount-heading">
            Trusted by Creators Worldwide
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Join thousands of professionals who trust SketchFlow for their visual projects
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2 font-bitcount">
                {stat.number}
              </div>
              <div className="text-xl font-semibold mb-1">
                {stat.label}
              </div>
              <div className="text-sm opacity-80">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}