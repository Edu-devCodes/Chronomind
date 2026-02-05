const KEY = "chronomind_categories";

export function getCategories() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function saveCategories(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addCategory(category) {
  const list = getCategories();

  list.push(category);

  saveCategories(list);
}

export function cleanUnusedCategories(goals) {

  const used = new Set(
    goals
      .map(g => g._id)
      .filter(Boolean)
  );

  const all = getCategories();

  const filtered = all.filter(cat =>
    used.has(cat.goalId)
  );

  saveCategories(filtered);
}