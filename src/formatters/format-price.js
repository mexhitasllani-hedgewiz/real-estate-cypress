function formatPrice(price) {
  if (typeof price !== "string") return price;

  return price.replace(
    /^\s*€\s*([\d.]+)\s*$/,
    (_, amount) => `${amount.replace(/\./g, ",")} €`,
  );
}

export { formatPrice };
