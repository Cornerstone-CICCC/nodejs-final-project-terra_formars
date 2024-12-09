export const themes = [
  // nouns
  "cat",
  "dog",
  "house",
  "tree",
  "sun",
  "moon",
  "star",
  // food
  "pizza",
  "apple",
  "banana",
  "sushi",
  "cake",
  // vehicle
  "car",
  "bike",
  "train",
  "plane",
  // animal
  "elephant",
  "giraffe",
  "penguin",
  "lion",
  // object
  "chair",
  "table",
  "book",
  "phone",
];

export const getRandomTheme = () => {
  return themes[Math.floor(Math.random() * themes.length)];
};
