# Wealth Stratification ABM

An **Agent-Based Model** demonstrating how wealth inequality emerges and evolves across generations through the interplay of genetic potential, environmental factors, assortative mating, and stochastic events. See the [live demo](http://johnflournoy.science/wealth-strat_abm/).

## Table of Contents

- [Overview](#overview)
- [Model Description](#model-description)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Tools](#development-tools)
- [Testing](#testing)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Overview

This simulation models how socioeconomic stratification emerges from intergenerational wealth transmission. Each agent has:

- **Genetic potential** (two alleles inherited from parents)
- **Environmental endowment** (derived from parental wealth + noise)
- **Education score** (weighted combination of genes and environment)
- **Wealth** (log-normal distribution with Pareto tail, influenced by education and parental wealth)

The model explores how different parameter settings affect inequality metrics (Gini coefficient), wealth concentration, and social mobility across generations.

## Model Description

### Agent Properties

Each agent in the simulation has the following characteristics:

- `alleles`: Two real-valued genes (inherited from parents with small mutation chance)
- `meanAllele`: Average of the two alleles (genetic education potential)
- `env`: Environmental quality score (derived from parental wealth, transformed via rank-based inverse normal)
- `educationScore`: Weighted sum of genetic potential and environmental endowment
- `wealth`: Financial outcome (log-normal × Pareto distribution)
- `parentWealth`: Combined wealth of both parents

### Key Mechanisms

#### 1. Education Formation

```
educationScore = geneEnvWeight × meanAllele + (1 - geneEnvWeight) × env
```

The `geneEnvWeight` parameter controls the relative contribution of nature vs. nurture.

#### 2. Wealth Generation

Wealth follows a two-component distribution:

- **Bulk wealth**: Log-normal distribution centered around median (~$50k)
- **Tail wealth**: Pareto distribution creating the upper tail
- **Parental effect**: Weighted contribution from parental wealth
- **Stochastic noise**: Gaussian noise terms for unpredictable life events

```
potentialWealth = exp(μ_L + σ_L × educationScore + noise) × Pareto(κ)
wealth = financeWeight × potentialWealth + (1 - financeWeight) × (parentComponent + parentWealth × catastrophe)
```

#### 3. Environmental Inheritance

Children's environment is determined by:

1. Rank-transform of parental wealth into percentiles
2. Inverse-CDF mapping to standard normal distribution
3. Addition of Gaussian noise (σ controlled by `envNoiseStd`)

This creates strong but imperfect environmental transmission.

#### 4. Assortative Mating

Mate selection uses a k-d tree for efficient similarity search in gene-environment space:

- **Gene homophily**: Preference for partners with similar genetic potential
- **Environment homophily**: Preference for partners from similar backgrounds
- **Distance metric**: Weighted Manhattan distance with homophily-based stretching

```
distance = α_gene × |meanAllele_A - meanAllele_B| + α_env × |env_A - env_B|
```

where α values are derived from homophily parameters ∈ [0, 1].

#### 5. Generational Transition

Each generation:

1. Agents are paired based on homophily preferences
2. Each pair produces 2 children
3. Children inherit one allele from each parent (with 1% mutation rate)
4. Children's environment is computed from parental wealth
5. Education and wealth scores are calculated
6. Previous generation is replaced

## Features

### Interactive Controls

- **Start/Pause/Reset**: Control simulation execution
- **Step**: Advance one generation at a time
- **Color by**: Visualize agents by different attributes (genes, environment, education, wealth)

### Adjustable Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| **Env Quality Noise σ** | 0-2 | Random variation in environmental endowment inheritance |
| **Env ↔ Gene Weight** | 0-1 | Balance between environmental (0) and genetic (1) influence on education |
| **Parent Wealth ↔ Education Weight** | 0-1 | Balance between parental wealth (0) and education (1) in determining agent wealth |
| **Wealth Noise σ** | 0-2 | Random variation in wealth outcomes |
| **Gene Homophily** | 0-1 | Strength of assortative mating by genetic potential |
| **Env Homophily** | 0-1 | Strength of assortative mating by environmental background |

### Real-Time Visualizations

- **Agent Raster**: Grid visualization of population colored by selected attribute
- **Wealth Histogram**: Distribution of agent wealth (log scale)
- **Feature Histogram**: Distribution of currently selected feature
- **Lorenz Curve**: Cumulative wealth inequality visualization
- **Gini Time Series**: Evolution of inequality coefficient across generations

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** (bundled with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/jflournoy/wealth-strat_abm.git
cd wealth-strat_abm

# Install dependencies
npm install
```

### Development Server

Launch the development server with hot module reloading:

```bash
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

### Production Build

Build the optimized production bundle:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Deploy to GitHub Pages:

```bash
npm run deploy
```

## Project Structure

### TypeScript ABM Implementation

```
src/
├── model.ts              # Core ABM logic (agents, mating, generations)
├── model.test.ts         # Vitest unit tests for model
├── main.ts               # Application entry point and UI bindings
├── helpText.ts           # In-app help content
├── ui/
│   ├── controls.ts       # UI control components
│   └── widgets.ts        # Reusable UI widgets
└── viz/
    ├── plots.ts          # D3 visualizations (Lorenz, Gini, histograms)
    └── raster.ts         # Canvas-based agent grid rendering
```

### JavaScript Development Tools

The repository includes Claude Code helper scripts for AI-assisted development:

```
scripts/
├── cli.js                # Setup CLI for new projects
├── docs.js               # Documentation maintenance
├── feature-check.js      # Verify new features have tests/docs
├── learn.js              # Capture development insights
├── monitor-repo.js       # GitHub CI/PR monitoring
├── reflect.js            # Structured reflection prompts
├── retrospective.js      # Session retrospectives
├── session-history.js    # Conversation history management
├── tdd.js                # TDD workflow automation
└── todo-github.js        # GitHub Issues integration

.claude/commands/         # Slash commands for Claude Code
├── commit.md             # Atomic commit workflow
├── docs.md               # Documentation updates
├── hygiene.md            # Project health checks
├── learn.md              # Learning capture
├── monitor.md            # Repository monitoring
├── next.md               # AI-recommended next steps
├── push.md               # Safe push workflow
├── reflect.md            # Reflection prompts
├── retrospective.md      # Session summaries
├── session-history.md    # Conversation archiving
├── tdd.md                # TDD cycle guidance
└── todo.md               # Task management
```

### Other Files

```
index.html                # Main HTML entry point
proto.r                   # Reference R prototype of the model
package.json              # NPM dependencies and scripts
tsconfig.json             # TypeScript configuration
vite.config.ts            # Vite build configuration
eslint.config.js          # Code quality rules
.remarkrc.js              # Markdown linting configuration
CLAUDE.md                 # AI development guidelines
```

## Development Tools

This project includes a comprehensive suite of development automation tools designed for Claude Code but usable standalone.

### Slash Commands

Available slash commands (see `.claude/commands/`):

- `/hygiene` - Run comprehensive project health checks
- `/commit` - Create atomic commits with quality validation
- `/tdd` - TDD workflow (red-green-refactor cycle)
- `/docs` - Update and validate documentation
- `/todo` - Manage tasks via GitHub Issues
- `/learn` - Capture development insights
- `/monitor` - Monitor CI/PR status
- `/reflect` - Structured reflection on work
- `/next` - Get AI-recommended priorities

### NPM Scripts

Quality and maintenance scripts:

```bash
# Quality checks
npm run hygiene           # Quick health check
npm run hygiene:full      # Comprehensive analysis
npm run lint:check        # ESLint validation
npm run test:check        # Test execution
npm run feature:check     # Verify features have tests/docs
npm run markdown:lint     # Validate markdown files

# Development
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report

# Documentation
npm run docs              # Update documentation
npm run docs:examples     # Generate examples

# Learning & reflection
npm run learn             # Capture insights
npm run reflect:quick     # Quick reflection
npm run retrospective     # Session summary

# Monitoring
npm run monitor:start     # Start CI monitoring
npm run monitor:status    # Check status
```

### Feature Quality Gate

The project enforces that all new features must have:

1. **Test coverage** - Unit or integration tests
2. **Documentation** - README or docs/ updates

Configure exclusions in `.featurecheckignore` for non-feature files.

## Testing

### Unit Tests (Vitest)

The model includes comprehensive unit tests covering:

- Population initialization
- Education score computation
- Wealth generation (log-normal × Pareto)
- Environmental inheritance via rank transformation
- Assortative mating with homophily
- Generational transitions

Run tests:

```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Integration Tests (Node.js Test Runner)

Development tools have integration tests validating:

- CLI functionality
- Documentation generation
- Feature checking
- Markdown validation
- Session management

Tests are located in `test/*.test.js`.

## Dependencies

### Production

- **[d3](https://github.com/d3/d3)** ^7.9.0 - Data visualization and charts
- **[jstat](https://github.com/jstat/jstat)** ^1.9.6 - Statistical distributions and sampling
- **[@stdlib/stats-ranks](https://github.com/stdlib-js/stats-ranks)** ^0.2.2 - Rank transformations
- **[kd-tree-javascript](https://github.com/ubilabs/kd-tree-javascript)** ^1.0.3 - Efficient spatial queries for mate selection

### Development

- **TypeScript** ^5.8.3 - Type-safe ABM implementation
- **Vite** ^6.3.5 - Build tool and dev server
- **Vitest** ^3.2.4 - Unit testing framework
- **ESLint** ^9.33.0 - Code quality
- **Remark** ^15.0.1 - Markdown linting
- **Husky** ^9.1.7 - Git hooks

See [package.json](package.json) for the complete list.

## Contributing

### Development Workflow

1. **Check project health**: `npm run hygiene`
2. **Make changes**: Edit TypeScript files in `src/`
3. **Write tests**: Follow TDD practices (`/tdd` command)
4. **Validate quality**: `npm run commit:check`
5. **Commit**: Use atomic commits with `/commit`
6. **Push**: Verify CI passes before pushing

### Code Standards

- **TypeScript**: Strict mode, no `any` types
- **Functional style**: Minimize mutation, prefer pure functions
- **Test coverage**: 60% minimum
- **Documentation**: Update README and docs/ for new features
- **Complexity**: Keep functions under 15 cyclomatic complexity
- **File size**: Keep files under 400 lines

See [CLAUDE.md](CLAUDE.md) for detailed development guidelines.

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

**Last Updated**: 2025-11-03
**Live Demo**: <http://johnflournoy.science/wealth-strat_abm/>
**Repository**: <https://github.com/jflournoy/wealth-strat_abm>
