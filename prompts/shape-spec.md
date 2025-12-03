# /shape-spec - Feature Shaping Workflow

> Use this prompt to shape a feature before detailed specification.

## Instructions

I need help shaping a feature for **taskflow-cli**.

Shaping means defining:
- **Problem** - What user problem are we solving?
- **Appetite** - How much time should this take? (hours/days/weeks)
- **Solution** - Rough approach, not detailed design
- **Boundaries** - What's in and out of scope?
- **Risks** - What could go wrong? What's unknown?

## Process

1. **Start with the Problem**
   - Describe the user pain point
   - Show concrete examples
   - Explain why it matters

2. **Set the Appetite**
   - Small (hours): Bug fix, minor enhancement
   - Medium (days): New feature, significant change
   - Large (weeks): Major feature, architecture change

3. **Sketch the Solution**
   - Describe the approach at a high level
   - Include rough UI sketches if applicable
   - Identify key technical decisions

4. **Define Boundaries**
   - What's included in this work?
   - What's explicitly excluded?
   - What can be simplified?

5. **Surface Risks**
   - What don't we know yet?
   - What could cause delays?
   - Are there dependencies?

## Current Context

Review these files:
- `docs/product/vision.md` - Product vision
- `docs/product/roadmap.md` - Feature priorities
- `docs/specs/` - Existing specifications

## Output

Create a shaping document that we can discuss. Once approved, we'll use `/write-spec` to create the detailed specification.

## Remember

- Shaping is about finding the right approach, not perfection
- Leave room for implementation details
- Focus on the core value, cut nice-to-haves
- Fixed time, variable scope

