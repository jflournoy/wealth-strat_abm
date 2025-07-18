# Wealth Stratification ABM

An **Agent Stratification Demo** that simulates how wealth distributes and evolves across generations based on gene–environment interactions, mating homophily, and stochastic influences. See [it live](http://johnflournoy.science/wealth-strat_abm/).

## Features

- **Interactive Controls**  
  - **Start**, **Pause**, **Reset**, **Step** execution  
  - **Color by:** attribute selector  
- **Model Parameters**  
  - **Environment Quality Noise σ**  
  - **Finance Success Noise σ**  
  - **Gene Homophily for Mating**  
  - **Env Homophily for Mating**  
- **Visualizations**  
  - Distribution of income histogram  
  - Lorenz curve  
  - Gini coefficient evolution over time  
- **Reference Prototype**  
  - `proto.r` contains a standalone R implementation of the same simulation logic for comparison

## Demo

Open `index.html` in your browser (or run locally via Vite) to interact with sliders and observe wealth dynamics in real time.

## Getting Started

### Prerequisites

- **Node.js** (v18 or later recommended)  
- **npm** (comes with Node.js)  

### Installation

```bash
# Clone the repository
git clone https://github.com/jflournoy/wealth-strat_abm.git
cd wealth-strat_abm

# Install dependencies
npm install
```

### Development Server

Launch a local development server with hot‑reloading:

```bash
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Production Build

Compile and minify for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Running Tests

Execute the test suite with Vitest:

```bash
npm run test
```

## Project Structure

```
.
├── src/                   # TypeScript source files
├── index.html            # Main HTML entry point
├── proto.r               # Reference R prototype of the model
├── package.json          # Project manifest and scripts
├── tsconfig.json         # TypeScript compiler configuration
├── vite.config.ts        # Vite build configuration
└── .gitignore            # Ignored files
```

## Dependencies

- **Visualization & UI**  
  - [D3](https://github.com/d3/d3) for dynamic charts  
- **Statistical Utilities**  
  - [jstat](https://github.com/jstat/jstat) for distributions and random sampling  
  - [@stdlib/stats-ranks](https://github.com/stdlib-js/stats-ranks) for computing ranks  
- **Spatial Structures**  
  - [kd-tree-javascript](https://github.com/ubilabs/kd-tree-javascript) for homophily‑based neighbor searches  

_All managed via npm_

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.
