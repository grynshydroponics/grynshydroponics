# Plant library generator

The app does **not** call the Perenual API at runtime. You preload it with a generated JSON.

## 1. Configure plants to fetch

Edit **`getPlantInfo.json`** in the project root:

- **`queries`**: search terms (e.g. `["basil", "tomato", "lettuce"]`). The script uses the first Perenual result for each.
- **`speciesIds`**: exact Perenual species IDs if you know them (e.g. `[123, 456]`).

## 2. Run the generator

Set your [Perenual API key](https://perenual.com/user/developer) and run:

```bash
PERENUAL_API_KEY=your_key npm run generate-plant-library
```

Or put the key in `mykey.md` (first line) and run:

```bash
npm run generate-plant-library
```

Output is written to **`plantLibrary.generated.json`** in the project root.

## 3. Preload the app

When you’re ready, use that JSON in the app (e.g. replace or merge with `src/data/plants.ts` or load it at runtime). Each entry in the generated file has:

- `id`, `name`, `perenualId`, `image`
- `cycle`, `estimatedDaysToHarvest` (from details + care guide)
- optional `scientific_name`, `watering`, `sunlight`
