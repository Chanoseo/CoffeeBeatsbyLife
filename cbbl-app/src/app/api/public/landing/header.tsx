function Header({ hero }) {
  return (
    <header>
      <img src={hero.image} alt="Hero" />
      <h1>{hero.headline}</h1>
      <p>{hero.subtext}</p>
      <a href={hero.ctaHref}>{hero.ctaText}</a>
    </header>
  );
}
export default Header;
