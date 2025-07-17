// helpContent.ts
// Centralized help text for the ABM interface, to be injected into your UI via innerHTML or as a React component.

export const helpContent = {
  general: `
    <h2>Agent-Based Inheritance & Socioeconomic Simulator</h2>
    <p>This interactive model shows how traits and resources flow from one generation to the next through four stages:</p>
    <ol>
      <li><strong>Parent Genes → Genes</strong></li>
      <li><strong>Parent Wealth → Environmental Endowment</strong></li>
      <li><strong>Genes + Environment → Education Level</strong></li>
      <li><strong>Education + Parent Wealth → Child Wealth</strong></li>
    </ol>
    <p>Each simulated “agent” inherits genetic values and an environmental endowment, which together determine its educational attainment. That education—combined with parental wealth—then produces the agent’s own wealth. Use the controls on the left to adjust noise, homophily, population size, etc., and watch the effects ripple through the grid and across your inequality metrics on the right.</p>
  `,
  plots: `
    <h3>Plots</h3>
    <ul>
      <li><strong>Population Raster</strong>
        <ul>
          <li>Shows every agent as a cell, colored by whichever stage you’ve selected: Genes, Environmental Endowment, Education Level, or Wealth.</li>
          <li>Grid layout makes spatial patterns easy to spot.</li>
        </ul>
      </li>
      <li><strong>Lorenz Curve (Wealth Distribution)</strong>
        <ul>
          <li>Cumulative share of agents vs. cumulative share of <strong>wealth</strong>.</li>
          <li>Diagonal = perfect equality; bowing indicates inequality.</li>
        </ul>
      </li>
      <li><strong>Gini Coefficient (Wealth Inequality)</strong>
        <ul>
          <li>Single value (0–1) summarizing how unequal the wealth distribution is.</li>
        </ul>
      </li>
      <li><strong>Histogram of Selected Feature</strong>
        <ul>
          <li>Distribution of genes, environment, education, or wealth across agents.</li>
          <li>Hover bars to see exact counts or percentages.</li>
        </ul>
      </li>
      <li><strong>Time Series (Over Generations)</strong> (if enabled)
        <ul>
          <li>Tracks summary stats (mean, variance, Gini) of <strong>wealth</strong> or <strong>education</strong> as you simulate multiple generations.</li>
        </ul>
      </li>
    </ul>
  `,
  controls: `
    <h3>Controls</h3>
    <dl>
      <dt>Feature Selector</dt>
      <dd>Pick which stage to display/analyze:
        <ul>
          <li>Genes</li>
          <li>Environmental Endowment</li>
          <li>Education Level</li>
          <li>Wealth</li>
        </ul>
      </dd>
      <dt>Noise Level</dt>
      <dd>Adjust randomness in gene transmission each generation (low = near-deterministic, high = more mutation).</dd>
      <dt>Homophily</dt>
      <dd>How strongly agents choose partners with similar education or wealth (0 = random; 1 = strict; &gt;1 amplifies similarity effects).</dd>
      <dt>Population Size</dt>
      <dd>Total agents simulated (more &rarr; smoother stats, slower compute).</dd>
      <dt>Grid Dimensions</dt>
      <dd>Number of rows (columns scale accordingly) for the raster layout.</dd>
      <dt>Generations</dt>
      <dd>Number of breeding cycles to run before showing final outcomes.</dd>
      <dt>Run / Reset</dt>
      <dd>
        <ul>
          <li><strong>Run</strong>: simulates with current settings.</li>
          <li><strong>Reset</strong>: restores defaults and clears results.</li>
        </ul>
      </dd>
      <dt>Download Data</dt>
      <dd>Export the final dataset or summary statistics as CSV.</dd>
    </dl>
  `,
  extras: `
    <h3>Extras & Tooltips</h3>
    <ul>
      <li>Hover over any plot element to see precise values.</li>
      <li>Legend beneath the raster maps colors to numeric ranges.</li>
      <li>Help (<code>i</code>) icon opens a quick primer on inheritance and inequality concepts.</li>
      <li>Auto-update toggle (optional) re-runs the sim live as you drag sliders.</li>
    </ul>
  `
};
