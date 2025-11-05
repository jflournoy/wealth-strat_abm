# New Economic Model Design

**Date**: 2025-11-04
**Status**: Approved - Ready for Implementation
**Decision**: Moving from sampling-based to accumulation-based wealth model

## Executive Summary

We are replacing the current wealth resampling model with a realistic economic accumulation model that:
- Separates labor income from capital income
- Implements compound capital returns (r × wealth)
- Uses class-based savings rates
- Accumulates wealth over time instead of resampling
- Makes inequality harder to solve (stronger philosophical argument)

## Current Model Problems

### What We Do Now (Problematic)

```typescript
// Current: Resample wealth from distribution each generation
potentialWealth = exp(μ_L + σ_L × educationScore + noise) × Pareto(κ)
wealth = financeWeight × potentialWealth + (1-financeWeight) × (envWealth + parentWealth × catastrophe)
```

**Problems:**
- Wealth is sampled, not accumulated
- No capital returns (r × wealth)
- No savings behavior
- Overstates education effectiveness
- Understates wealth concentration
- Unrealistic: people don't get new wealth draws each period

## New Model Architecture

### Core Economic Framework

**Wealth is a function of accumulated income:**
```
Wealth_t = Wealth_{t-1} + Savings_t
```

**Income comes from two sources:**
```
Total Income = Labor Income + Capital Income
```

### 1. Labor Income

Labor income depends on productivity (genes, environment, education):

```typescript
// Education score (unchanged)
educationScore = geneEnvWeight × meanAllele + (1 - geneEnvWeight) × env

// Labor productivity
laborProductivity = exp(μ_L + σ_L × educationScore + noise)

// Labor income
laborIncome = wageRate × laborProductivity
```

**Parameters:**
- `μ_L` = 10.5 (mean log productivity)
- `σ_L` = 0.5 (education impact on productivity)
- `wageRate` = baseline wage per unit of productivity
- `noise` ~ N(0, σ_noise²) (luck/variation)

### 2. Capital Income

Capital income comes from returns on accumulated wealth:

```typescript
// Capital returns
capitalIncome = wealth_{t-1} × params.capitalReturnRate
```

**Parameters:**
- `capitalReturnRate` = 0.05 (default 5% real annual return on capital)

**Why 5% default?**
- Historical real return on capital ~4-6%
- Piketty's r > g: capital returns exceed economic growth
- Makes wealth compound automatically for the rich

**User Control:**
The capital return rate should be modifiable via UI slider, allowing users to experiment with different scenarios:
- Lower r (~2-3%): Less inequality from capital accumulation
- Higher r (~7-8%): More rapid wealth concentration at the top
- Zero r: No capital returns (labor income only)

### 3. Savings and Consumption

Savings rates vary by wealth percentile (empirically realistic):

```typescript
function getSavingsRate(
  wealth: number,
  population: Agent[],
  params: Params
): number {
  const percentile = computePercentile(wealth, population)

  if (percentile < 0.2)   return params.savingsRateBottom    // Bottom 20%
  if (percentile < 0.8)   return params.savingsRateMiddle    // Middle 60%
  if (percentile < 0.99)  return params.savingsRateUpper     // Top 19%
  return params.savingsRateTop                               // Top 1%
}
```

**Default Parameter Values:**
- `savingsRateBottom` = 0.05 (5% - bottom 20%)
- `savingsRateMiddle` = 0.15 (15% - middle 60%)
- `savingsRateUpper` = 0.40 (40% - top 19%)
- `savingsRateTop` = 0.70 (70% - top 1%)

**Rationale:**
- Bottom quintile lives paycheck-to-paycheck (default 5% savings)
- Middle class saves modestly (default 15%)
- Upper middle class saves substantially (default 40%)
- Top 1% saves most income (default 70%)

**User Control:**
All savings rates should be modifiable via UI sliders, allowing users to experiment with different savings behaviors and observe their impact on inequality.

**Consumption:**
```typescript
totalIncome = laborIncome + capitalIncome
savings = totalIncome × savingsRate(wealth, population)
consumption = totalIncome - savings  // Disappears from model
```

Consumption disappears (steady-state assumption - not modeling circular flow).

### 4. Wealth Accumulation

```typescript
// Each time period
wealth_t = wealth_{t-1} + savings_t
```

**Over generations:**
```typescript
// At generation transition
parentWealth = agent.wealth
childStartingWealth = parentWealth × inheritanceRate

// Child continues accumulating
child.wealth = childStartingWealth
// Then in subsequent periods:
child.wealth += child.savings
```

### 5. Intergenerational Transfer

