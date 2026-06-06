# 🍽️ MealMind — AI-Powered Personal Cooking Planner

**MealMind** is a premium, responsive AI cooking planner built for the **PromptWars Jaipur Hackathon**. It generates hyper-personalized daily meal plans, complete grocery lists, budget feasibility analysis, and tailored ingredient substitutions based on the user's daily activity level, cuisine preference, budget, and dietary restrictions.

Powered by **Google Gemini** models using the new `@google/genai` SDK, MealMind features a sleek, interactive wizard interface with stunning glassmorphism styles and live rate-limit/quota recovery mechanisms.

---

## ✨ Key Features

### 1. 🚶 Step-by-Step Wizard
- **Activity Profile**: Captures daily physical exertion, scheduling density, and custom day description.
- **Dietary & Cuisine Preferences**: Multi-select dietary restrictions (Vegetarian, Vegan, Gluten-Free, Keto, etc.), select preferred cuisines, and specify food allergies.
- **Budgeting & Scale**: Specify daily budgets (in Indian Rupees ₹) and number of people to scale portion pricing dynamically.
- **Preview & Generate**: A review card summarized before triggering the AI model for plan generation.

### 2. 🍛 Complete Meal Plans
- Structured recipes for **Breakfast**, **Lunch**, **Dinner**, and **Snacks**.
- Step-by-step recipes, precise prep/cook times, and list of ingredients.
- Clean macro bars showing the division of Protein, Carbs, Fat, and Fiber.

### 3. 📊 Interactive Nutritional Dashboard
- **SVG Ring Progress Visuals**: Real-time rings displaying calories, protein, carbs, fat, and fiber metrics against daily nutrition goals.
- **Micronutrient Tracking**: Interactive badges showing RDA percentage coverage for Vitamin C, Vitamin D, Vitamin B12, Calcium, Iron, and Zinc.

### 4. 💰 Budget Feasibility Analysis
- **Per-meal Cost Allocation**: Compares breakfast, lunch, dinner, and snack costs.
- **Feasibility Status**: Categorizes budgets dynamically as `Within`, `Slightly-Over`, or `Over`.
- **Smart Savings Tips**: Tailored AI suggestions to reduce recipe costs without sacrificing nutrition.

### 5. 🛒 Smart Grocery Checklist
- Categorized shopping checklist (Dairy, Vegetables, Grains, Proteins, Spices, etc.).
- Includes ingredient quantities and estimated local market prices in Indian Rupees (₹).
- Per-item quick substitutions.

### 6. 🔄 Active Substitutions
- Quick substitutions for key ingredients to adapt to allergies, budget, or pantry shortages.

---

## 🛠️ Technical Stack & Implementation

- **Frontend**: [Vite](https://vitejs.dev/) + [React](https://react.dev/)
- **Styling**: Vanilla CSS (CSS Variables, Grid, Flexbox, custom keyframe animations, glassmorphism overlays)
- **AI Integration**: [@google/genai SDK](https://www.npmjs.com/package/@google/genai)
- **Dynamic Model Selection**: Fetches available models from Google AI Studio dynamically using the user's API key, filtering for active models that support text generation (`generateContent`).
- **Quota Error Panels**: Automatically handles `429 RESOURCE_EXHAUSTED` responses:
  - *Daily Quota Exhaustion*: Prompts user to swap models (e.g., fallback to Gemini 1.5 Flash).
  - *Rate Limits*: Displays a live count-down timer before enabling the retry action.

---

## 📂 Project Structure

```
PromptWars/
├── README.md                      # Project documentation
├── meal-mind/                     # React App Root
│   ├── index.html                 # App HTML skeleton (Google Fonts integration)
│   ├── package.json               # Node dependencies
│   ├── src/
│   │   ├── main.jsx               # Entry script
│   │   ├── index.css              # Styling system (Glassmorphism, animations, responsive vars)
│   │   ├── App.jsx                # Main App & Wizard state management
│   │   ├── services/
│   │   │   └── geminiService.js   # Gemini AI API connector & model list parser
│   │   └── components/
│   │       ├── WizardStep1_Activity.jsx
│   │       ├── WizardStep2_Diet.jsx
│   │       ├── WizardStep3_Budget.jsx
│   │       ├── WizardStep4_Generate.jsx
│   │       ├── MealCard.jsx
│   │       ├── GroceryList.jsx
│   │       ├── NutritionDashboard.jsx
│   │       └── BudgetPanel.jsx
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Setup Instructions

1. **Navigate to the web app directory**:
   ```bash
   cd meal-mind
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:5173/](http://localhost:5173/).

5. **API Key Setup**:
   Obtain a free API key from [Google AI Studio](https://aistudio.google.com/apikey). When prompting, save your API key in the app’s modal. The key is stored securely in your browser's local storage (`localStorage`).

---

## 🎨 Design System & Aesthetics

- **Color Palette**: Pitch dark background (`#0a0a0f`) styled with semi-transparent glass cards (`rgba(255, 255, 255, 0.06)`) and highlighted using harmonic gradients (Violet to Cyan, Amber to Rose).
- **Typography**: Sleek headings using `Outfit` combined with highly readable `Inter` for content text.
- **Micro-Animations**: Shimmer buttons, floating UI logo actions, jumping loaders, and spring transitions for card overlays.
- **Responsiveness**: Entire layout adjusts dynamically from high-resolution viewports down to small screens.