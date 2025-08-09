export const RandomImage = () => {
  const imageSrc = `${process.env.CLIENT_API}/hourly-image`;

  return (
    <div style={{ marginTop: "1rem" }}>
      <img src={imageSrc} style={{ width: "20rem", height: "auto" }} />
    </div>
  );
};
