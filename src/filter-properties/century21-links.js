import { readFile } from "node:fs/promises";

export async function readCentury21Checkpoint() {
  try {
    const content = await readFile(
      new URL("./database-century21.json", import.meta.url),
      "utf8",
    );
    return JSON.parse(content).lastProperty?.code;
  } catch (error) {
    if (error.code === "ENOENT") return undefined;
    throw error;
  }
}

export function century21LinksBeforeCheckpoint(links, code) {
  // Keep the listing order: newest properties appear first.
  const orderedLinks = [...links];
  if (!code) return orderedLinks;
  const checkpointIndex = orderedLinks.findIndex((href) => {
    const linkCode = new URL(href).pathname.match(/-([a-z0-9]+)\.html$/i)?.[1];
    return linkCode?.toLowerCase() === String(code).toLowerCase();
  });
  return checkpointIndex === -1
    ? orderedLinks
    : orderedLinks.slice(0, checkpointIndex);
}