```typescript
// When creating new generation
const inheritanceRate = params.inheritanceRate  // e.g., 0.8 (80% transfer)

// Optional: catastrophe events
const catastropheOccurs = random() < params.catastropheRate
const finalInheritance = catastropheOccurs
  ? childStartingWealth × params.catastropheEffect
  : childStartingWealth
```

## Complete Formulas

### Agent Wealth Evolution

**Within a generation (time period):**
```
laborIncome_t = wageRate × exp(μ_L + σ_L × educationScore + noise_t)
capitalIncome_t = wealth_{t-1} × capitalReturnRate
totalIncome_t = laborIncome_t + capitalIncome_t
savings_t = totalIncome_t × savingsRate(wealth_{t-1})
wealth_t = wealth_{t-1} + savings_t
```

**Between generations:**
```
child.educationScore = geneEnvWeight × child.meanAllele + (1 - geneEnvWeight) × child.env
child.wealth_0 = parent.wealth_final × inheritanceRate × (1 - catastrophe)
```

## Implementation Plan

### Phase 1: Add Capital Returns (TDD)
**Estimate: 2-3 sessions**

1. Add `previousWealth` tracking to Agent interface
2. Add `capitalReturnRate` parameter to `Params` interface (default 0.05)
3. Modify wealth generation to include capital income
4. Add UI slider for capital return rate (range 0-0.10, default 0.05)
5. Update tests to verify capital returns work
6. Run simulation and observe increased inequality

**Test cases:**
- Capital returns compound over time
- `capitalReturnRate × wealth` produces correct income
- Changing `capitalReturnRate` parameter affects wealth accumulation
- Inequality increases compared to baseline
- Zero `capitalReturnRate` produces labor-only income model

### Phase 2: Implement Savings Rates (TDD)
**Estimate: 2-3 sessions**

1. Add savings rate parameters to `Params` interface:
   - `savingsRateBottom` (default 0.05)
   - `savingsRateMiddle` (default 0.15)
   - `savingsRateUpper` (default 0.40)
   - `savingsRateTop` (default 0.70)
2. Add `getSavingsRate()` function with percentile lookup
3. Add `computePercentile()` helper function
4. Separate total income into labor + capital components
5. Calculate savings from total income
6. Update wealth as accumulation (not sampling)
7. Add UI sliders for all four savings rate parameters

**Test cases:**
- Savings rates match percentile thresholds
- Savings rates use parameter values (not hardcoded)
- Bottom quintile uses `savingsRateBottom`, top 1% uses `savingsRateTop`
- Wealth accumulates correctly over time
- Changing savings rate parameters affects wealth accumulation

### Phase 3: Refactor Wealth Generation (TDD)
**Estimate: 3-4 sessions**

1. Remove old sampling-based wealth generation
2. Replace with accumulation-based model
3. Ensure labor income still depends on education
4. Verify Pareto tail still emerges naturally
5. Update all tests to match new model

**Test cases:**
- Labor income depends on education score
- Capital income depends on previous wealth
- Wealth distribution still shows Pareto tail
- Gini coefficient increases (as expected)

### Phase 4: Multi-Period Time Steps (Optional)
**Estimate: 4-5 sessions**

Currently: 1 time step = 1 generation (30-40 years)

**Enhancement:** Multiple time periods per generation
- Generation = 30 years = 30 annual time steps
- Wealth accumulates continuously
- More realistic compound growth

**Trade-offs:**
- More realistic
- Better visualizations (see wealth grow over time)
- More computationally expensive
- More complex UI (time vs generation slider)

**Decision:** Defer until after basic accumulation works

### Phase 5: Validation and Testing
**Estimate: 2-3 sessions**

1. Compare Gini coefficients (old vs new model)
2. Verify inequality increases (expected)
3. Test edge cases (zero wealth, extreme wealth)
4. Performance testing (ensure UI still responsive)
5. Update README and help text

## Expected Outcomes

### Inequality Will Increase

**Current model (sampling):**
- Gini ≈ 0.4-0.6 (depends on parameters)
- Education matters a lot
- Redistribution looks effective

**New model (accumulation):**
- Gini ≈ 0.5-0.7 (higher)
- Education matters less (capital dominates)
- Redistribution less effective (r > g)

**This strengthens your argument:**
- "Opportunity isn't enough" becomes STRONGER
- Wealth concentration is structural, not just bad luck
- Capital returns create inevitable stratification

### Parameter Sensitivities

**Increasing r (capital return rate):**
- Higher r → more inequality
- Rich get richer faster
- Education becomes less important

**Increasing top 1% savings rate:**
- Higher savings → faster wealth accumulation
- Even more concentration at the top

