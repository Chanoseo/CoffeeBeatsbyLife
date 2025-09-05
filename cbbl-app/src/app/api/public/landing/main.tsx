function Main({ features, cta }) {
  return (
    <main>
      <section>
        {features.map((f, i) => (
          <div key={i}>
            <img src={f.image} alt="" />
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>
      <section>
        <h2>{cta.title}</h2>
        <a href={cta.href}>{cta.button}</a>
      </section>
    </main>
  );
}
export default Main;
