export async function* mockStreamAnswer(q: string): AsyncGenerator<string> {
  const answers = [
    "Great question! Think of an ArrayList like a stretchy array that grows as you add items. Access is O(1), inserts in the middle are O(n).",
    "A HashMap works by hashing keys to find a bucket. Good hashes make lookups average O(1); collisions are resolved by chaining or open addressing.",
    "Sorting at scale needs efficient algorithms: O(n log n) like mergesort/quickSort. Stability and memory usage matter for real workloads.",
  ];
  // Use the question to deterministically pick an answer (avoids unused param warning)
  const seed = Array.from(q).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const answer = answers[seed % answers.length];
  const chunks = answer.match(/.{1,15}/g) || [];
  for (const c of chunks) {
    await new Promise((r) => setTimeout(r, 100));
    yield c;
  }
}
