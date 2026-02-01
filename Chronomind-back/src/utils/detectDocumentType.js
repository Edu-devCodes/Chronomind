export function isLikelyResume(text) {
  const keywords = [
    "currículo",
    "curriculum vitae",
    "resume",
    "experiência profissional",
    "formação acadêmica",
    "education",
    "experience",
    "skills",
    "professor",
    "consultant",
    "university",
    "faculty",
    "sales",
    "retired"
  ];

  const lower = text.toLowerCase();
  let hits = 0;

  for (const k of keywords) {
    if (lower.includes(k)) hits++;
  }

  return hits >= 3; // ↓ era 4, muito agressivo
}
