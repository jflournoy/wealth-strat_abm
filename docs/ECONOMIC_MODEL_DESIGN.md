# Economic Model Design

## Overview

This document describes the transition from a **sample-based wealth model** to an **accumulation-based economic model** for the wealth stratification ABM. This redesign addresses fundamental limitations in how the simulation represents wealth generation and inequality.

## Current Model (Sample-Based)

### How It Works

The current model generates wealth by sampling from distributions:

1. Agent receives `educationScore` (weighted combination of genes + environment)
2. Wealth is sampled from log-normal distribution with Pareto tail
3. Distribution parameters influenced by `educationScore` and `parentWealth`
4. Each generation resamples wealth independently

### Limitations

**Critical Issue**: This approach **overstates the effectiveness of education-based interventions** and **understates wealth concentration dynamics**.

#### Why Sample-Based Models Fail

1. **No Capital Returns**: Existing wealth doesn't generate returns (r × wealth)
   - Real world: Capital returns > labor returns (Piketty's r > g)
   - Model: Wealth resets each generation via sampling

2. **No Production Function**: Education doesn't map to productivity
   - Real world: Education → skills → labor productivity → income
   - Model: Education → distribution parameters (indirect, unrealistic)

3. **Missing Accumulation**: Wealth doesn't compound
   - Real world: Save → invest → returns → reinvest (compound growth)
   - Model: Sample from distribution (no accumulation)

4. **Overoptimistic Mobility**: Equal opportunity seems sufficient
   - Real world: r > g means wealth concentrates regardless of opportunity
   - Model: Better education → better distribution → reduced inequality

### Evidence from Learnings

From `.claude/learnings/2025-11.md`:

> "Current model samples wealth from distributions rather than modeling production. This OVERSTATES effectiveness of education-based interventions and UNDERSTATES how capital returns drive wealth concentration independent of education quality."

> "The model is 'too optimistic' about reducing inequality through opportunity alone."

## New Model (Accumulation-Based)

### Design Principles

1. **Model production, not sampling**: Education → skills → productivity → income
2. **Capital returns**: Existing wealth generates returns (r × wealth)
3. **Accumulation dynamics**: Wealth compounds via savings and investment
4. **Realistic inequality**: Capture how r > g drives concentration

### Core Mechanisms

#### 1. Production Function

```typescript
// Education determines labor productivity
const laborProductivity = f(educationScore, skillLevel);
const laborIncome = laborProductivity × baseWage;
```

#### 2. Capital Returns

```typescript
// Existing wealth generates returns
const capitalIncome = capitalReturnRate × previousWealth;
```

#### 3. Wealth Accumulation

```typescript
// Total income = labor + capital
const totalIncome = laborIncome + capitalIncome;

// Savings rate varies by wealth class
const savingsRate = getSavingsRate(currentWealth);
const saved = totalIncome × savingsRate;

// Consumption for current period
const consumed = totalIncome × (1 - savingsRate);

// Wealth accumulates
const newWealth = previousWealth + saved - depreciation;
```

#### 4. Class-Based Dynamics

```typescript
// Savings rates differ by wealth class
const getSavingsRate = (wealth: number): number => {
  if (wealth < povertyLine) return 0.0;      // Can't save
  if (wealth < middleClass) return 0.05;     // Low savings
  if (wealth < wealthyClass) return 0.15;    // Moderate savings
  return 0.30;                                // High savings (invest more)
};
```

### Expected Behavioral Changes

#### Gini Coefficient Impact

- **Phase 1 (Capital Returns)**: +5-10% increase
  - Wealth generates returns, rich accumulate faster

- **Phase 3 (Full Accumulation)**: +10-15% increase
  - Compound effects of savings differentials

- **Phase 9 (Wealth Tax)**: -5-8% decrease
  - Redistributive policy partially offsets accumulation

#### Inequality Dynamics

1. **r > g Effect**: Capital returns outpace wage growth
   - Rich get richer through passive returns
   - Labor income alone can't compete

2. **Savings Heterogeneity**: Class-based savings rates
   - Poor: 0% savings (consumption = income)
   - Middle: 5-15% savings
   - Wealthy: 30%+ savings → faster accumulation

3. **Initial Wealth Persistence**: Inheritance matters more
   - Parents' wealth → child's starting capital
   - Capital returns amplify initial advantages

## Implementation Phases

Structured as 10 phases (see GitHub Issues #3-#10):

### Phase 1: Capital Returns (Issue #4)
- Add `previousWealth` to Agent interface
- Add `capitalReturnRate` parameter (default 0.05)
- Compute capital income: `r × previousWealth`
- UI slider for capital return rate

**Estimated effort**: 2-3 sessions

### Phase 2: Class-Based Savings (Issue #5)
- Define wealth classes (poverty, middle, wealthy)
- Implement differential savings rates
- Track savings vs consumption

**Estimated effort**: 2-3 sessions

### Phase 3: Full Accumulation Model (Issue #6)
- Replace wealth sampling with accumulation
- Implement: `wealth_t = wealth_{t-1} + savings - depreciation`
- Add depreciation parameter

**Estimated effort**: 3-4 sessions

### Phase 4: Validation & Documentation (Issue #7)
- Verify Gini coefficient trends
- Document parameter ranges
- Compare to empirical data

**Estimated effort**: 2-3 sessions

### Phases 5-9: Policy Interventions
- Phase 5: Progressive taxation (Issue #8)
- Phase 6: Inheritance tax (Issue #8)
- Phase 7: Education subsidies (Issue #8)
- Phase 8: Universal Basic Income (Issue #8)
- Phase 9: Wealth tax (Issue #8)

**Estimated effort**: 2-3 sessions each (10-15 total)

### Phase 10: Final Validation (Issue #9)
- Cross-validate all interventions
- Performance optimization
- Documentation update

**Estimated effort**: 2-3 sessions

**Total estimated effort**: ~30-40 sessions

## Key Parameters

### Capital Returns
- `capitalReturnRate`: 0.03-0.07 (realistic range)
- Default: 0.05 (5% annual return)

### Savings Rates (by class)
- Poverty: 0.00 (no savings capacity)
- Low income: 0.05 (5%)
- Middle class: 0.10-0.15 (10-15%)
- Wealthy: 0.25-0.35 (25-35%)

### Wealth Classes (thresholds)
- Poverty line: 10th percentile
- Middle class: 25th-75th percentile
- Wealthy: 90th+ percentile

### Depreciation
- `depreciationRate`: 0.01-0.03 (1-3% annual)
- Models wealth decay (maintenance, inflation)

## Validation Strategy

### 1. Gini Coefficient Trends
- **Before**: Gini ~0.35-0.45 (too low)
- **After Phase 1**: Gini +5-10% (capital returns effect)
- **After Phase 3**: Gini +10-15% (full accumulation)
- **Target**: Gini ~0.50-0.60 (realistic for modern economies)

### 2. Wealth Concentration
- Top 10% wealth share should increase
- Bottom 50% wealth share should decrease
- Middle class hollowing effect

### 3. Intergenerational Elasticity
- Correlation between parent and child wealth should increase
- Mobility should decrease compared to current model

### 4. Policy Response
- Education interventions should have **smaller** impact than before
- Redistributive policies should be **necessary** to reduce inequality

## Research Context

### Theoretical Foundations

**Piketty (2014)**: *Capital in the Twenty-First Century*
- Central inequality: r > g (return on capital > growth rate)
- Capital share of income rising over time
- Wealth concentration driven by differential returns

**Chetty et al. (2014)**: Intergenerational mobility studies
- Geography matters (place-based effects)
- Role of neighborhood quality, school quality
- Limits of education policy alone

**Saez & Zucman (2016)**: Wealth inequality in the US
- Top 0.1% wealth share tripled since 1980
- Capital income concentration
- Tax policy implications

### Empirical Targets

**US Wealth Inequality (2020s)**:
- Gini coefficient: ~0.85 (very high)
- Top 10% own: ~70% of wealth
- Bottom 50% own: ~2% of wealth

**Intergenerational Elasticity**:
- US: ~0.4-0.5 (moderate-low mobility)
- Scandinavian countries: ~0.15-0.2 (high mobility)
- Developing nations: ~0.6+ (low mobility)

## Migration Strategy

### Backwards Compatibility

Option 1: **Feature flag**
```typescript
const useAccumulationModel = params.accumulationModel ?? false;
```

Option 2: **Separate model files**
- Keep `model.ts` (sample-based)
- Create `model-accumulation.ts` (new)
- UI toggle between models

**Recommendation**: Option 1 (feature flag)
- Allows direct comparison
- Educational value: show both approaches
- Parameter: `accumulationModel: boolean`

### Transition Plan

1. **Phase 1-3**: Build alongside existing model
2. **Phase 4**: Validate both models side-by-side
3. **Phase 5+**: Default to accumulation model
4. **Phase 10**: Keep sample model as "toy model" option

## Open Questions

### 1. Production Function Form
- Linear: `income = wage × educationScore`
- Cobb-Douglas: `income = A × (education^α) × (experience^β)`
- Log-linear: `log(income) = β₀ + β₁×education + ε`

**Decision needed**: Which functional form?

### 2. Capital Return Heterogeneity
- Constant rate: `r = 0.05` for all
- Wealth-dependent: `r = f(wealth)` (rich get better returns)
- Skill-dependent: `r = g(education)` (smarter investors)

**Decision needed**: Constant or heterogeneous?

### 3. Consumption vs Investment
- Explicit: Track consumption separately
- Implicit: Assume (1 - savingsRate) is consumed

**Current approach**: Implicit (simpler)

### 4. Shocks and Uncertainty
- Deterministic: Predictable returns
- Stochastic: Random shocks to income/returns
- Rare events: Bankruptcies, windfalls

**Decision needed**: Add stochastic shocks?

## References

1. Piketty, T. (2014). *Capital in the Twenty-First Century*. Harvard University Press.

2. Chetty, R., Hendren, N., Kline, P., & Saez, E. (2014). "Where is the land of opportunity? The geography of intergenerational mobility in the United States." *Quarterly Journal of Economics*, 129(4), 1553-1623.

3. Saez, E., & Zucman, G. (2016). "Wealth inequality in the United States since 1913: Evidence from capitalized income tax data." *Quarterly Journal of Economics*, 131(2), 519-578.

4. Jones, C. I. (2015). "Pareto and Piketty: The macroeconomics of top income and wealth inequality." *Journal of Economic Perspectives*, 29(1), 29-46.

## Revision History

- 2025-11-06: Initial design document created
- Based on learnings from `.claude/learnings/2025-11.md`
- References GitHub Issues #3-#10 for implementation plan