**Decreasing inheritanceRate:**
- Wealth doesn't transfer as much between generations
- Reduces inequality (acts like estate tax)

## New UI Parameters

Add to parameter sliders:

1. **Capital Return Rate (r)**
   - Parameter: `capitalReturnRate`
   - Range: 0% to 10%
   - Default: 5% (0.05)
   - Label: "Return on capital (r)"
   - Help: "Annual real return on accumulated wealth"

2. **Savings Rates by Class** (4 separate sliders)
   - **Bottom 20% Savings Rate**
     - Parameter: `savingsRateBottom`
     - Range: 0-30% (0.0-0.30)
     - Default: 5% (0.05)
     - Label: "Savings rate: bottom 20%"
     - Help: "Fraction of income saved by poorest quintile"

   - **Middle 60% Savings Rate**
     - Parameter: `savingsRateMiddle`
     - Range: 0-50% (0.0-0.50)
     - Default: 15% (0.15)
     - Label: "Savings rate: middle 60%"
     - Help: "Fraction of income saved by middle class"

   - **Top 19% Savings Rate**
     - Parameter: `savingsRateUpper`
     - Range: 0-80% (0.0-0.80)
     - Default: 40% (0.40)
     - Label: "Savings rate: top 19%"
     - Help: "Fraction of income saved by upper middle class"

   - **Top 1% Savings Rate**
     - Parameter: `savingsRateTop`
     - Range: 0-95% (0.0-0.95)
     - Default: 70% (0.70)
     - Label: "Savings rate: top 1%"
     - Help: "Fraction of income saved by wealthiest 1%"

3. **Wage Rate**
   - Parameter: `wageRate`
   - Range: 0.5 to 2.0
   - Default: 1.0
   - Label: "Baseline wage rate"
   - Help: "Multiplier for labor productivity → income"

## Theoretical Justification

### Piketty's r > g

When capital returns (r) exceed economic growth (g):
- Capital accumulates faster than labor income grows
- Wealth becomes increasingly concentrated
- Inequality increases inexorably

**Our model captures this:**
- r = 5% (capital returns)
- g ≈ 0% (no aggregate economic growth yet)
- Therefore r > g → concentration

### Class-Based Savings Rates

Empirical evidence (Saez & Zucman, Dynan et al.):
- Poor save <10% (often negative - debt)
- Middle class saves 10-20%
- Rich save 30-50%
- Top 1% saves 50-80%

**Our rates are realistic:**
- Bottom quintile: 5% (conservative - some in debt)
- Middle class: 15% (standard advice is 10-15%)
- Upper middle: 40% (professionals, business owners)
- Top 1%: 70% (already wealthy, reinvest most income)

### Why This Matters

**Without capital returns:**
- Education can reduce inequality
- Meritocracy seems achievable
- Redistribution looks very effective

**With capital returns:**
- Education helps, but capital dominates
- Meritocracy is swamped by inheritance
- Redistribution fights against r > g

**Your philosophical point gets STRONGER:**
- Even perfect equal opportunity can't prevent stratification
- Structural forces (r > g) create inequality
- Need aggressive redistribution to counteract compound wealth

## Migration Strategy

### Backward Compatibility

**Option A: Clean break**
- Replace old model entirely
- Update all tests
- Document breaking change
- RECOMMENDED

**Option B: Feature flag**
- Add `useAccumulationModel` parameter
- Support both models
- Users can compare side-by-side
- More complex codebase

**Recommendation:** Clean break (Option A)
- Old model is fundamentally unrealistic
- No scientific reason to keep it
- Simpler code and tests

### Deployment Plan

1. Implement on feature branch
2. Run extensive testing
3. Compare results to current model
4. Document changes in CHANGELOG
5. Merge to main
6. Update deployed demo

## Open Questions

1. **Time granularity:**
   - Keep 1 step = 1 generation?
   - Or implement multiple periods per generation?

2. **Economic growth:**
   - Add aggregate growth (g)?
   - Or keep static economy?

3. **Wage dynamics:**
   - Fixed wage rate?
   - Or labor market clearing?

4. **Initial wealth distribution:**
   - Start with equal wealth?
   - Or sample initial distribution?

## References

- **Piketty (2014)**: Capital in the Twenty-First Century - r > g mechanism
- **Saez & Zucman (2016)**: Wealth inequality in the United States since 1913
- **Dynan, Skinner, Zeldes (2004)**: Do the rich save more?
- **Chetty et al. (2014)**: Where is the land of opportunity?

---

**Next Steps:**
1. Close Issue #2 with decision documented
2. Create new Issue for implementation
3. Start Phase 1 (TDD: Add capital returns)
4. Test impact on inequality metrics
5. Proceed through phases 2-5
